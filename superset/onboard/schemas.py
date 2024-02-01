from marshmallow import Schema, fields


class OnboardSchema(Schema):
    csight_key = fields.String(required=False)

