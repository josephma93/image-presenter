angular.module( 'app.projectionControl' )
	.controller( 'ProjectionControlController', [
		'$scope',
		'$element',
		'ProjectionControlService',
		'SUPPORTED_IMAGE_TYPES',

		/**
		 * @param {jQuery} $element
		 * @param {Set<string>} SUPPORTED_IMAGE_TYPES
		 */
		function ProjectionControlCtrl(
			$scope,
			$element,
			ProjectionControlService,
			SUPPORTED_IMAGE_TYPES,
		) {
			const vm = this,
				DYNAMIC_CSS_CLASSES = {
					DROP_DATA_SUPPORTED: 'can-take-drop',
				};
			/**
			 * Alert object definition
			 * @typedef {Object} AlertMessage
			 * @property {('success'|'info'|'warning'|'danger')} type
			 * @property {boolean} [isDismissible=false]
			 * @property {string} HTMLMessage
			 */

			/** @type {AlertMessage[]} */
			let floatingAlerts = [];

			vm.showDropSupportedMessage = false;
			vm.floatingAlerts = floatingAlerts;
			vm.$onInit = $onInit;
			vm.$doCheck = $doCheck;

			/**
			 * @param {string} MIMEType
			 * @returns {boolean}
			 */
			function _isASupportedImageType( MIMEType ) {
				return SUPPORTED_IMAGE_TYPES.has( mime.getExtension( MIMEType ));
			}

			/**
			 * @param {DataTransfer} dataTransfer
			 * @returns {boolean}
			 */
			function _isDropDataSupported( dataTransfer ) {
				const { items } = dataTransfer;
				let itemsIdx = items.length,
					isSupported = itemsIdx > 0;

				while (( itemsIdx-- > 0 ) && isSupported ) {
					const item = items[ itemsIdx ];
					isSupported = item.kind === 'file' && _isASupportedImageType( item.type );
				}

				return isSupported;
			}

			function _showDropSupportedMessage() {
				vm.showDropSupportedMessage = true;
				$element.addClass( DYNAMIC_CSS_CLASSES.DROP_DATA_SUPPORTED );
			}

			function _hideDropSupportedMessage() {
				vm.showDropSupportedMessage = false;
				$element.removeClass( DYNAMIC_CSS_CLASSES.DROP_DATA_SUPPORTED );
			}

			function _setUpDropBehaviour() {
				let dragOverCounter = 0;
				$element
					.on( 'dragenter', function dragEnterListener( event ) {
						++dragOverCounter;
						const { dataTransfer } = event;
						if ( _isDropDataSupported( dataTransfer )) {
							// Allow drop
							event.preventDefault();
							dataTransfer.effectAllowed = dataTransfer.dropEffect = 'link';
							$scope.safeApply( _showDropSupportedMessage );
						}
					})
					.on( 'dragover', function dragOverListener( event ) {
						const { dataTransfer } = event;
						if ( _isDropDataSupported( dataTransfer )) {
							event.preventDefault();
							dataTransfer.effectAllowed = dataTransfer.dropEffect = 'link';
						}
					})
					.on( 'dragleave', function dragLeaveListener() {
						--dragOverCounter;
						if ( dragOverCounter === 0 ) {
							$scope.safeApply( _hideDropSupportedMessage );
						}
					})
					.on( 'drop', function dropEventListener( event ) {
						// Prevent browser from doing default behaviour
						event.preventDefault();
						dragOverCounter = 0;
						const { dataTransfer } = event;
						if ( _isDropDataSupported( dataTransfer )) {
							$scope.safeApply(() => {
								_hideDropSupportedMessage();
								// Process files dropped
								ProjectionControlService.addFileListToImagesForProjection( dataTransfer.files );
							});
						}
					});
			}

			function $onInit() {
				_setUpDropBehaviour();
			}

			function $doCheck() {

			}
		}
	]);
