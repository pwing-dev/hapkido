const config       = require('config');
const createServer = require('hapkido-server');

if (require.main === module) {
  // called directly from cli
  createServer().then(
    app => app.listen(config.get('hapkido-server.port')),
    error => { console.error(error); process.exit(1); }
  );
} else {
  // required by other file
  module.exports = createServer;
}
