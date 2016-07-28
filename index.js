const express = require('express');
const exphbs  = require('express-handlebars');
const handleStatic = require('./routes/static');

const app = express();
handleStatic(app);

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
    res.render('dashboard');
});


app.listen(3000);
