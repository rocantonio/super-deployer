// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const server = require('./SERVICE/server');
const open = require('open');
let serverStatus = false;
let myStatusBarItem;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "super-deployer" is now active!');

	const myCommandId = 'superDeployer.startServer';

	context.subscriptions.push(vscode.commands.registerCommand(myCommandId, async () => {
		// let fileProxy = vscode.workspace.findFiles('**/config.proxy.js', '**/node_modules/**', 1);
		// let pathStarter = vscode.workspace.findFiles('**/webapp/index.html', '**/node_modules/**', 1);
		let port = await server.checkPort();
		if (serverStatus) {
			stopServer();
		} else {
			startServer(port);
			vscode.window.showInformationMessage(`Super Server started at http://localhost:${port}`);
		}


	}));
	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
	myStatusBarItem.command = myCommandId;
	context.subscriptions.push(myStatusBarItem);
	updateStatusBarItem();
}
exports.activate = activate;


function updateStatusBarItem(port) {
	if (serverStatus) {
		myStatusBarItem.text = `$(microscope) :${port}`;
	} else {
		myStatusBarItem.text = `$(octoface) Super Deployer`;
	}

	myStatusBarItem.show();
}

async function startServer(port) {
	server.start();
	serverStatus = true;
	await open(`http://localhost:${port}`);
	updateStatusBarItem(port);
}

function stopServer() {
	server.stop();
	serverStatus = false;
	updateStatusBarItem();
}
// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
