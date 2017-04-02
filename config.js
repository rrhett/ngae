'use strict';

const chalk = require('chalk');
const path = require('path');
const preconditions = require('./preconditions.js');

function get(config, name, defaultValue) {
  if (name in config) {
    return config[name];
  }
  // If we do not have a default value, assume the field is required.
  if (arguments.length === 2) {
    console.error(chalk.red('Config must define ' + name));
    process.exit(1);
  }
  return defaultValue;
};

exports.config = (file) => {
  if (file === undefined) {
    console.error(chalk.red('Must specify a configuration file'));
    process.exit(1);
  }
  try {
    const fileConfig = require(path.join(process.cwd(), file));
    const config = {};
    config.dir = path.join(process.cwd(), get(fileConfig, 'dir'));
    config.projectId = get(fileConfig, 'projectId');
    return config;
  } catch (e) {
    console.error('Missing configuration file: ' + file, e);
    process.exit(1);
  }
};
