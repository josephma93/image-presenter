module.exports = function (grunt) {
	// Load all grunt tasks matching the ['grunt-*', '@*/grunt-*'] patterns
	require('load-grunt-tasks')(grunt);

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		clean: {
			tempFolder: [
				'.temp/**'
			],
		},

		concat: {
			jsFiles: {
				files: [{
					src: [
						'src/renderer/app.js',
						'src/renderer/**/*.module.js',
						'src/renderer/**/*.js',
					],
					dest: '.temp/concatenated-not-transpiled.js',
				}]
			},
		},

		copy: {
			dev: {},
			prod: {},
		},

		sass: {
			options: {
				sourcemap: true,
				quiet: true,
				update: true,
			},
			dev: {
				options: {
					style: 'nested',
				},
				files: {
					'.compiled/app.css': 'src/renderer/app.scss',
				}
			},
			prod: {
				options: {
					style: 'compressed',
				},
				files: {
					'.compiled/app.css': 'src/renderer/app.scss',
				}
			},
		},

		babel: {
			options: {
				'sourceMap': true,
			},
			dev: {
				options: {
					'presets': [
						['@babel/preset-env', {
							'targets': 'last 1 Electron version'
						}]
					]
				},
				files: {
					'.compiled/app.js': '.temp/concatenated-not-transpiled.js'
				},
			},
			prod: {
				options: {
					'presets': [
						['minify'],
						['@babel/preset-env', {
							'targets': 'last 1 Electron version'
						}]
					]
				},
				files: {
					'.compiled/app.js': '.temp/concatenated-not-transpiled.js'
				},
			},
		},

		watch: {
			configFiles: {
				files: ['Gruntfile.js', 'package.json'],
				options: {
					reload: true,
				}
			},
			scripts: {
				files: [
					'src/renderer/**/*.js',
				],
				tasks: [
					'clean',
					'concat:jsFiles',
					'babel:dev',
				],
			},
			styles: {
				files: [
					'src/renderer/*.scss',
				],
				tasks: ['sass:dev'],
			},
		},
	});

	// Register tasks
	grunt.registerTask('default', [
		'clean',
		'concat:jsFiles',
		'babel:dev',
		'sass:dev',
		'watch'
	]);
	grunt.registerTask('production', [
		'clean',
		'concat:jsFiles',
		'babel:prod',
		'sass:prod',
	]);

};
