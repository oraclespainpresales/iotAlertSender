'use strict';

// Module imports
var express = require('express')
  , restify = require('restify')
  , http = require('http')
  , bodyParser = require('body-parser')
  , util = require('util')
  , log = require('npmlog-ts')
  , _ = require('lodash')
  , cors = require('cors')
;

const PCSHOST = "https://process-gse00011668.process.us2.oraclecloud.com";
const POST    = 'POST';
const restURI = '/events';
const pcsURI  = '/bpm/api/4.0/processes';

log.stream = process.stdout;
log.timestamp = true;
log.level = 'verbose';

// Instantiate classes & servers
var app    = express()
  , router = express.Router()
  , server = http.createServer(app)
  , pcsClient = restify.createJsonClient({
    url: PCSHOST,
    rejectUnauthorized: false
  })
;

// ************************************************************************
// Main code STARTS HERE !!
// ************************************************************************

// Main handlers registration - BEGIN
// Main error handler
process.on('uncaughtException', function (err) {
  log.error("","Uncaught Exception: " + err);
  log.error("","Uncaught Exception: " + err.stack);
});
// Detect CTRL-C
process.on('SIGINT', function() {
  log.error("","Caught interrupt signal");
  log.error("","Exiting gracefully");
  process.exit(2);
});
// Main handlers registration - END

// REST engine initial setup
const PORT = 11111;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// REST stuff - BEGIN
router.use(function(req, res, next) {
  if ( req.method === POST) {
//    console.log(util.inspect(req.body, true, null));
    res.status(204).end();
    var e = req.body[0];
    var pcsPayload = {
    	processDefId:"default~IoT_Alert_Handler!1.0~HandleAlert",
    	serviceName:"HandleAlert.service",
    	operation:"start",
    	action:"Submit",
    }
    var params = { source: "IoTCS", type: e.type, alert_description: "Detected malfunction with Cooler in " + e.payload.data.source_location, alert_values: "Temperature: "  + e.payload.data.avg_of_data_internal_temperature_8 + ", Engine vibration: " + e.payload.data.avg_of_data_vibration_8 }
    pcsPayload.params = params;
    console.log(pcsPayload);
    pcsClient.post(pcsURI, pcsPayload, (err, _req, _res, data) => {
      if (err) {
        log.error("","[POST] Error from PCS call: " + err.statusCode);
        log.error("", "URI: " + restURI+_req.url);
        log.error("", err);
        return;
      } else {
        log.info("", data;
      }
    });
  }
});

app.use(restURI, router);

// REST stuff - END

server.listen(PORT, () => {
  _.each(router.stack, (r) => {
    log.info("","Listening for request at http://localhost:%s%s", PORT, restURI);
  });
});
