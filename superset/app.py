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
import os
from typing import Optional
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS
from flask import request, abort

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

def create_app(superset_config_module: Optional[str] = None) -> Flask:
    app = SupersetApp(__name__)
    
    # Fetch CORS origins from .env and convert to list
    cors_origins = os.environ.get("CORS_ORIGINS", "").split(",")
    logger.info(f"CORS_ORIGINS :: {cors_origins}")
    app.config['CORS_HEADERS'] = 'Content-Type'
    CORS(app, resources={r"/*": {"origins": cors_origins, "supports_credentials": True}})

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
        
        # TekSecur Custom Code to prevent penetration attack [2024-11-30] -- Begins
        @app.before_request
        def validate_host():
            host = get_host()

            # Check User-Agent for health probe
            user_agent = request.headers.get('User-Agent', '')
            if user_agent.startswith('kube-probe/'):
                return  # Allow Kubernetes health probes
            
            ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "").split(",")
            if host not in ALLOWED_HOSTS:
                abort(400, "Invalid Host Header")

        @app.before_request
        # Dynamic Content length for File upload and request
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
                    abort(413, description="File upload size exceeds 10 MB limit.")
                return 

            if content_length > max_length_normal:
                abort(413, description="Request size exceeds 10 KB limit.")

        @app.after_request
        def apply_security_headers(response):
            # Enforce HTTPS
            response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
            # Prevent clickjacking
            response.headers['X-Frame-Options'] = 'SAMEORIGIN'
            # Prevent MIME sniffing
            response.headers['X-Content-Type-Options'] = 'nosniff'
            return response
        # TekSecur Custom Code to prevent penetration attack [2024-11-30] -- Begins
        return app

    # Make sure that bootstrap errors ALWAYS get logged
    except Exception as ex:
        logger.exception("Failed to create app")
        raise ex


class SupersetApp(Flask):
    pass
