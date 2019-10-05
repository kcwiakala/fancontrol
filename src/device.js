const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const Pwm = require('./pwm');
const Sensor = require('./sensors');

const extract = (files, matcher) => 
  [...new Set(files.filter(f => matcher.test(f)).map(f => f.split('_')[0]))];

class Device {
  constructor(name) {
    this.name = name;
    this.path = path.join('/sys/class/hwmon', name);
    const files = fs.readdirSync(this.path);

    this.fans = extract(files, /fan\d+_/)
      .reduce((o, n) => _.set(o, n, new Sensor(this.path, n)), {});
    this.sensors = extract(files, /temp\d+_/)
      .reduce((o, n) => _.set(o, n, new Sensor(this.path, n, 0.001)), {});
    this.pwms = extract(files, /pwm\d+_/)
      .reduce((o, n) => _.set(o, n, new Pwm(this.path, n)), {});
  }
}

module.exports = Device;