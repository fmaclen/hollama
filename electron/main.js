import net from 'net';
import { join } from 'path';
import { app, BrowserWindow, dialog, shell, utilityProcess } from 'electron';

// Vite default dev & production ports
const hollamaPort = app.isPackaged ? '4173' : '5173';
const HOLLAMA_HOST = '127.0.0.1';
const HOLLAMA_ORIGIN = `http://${HOLLAMA_HOST}:${hollamaPort}`;

function openInBrowser(url) {
	const { protocol } = new URL(url);
	if (protocol === 'http:' || protocol === 'https:') shell.openExternal(url);
}

function createWindow() {
	const mainWindow = new BrowserWindow({
		width: 1280,
		height: 800,
		minWidth: 400,
		minHeight: 640
	});

	mainWindow.menuBarVisible = false; // Windows: hides the menu bar

	// Links that would leave the app (new windows or navigating away from Hollama)
	// open in the default browser instead, so the app window always shows Hollama
	mainWindow.webContents.setWindowOpenHandler(({ url }) => {
		openInBrowser(url);
		return { action: 'deny' };
	});
	mainWindow.webContents.on('will-navigate', (event) => {
		if (new URL(event.url).origin === HOLLAMA_ORIGIN) return;
		event.preventDefault();
		openInBrowser(event.url);
	});

	mainWindow.loadURL(HOLLAMA_ORIGIN);
}

function checkServerAvailability(port) {
	const MAX_RETRIES = 10;
	const RETRY_INTERVAL_IN_MS = 1000;

	return new Promise((resolve, reject) => {
		let retries = 0;

		function tryConnection() {
			const socket = new net.Socket();

			const onError = () => {
				socket.destroy();

				if (retries >= MAX_RETRIES) {
					reject(new Error(`Couldn't connect to Hollama server after ${MAX_RETRIES} attempts`));
				} else {
					retries++;
					setTimeout(tryConnection, RETRY_INTERVAL_IN_MS);
				}
			};

			socket.setTimeout(1000);
			socket.once('error', onError);
			socket.once('timeout', onError);

			socket.connect(port, HOLLAMA_HOST, () => {
				socket.destroy();
				resolve();
			});
		}

		tryConnection();
	});
}

app
	.whenReady()
	.then(async () => {
		if (app.isPackaged) {
			utilityProcess.fork(join(app.getAppPath(), 'build', 'index.js'), {
				env: { ...process.env, PORT: hollamaPort }
			});
		} else {
			console.warn('##### Running Electron in development mode');
			console.log('##### Run `npm run dev` to start the Hollama server separately');
		}

		await checkServerAvailability(parseInt(hollamaPort));
		createWindow();
	})
	.catch((error) => {
		dialog.showErrorBox('Error', error.message);
		app.quit();
	});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit();
});

// macOS: Open a window if none are open
app.on('activate', function () {
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
