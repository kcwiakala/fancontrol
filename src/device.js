const _ = require('lodash');
const async = require('async');
const fs = require('fs');
const path = require('path');

const Pwm = require('./pwm');
const {Fan, TempSensor} = require('./sensors');

const extract = (files, matcher) => 
  [...new Set(files.filter(f => matcher.test(f)).map(f => f.split('_')[0]))];

class Device {
  constructor(name) {
    this.name = name;
    this.path = path.join('/sys/class/hwmon', name);
    const files = fs.readdirSync(this.path);

    this.fans = extract(files, /fan\d+_/)
      .reduce((o, n) => _.set(o, n, new Fan(this.path, n)), {});
    this.sensors = extract(files, /temp\d+_/)
      .reduce((o, n) => _.set(o, n, new TempSensor(this.path, n)), {});
    this.pwms = extract(files, /pwm\d+_/)
      .reduce((o, n) => _.set(o, n, new Pwm(this.path, n)), {});

    this.updateable = [..._.values(this.fans), ..._.values(this.sensors)];
    this.update();
  }

  update(done) {
    async.each(this.updateable, (s, cb) => s.update(cb), done);
  }
}

module.exports = Device;