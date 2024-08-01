// Modules to control application life and create native browser window
import { app, BrowserWindow } from 'electron';
import path from 'path';
import express from 'express';
import cors from 'cors';

const { pathname: electron } = new URL('.', import.meta.url);

const localServerApp = express();
const PORT = 5173;
const startLocalServer = (done) => {
	localServerApp.use(express.json({ limit: '100mb' }));
	localServerApp.use(cors());
	localServerApp.use(express.static('./build/'));
	localServerApp.listen(PORT, async () => {
		console.log('Server started on port', PORT);
		done();
	});
};

function createWindow() {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: 1280,
		height: 800,
		minWidth: 400,
		minHeight: 640
		webPreferences: {
			preload: path.join(electron, 'preload.js')
		}
	});

	// and load the index.html of the app.
	//   mainWindow.loadFile('index.html')
	mainWindow.loadURL('http://localhost:' + PORT);

	// Open the DevTools.
	// mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	startLocalServer(createWindow);

	app.on('activate', function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
