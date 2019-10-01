const _ = require('lodash');
const async = require('async');
const fs = require('fs');
const Device = require('./device');
const logger = require('log4js').getLogger('system');

class System {
  constructor() {
    const devices = fs.readdirSync('/sys/class/hwmon');
    logger.info('Devices discovered in system:', devices);
    this.devices = devices.reduce((o,n) => _.set(o, n, new Device(n)), {});
  }

  update(done) {
    async.each(_.values(this.devices), (d, cb) => d.update(cb), done);
  }
}

module.exports = System;