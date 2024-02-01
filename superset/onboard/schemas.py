from marshmallow import Schema, fields


class OnboardSchema(Schema):
    csight_key = fields.String(required=False)
    dora_key = fields.String(required=False)
    valuestream_key = fields.String(required=False)
    operationalmetrics_key = fields.String(required=False)

