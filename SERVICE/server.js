const express = require("express");
const app = express();
const router = require("./router");
const cors = require("cors");
const path = require("path");
const net = require("net");
var port = 3001;
var server = net.createServer();
var server2 = "";
const actions = require("./actions.controller");
const { spawn } = require("child_process");

const enableWS = require("express-ws");
enableWS(app);

app.ws("/main", (ws, req) => {
  let cfVersion = actions.cfVersion;
  ws.on("message", (message) => {
    let oData = JSON.parse(message);
    let oInfo = oData.info;
    let aProjects = oData.projects;
    //do the spawn right here (data == JSON with all info)
    let connect = `${cfVersion} t -o "${oInfo.Org}" -s ${oInfo.Space}`;
    //Para mas adelante implementar deployment en tros entornos con MTAEXT (para la DB)
    //Un for para hacer cada build cada todo (sera extensito)
    var project = "";
    for (var i in aProjects) {
      let oProj = aProjects[i];

      project =
        project +
        '&& cd "' +
        aProjects[i].uri.fsPath.substr(0, aProjects[i].uri.fsPath.length - 8) +
        `" && mbt build && ${cfVersion} deploy mta_archives/` +
        aProjects[i].mta.ID +
        "_" +
        aProjects[i].mta.version +
        ".mtar ";
    }
    const executer = spawn(`${connect} ${project}`, { shell: true });

    executer.stdout.on("data", (data) => {
      let obj = { message: data.toString(), type: "NORM" };
      ws.send(JSON.stringify(obj));
      console.log(`stdout: ${data}`);
    });

    executer.stderr.on("data", (data) => {
      let obj = { message: data.toString(), type: "ERROR" };
      ws.send(JSON.stringify(obj));
      console.error(`stderr: ${data}`);
    });

    executer.on("close", (code) => {
      console.log("HOLA");
      let obj = { message: code, type: "FINITO" };
      ws.send(JSON.stringify(obj));
      ws.close();
      console.log(`child process exited with code ${code}`);
    });
  });
});
module.exports.checkPort = () => {
  return new Promise((res, rej) => {
    server.once("error", function (err) {
      if (err.code === "EADDRINUSE") {
        port++;
        module.exports.checkPort();
      }
    });

    server.once("listening", function () {
      // close the server if listening doesn't fail
      server.close();
      res(port);
    });
    server.listen(port);
  });
};

app.use(cors());
app.use("/", router);
// (req, res) => {res.sendFile(path.join(__dirname, '../UI5/webapp/', 'index.html'))}
app.use("/", express.static(path.join(__dirname, "../UI5/webapp/")));

module.exports.app = app;
module.exports.start = async () => {
  server2 = app.listen(port);
};

module.exports.stop = () => {
  server2.close(() => {
    process.exit(0);
  });
};
