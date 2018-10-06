const express = require('express');
const auth = require('basic-auth');
const Joi = require('joi');
const LocationSchema = require('./schemas');
const Queue = require('double-ended-queue');

const kMaxLocations = 100;
const locationsQueue = new Queue(kMaxLocations);

const locations = new express.Router();
locations.use(express.json());

locations.get('/newest', function(req, res) {
  const newest = locationsQueue[locationsQueue.length-1];
  if (!newest) {
    return res.status(404).send('No location found');
  }
  return res.json(newest);
});

locations.get('/', function(req, res) {
  if (req.query.limit) {
    const limit = req.query.limit;
    const results = [];
    let len = limit;
    if (len > locationsQueue.length) {
      len = locationsQueue.length;
    }
    for (let i = len-1; i >= 0; i--) {
      results.push(locationsQueue.get(i));
    }
    return res.json(results);
  }
  return res.json(locationsQueue);
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
  locationsQueue.enqueue(result.value);
  if (locationsQueue.length > kMaxLocations) {
    locationsQueue.dequeue();
  }
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
