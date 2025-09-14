// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const platformOpenCommand: Record<NodeJS.Platform, string> = {
	win32: 'start ""',
	darwin: 'open',
	linux: 'xdg-open',
	// The following platforms are not supported by this extension
	// If you want to support these platforms, you can add the appropriate commands
	// or use a library like `open` that abstracts the platform differences
	aix: 'xdg-open',
    freebsd: 'xdg-open',
    android: 'xdg-open',
    sunos: 'xdg-open',
    haiku: 'xdg-open',
    openbsd: 'xdg-open',
    cygwin: 'xdg-open',
    netbsd: 'xdg-open'
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Jump Zotero is now active!');

	const commandID = 'zotero-link.jump';

	const jumpHandler = (uri: string) => {
		if (!uri) {
			vscode.window.showErrorMessage('No Zotero link provided.');
			return;
		}
		// Use VS Code API to open the link on the UI side
		vscode.env.openExternal(vscode.Uri.parse(uri)).then(
			(success) => {
				if (!success) {
					vscode.window.showErrorMessage('Could not open Zotero link.');
				}
			},
			(err) => {
				vscode.window.showErrorMessage(`Could not open Zotero link: ${err}`);
			}
		);
	};


	// Register a document link provider for markdown files to create clickable links
	// that execute the command and pass the Zotero link as an argument
	// This allows users to click on Zotero links in markdown files
	// and open them directly in Zotero
	const commandDisposable = vscode.commands.registerCommand(commandID, jumpHandler);
	const clickDisposable = vscode.languages.registerDocumentLinkProvider(['markdown', 'latex', 'tex'], {
        provideDocumentLinks(document, token) {
            const text = document.getText();
            const regex = /zotero:\/\/[&\w/?=-]+/g;
            const links = [];
            let match;
            while ((match = regex.exec(text)) !== null) {
                const start = document.positionAt(match.index);
                const end = document.positionAt(match.index + match[0].length);
                const range = new vscode.Range(start, end);
                const commandUri = vscode.Uri.parse(
                    `command:${commandID}?${encodeURIComponent(JSON.stringify(match[0]))}`
                );
                links.push(new vscode.DocumentLink(range, commandUri));
            }
            return links;
        }
    });
	context.subscriptions.push(commandDisposable, clickDisposable);
}
