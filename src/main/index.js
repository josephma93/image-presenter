const {
		app,
		BrowserWindow
	} = require('electron');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
	app.quit();
}

let mainWindow;

function createWindow() {
	mainWindow = new BrowserWindow({
		backgroundColor: '#2e2c29',
		width: 800,
		height: 600,
		center: true,
		show: false,
	});

	mainWindow.loadURL(`file://${__dirname}/src/renderer/app.html`);

	mainWindow.webContents.openDevTools({ mode: 'right' });
	mainWindow.webContents.once('devtools-opened', () => {
		mainWindow.webContents.addWorkSpace(__dirname);
	});

	mainWindow.once('ready-to-show', () => {
		mainWindow.show();
	});

	mainWindow.on('closed', () => {
		mainWindow = null;
	});
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (mainWindow === null) {
		createWindow();
	}
});
