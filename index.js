const log4js = require('log4js');
const async = require('async');
const Controler = require('./src/controler');
const System = require('./src/system');

log4js.configure(require('./conf/logger'));
const logger = log4js.getLogger();
if(process.env.NODE_ENV === 'production') {
  logger.level = 'info';
}

const opts = require('./conf/fancontrol');

const sys = new System();
logger.info('System Configuration:', sys);

const controlers = opts.controlers.map(copts => {
  const [sdev, sname] = copts.sensor.split('/');
  const [pdev, pname] = copts.pwm.split('/');
  return new Controler(sys.devices[sdev].sensors[sname], sys.devices[pdev].pwms[pname], copts);
});
logger.info('Controlers:', controlers);

const sensors = [... new Set(controlers.map(c => c.sensor))];
logger.info('Used sensors:', sensors);

setInterval(() => async.each(sensors, (s, cb) => s.update(cb), err => {
  if(err) {
    logger.error('Unable to get sensor readings');
    throw new Error(err);
  }
}), opts.probeInterval || 1000);

async.each(controlers, (c, cb) => c.enable(true, cb), err => {
  if(err) {
    logger.error('Unable to enable controler');
    throw new Error(err);
  }
});

setInterval(() => async.each(controlers, (c, cb) => c.update(cb), err => {
  if(err) {
    logger.error('Unable to set control outputs');
    throw new Error(err);
  }
}), opts.controlInterval || 1000);

const cleanup = exit_code => () => {
  logger.info('Cleanup on exit with code', exit_code);
  async.each(controlers, (c, cb) => c.enable(false, err => {
    if(err) {
      logger.error('Error on controler cleanup:', err);
    }
    cb();
  }), () => process.exit(exit_code));
};

['SIGINT', 'SIGHUP', 'uncaughtException'].forEach(sig => process.on(sig, cleanup(1)));
['SIGTERM', 'SIGQUIT'].forEach(sig => process.on(sig, cleanup(0)));