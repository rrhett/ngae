#!/usr/bin/env node
'use strict';

const chalk = require('chalk');
const path = require('path');
const spawn = require('child_process').spawn;

const run = (dir, compile) => {
  const step = require('./status.js').status('Running...');

  if (compile) {
    require('./compile.js').compile(dir);
  }

  // Run dev_appserver.py from the appengine directory.
  const appengine = spawn('dev_appserver.py', ['./'], {cwd: dir});

  appengine.stdout.on('data', (data) => { console.log(data.toString().trim()); });
  appengine.stderr.on('data', (data) => { console.error(data.toString().trim()); });

  step.done();
};

exports.run = run;

if (require.main == module) {
  const program = require('commander');

  program.arguments('')
      .option('-c, --config [file]', 'Configuration file', 'ngae.conf.json')
      .option('--compile', 'Compile first')
      .action(() => { });
  program.parse(process.argv);

  const config = require('./config.js').config(program.config);
  run(config.dir, program.compile);
}
