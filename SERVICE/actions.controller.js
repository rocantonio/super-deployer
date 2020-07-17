const { exec, spawn } = require("child_process");
const WebSocketServer = require('ws').Server;

const vscode = require('vscode');
const yaml = require('js-yaml');
const fs = require('fs');

function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}
exports.getProjects = async (req, res) => {
    let findMTA = vscode.workspace.findFiles('**/mta.yaml', '**/node_modules/**');
    let findMTAD = vscode.workspace.findFiles('**/mtad.yaml', '**/node_modules/**');
    let findDEV = vscode.workspace.findFiles('**/dev.mtaext', '**/node_modules/**');
    let findTEST = vscode.workspace.findFiles('**/test.mtaext', '**/node_modules/**');
    let findPROD = vscode.workspace.findFiles('**/prod.mtaext', '**/node_modules/**');
    var projects = [];
    var extensions = []
    let DEVExt = await findDEV;
    let TESTExt = await findTEST;
    let PRODExt = await findPROD;
    for (var i in DEVExt) {
        let obj = yaml.load(fs.readFileSync(DEVExt[i].fsPath, { encoding: 'utf-8' }));
        extensions.push({ dev: obj.extends, test: "", prod: "" });
    }

    for (var i in TESTExt) {
        let obj = yaml.load(fs.readFileSync(TESTExt[i].fsPath, { encoding: 'utf-8' }));
        extensions.find((o, i) => {
            if (o.dev == obj.extends) {
                extensions[i].test = o.dev;
            }
        })
    }
    for (var i in PRODExt) {
        let obj = yaml.load(fs.readFileSync(PRODExt[i].fsPath, { encoding: 'utf-8' }));
        extensions.find((o, i) => {
            if (o.test == obj.extends) {
                extensions[i].prod = o.test;
            }
        })
    }


    let MTAUris = await findMTA;
    for (var i in MTAUris) {
        let obj = yaml.load(fs.readFileSync(MTAUris[i].fsPath, { encoding: 'utf-8' }));
        let ext = extensions.find((o) => {
            return obj.ID == o.dev || obj.ID == o.test || obj.ID == o.prod;
        })
        projects.push({ projectName: obj.ID, mta: isEmpty(obj) ? false : obj, mtad: false, dev: ext.dev ? true : false, test: ext.test ? true : false, prod: ext.prod ? true : false });
    }

    let MTADUris = await findMTAD;
    for (var i in MTADUris) {
        var obj = yaml.load(fs.readFileSync(MTADUris[i].fsPath, { encoding: 'utf-8' }));
        let proj = projects.find((proj, index) => {
            if (proj.projectName == obj.ID) {
                projects[index].mtad = obj;
                return true;
            }
            return false;
        });

        if (!proj) {
            let ext = extensions.find((o) => {
                return obj.ID == o.dev || obj.ID == o.test || obj.ID == o.prod;
            })
            projects.push({ projectName: obj.ID, mta: false, mtad: obj, dev: ext.dev ? true : false, test: ext.test ? true : false, prod: ext.prod ? true : false })
        }
    }
    for (var i in projects) {
        projects[i].ID = i;
    }
    return res.send(projects);
};

exports.getOrgs = (req, res) => {
    exec("cf orgs", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        let orgs = stdout.split("name")[1].split("\n");
        orgs.splice(orgs.length - 1, 1);
        for (var i in orgs) {
            orgs[i] = { ID: orgs[i] };
        }
        return res.send(orgs);

    });
};

exports.getSpaces = (req, res) => {
    exec(`cf org "${req.body.ID}"`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        let spaces = stdout.split("spaces:")[1].split("\n")[0].split(", ");
        for (var i in spaces) {
            spaces[i] = { ID: spaces[i].trim() };
        }
        return res.send(spaces);

    });
};

exports.deployProjects = (req, res) => {
    const deploy = req.body;
    // If you want to add a path as well, use path: "PathName"
    const wss = new WebSocketServer({ port: 8080 });
    wss.on('connection', function connection(ws) {
        const ls = spawn('cd /Users/rocantonio/Documents/Projects/ACCENTURE/ENEL && ls && cf orgs && cf org in', {
            shell: true
          });

        ls.stdout.on('data', (data) => {
            ws.send(`stdout ${data}`);
            console.log(`stdout: ${data}`);
        });

        ls.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        ls.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
    });
    res.send({perfect: true})

    // ws.on('message', function incoming(message) {
    //     console.log('received: %s', message);
    // });





};