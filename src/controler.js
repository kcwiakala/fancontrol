const logger = require('log4js').getLogger('controler');

const curve = [[30,50],[80,255]];

class Controler {
  constructor(sensor, actor, options) {
    this.sensor = sensor;
    this.actor = actor;
    this.curve = options.curve;
    const cl = this.curve.length;
    this.in_range = [this.curve[0][0], this.curve[cl-1][0]];
    this.out_range = [this.curve[0][1], this.curve[cl-1][1]];
    this.dydx = (this.out_range[1] - this.out_range[0])/(this.in_range[1] - this.in_range[0]);
  }

  update() {
    const x = this.sensor.value;
    let y = -1;
    if(x < this.in_range[0]) {
      y = this.out_range[0];
    } else if(x > this.in_range[1]) {
      y = this.out_range[1];
    } else {
      y = this.out_range[0] + (x - this.in_range[0]) * this.dydx
    }
    logger.info(`Input: ${x}, setting output to ${y}`);
  }
}

module.exports = Controler;