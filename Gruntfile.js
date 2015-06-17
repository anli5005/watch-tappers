module.exports = function(grunt) {
	
	grunt.initConfig({
		clean: {
			css: ["css"],
			js: ["js/watch-tappers.js", "js/*.min.js"]
		},
		concat: {
			js: {
				src: ["js/watch-tappers-core.js", "js/watch-tappers-ui.js"],
				dest: "js/watch-tappers.js"
			}
		},
		less: {
			styles: {
				options: {
					plugins: [
					new (require('less-plugin-autoprefix'))({browsers: ["last 2 versions"]})
					]
				},
				files: {
					"css/watch-tappers.css": "less/watch-tappers.less"
				}
			}
		},
		cssmin: {
			styles: {
				files: {
					"css/watch-tappers.min.css": "css/watch-tappers.css"
				}
			}
		},
		uglify: {
			js: {
				options: {
					mangle: false
				},
				files: {
					"js/watch-tappers.min.js": "js/watch-tappers.js",
					"js/watch-tappers-core.min.js": "js/watch-tappers-core.js",
					"js/watch-tappers-ui.min.js": "js/watch-tappers-ui.js"
				}
			}
		}
	});
	
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-less");
	grunt.loadNpmTasks("grunt-contrib-cssmin");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	
	grunt.registerTask("js", ["clean:js", "concat:js", "uglify:js"]);
	grunt.registerTask("css", ["clean:css", "less:styles", "cssmin:styles"]);
	
	grunt.registerTask("process", ["js", "css"]);
	
	grunt.registerTask("default", ["process"]);
};
