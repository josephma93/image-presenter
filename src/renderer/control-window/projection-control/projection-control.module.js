angular.module( 'app.projectionControl', [])
	.constant( 'SUPPORTED_IMAGE_TYPES', new Set([
		'apng',
		'bmp',
		'gif',
		'jpe',
		'jpeg',
		'jpg',
		'png',
		'webp',
	]));
