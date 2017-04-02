#!/usr/bin/env node
'use strict';

const chalk = require('chalk');
const path = require('path');
const spawnSync = require('child_process').spawnSync;

const clean = (dir) => {
  const step = require('./status.js').status('Cleaning');
  spawnSync('rm', ['-rf', path.join(dir, 'genfiles')]);
  spawnSync('rm', ['-rf', path.join(dir, 'generated_content')]);
  spawnSync('rm', ['-f', path.join(dir, '*pyc')]);
  step.done();
};

exports.clean = clean;

if (require.main === module) {
  const program = require('commander');

  program.arguments('')
      .option('-c, --config [file]', 'Configuration file')
      .action(() => {});
  program.parse(process.argv);

  const config = require('./config.js').config(program.config);
  clean(config.dir);
}
