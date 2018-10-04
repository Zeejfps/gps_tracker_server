const Joi = require('joi');

const LocationSchema = Joi.object().keys({
  lat: Joi.number().required(),
  lng: Joi.number().required(),
});

module.exports = LocationSchema;
