const logger = require('log4js').getLogger('pwm');
const fs = require('fs');
const path = require('path');

class Pwm {
  constructor(device, name) {
    this.name = name;
    this.value = -1;
    this.efile = path.join(device, `${name}_enable`);
    this.ifile = path.join(device, `${name}`);
    this.enabled = parseInt(fs.readFileSync(this.efile)) === 1;
  }

  set(value, done) {
    if(value != this.value) {
      this.value = value;
      logger.debug(`${this.ifile} < ${value}`);
      fs.writeFile(this.ifile, value, done);
    } else {
      done(null);
    }
  }

  enable(enabled, done) {
    fs.writeFile(this.efile, enabled ? '1' : '2', done);
  }
}

module.exports = Pwm;