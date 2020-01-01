const _ = require('lodash');
const async = require('async');
const fs = require('fs');
const Device = require('./device');
const logger = require('log4js').getLogger('system');

class System {
  constructor() {
    const devices = fs.readdirSync('/sys/class/hwmon');
    logger.info('Devices discovered in system:', devices);
    this.devices = devices.map(id => new Device(id)).reduce((o,d) => _.set(o, d.name, d), {});
  }
}

module.exports = System;