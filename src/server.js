const bodyParser = require('body-parser');
const express = require('express');
const log4js = require('log4js');
const path = require('path');

const app = express();
const logger = log4js.getLogger();
app.use(log4js.connectLogger(logger, {level: 'auto'}));


app.use(bodyParser.json());

app.use('/api', (req, res) => res.json({error: 'Not implemented yet'}));

const frontend = path.join(process.cwd(), 'frontend/build/index.html');
app.get('*', (req, res) => res.sendFile(frontend));

module.exports = app;