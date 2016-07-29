/* global Module */

/* Magic Mirror
 * Module: MMM-RandomPhoto
 *
 * By Diego Vieira <diego@protos.inf.br>
 * ICS Licensed.
 */

Module.register("MMM-RandomPhoto",{
	defaults: {
		opacity: 0.3,
		animationSpeed: 500,
		updateInterval: 60,
		url: 'https://unsplash.it/1920/1080/?random'
	},

	start: function() {
		this.load();
	},

	load: function() {
		var self = this;

		var url = self.config.url + '&' + (new Date().getTime());
		var img = $('<img />').attr('src', url);

		img.on('load', function() {
				$('#mmm-photos-placeholder1').attr('src', url).animate({
					opacity: self.config.opacity
				}, self.config.animationSpeed, function() {
					$(this).attr('id', 'mmm-photos-placeholder2');
				});

				$('#mmm-photos-placeholder2').animate({
					opacity: 0
				}, self.config.animationSpeed, function() {
					$(this).attr('id', 'mmm-photos-placeholder1');
				});

				setTimeout(function() {
					self.load();
				}, (self.config.updateInterval * 1000));
		});
	},

	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.innerHTML = '<img id="mmm-photos-placeholder1" style="opacity: 0; position: absolute" /><img id="mmm-photos-placeholder2" style="opacity: 0; position: absolute" />';
		return wrapper;
	},
	getScripts: function() {
    return [
			this.file('node_modules/jquery/dist/jquery.min.js')
    ]
	}
});
