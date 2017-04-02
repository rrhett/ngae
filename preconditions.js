'use strict'

exports.require = (arg, name) => {
  if (arg === null || arg === undefined) {
    if (name) {
      console.error(name + ' is required');
    }
    process.exit(1);
  }
};
