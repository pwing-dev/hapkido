const express = require('express');
const rollup  = require('express-middleware-rollup');
const sass    = require('node-sass-middleware');
const exphbs  = require('express-handlebars');
const path    = require('path');
const buble   = require('rollup-plugin-buble');

const app = express();

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

// Templating
app.set('views', 'frontend/html/');
app.engine('.hbs', exphbs({
  defaultLayout: 'default',
  extname: '.hbs',
  layoutsDir: 'frontend/html/layouts/',
  partialsDir: 'frontend/html/partials/'
}));
app.set('view engine', '.hbs');
app.get('/', function (req, res) {
    res.render('home');
});


app.listen(3000);
