angular.module( 'app.projectionCanvas' )
	.controller( 'ProjectionCanvasController', [
		'$scope',

		function ProjectionCanvasCtrl(
			$scope
		) {
			const vm = this,
				{ ipcRenderer } = electron;

			vm.imageProjected = null;
			vm.$onInit = $onInit;

			function _setProjectedImage( event, imageProjected ) {
				$scope.safeApply(() => {
					vm.imageProjected = imageProjected;
				});
			}

			function $onInit() {
				ipcRenderer.send( 'projectionCanvasInitialized' );
			}

			ipcRenderer.on( 'setProjectedImage', _setProjectedImage );
		}
	]);
