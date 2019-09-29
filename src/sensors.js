const fs = require('fs');
const path = require('path');

class Sensor {
  constructor(device, name) {
    this.name = name;
    this.sfile = path.join(device, `${name}_input`);
    this.readout = -1;
  }

  update(done) {
    fs.readFile(this.sfile, (err, data) => {
      if(err) {
        return done(err);
      }
      this.readout = parseInt(data);
      done(null);
    });
  }

  get value() {
    return this.readout;
  }
}

class TempSensor extends Sensor {
  constructor(device, name) {
    super(device, name);
  }

  get value() {
    return this.readout/1000;
  }
}

exports.Fan = Sensor;
exports.TempSensor = TempSensor;