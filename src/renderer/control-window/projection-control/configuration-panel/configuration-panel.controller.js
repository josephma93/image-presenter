angular.module( 'app.projectionControl' )
	.controller( 'ConfigurationPanelController', [
		'$scope',
		'ProjectionControlService',

		function ConfigurationPanelCtrl(
			$scope,
			ProjectionControlService
		) {
			const vm = this,
				{
					ipcRenderer,
				} = electron;

			vm.isProjectionEnabled = false;
			vm.ctrlPnlSvcData = ProjectionControlService.data;
			vm.objectFitOptions = [
				{
					label: 'Contain',
					value: 'contain',
				},
				{
					label: 'Cover',
					value: 'cover',
				},
				{
					label: 'Fill',
					value: 'fill',
				},
				{
					label: 'Scale down',
					value: 'scale-down',
				},
			];
			vm.positionPresets = [
				{
					label: 'Centered',
					value: '50% 50%',
				},
				{
					label: 'Center top',
					value: 'center top',
				},
				{
					label: 'Advanced',
					value: 'custom',
				},
			];
			vm.objectFitPreset = vm.positionPresets[ 0 ];

			vm.toggleProjection = toggleProjection;
			vm.imagePositionPresetChanged = imagePositionPresetChanged;

			function toggleProjection() {
				ipcRenderer.send( 'toggleProjection', vm.isProjectionEnabled );

				if ( vm.isProjectionEnabled ) {
					ipcRenderer.once( 'projectionCanvasInitialized', () => {
						ipcRenderer.send( 'setProjectedImage', ProjectionControlService.data.imageProjected );
					});
				}
			}

			function imagePositionPresetChanged() {
				const {
					objectFitPreset,
					positionPresets,
				} = vm;
				if ( objectFitPreset !== positionPresets[ positionPresets.length - 1 ]) {
					ProjectionControlService.data.imageProjected.objectPosition = objectFitPreset;
				}
			}
		}
	]);
