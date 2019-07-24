angular.module( 'app.core' )
	.factory( 'ImageForProjection', [

		function ImageForProjectionModel(
		) {

			function equals( expected ) {
				const actual = this;
				let areEqual = actual.src === expected.src;
				return areEqual;
			}

			function makeImageForProjection( file ) {
				return {
					src: path.normalize( file.path ),
					preset: null,
					equals,
				};
			}

			return makeImageForProjection;
		}
	]);
