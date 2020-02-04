const vscode = require('vscode');
const unirest = require('unirest');
const editor = vscode.window.activeTextEditor;
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log('WebAily is active!');
	let disposable = vscode.commands.registerCommand('webaily.short', async function () {
		let selected;
		if(vscode.window.activeTextEditor){
			selected = editor.document.getText(editor.selection);
			selected = selected.replace(/\s/g, '');
		}
		if(!/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test(selected)){
			selected === ''
		}
		const result = await vscode.window.showInputBox({
			value: selected,
			placeHolder: 'Enter url to short',
			prompt: "WebAily Short",
			validateInput: text => {
				if(!/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test(text)){
					return "Provide valid URL!"
				}
			}
		});
		if(result !== undefined && !/shortly\.page\.link\/[a-zA-Z0-9]/.test(result)){
			const result2 = await vscode.window.showQuickPick(['short', 'long'], {
				placeHolder: 'Select link option'
			});
			if(result2 !== undefined){
				vscode.window.withProgress({
					location: vscode.ProgressLocation.Notification,
					title: `Shorting ${result} ...`,
					cancellable: false
				}, () => {
					var p = new Promise(resolve => {
						const data = JSON.stringify({
							url: result,
							type: result2,
							token: "bGVzemVra0BsZXN6ZWtrLmV1"
						});
						unirest.post('https://webaily.web.app/shorturl')
						.headers({'Content-Type': 'application/json'})
						.send(data)
						.then((response) => {
							const resJSON = JSON.parse(response.body);
							const shortedUrl = resJSON.url;
							vscode.window.showInformationMessage(`Shorted URL: ${shortedUrl}`, ...['Copy', 'OK'])
							.then(selection => {
								if(selection === 'Copy'){
									vscode.env.clipboard.writeText(shortedUrl);
									vscode.window.showInformationMessage(`Copied! - ${shortedUrl}`, ...['ok']);
								}
							})
						})
						.catch(error => {
							vscode.window.showErrorMessage("Error! [API REQUEST]");
						})
						resolve();
					});
					return p;
				});
			}

		}
	});
	context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() {}
module.exports = {
	activate,
	deactivate
}