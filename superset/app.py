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

from flask import Flask

from superset.initialization import SupersetAppInitializer

logger = logging.getLogger(__name__)


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
