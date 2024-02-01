from flask import Response, request
from flask_appbuilder import expose
from flask_appbuilder.api import BaseApi
from flask_appbuilder.const import API_SECURITY_VERSION

from superset.onboard.schemas import OnboardSchema


class OnboardApi(BaseApi):
    resource_name = 'onboard-api'
    route_base = '/onboard'
    openapi_spec_tag = "Onboard App"
    version = API_SECURITY_VERSION

    add_model_schema = OnboardSchema()
    add_columns = ["csight_key"]

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
                if item['csight_key'] == "test":
                    return self.response(200, message="Csight enabled for onboard")
            return self.response(500, message="Does not exist",
                                 data={"msg": "App does not exist"})
        except Exception as e:
            return self.response(500, message=str(e), data={})
