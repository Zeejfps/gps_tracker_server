const express = require('express');
const locations = require('./locations');

const server = express();
server.use('/locations', locations);
const port = process.env.PORT || 8080;
server.listen(port, '0.0.0.0', function() {
  console.log(`Server started, listening on port ${port}...`);
});
