angular.module( 'app.projectionControl' )
	.controller( 'ImagePreviewController', [
		'$scope',
		'$element',
		'ProjectionControlService',

		function ImagePreviewCtrl(
			$scope,
			$element,
			ProjectionControlService,
		) {
			const vm = this,
				{
					ipcRenderer,
				} = electron;

			/** @type {HTMLElement} */
			let screenFrameElm = null;

			vm.$onInit = $onInit;
			vm.ctrlPnlSvcData = ProjectionControlService.data;
			vm.canvasHeight = null;

			function $onInit() {
				screenFrameElm = $element[ 0 ].querySelector( '#screenFrame' );
			}

			function _handleCanvasDimensionChange( canvasDimensions ) {
				const {
					height: originalHeight,
					width: originalWidth,
				} = canvasDimensions;
				/**
				 * Say you have a photo that is 1600 x 1200 pixels, but your blog only has space for a photo 400 pixels wide.
				 * To find the new height of your photo—while preserving the aspect ratio—you would need to do the following calculation:
				 * (original height / original width) x new width = new height
				 */
				vm.canvasHeight = originalHeight / originalWidth * screenFrameElm.offsetWidth + 'px';
				vm.canvasWidth = originalWidth / originalHeight * screenFrameElm.offsetHeight + 'px';
			}

			$scope.$on( 'projectionCanvasDimensionChanged', _handleCanvasDimensionChange );
			ipcRenderer.on( 'projectionCanvasInitialized', ( event, canvasDimensions ) => {
				$scope.safeApply(() => {
					_handleCanvasDimensionChange( canvasDimensions );
				});
			});
		}
	]);
