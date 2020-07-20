const express = require('express');
const app = express();
const router = require('./router');
const cors = require('cors');
const path = require('path');
const net = require('net');
var port = 3001;
var server = net.createServer();
var server2 = "";
module.exports.checkPort = () => {
  return new Promise((res, rej) => {
    server.once('error', function (err) {
      if (err.code === 'EADDRINUSE') {
        port++;
        module.exports.checkPort();
      }
    });

    server.once('listening', function () {
      // close the server if listening doesn't fail
      server.close();
      res(port);
    });
    server.listen(port);
  })
};



app.use(cors());
app.use('/', router);
// (req, res) => {res.sendFile(path.join(__dirname, '../UI5/webapp/', 'index.html'))}
app.use('/', express.static(path.join(__dirname, '../UI5/webapp/')));

module.exports.app = app;
module.exports.start = async () => {
    server2 = app.listen(port);
}


module.exports.stop = () => {
  server2.close()
}