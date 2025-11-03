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
from collections.abc import Sequence
from io import IOBase
from typing import Union
from datetime import datetime, timedelta

import backoff
import pandas as pd
from flask import g
from flask_babel import gettext as __
from slack_sdk import WebClient
from slack_sdk.errors import (
    BotUserAccessError,
    SlackApiError,
    SlackClientConfigurationError,
    SlackClientError,
    SlackClientNotConnectedError,
    SlackObjectFormationError,
    SlackRequestError,
    SlackTokenRotationError,
)

from superset import app
from superset.reports.models import ReportRecipientType
from superset.reports.notifications.base import BaseNotification
from superset.reports.notifications.exceptions import (
    NotificationAuthorizationException,
    NotificationMalformedException,
    NotificationParamException,
    NotificationUnprocessableException,
)
from superset.utils.core import get_email_address_list
from superset.utils.decorators import statsd_gauge

logger = logging.getLogger(__name__)

# Slack only allows Markdown messages up to 4k chars
MAXIMUM_MESSAGE_SIZE = 4000


class SlackNotification(BaseNotification):  # pylint: disable=too-few-public-methods
    """
    Sends a slack notification for a report recipient
    """

    type = ReportRecipientType.SLACK

    def _get_channel(self) -> str:
        """
        Get the recipient's channel(s).
        Note Slack SDK uses "channel" to refer to one or more
        channels. Multiple channels are demarcated by a comma.
        :returns: The comma separated list of channel(s)
        """
        recipient_str = json.loads(self._recipient.recipient_config_json)["target"]

        return ",".join(get_email_address_list(recipient_str))

    def _message_template(self, table: str = "") -> str:
        logger.info(f"Title + Chart Name Passed to Get the Slack Title -- > {self._content.name}")
        prefix=app.config["ALERT_TITLE_PREFIX"] if "alert" in self._content.name.lower() else app.config["EMAIL_REPORT_SUBJECT_PREFIX"]
        title=self._content.name
        second_colon_index=title.find(":", title.find(":") + 1)
        title=title[:second_colon_index]

        return __(
            """*%(prefix)s %(name)s*

%(description)s

<%(url)s|Explore in CSight>

%(table)s
""",
            # name=self._content.name,
            prefix=prefix,
            name=title,
            description=self._content.description or "",
            # url=self._content.url,
            url=app.config["EMAIL_REPORTS_CTA_URL"],
            table=table,
        )

    @staticmethod
    def _error_template(name: str, description: str, text: str) -> str:
        return __(
            """*%(name)s*

%(description)s

Error: %(text)s
""",
            name=name,
            description=description,
            text=text,
        )

    def _get_body(self) -> str:
        if self._content.text:
            return self._error_template(
                self._content.name, self._content.description or "", self._content.text
            )

        if self._content.embedded_data is None:
            return self._message_template()

        # Embed data in the message
        df = self._content.embedded_data

        # ========== DYNAMIC COLUMN RENAMING - START ==========
        # Step 1: Flatten tuple column names to strings (only if they are tuples)
        if len(df.columns) > 0:
            if isinstance(df.columns[0], tuple):
                # Columns are tuples - flatten them
                df.columns = [col[0] if isinstance(col, tuple) else col for col in df.columns]
                logger.info("Flattened tuple columns to strings")
            else:
                # Columns are already strings - no flattening needed
                logger.info("Columns are already strings, no flattening needed")

        logger.info(f"Original DataFrame columns: {df.columns.tolist()}")

        column_mapping = {}
        date_column_value = None
        alert_type = None

        # Step 2: Identify alert type and extract the date from the date column
        for col in df.columns:
            col_lower = col.lower()
            
            # Check for Daily Alert - look for "Date" column
            if col_lower == 'date' and not df.empty:
                alert_type = 'daily'
                date_column_value = str(df[col].iloc[0])
                logger.info(f"Detected Daily Alert with date: {date_column_value}")
                break
            
            # Check for Weekly Alert - look for "Week" column
            elif col_lower == 'week' and not df.empty:
                alert_type = 'weekly'
                date_column_value = str(df[col].iloc[0])
                logger.info(f"Detected Weekly Alert with week: {date_column_value}")
                break
            
            # Check for Monthly Alert - look for "Month" column
            elif col_lower == 'month' and not df.empty:
                alert_type = 'monthly'
                date_column_value = str(df[col].iloc[0])
                logger.info(f"Detected Monthly Alert with month: {date_column_value}")
                break

        # Step 3: Calculate previous date based on alert type
        if date_column_value and alert_type:
            try:
                # Handle both date strings and datetime objects
                if isinstance(date_column_value, str):
                    # Try parsing with time component first
                    if ' ' in date_column_value:
                        current_date_obj = datetime.strptime(date_column_value.split(' ')[0], '%Y-%m-%d')
                    else:
                        current_date_obj = datetime.strptime(date_column_value, '%Y-%m-%d')
                else:
                    # If it's already a datetime object (from pandas)
                    current_date_obj = date_column_value
                
                if alert_type == 'daily':
                    current_date_str = current_date_obj.strftime('%Y-%m-%d')
                    previous_date_str = (current_date_obj - timedelta(days=1)).strftime('%Y-%m-%d')
                    
                    # Define column mappings for Daily Alert
                    for col in df.columns:
                        col_lower = col.lower()
                        if 'cost on date' in col_lower:
                            column_mapping[col] = f'Cost on {current_date_str}'
                        elif 'prev. day cost' in col_lower or 'prev day cost' in col_lower:
                            column_mapping[col] = f'Prev. Day Cost on {previous_date_str}'
                
                elif alert_type == 'weekly':
                    current_date_str = current_date_obj.strftime('%Y-%m-%d')
                    previous_date_str = (current_date_obj - timedelta(weeks=1)).strftime('%Y-%m-%d')
                    
                    # Define column mappings for Weekly Alert
                    for col in df.columns:
                        col_lower = col.lower()
                        if 'cost on week' in col_lower:
                            column_mapping[col] = f'Cost on Week {current_date_str}'
                        elif 'prev. week cost' in col_lower or 'prev week cost' in col_lower:
                            column_mapping[col] = f'Cost on Week {previous_date_str}'
                
                elif alert_type == 'monthly':
                    # Format: "October 2025" instead of "2025-10-01"
                    current_month_str = current_date_obj.strftime('%b %Y')
                    
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
                    previous_month_str = previous_month_obj.strftime('%b %Y')
                    
                    # Define column mappings for Monthly Alert
                    for col in df.columns:
                        col_lower = col.lower()
                        if '$ current month' in col_lower or 'current month' in col_lower:
                            column_mapping[col] = f'Cost - {current_month_str}'
                        elif '$ prev. month' in col_lower or 'prev. month' in col_lower or 'prev month' in col_lower:
                            column_mapping[col] = f'Cost - {previous_month_str}'
                
                logger.info(f"Column mapping to apply: {column_mapping}")
                
            except (ValueError, AttributeError) as e:
                logger.error(f"Error parsing date from column: {e}")

        # Step 4: Apply the renaming
        if column_mapping:
            df = df.rename(columns=column_mapping)
            
            # Drop the date/week/month columns
            columns_to_drop = [col for col in df.columns if col.lower() in ['date', 'week', 'month']]
            if columns_to_drop:
                df = df.drop(columns=columns_to_drop)
                logger.info(f"Dropped columns: {columns_to_drop}")
            
            # Reorder columns to group cost columns together
            base_cols = ['Provider', 'Account', 'Resource']
            renamed_cost_cols = [col for col in df.columns if 'Cost' in col and not col.startswith('$')]
            other_cols = [col for col in df.columns if col not in base_cols and col not in renamed_cost_cols]
            
            # Filter to only existing columns
            new_order = [col for col in base_cols if col in df.columns] + renamed_cost_cols + other_cols
            df = df[new_order]
            
            logger.info(f"Final columns after reordering: {df.columns.tolist()}")
        else:
            logger.info("No columns were renamed - using original column names")

        # ========== DYNAMIC COLUMN RENAMING - END ==========

        # Flatten columns/index so they show up nicely in the table
        df.columns = [
            " ".join(str(name) for name in column).strip()
            if isinstance(column, tuple)
            else column
            for column in df.columns
        ]
        df.index = [
            " ".join(str(name) for name in index).strip()
            if isinstance(index, tuple)
            else index
            for index in df.index
        ]

        # Reset index to start from 1
        df.index = range(1, len(df) + 1)

        # Slack Markdown only works on messages shorter than 4k chars, so we might
        # need to truncate the data
        for i in range(len(df) - 1):
            truncated_df = df[: i + 1].fillna("")
            truncated_row = pd.Series({k: "..." for k in df.columns})
            truncated_df = pd.concat(
                [truncated_df, truncated_row.to_frame().T], ignore_index=True
            )
            tabulated = df.to_markdown()
            table = f"```\n{tabulated}\n```\n\n(table was truncated)"
            message = self._message_template(table)
            if len(message) > MAXIMUM_MESSAGE_SIZE:
                # Decrement i and build a message that is under the limit
                truncated_df = df[:i].fillna("")
                truncated_row = pd.Series({k: "..." for k in df.columns})
                truncated_df = pd.concat(
                    [truncated_df, truncated_row.to_frame().T], ignore_index=True
                )
                tabulated = df.to_markdown()
                table = (
                    f"```\n{tabulated}\n```\n\n(table was truncated)"
                    if len(truncated_df) > 0
                    else ""
                )
                break

        # Send full data
        else:
            tabulated = df.to_markdown()
            table = f"```\n{tabulated}\n```"

        return self._message_template(table)

    def _get_inline_files(self) -> Sequence[Union[str, IOBase, bytes]]:
        if self._content.csv:
            return [self._content.csv]
        if self._content.screenshots:
            return self._content.screenshots
        return []

    @backoff.on_exception(backoff.expo, SlackApiError, factor=10, base=2, max_tries=5)
    @statsd_gauge("reports.slack.send")
    def send(self) -> None:
        files = self._get_inline_files()
        title = self._content.name
        channel = self._get_channel()
        body = self._get_body()
        file_type = "csv" if self._content.csv else "png"
        global_logs_context = getattr(g, "logs_context", {}) or {}
        try:
            token = app.config["SLACK_API_TOKEN"]
            if callable(token):
                token = token()
            client = WebClient(token=token, proxy=app.config["SLACK_PROXY"])
            # files_upload returns SlackResponse as we run it in sync mode.
            if files:
                for file in files:
                    client.files_upload(
                        channels=channel,
                        file=file,
                        initial_comment=body,
                        title=title,
                        filetype=file_type,
                    )
            else:
                client.chat_postMessage(channel=channel, text=body)
            logger.info(
                "Report sent to slack",
                extra={
                    "execution_id": global_logs_context.get("execution_id"),
                },
            )
        except (
            BotUserAccessError,
            SlackRequestError,
            SlackClientConfigurationError,
        ) as ex:
            raise NotificationParamException(str(ex)) from ex
        except SlackObjectFormationError as ex:
            raise NotificationMalformedException(str(ex)) from ex
        except SlackTokenRotationError as ex:
            raise NotificationAuthorizationException(str(ex)) from ex
        except (SlackClientNotConnectedError, SlackApiError) as ex:
            raise NotificationUnprocessableException(str(ex)) from ex
        except SlackClientError as ex:
            # this is the base class for all slack client errors
            # keep it last so that it doesn't interfere with @backoff
            raise NotificationUnprocessableException(str(ex)) from ex
