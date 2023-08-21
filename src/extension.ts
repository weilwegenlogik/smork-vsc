import * as vscode from 'vscode';
import * as fs from 'fs';
import * as child_process from 'child_process';

export function activate(context: vscode.ExtensionContext) {
    vscode.extensions.all.forEach(extension => {
        console.log(extension.packageJSON.displayName);
        console.log(extension.packageJSON.contributes.statusbarItems);
    });

    let majorButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    majorButton.text = "$(triangle-up) Major";
    majorButton.command = 'extension.incrementMajor';
    majorButton.show();

    let minorButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 101);
    minorButton.text = "$(triangle-up) Minor";
    minorButton.command = 'extension.incrementMinor';
    minorButton.show();

    let patchButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 102);
    patchButton.text = "$(triangle-up) Patch";
    patchButton.command = 'extension.incrementPatch';
    patchButton.show();

    context.subscriptions.push(
        vscode.commands.registerCommand('extension.incrementMajor', () => {
            incrementAndExecute('major');
        }),
        vscode.commands.registerCommand('extension.incrementMinor', () => {
            incrementAndExecute('minor');
        }),
        vscode.commands.registerCommand('extension.incrementPatch', () => {
            incrementAndExecute('patch');
        })
    );
}

function incrementAndExecute(level: 'major' | 'minor' | 'patch') {
    const packageJsonPath = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath + '/package.json' : null;
if (!packageJsonPath) {
    vscode.window.showErrorMessage('No workspace found.');
    return;
}
const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
const packageJson = JSON.parse(packageJsonContent);

    packageJson.version = incrementVersion(packageJson.version, level);
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    child_process.exec('npm start', (error, stdout, stderr) => {
        if (error) {
            vscode.window.showErrorMessage('Error executing npm start');
        } else {
            vscode.window.showInformationMessage('npm start executed successfully');
        }
    });
}

function incrementVersion(version: string, level: 'major' | 'minor' | 'patch'): string {
    const [major, minor, patch] = version.split('.').map(Number);

    switch (level) {
        case 'major':
            return `${major + 1}.0.0`;
        case 'minor':
            return `${major}.${minor + 1}.0`;
        case 'patch':
            return `${major}.${minor}.${patch + 1}`;
        default:
            return version;
    }
}

export function deactivate() {}
