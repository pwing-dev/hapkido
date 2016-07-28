const express = require('express');
const rollup  = require('express-middleware-rollup');
const sass    = require('node-sass-middleware');
const buble   = require('rollup-plugin-buble');
const appRoot = require('app-root-path').toString();

module.exports = app => {
  // Javascript compilation
  app.use(rollup({
    src: 'frontend/js',
    dest: 'static/js',
    root: appRoot,
    prefix: '/js',
    rollupOpts: {
      plugins: [buble()]
    }
  }));

  // Css compilation
  app.use(sass({
    root: appRoot,
    src: 'frontend/css',
    dest: 'static/css',
    outputStyle: 'extended',
    prefix: '/css',
    includePaths: [
      `${appRoot}/node_modules`
    ]
  }));

  // Static file server
  app.use(express.static(`${appRoot}/static`));
};
