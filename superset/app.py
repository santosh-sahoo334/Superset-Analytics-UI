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

import logging
import os, re
from typing import Optional
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS
from flask import request, abort, redirect, session
import urllib.parse

from flask import Flask

from superset.initialization import SupersetAppInitializer

logger = logging.getLogger(__name__)


def get_host():
    # Try multiple headers in order of priority
    headers = [
        'X-Forwarded-Host',  # Most common in load balanced environments
        'Host',
        'X-Host',            # Fallback option
    ]  
    for header in headers:
        host = request.headers.get(header)
        if host:
            return host
    
    return ''  # Default if no host found

def is_valid_origin(origin, allowed_hosts):
    if not origin:
        return False
    try:
        parsed_origin = urllib.parse.urlparse(origin)
        origin_host = parsed_origin.netloc.lower()
        # Remove port if present
        origin_host = origin_host.split(':')[0]
        for host_item in allowed_hosts: # host_item = localhost:8088
            host_item = host_item.split(':')[0] # localhost
            if host_item.lower() == origin_host.lower():
                return True
        return False
    except Exception:
        return False

def create_app(superset_config_module: Optional[str] = None) -> Flask:
    app = SupersetApp(__name__)
    
    # Initialize Flask-Limiter
    limiter = Limiter(get_remote_address,
                      default_limits=["100 per minute"],
                       app=app)

    try:
        # Allow user to override our config completely
        config_module = superset_config_module or os.environ.get(
            "SUPERSET_CONFIG", "superset.config"
        )
        app.config.from_object(config_module)

        app_initializer = app.config.get("APP_INITIALIZER", SupersetAppInitializer)(app)
        app_initializer.init_app()

        @app.before_request
        def check_blacklist():
            """Block reuse of sessions that were explicitly logged out.
            Uses session['_blacklist_id'] — a random UUID set once per login,
            separate from Flask-Login's deterministic session['_id'].
            This prevents false-positive blacklisting when a user logs out
            and back in from the same browser (which produces the same _id)."""
            blacklist_id = session.get("_blacklist_id")
            path = request.path
            # --- DEBUG: trace every request through check_blacklist ---
            has_user_id = "_user_id" in session
            has_id = "_id" in session
            bid_short = blacklist_id[:8] if blacklist_id else "None"
            logger.warning(
                "[check_blacklist] %s %s | _blacklist_id=%s _user_id=%s _id=%s",
                request.method, path, bid_short, has_user_id, has_id,
            )
            if blacklist_id:
                from superset.utils.redis_blacklist import is_blacklisted
                hit = is_blacklisted(blacklist_id)
                if hit:
                    logger.warning(
                        "[check_blacklist] BLACKLISTED — clearing session for %s %s (bid=%s)",
                        request.method, path, bid_short,
                    )
                    session.clear()
                    response = redirect("/login")
                    response.set_cookie("session", "", expires=0)
                    response.set_cookie("refresh_token", "", expires=0)
                    response.set_cookie("slug", "", expires=0)
                    return response

        @app.before_request
        def debug_auth_state():
            """Temporary debug hook — log authentication state on dashboard routes."""
            path = request.path
            # Only log for dashboard and login routes to avoid noise
            if "/dworks/" not in path and "/login" not in path and "/oauth" not in path:
                return
            from flask import g
            try:
                user = getattr(g, "user", None)
                is_authed = user is not None and getattr(user, "is_authenticated", False)
                user_str = str(user) if is_authed else "anonymous"
                roles = [r.name for r in user.roles] if is_authed and hasattr(user, "roles") else []
                logger.warning(
                    "[auth_state] %s %s | authenticated=%s user=%s roles=%s",
                    request.method, path, is_authed, user_str, roles,
                )
            except Exception as e:
                logger.warning(
                    "[auth_state] %s %s | ERROR loading user: %s",
                    request.method, path, e,
                )

        @app.before_request
        def validate_next():
            """
            Validates the `next` parameter value to ensure it is safe.
            """
            if not 'next' in request.args:
                return
            next_value = request.args.get('next')
            if len(next_value) <= 0:
                return
            # Allowed URL Pattern to avoid XSS attack
            # Change it to http in case of local test
            pattern = r'^(https://[a-zA-Z0-9._~:/?#\[\]@!$&\'()*+,;=%-]+|/[a-zA-Z0-9/_\-.:]*(\?[a-zA-Z0-9&=_%.-]*)?)$'

            if not re.match(pattern, next_value):
                abort(400,"Operation not allowed")

        # TekSecur Custom Code to prevent penetration attack [2024-11-30] -- Begins
        @app.before_request
        def validate_host():
            host = get_host()
            origin = request.headers.get('Origin')

            # Check the Request Origin
            user_agent = request.headers.get('User-Agent', '')
            if user_agent.startswith('kube-probe/'):
                return  # Allow Kubernetes health probes

            ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "").split(",")
            if host not in ALLOWED_HOSTS:
                abort(400, "Invalid Host Header")
            
            # Check the Origin
            if origin:
                if not is_valid_origin(origin, ALLOWED_HOSTS):
                    abort(400, "Invalid Origin")
        
        # Dynamic Content length for File upload and request
        @app.before_request 
        def enforce_dynamic_max_content_length():
            # Get Content-Length from the request headers
            content_length = request.content_length 

            # Handle case where Content-Length is missing
            if content_length is None:
                return
            # Content-Length is in bytes
            max_length_normal = app.config.get("DWORKS_MAX_CONTENT_LENGTH", 10 * 1024) # Default 10 KiB
            max_length_file_upload = app.config.get("ZIPPED_FILE_MAX_SIZE", 5 * 1024 * 1024) # Default 5 MiB
            
            file = request.files.get('formData')  # Replace 'formData' with the actual key
            if file:
                file.seek(0, 2)  # Move to the end of the file
                file_size = file.tell()  # Get the file size in bytes
                file.seek(0)  # Reset the pointer to the beginning
                if file_size > max_length_file_upload:
                    abort(413, description="File upload size exceeds 5 MB limit.")
                return 

            if content_length > max_length_normal:
                abort(413, description="Request size exceeds 10 KB limit.")

        @app.after_request
        def apply_security_headers(response):
            # Enforce HTTPS
            response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
            # Prevent clickjacking
            response.headers['X-Frame-Options'] = 'DENY'
            # Prevent MIME sniffing
            response.headers['X-Content-Type-Options'] = 'nosniff'

            # Prevent browser from caching authenticated HTML pages (back-button security)
            content_type = response.content_type or ''
            if 'text/html' in content_type:
                response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
                response.headers['Pragma'] = 'no-cache'
                response.headers['Expires'] = '0'

            return response
        return app

    # Make sure that bootstrap errors ALWAYS get logged
    except Exception as ex:
        logger.exception("Failed to create app")
        raise ex


class SupersetApp(Flask):
    pass
