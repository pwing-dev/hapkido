const express = require('express');
const rollup  = require('express-middleware-rollup');
const sass    = require('node-sass-middleware');
const path    = require('path');
const buble   = require('rollup-plugin-buble');

module.exports = app => {
  // Javascript compilation
  app.use(rollup({
    src: 'frontend/js',
    dest: 'static',
    root: __dirname,
    prefix: '/js',
    rollupOpts: {
      plugins: [ buble() ]
    }
  }));

  // Css compilation
  app.use(sass({
    root: __dirname,
    src:  'frontend/css',
    dest: 'static',
    outputStyle: 'extended',
    prefix:  '/css'
  }));

  // Static file server
  app.use(express.static(path.join(__dirname, 'static')));
}
