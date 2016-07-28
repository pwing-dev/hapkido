const express = require('express');
const rollup  = require('express-middleware-rollup');
const path    = require('path');
 
const app = express();
app.use(rollup({
  src: 'frontend/js',
  dest: 'static',
  root: __dirname,
  prefix: '/js'
}));
app.use(express.static(path.join(__dirname, 'static')));
app.listen(3000);
