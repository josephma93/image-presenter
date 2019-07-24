angular.module( 'app.projectionControl' )
	.service( 'ProjectionControlService', [

		function ProjectionControlSvc(
		) {
			/**
			 * User interface image
			 * @typedef {Object} ImageForProjection
			 * @property {string} src
			 * @property {('contain'|'cover'|'fill'|'none'|'scale-down')} objectFit
			 * @property {string} objectPosition
			 */

			const svc = new EventEmitter(),
				{ ipcRenderer } = electron,
				/** @type {ImageForProjection[]} */
				imagesToProject = [],
				dataToExpose = {
					/** @type {ImageForProjection} */
					imageProjected: null,
					imagesToProject,
				},
				serviceData = new Proxy( dataToExpose, {
					set( target, property, value ) {
						switch ( property ) {
						case 'imageProjected':
							ipcRenderer.send( 'setProjectedImage', value );
							break;
						}
						// Return true to indicate that assignment succeeded.
						return Reflect.set( ...arguments );
					}
				});

			svc.data = serviceData;

			svc.addFileListToImagesForProjection = addFileListToImagesForProjection;
			svc.addImagesForProjection = addImagesForProjection;
			svc.removeImageForProjection = removeImageForProjection;

			/**
			 * @param {FileList} files
			 * @returns {ImageForProjection[]}
			 */
			function _fileListToImageForProjection( files ) {
				return Array.from( files )
					.map( file => {
						return new Proxy({
							src: path.normalize( file.path ),
							objectFit: 'contain',
							objectPosition: '50% 50%',
						}, {
							set( target ) {
								let result = Reflect.set( ...arguments );
								ipcRenderer.send( 'setProjectedImage', target );
								return result;
							}
						});
					});
			}

			/**
			 * @param {ImageForProjection[]} images
			 */
			function addImagesForProjection( images ) {
				// TODO: check for duplicates
				imagesToProject.push( ...images );
				// svc.emit( 'imagesProjectedChanged', imagesToProject );
			}

			/**
			 * @param {FileList} files
			 */
			function addFileListToImagesForProjection( files ) {
				let images = _fileListToImageForProjection( files );
				addImagesForProjection( images );
			}

			/**
			 * @param {ImageForProjection} image
			 */
			function removeImageForProjection( image ) {
				let indexOfImageToRemove = imagesToProject.indexOf( image );
				if ( indexOfImageToRemove > -1 ) {
					let imageToRemove = imagesToProject[ indexOfImageToRemove ];
					imagesToProject.splice( indexOfImageToRemove, 1 );
					if ( dataToExpose.imageProjected === imageToRemove ) {
						dataToExpose.imageProjected = null;
					}
				}
			}

			return svc;
		}
	]);
