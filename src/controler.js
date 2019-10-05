const logger = require('log4js').getLogger('controler');
const { makeFilter } = require('./filters');

class Controler {
  constructor(sensor, actor, opts) {
    this.sensor = sensor;
    this.actor = actor;

    const poly = opts.polyline;
    this.sx = [Number.NEGATIVE_INFINITY, ...poly.map(p => p[0]), Number.POSITIVE_INFINITY];
    this.sy = [Number.NEGATIVE_INFINITY, ...poly.map(p => p[1]), Number.POSITIVE_INFINITY];
    this.size = this.sx.length;

    this.slopes = [0];
    for(let i=1; i<poly.length; i++) {
      this.slopes.push((poly[i][1] - poly[i-1][1]) / (poly[i][0] - poly[i-1][0]));
    }
    this.slopes.push(0);
    
    this.y = (poly[0][1] + poly[poly.length-1][1]) / 2;
    this.target = this.y;
    this.hyst = opts.hyst || 1.0;
    this.alhpa = opts.alpha || 1.0;
    this.stop = opts.stop;
    this.bounds = [50 - this.hyst, 50 + this.hyst];
    this.inputFilter = makeFilter(opts.inputFilter);
  }

  enable(status, done) {
    this.actor.enable(status, done);
  }

  updateTarget(x) {
    const s = this.sx.findIndex(s => x < s);
    if(s === 1) {
      this.bounds = [Number.NEGATIVE_INFINITY, this.sx[1] + this.hyst];
      this.target = this.stop ? 0 : this.sy[1]-0.1;
    } else if (s === this.size - 1) {
      this.bounds = [this.sx[this.size - 2] - this.hyst, Number.POSITIVE_INFINITY];
      this.target = this.sy[this.size - 2];
    } else {
      this.bounds = [x-this.hyst, x + this.hyst];      
      this.target = this.sy[s-1] + (x - this.sx[s-1]) * this.slopes[s-1] ;
    }
    logger.debug('Current bounds:', this.bounds, 'target:', this.target);
  }

  update(done) {
    const x = parseInt(this.inputFilter(this.sensor.value));
    if(x < this.bounds[0]) {
      this.updateTarget(x + this.hyst);
    } else if (x > this.bounds[1]) {
      this.updateTarget(x - this.hyst);
    }
    if(Math.abs(this.y - this.target) > 0.1) {
      this.y = this.y + (this.target - this.y) * this.alhpa;
      logger.debug(`Input: ${x}, setting output to ${this.y}`);
      this.actor.set(Math.round(this.y), done);
    }
  }
}

module.exports = Controler;