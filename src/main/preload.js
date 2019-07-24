/* global window */
const electron = require( 'electron' );
window.electron = {
	ipcRenderer: electron.ipcRenderer,
};
window.mime = require( 'mime' );
window.path = require( 'upath' );
window.EventEmitter = require( 'events' );
