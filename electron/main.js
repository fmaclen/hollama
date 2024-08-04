import { join } from 'path';
import { app, BrowserWindow, utilityProcess } from 'electron';

const isAppPackaged = process.env.IS_APP_PACKAGED === 'true';
const hollamaHost = isAppPackaged ? '0.0.0.0' : '127.0.0.1';
const hollamaPort = isAppPackaged ? '4173' : '5173';

function createWindow() {
	console.log("creating window")
	const mainWindow = new BrowserWindow({
		width: 1280,
		height: 800,
		minWidth: 400,
		minHeight: 640
	});

	mainWindow.loadURL(`http://${hollamaHost}:${hollamaPort}`);
}

app
	.whenReady()
	.then(() => {
		if (isAppPackaged) {
			const utility = utilityProcess.fork(join(app.getAppPath(), 'build', 'index.js'), {
				env: { HOST: hollamaHost, PORT: hollamaPort }
			});

			utility.on('message', (message) => message === 'ready' && createWindow());
		} else {
			console.warn('Running Electron in development mode');
			console.log('Run `npm run dev` to start the Hollama server separately');
			createWindow();
		}

		// macOS: Open a window if none are open
		app.on('activate', function () {
			if (BrowserWindow.getAllWindows().length === 0) createWindow();
		});
	})
	.catch(console.error);

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit();
});
