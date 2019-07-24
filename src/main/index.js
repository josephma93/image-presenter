const electron = require( 'electron' ),
	{
		app,
		BrowserWindow,
		ipcMain,
	} = electron,
	path = require( 'upath' ),
	url = require( 'url' ),
	SRC_FOLDER_PATH = path.resolve( __dirname, '../' ),
	RENDERER_FOLDER_PATH = path.join( SRC_FOLDER_PATH, 'renderer' ),
	MAIN_FOLDER_PATH = path.join( SRC_FOLDER_PATH, 'main' ),
	TEMPLATE_PATHS = {
		MAIN_WINDOW: url.format({
			pathname: path.join( RENDERER_FOLDER_PATH, 'control-window', 'control-window.html' ),
			protocol: 'file:',
			slashes: true,
		}),
		PROJECTION_WINDOW: url.format({
			pathname: path.join( RENDERER_FOLDER_PATH, 'projection-window', 'projection-window.html' ),
			protocol: 'file:',
			slashes: true,
		}),
	};

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if ( require( 'electron-squirrel-startup' )) {
	app.quit();
}

let mainWindow,
	projectionWindow;

function createWindow() {
	mainWindow = new BrowserWindow({
		backgroundColor: '#2e2c29',
		width: 800,
		height: 600,
		center: true,
		show: false,
		webPreferences: {
			preload: path.join( MAIN_FOLDER_PATH, 'preload.js' ),
		},
	});

	mainWindow.loadURL( TEMPLATE_PATHS.MAIN_WINDOW );
	mainWindow.maximize();
	mainWindow.webContents.openDevTools({ mode: 'right', });

	mainWindow.once( 'ready-to-show', () => {
		mainWindow.show();
	});

	mainWindow.on( 'closed', () => {
		mainWindow = null;
	});
}

function getExternalDisplay() {
	let displays = electron.screen.getAllDisplays();
	return displays.find(( display ) => {
		return display.bounds.x !== 0 || display.bounds.y !== 0;
	});
}

function createProjectionWindow() {

	if ( projectionWindow != null ) {
		closeProjectionWindow();
	}

	let externalDisplay = getExternalDisplay(),
		x = 0,
		y = 0;
	if ( externalDisplay != null ) {
		x = externalDisplay.bounds.x + 50;
		y = externalDisplay.bounds.y + 50;
	}

	projectionWindow = new BrowserWindow({
		backgroundColor: '#000000',
		width: 800,
		height: 600,
		x,
		y,
		center: true,
		show: false,
		frame: false,
		fullscreen: true,
		webPreferences: {
			preload: path.join( MAIN_FOLDER_PATH, 'preload.js' ),
		},
	});

	projectionWindow.loadURL( TEMPLATE_PATHS.PROJECTION_WINDOW );

	projectionWindow.once( 'ready-to-show', () => {
		projectionWindow.show();
	});

	projectionWindow.on( 'closed', () => {
		projectionWindow = null;
	});
}

function closeProjectionWindow() {
	if ( projectionWindow == null ) {
		return;
	}
	projectionWindow.close();
}

function toggleProjection( event, isProjectionEnabled ) {

	function setProjectedImage( event, imageProjected ) {
		projectionWindow.webContents.send( 'setProjectedImage', imageProjected );
	}

	if ( isProjectionEnabled ) {
		ipcMain.once( 'projectionCanvasInitialized', () => {
			let rectangle = projectionWindow.getBounds();
			event.reply( 'projectionCanvasInitialized', {
				width: rectangle.width,
				height: rectangle.height,
			});
		});
		ipcMain.on( 'setProjectedImage', setProjectedImage );
		createProjectionWindow();
	} else {
		ipcMain.removeListener( 'setProjectedImage', setProjectedImage );
		closeProjectionWindow();
	}
}

app.on( 'ready', () => {
	ipcMain.on( 'toggleProjection', toggleProjection );
	createWindow();
});

app.on( 'window-all-closed', () => {
	if ( process.platform !== 'darwin' ) {
		app.quit();
	}
});

app.on( 'activate', () => {
	if ( mainWindow === null ) {
		createWindow();
	}
});
