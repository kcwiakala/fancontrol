const log4js = require('log4js');
const async = require('async');
const System = require('./src/system');

log4js.configure(require('./conf/logger'));
const logger = log4js.getLogger();
if(process.env.NODE_ENV === 'production') {
  logger.level = 'info';
}

const opts = require('./conf/fancontrol');

const sys = new System();
logger.info('System Configuration:', sys);

setInterval(sys.update.bind(sys), opts.probeInterval || 1000);

const Controler = require('./src/controler');

const controlers = opts.controlers.map(copts => {
  const [sdev, sname] = copts.sensor.split('/');
  const [pdev, pname] = copts.pwm.split('/');
  return new Controler(sys.devices[sdev].sensors[sname], sys.devices[pdev].pwms[pname], copts);
});
logger.info('Controlers:', controlers);
setInterval(() => async.each(controlers, (c, cb) => c.update(cb)), opts.controlInterval || 1000);

function cleanup(exit_code) {
  return () => async.each(controlers, (c, cb) => c.cleanup(cb), () => process.exit(exit_code));
}

['SIGINT', 'SIGHUP'].forEach(sig => process.on(sig, cleanup(1)));
['SIGTERM', 'SIGQUIT'].forEach(sig => process.on(sig, cleanup(0)));