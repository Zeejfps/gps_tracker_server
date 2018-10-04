const express = require('express');
const auth = require('basic-auth');
const Joi = require('joi');
const LocationSchema = require('./schemas');

const locationsList = [];

const locations = new express.Router();
locations.use(express.json());

locations.get('/newest', function(req, res) {
  const newest = locationsList[locationsList.length-1];
  if (!newest) {
    return res.status(404).send('No location found');
  }
  return res.json(newest);
});

locations.get('/', function(req, res) {
  res.json(locationsList);
});

locations.post('/', function(req, res) {
  const credentials = auth(req);
  if (!credentials || !validCredentials(credentials.name, credentials.pass)) {
    return res.status(401).send('Access denied');
  }

  const result = Joi.validate(req.body, LocationSchema);
  if (result.error) {
    return res.status(400).send(result.error);
  }
  result.value.timestamp = new Date().toISOString();
  locationsList.push(result.value);
  return res.json(result.value);
});

/**
 * @param {string} username
 * @param {string} password
 * @return {boolean} True if valid
 */
function validCredentials(username, password) {
  return username === 'admin' && password === 'password';
}

module.exports = locations;
