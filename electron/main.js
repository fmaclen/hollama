import { app, BrowserWindow, utilityProcess } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HOST = '127.0.0.1';
const PORT = '5173';

function createWindow() {
	const mainWindow = new BrowserWindow({
		width: 1280,
		height: 800,
		minWidth: 400,
		minHeight: 640
	});

	mainWindow.loadURL(`http://${HOST}:${PORT}`);

	// Open the DevTools.
	// mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app
	.whenReady()
	.then(() => {
		const file = path.join(__dirname, '../build', 'index.js');
		console.log(file);
		const utility = utilityProcess.fork(file, {
			env: {
				HOST,
				PORT
			}
		});

		utility.on('message', (message) => {
			console.log(message);
			if (message === 'ready') {
				createWindow();
			}
		});

		app.on('activate', function () {
			// On macOS it's common to re-create a window in the app when the
			// dock icon is clicked and there are no other windows open.
			if (BrowserWindow.getAllWindows().length === 0) createWindow();
		});
	})
	.catch(console.error);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit();
});
