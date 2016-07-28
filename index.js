const express = require('express');
const rollup  = require('express-middleware-rollup');
const sass    = require('node-sass-middleware');
const path    = require('path');
const buble   = require('rollup-plugin-buble');

const app = express();
app.use(rollup({
  src: 'frontend/js',
  dest: 'static',
  root: __dirname,
  prefix: '/js',
  rollupOpts: {
    plugins: [ buble() ]
  }
}));
app.use(sass({
  root: __dirname,
  src:  'frontend/css',
  dest: 'static',
  outputStyle: 'extended',
  prefix:  '/css'
}));
app.use(express.static(path.join(__dirname, 'static')));
app.listen(3000);
