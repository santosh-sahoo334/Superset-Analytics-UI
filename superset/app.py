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
from flask import request, abort, session, redirect
import urllib.parse

from flask import Flask
from flask.sessions import SecureCookieSessionInterface

from superset.initialization import SupersetAppInitializer


class SkipAnonymousSessionInterface(SecureCookieSessionInterface):
    """Prevent Flask from writing a session cookie for anonymous requests.

    With client-side sessions (SESSION_SERVER_SIDE=False) and
    SESSION_REFRESH_EACH_REQUEST=True, every response calls save_session()
    which adds a Set-Cookie header.  When the request arrived WITHOUT an
    authenticated session, this creates an anonymous session cookie that
    OVERWRITES the authenticated cookie the browser already held.

    Fix: skip save_session entirely for anonymous requests on paths that
    are NOT part of the login / OAuth flow (those paths need the cookie to
    carry the CSRF token for the login form and to establish the session).
    """

    def save_session(self, app, session, response):
        if "_user_id" not in session:
            path = request.path
            # Allow login/OAuth/logout paths — they need the cookie
            if "/login" not in path and "/logout" not in path and "/oauth" not in path:
                if 'favorite_status' in path or 'filter_state' in path or 'csrf_token' in path:
                    logger.warning(
                        "[save_session] SKIPPING cookie for anonymous %s %s | session_keys=%s",
                        request.method, path, list(session.keys()),
                    )
                return  # Don't set any session cookie
        return super().save_session(app, session, response)

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
    app.session_interface = SkipAnonymousSessionInterface()

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

        # TekSecur: Force real logout when Flask session expired but SSO cookies remain.
        # Without this, the login page detects the stale refresh_token cookie and
        # auto-redirects to the OAuth callback, silently re-authenticating the user
        # without showing the login form.
        @app.before_request
        def force_logout_on_expired_session():
            path = request.path
            # Skip paths that don't require authentication
            if any(path.startswith(p) for p in (
                '/login', '/logout', '/oauth', '/static/', '/health',
            )):
                return
            # Skip health probes
            user_agent = request.headers.get('User-Agent', '')
            if user_agent.startswith('kube-probe/') or user_agent.startswith('ELB-HealthChecker'):
                return
            # If session is valid, pass through
            if '_user_id' in session:
                return
            # Session expired but SSO cookies still present → force real logout
            has_sso_cookies = (
                request.cookies.get('kc_id_token')
                or request.cookies.get('refresh_token')
            )
            if has_sso_cookies:
                logger.warning(
                    "[session_timeout] Expired session with stale SSO cookies — "
                    "redirecting to /logout/ for %s %s",
                    request.method, path,
                )
                return redirect('/logout/')

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
            if user_agent.startswith('kube-probe/') or user_agent.startswith('ELB-HealthChecker'):
                return  # Allow Kubernetes and AWS ALB health probes

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
