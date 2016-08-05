const express = require('express');
const rollup  = require('express-middleware-rollup');
const sass    = require('node-sass-middleware');
const buble   = require('rollup-plugin-buble');
const appRoot = require('app-root-path').toString();

const composeMiddlewares = (...middlewares) => middlewares.reduce(
  (a, b) =>
    (req, res, next) =>
      a(req, res, err => err ? next(err) : b(req, res, next))
);

// Javascript compilation
const js = rollup({
  src: 'frontend/js',
  dest: 'static/js',
  root: appRoot,
  prefix: '/js',
  rollupOpts: {
    plugins: [buble()]
  }
});

// Css compilation
const scss = sass({
  root: appRoot,
  src: 'frontend/css',
  dest: 'static/css',
  outputStyle: 'extended',
  prefix: '/css',
  includePaths: [
    `${appRoot}/node_modules`
  ]
});

// Static file server
const statics = express.static(`${appRoot}/static`);

module.exports = composeMiddlewares(js, scss, statics);
