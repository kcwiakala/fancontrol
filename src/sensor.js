const fs = require('fs');
const path = require('path');

class Sensor {
  constructor(device, name, scale) {
    this.name = name;
    this.sfile = path.join(device, `${name}_input`);
    this.readout = -1;
    this.scale = scale || 1.0;
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
    return this.readout * this.scale;
  }
}

module.exports = Sensor