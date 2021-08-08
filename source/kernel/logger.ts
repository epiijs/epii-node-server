/* eslint-disable global-require, no-console */
type LoggerFn = (...message: any[]) => void;
type ColorMap = {
  [key in string]: string;
};

const LOGO = 'epii-server';
const COLORS: ColorMap = {
  info: 'blue',
  warn: 'yellow',
  fail: 'red',
  done: 'green'
};

function getLoggerFn(name: string): LoggerFn {
  const prefix = chalk ? chalk[COLORS[name]](LOGO) : `${LOGO}[${name}]`;
  return () => {
    console.log.apply(null, [prefix, ...arguments]);
  };
}

let chalk: any;
try {
  chalk = require('chalk');
} catch (error) {
  console.error('chalk not installed');
}

export default {
  info: getLoggerFn('info'),
  warn: getLoggerFn('warn'),
  fail: getLoggerFn('fail'),
  done: getLoggerFn('done'),
};
