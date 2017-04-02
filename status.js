'use strict';

const chalk = require('chalk');

exports.status = (step) => {
  step = step + '...';
  console.log(step);
  return {
    done: () => {
      console.log(chalk.green(step + ' DONE'));
    },
    error: (msg) => {
      console.error(msg);
      console.error(chalk.red(step + ' FAILED'));
      process.exit(1);
    }
  };
};
