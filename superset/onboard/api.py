from flask import Response, request
from flask_appbuilder import expose
from flask_appbuilder.api import BaseApi


class OnboardApi(BaseApi):
    resource_name = 'onboard-api'
    route_base = '/onboard'
    openapi_spec_tag = "Onboard App"

    @expose('/app', methods=['POST'])
    def post(self) -> Response:
        try:
            if 'cisght_key' in request.json:
                if request.json['csight_key'] == "test":
                    return self.response(200, message="Csight enabled for onboard",
                                         data={"msg": "Enable for onboarding"})
            return self.response(500, message="Does not exist",
                                 data={"msg": "App does not exist"})
        except Exception as e:
            return self.response(500, message=str(e), data={})
