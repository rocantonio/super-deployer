// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const server = require('./SERVICE/server');
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

	context.subscriptions.push(vscode.commands.registerCommand(myCommandId, () => {
		// let fileProxy = vscode.workspace.findFiles('**/config.proxy.js', '**/node_modules/**', 1);
		// let pathStarter = vscode.workspace.findFiles('**/webapp/index.html', '**/node_modules/**', 1);

		if (serverStatus) {
			stopServer();
		} else {
			startServer();
			vscode.window.showInformationMessage(`Super Server started at http://localhost:3001`);
		}


	}));
	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
	myStatusBarItem.command = myCommandId;
	context.subscriptions.push(myStatusBarItem);
	updateStatusBarItem();
}
exports.activate = activate;


function updateStatusBarItem() {
	if (serverStatus) {
		myStatusBarItem.text = `$(microscope) :3001`;
	} else {
		myStatusBarItem.text = `$(octoface) Super Deployer`;
	}

	myStatusBarItem.show();
}

function startServer() {
	server.start();
	serverStatus = true;
	updateStatusBarItem();
}

function stopServer() {
	server.app.close();
	serverStatus = false;
	updateStatusBarItem();
}
// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
