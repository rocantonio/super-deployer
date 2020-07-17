const express = require('express');
const app = express();
const router = require('./router');
const cors = require('cors');
const path = require('path');

app.use(cors());
app.use('/', router);
// (req, res) => {res.sendFile(path.join(__dirname, '../UI5/webapp/', 'index.html'))}
app.use('/', express.static(path.join(__dirname, '../UI5/webapp/')));

module.exports.app = app;
module.exports.start = () =>
  new Promise(resolve => app.listen(3001, () => resolve(app)))