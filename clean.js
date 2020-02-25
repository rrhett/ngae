#!/usr/bin/env node
'use strict';

const chalk = require('chalk');
const path = require('path');
const spawnSync = require('child_process').spawnSync;

const clean = (config) => {
  const step = require('./status.js').status('Cleaning');
  // Either way, the dist folder can be cleaned, as that is generated from
  // compile.
  spawnSync('rm', ['-rf', 'dist']);
  if (config.firebase) {
    // Nothing to do other than clean dist folder.
  } else {
    // Clean copied artifacts in the appengine folder.
    spawnSync('rm', ['-rf', path.join(dir, 'genfiles')]);
    spawnSync('rm', ['-rf', path.join(dir, 'generated_content')]);
    spawnSync('rm', ['-f', path.join(dir, '*pyc')]);
  }
  step.done();
};

exports.clean = clean;

if (require.main === module) {
  const program = require('commander');

  program.arguments('')
      .option('-c, --config [file]', 'Configuration file', 'ngae.conf.json')
      .action(() => {});
  program.parse(process.argv);

  const config = require('./config.js').config(program.config);
  clean(config);
}
