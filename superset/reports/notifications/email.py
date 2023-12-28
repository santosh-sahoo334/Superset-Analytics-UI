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
                <b><a href={call_to_action_url}>{call_to_action}</a></b><p></p>
                <div>
                <p><strong>Navigation Path</strong></p>
                <ol>
                    <li>Once Logged in, please navigate to <strong>Cost Summary</strong></li>
                    <li>Scroll down to the Chart - <strong>Cost Breakdown by Resource</strong></li>
                    <li>Click on the Resource Name, for example, <strong>AWSLambda</strong></li>
                    <li>Other Charts will be refreshed as per the selected Resource Name.</li>
                    <li>Scroll down to the Chart - <strong>Cost Breakdown by Resource ID</strong>.</li>
                    <li>Sort the cost in descending order to see the Resource ID that caused the spike.</li>
                </ol>
                </div>
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
        prefix=app.config["ALERT_TITLE_PREFIX"] if "alert" in self._content.name.lower() else app.config["EMAIL_REPORT_SUBJECT_PREFIX"]
        title=self._content.name
        second_colon_index=title.find(":", title.find(":") + 1)
        title=title[:second_colon_index]
        return __(
            "%(prefix)s %(title)s",
            # prefix=app.config["EMAIL_REPORT_SUBJECT_PREFIX"]
            prefix=prefix,
            # title=self._content.name,
            title=title
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
