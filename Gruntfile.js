module.exports = ( grunt ) => {
	// Load all grunt tasks matching the ['grunt-*', '@*/grunt-*'] patterns
	require( 'load-grunt-tasks' )( grunt );

	const ENV_PRESET_CONFIG = [ '@babel/preset-env', {
			'targets': 'last 1 Electron version',
		} ],
		RENDERER_FOLDER = 'src/renderer',
		COMPILED_FOLDER = '<%= PATHS.RENDERER_FOLDER %>/compiled',
		CSS_OUTPUT = {
			CONTROL: '<%= PATHS.COMPILED_FOLDER %>/control-window.css',
			PROJECTION: '<%= PATHS.COMPILED_FOLDER %>/projection-window.css',
		},
		JS_OUTPUT = {
			CONTROL: '<%= PATHS.COMPILED_FOLDER %>/control-window.js',
			CONTROL_LIBS: '<%= PATHS.COMPILED_FOLDER %>/control-window-libs.js',
			PROJECTION: '<%= PATHS.COMPILED_FOLDER %>/projection-window.js',
			PROJECTION_LIBS: '<%= PATHS.COMPILED_FOLDER %>/projection-window-libs.js',
		},
		SASS_FILES_CONFIG = {
			'<%= PATHS.CSS_OUTPUT.CONTROL %>': '<%= PATHS.RENDERER_FOLDER %>/control-window/control-window.scss',
			'<%= PATHS.CSS_OUTPUT.PROJECTION %>': '<%= PATHS.RENDERER_FOLDER %>/projection-window/projection-window.scss',
		},
		CONTROL_JS_FILES_CONFIG = {
			'<%= PATHS.JS_OUTPUT.CONTROL %>': [
				// Load modules first
				'<%= PATHS.RENDERER_FOLDER %>/control-window/**/*.module.js',
				// include main module after the others to honor dependencies
				'<%= PATHS.RENDERER_FOLDER %>/control-window/control-window.js',
				// include everything else
				'<%= PATHS.RENDERER_FOLDER %>/control-window/**/*.js',
				// with the exception of compiled folder (don't want to include output in the input)
				'!<%= PATHS.COMPILED_FOLDER %>/control-window/**/*',
			],
		},
		PROJECTION_JS_FILES_CONFIG = {
			'<%= PATHS.JS_OUTPUT.PROJECTION %>': [
				// Load modules first
				'<%= PATHS.RENDERER_FOLDER %>/projection-window/**/*.module.js',
				// include main module after the others to honor dependencies
				'<%= PATHS.RENDERER_FOLDER %>/projection-window/projection-window.js',
				// include everything else
				'<%= PATHS.RENDERER_FOLDER %>/projection-window/**/*.js',
				// with the exception of compiled folder (don't want to include output in the input)
				'!<%= PATHS.COMPILED_FOLDER %>/projection-window/**/*',
			],
		};

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON( 'package.json' ),

		PATHS: {
			RENDERER_FOLDER,
			COMPILED_FOLDER,
			CSS_OUTPUT,
			JS_OUTPUT,
		},

		sass: {
			dev: {
				options: {
					quiet: true,
					sourcemap: 'auto',
					style: 'expanded',
					update: true,
				},
				files: SASS_FILES_CONFIG,
			},
			prod: {
				options: {
					quiet: true,
					sourcemap: 'auto',
					style: 'compressed',
				},
				files: SASS_FILES_CONFIG,
			},
		},

		eslint: {
			dev: {
				options: {
					cache: true,
					fix: true,
				},
				src: '.',
			},
			prod: [ '.' ],
		},

		concat: {
			dev: {
				files: {
					'<%= PATHS.JS_OUTPUT.CONTROL_LIBS %>': [
						'node_modules/angular/angular.js',
						'node_modules/angular-sanitize/angular-sanitize.js',
					],
					'<%= PATHS.JS_OUTPUT.PROJECTION_LIBS %>': [
						'node_modules/angular/angular.js',
					],
				},
			},
			prod: {
				files: {
					'<%= PATHS.JS_OUTPUT.CONTROL_LIBS %>': [
						'node_modules/angular/angular.min.js',
						'node_modules/angular-sanitize/angular-sanitize.min.js',
					],
					'<%= PATHS.JS_OUTPUT.PROJECTION_LIBS %>': [
						'node_modules/angular/angular.min.js',
					],
				},
			},
		},

		babel_multi_files: {
			options: {
				comments: false,
				minified: true,
				sourceMap: true,
			},
			devControl: {
				options: {
					taskOptions: {
						cache: true,
						cacheName: 'devControl',
						cacheDirectory: '.babelTranspileCache',
						cacheUsingCheckSum: true,
					},
					presets: [
						ENV_PRESET_CONFIG,
					],
				},
				files: CONTROL_JS_FILES_CONFIG,
			},
			devProjection: {
				options: {
					taskOptions: {
						cache: true,
						cacheName: 'devProjection',
						cacheDirectory: '.babelTranspileCache',
						cacheUsingCheckSum: true,
					},
					presets: [
						ENV_PRESET_CONFIG,
					],
				},
				files: PROJECTION_JS_FILES_CONFIG,
			},
			prod: {
				options: {
					presets: [
						[ 'minify' ],
						ENV_PRESET_CONFIG,
					],
				},
				files: Object.assign(
					{},
					CONTROL_JS_FILES_CONFIG,
					PROJECTION_JS_FILES_CONFIG,
				),
			},
		},

		watch: {
			configFiles: {
				options: {
					reload: true,
				},
				files: [ 'Gruntfile.js', 'package.json' ],
				tasks: [
					'eslint:dev',
				],
			},
			mainFiles: {
				files: [
					'src/main/**/*.js',
				],
				tasks: [
					'eslint:dev',
				],
			},
			controlWindowScripts: {
				files: [
					'<%= PATHS.RENDERER_FOLDER %>/control-window/**/*.js',
				],
				tasks: [
					'eslint:dev',
					'babel_multi_files:devControl',
				],
			},
			projectionWindowScripts: {
				files: [
					'<%= PATHS.RENDERER_FOLDER %>/projection-window/**/*.js',
				],
				tasks: [
					'eslint:dev',
					'babel_multi_files:devProjection',
				],
			},
			styles: {
				files: [
					'<%= PATHS.RENDERER_FOLDER %>/**/*.scss',
				],
				tasks: [ 'sass:dev' ],
			},
		},
	});

	// Register tasks
	grunt.registerTask( 'development', [
		'sass:dev',
		'concat:dev',
		'eslint:dev',
		'babel_multi_files:devControl',
		'babel_multi_files:devProjection',
	]);
	grunt.registerTask( 'production', [
		'sass:prod',
		'concat:prod',
		'eslint:prod',
		'babel_multi_files:prod',
	]);
	grunt.registerTask( 'default', [
		'development',
		'watch',
	]);

};
