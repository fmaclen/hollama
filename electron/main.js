import { join } from 'path';
import { app, BrowserWindow, utilityProcess } from 'electron';

const hollamaPort = app.isPackaged ? '4173' : '5173';

function createWindow() {
	const mainWindow = new BrowserWindow({
		width: 1280,
		height: 800,
		minWidth: 400,
		minHeight: 640,
	});

	mainWindow.menuBarVisible = false; // Hides the menu bar in Windows
	mainWindow.loadURL(`http:/127.0.0.1:${hollamaPort}`);
}

app
	.whenReady()
	.then(() => {
		if (app.isPackaged) {
			utilityProcess.fork(join(app.getAppPath(), 'build', 'index.js'), {
				env: { ...process.env, PORT: hollamaPort }
			});
		} else {
			console.warn('##### Running Electron in development mode');
			console.log('##### Run `npm run dev` to start the Hollama server separately');
		}

		// FIXME: We create the window before we know if the server is ready.
		// Ideally we would receive a signal from the server or check that it's listening
		// to requests, otherwise the window could be created with a blank page.
		createWindow();

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
