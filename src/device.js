const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const Pwm = require('./pwm');
const Sensor = require('./sensor');

const extract = (files, matcher) => 
  [...new Set(files.filter(f => matcher.test(f)).map(f => f.split('_')[0]))];

class Device {
  constructor(id) {
    this.path = path.join('/sys/class/hwmon', id);
    const files = fs.readdirSync(this.path);
    this.name = fs.readFileSync(path.join(this.path, 'name'), {encoding: 'utf8'}).trim();
    this.fans = extract(files, /fan\d+_/)
      .reduce((o, n) => _.set(o, n, new Sensor(this.path, n)), {});
    this.sensors = extract(files, /temp\d+_/)
      .reduce((o, n) => _.set(o, n, new Sensor(this.path, n, 0.001)), {});
    this.pwms = extract(files, /pwm\d+_/)
      .reduce((o, n) => _.set(o, n, new Pwm(this.path, n)), {});
  }
}

module.exports = Device;