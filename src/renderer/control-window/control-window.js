angular.module( 'app', [
	'ngSanitize',

	'app.core',
	'app.projectionControl',
])
	.decorator( '$rootScope', function decorateRootScope( $delegate ) {
		$delegate.__proto__.safeApply = function safeApplyChange( expression ) {
			if ( $delegate.$$phase ) {
				this.$evalAsync( expression );
			} else {
				this.$apply( expression );
			}
		};
		return $delegate;
	});
