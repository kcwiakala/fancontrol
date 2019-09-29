const log4js = require('log4js');
const async = require('async');
const Device = require('./src/device');
const Pwm = require('./src/pwm');
const _ = require('lodash');
const System = require('./src/system');

log4js.configure(require('./conf/logger'));

const logger = log4js.getLogger('root');

const sys = new System();
logger.debug('System:', sys);

setInterval(sys.update.bind(sys), 1000);

const Controler = require('./src/controler');

const options = {
  curve: [[30,50],[80,255]]
}
const c1 = new Controler(sys.devices['hwmon0'].sensors['temp1'], sys.devices['hwmon0'].pwms['pwm1'], options);
setInterval(() => c1.update(), 1000);

