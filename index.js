const config       = require('config');
const createServer = require('./server/server');

if (require.main === module) {
  // called directly from cli
  createServer().then(
    app => app.listen(config.get('server.port')),
    error => { console.error(error); process.exit(1); }
  );
} else {
  // required by other file
  module.exports = createServer;
}
