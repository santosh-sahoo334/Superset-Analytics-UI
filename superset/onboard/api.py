from flask import Response, request
from flask_appbuilder import expose
from flask_appbuilder.api import BaseApi

from superset.onboard.schemas import OnboardSchema


class OnboardApi(BaseApi):
    resource_name = 'onboard-api'
    route_base = '/api/v1/onboard'
    openapi_spec_tag = "Onboard App"

    add_model_schema = OnboardSchema()
    add_columns = ["csight_key", "dora_key", "valuestream_key",
                   "operationalmetrics_key"]

    @expose('/app', methods=['POST'])
    def post(self) -> Response:
        """Create new OnboardApi
                                ---
                                post:
                                  requestBody:
                                    description: Model schema
                                    required: true
                                    content:
                                      application/json:
                                        schema:
                                          $ref: '#/components/schemas/{{self.__class__.__name__}}.post'
                                  responses:
                                    201:
                                      description: Item changed
                                      content:
                                        application/json:
                                          schema:
                                            type: object
                                            properties:
                                              result:
                                                $ref: '#/components/schemas/{{self.__class__.__name__}}.post'
                                    400:
                                      $ref: '#/components/responses/400'
                                    401:
                                      $ref: '#/components/responses/401'
                                    404:
                                      $ref: '#/components/responses/404'
                                    422:
                                      $ref: '#/components/responses/422'
                                    500:
                                      $ref: '#/components/responses/500'
                         """
        try:

            item = self.add_model_schema.load(request.json)
            if 'csight_key' in item:
                if item['csight_key'] == "84a20ad6-cffd-4f26-b307-6c6c867c5c0f":
                    return self.response(200, message="Csight enabled for onboard")
            if 'dora_key' in item:
                if item['dora_key'] == "d5383723-36fc-43a6-bf7b-f2ceeedb319d":
                    return self.response(200, message="Dora enabled for onboard")
            if 'valuestream_key' in item:
                if item['valuestream_key'] == "95f6b0ac-0386-4a8d-88d1-af11f71a8a2d":
                    return self.response(200, message="ValueStream enabled for onboard")
            if 'operationalmetrics_key' in item:
                if item[
                    'operationalmetrics_key'] == "6bb84d33-d1bd-4a5c-ad8a-907a7dd7fcfe":
                    return self.response(200,
                                         message="Operational Metrics enabled for onboard")
            return self.response(500, message="App Does not exist")
        except Exception as e:
            return self.response(500, message=str(e))
