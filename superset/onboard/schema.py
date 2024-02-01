from marshmallow import Schema, fields


class OnboardSchema(Schema):
    cisght_key = fields.String(required=False)

