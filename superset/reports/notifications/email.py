# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
import json
import logging
import textwrap
from dataclasses import dataclass
from email.utils import make_msgid, parseaddr
from typing import Any, Optional

import nh3
from flask_babel import gettext as __

from superset import app
from superset.exceptions import SupersetErrorsException
from superset.reports.models import ReportRecipientType
from superset.reports.notifications.base import BaseNotification
from superset.reports.notifications.exceptions import NotificationError
from superset.utils.core import HeaderDataType, send_email_smtp
from superset.utils.decorators import statsd_gauge
from datetime import datetime, timedelta
import re

logger = logging.getLogger(__name__)

TABLE_TAGS = {"table", "th", "tr", "td", "thead", "tbody", "tfoot"}
TABLE_ATTRIBUTES = {"colspan", "rowspan", "halign", "border", "class"}

ALLOWED_TAGS = {
    "a",
    "abbr",
    "acronym",
    "b",
    "blockquote",
    "br",
    "code",
    "div",
    "em",
    "i",
    "li",
    "ol",
    "p",
    "strong",
    "ul",
}.union(TABLE_TAGS)

ALLOWED_TABLE_ATTRIBUTES = {tag: TABLE_ATTRIBUTES for tag in TABLE_TAGS}
ALLOWED_ATTRIBUTES = {
    "a": {"href", "title"},
    "abbr": {"title"},
    "acronym": {"title"},
    **ALLOWED_TABLE_ATTRIBUTES,
}


@dataclass
class EmailContent:
    body: str
    header_data: Optional[HeaderDataType] = None
    data: Optional[dict[str, Any]] = None
    images: Optional[dict[str, bytes]] = None


class EmailNotification(BaseNotification):  # pylint: disable=too-few-public-methods
    """
    Sends an email notification for a report recipient
    """

    type = ReportRecipientType.EMAIL

    @staticmethod
    def _get_smtp_domain() -> str:
        return parseaddr(app.config["SMTP_MAIL_FROM"])[1].split("@")[1]

    @staticmethod
    def _error_template(text: str) -> str:
        return __(
            """
            Error: %(text)s
            """,
            text=text,
        )

    def _get_content(self) -> EmailContent:
        if self._content.text:
            return EmailContent(body=self._error_template(self._content.text))
        # Get the domain from the 'From' address ..
        # and make a message id without the < > in the end
        csv_data = None
        domain = self._get_smtp_domain()
        images = {}

        if self._content.screenshots:
            images = {
                make_msgid(domain)[1:-1]: screenshot
                for screenshot in self._content.screenshots
            }

        # Strip any malicious HTML from the description
        # pylint: disable=no-member
        description = nh3.clean(
            self._content.description or "",
            tags=ALLOWED_TAGS,
            attributes=ALLOWED_ATTRIBUTES,
        )

        # Strip malicious HTML from embedded data, allowing only table elements
        if self._content.embedded_data is not None:
            df = self._content.embedded_data
            
            # ========== ADD THIS BLOCK - START ==========
            # Dynamic column renaming based on date columns
            logger.info(f"Original DataFrame columns: {df.columns.tolist()}")
            column_mapping = {}
            date_column_value = None
            alert_type = None  # Will be 'daily', 'weekly', or 'monthly'
            # Step 1: Identify alert type and extract the date from the date column
            for col in df.columns:
                col_lower = col.lower()
        
                # Check for Daily Alert - look for "Date" column
                if col_lower == 'date' and not df.empty:
                    alert_type = 'daily'
                    date_column_value = str(df[col].iloc[0])  # Get first row's date value
                    logger.info(f"Detected Daily Alert with date: {date_column_value}")
                    break
        
                # Check for Weekly Alert - look for "Week" column
                elif col_lower == 'week' and not df.empty:
                    alert_type = 'weekly'
                    date_column_value = str(df[col].iloc[0])  # Get first row's week value
                    logger.info(f"Detected Weekly Alert with week: {date_column_value}")
                    break
        
                # Check for Monthly Alert - look for "Month" column
                elif col_lower == 'month' and not df.empty:
                    alert_type = 'monthly'
                    date_column_value = str(df[col].iloc[0])  # Get first row's month value
                    logger.info(f"Detected Monthly Alert with month: {date_column_value}")
                    break
            
            # Step 2: Calculate previous date based on alert type
            if date_column_value and alert_type:
                try:
                    current_date_obj = datetime.strptime(date_column_value, '%Y-%m-%d')
                    if alert_type == 'daily':
                        current_date_str = current_date_obj.strftime('%Y-%m-%d')
                        previous_date_str = (current_date_obj - timedelta(days=1)).strftime('%Y-%m-%d')

                        # Define column mappings for Daily Alert
                        for col in df.columns:
                            if 'cost on date' in col.lower():
                                column_mapping[col] = f'Cost on {current_date_str}'
                            elif 'prev. day cost' in col.lower():
                                column_mapping[col] = f'Cost on {previous_date_str}'
                    
                    elif alert_type == 'weekly':
                        current_date_str = current_date_obj.strftime('%Y-%m-%d')
                        previous_date_str = (current_date_obj - timedelta(weeks=1)).strftime('%Y-%m-%d')
                
                        # Define column mappings for Weekly Alert
                        for col in df.columns:
                            if 'cost on week' in col.lower():
                                column_mapping[col] = f'Cost on Week {current_date_str}'
                            elif 'prev. week cost' in col.lower():
                                column_mapping[col] = f'Cost on Week {previous_date_str}'
                    
                    elif alert_type == 'monthly':
                        # Format: "July 2025" instead of "2025-07-01"
                        current_month_str = current_date_obj.strftime('%B %Y')  # e.g., "October 2025"
                        # Calculate previous month (handle year boundary)
                        if current_date_obj.month == 1:
                            previous_month_obj = current_date_obj.replace(
                                year=current_date_obj.year - 1, 
                                month=12
                            )
                        else:
                            previous_month_obj = current_date_obj.replace(
                                month=current_date_obj.month - 1
                            )
                        previous_month_str = previous_month_obj.strftime('%B %Y')  # e.g., "September 2025"

                        # Define column mappings for Monthly Alert
                        for col in df.columns:
                            if '$ current month' in col.lower():
                                column_mapping[col] = f'Monthly Cost - {current_month_str}'
                            elif '$ prev. month' in col.lower():
                                column_mapping[col] = f'Monthly Cost - {previous_month_str}'
                    logger.info(f"Column mapping to apply: {column_mapping}")
                except ValueError as e:
                    logger.error(f"Error parsing date from column: {e}")
            
            # Step 3: Apply the renaming
            if column_mapping:
                df = df.rename(columns=column_mapping)
                logger.info(f"Renamed columns successfully. New columns: {df.columns.tolist()}")
            else:
                logger.warning("No columns were renamed. Check if column names match expected patterns.")
            
            # ========== ADD THIS BLOCK - END ==========

            # pylint: disable=no-member
            html_table = nh3.clean(
                df.to_html(na_rep="", index=True, escape=True),
                # pandas will escape the HTML in cells already, so passing
                # more allowed tags here will not work
                tags=TABLE_TAGS,
                attributes=ALLOWED_TABLE_ATTRIBUTES,
            )
        else:
            html_table = ""

        call_to_action = __(app.config["EMAIL_REPORTS_CTA"])
        call_to_action_url = app.config["EMAIL_REPORTS_CTA_URL"]
        img_tags = []
        for msgid in images.keys():
            img_tags.append(
                f"""<div class="image">
                    <img width="1000px" src="cid:{msgid}">
                </div>
                """
            )
        img_tag = "".join(img_tags)
        body = textwrap.dedent(
            f"""
            <html>
              <head>
                <style type="text/css">
                  table, th, td {{
                    border-collapse: collapse;
                    border-color: rgb(200, 212, 227);
                    color: rgb(42, 63, 95);
                    padding: 4px 8px;
                  }}
                  .image{{
                      margin-bottom: 18px;
                  }}
                </style>
              </head>
              <body>
                <div>{description}</div>
                <br>
                <b><a href="{call_to_action_url}">{call_to_action}</a></b><p></p>
                {html_table}
                {img_tag}
              </body>
            </html>
            """
        )

        if self._content.csv:
            csv_data = {__("%(name)s.csv", name=self._content.name): self._content.csv}
        return EmailContent(
            body=body,
            images=images,
            data=csv_data,
            header_data=self._content.header_data,
        )

    def _get_subject(self) -> str:
        logger.info(f"Title + Chart Name Passed to Get the Email Title -- > {self._content.name}")
        prefix = app.config["ALERT_TITLE_PREFIX"] if "alert" in self._content.name.lower() else app.config["EMAIL_REPORT_SUBJECT_PREFIX"]
        title=self._content.name
        second_colon_index=title.find(":", title.find(":") + 1)
        title=title[:second_colon_index]

        return __(
            "%(prefix)s %(title)s",
            prefix=prefix,
            title=title
            # prefix=app.config["EMAIL_REPORTS_SUBJECT_PREFIX"],
            # title=self._content.name,
        )

    def _get_to(self) -> str:
        return json.loads(self._recipient.recipient_config_json)["target"]

    @statsd_gauge("reports.email.send")
    def send(self) -> None:
        subject = self._get_subject()
        content = self._get_content()
        to = self._get_to()
        try:
            send_email_smtp(
                to,
                subject,
                content.body,
                app.config,
                files=[],
                data=content.data,
                images=content.images,
                bcc="",
                mime_subtype="related",
                dryrun=False,
                header_data=content.header_data,
            )
            logger.info(
                "Report sent to email, notification content is %s", content.header_data
            )
        except SupersetErrorsException as ex:
            raise NotificationError(
                ";".join([error.message for error in ex.errors])
            ) from ex
        except Exception as ex:
            raise NotificationError(str(ex)) from ex
