const fs = require('fs');
const path = require('path');

class Pwm {
  constructor(device, name) {
    this.name = name;
    this.efile = path.join(device, `${name}_enable`);
    this.ifile = path.join(device, `${name}_input`);
    this.enabled = parseInt(fs.readFileSync(this.efile)) === 1;
  }

  set(value, done) {
    fs.writeFile(this.ifile, value, done);
  }

  enable(enabled, done) {
    fs.writeFile(this.efile, enabled ? '1' : '2', done);
  }
}

module.exports = Pwm;