/* global Module */

/* Magic Mirror
 * Module: MMM-RandomPhoto
 *
 * By Diego Vieira <diego@protos.inf.br>
 * and skuethe
 * ICS Licensed.
 */

Module.register("MMM-RandomPhoto",{
    defaults: {
        opacity: 0.3,
        animationSpeed: 500,
        updateInterval: 60,
        url: "https://picsum.photos/",
        width: 1920,
        height: 1080,
        grayscale: false,
        blur: false,
        blurAmount: 1, // between 1 and 10
        startHidden: false,
        showStatusIcon: true,
        statusIconMode: "show", // one of: "show" (default / fallback) or "fade"
        statusIconPosition: "top_right", // one of: "top_right" (default / fallback), "top_left", "bottom_right" or "bottom_left"
    },

    start: function() {
        this.updateTimer = null;
        this.running = false;
    },

    pauseImageLoading: function() {
        Log.log(this.name + ": pausing");
        clearTimeout(this.updateTimer);
        this.running = false;
        if (this.config.showStatusIcon) {
            this.loadIcon();
        }
    },

    resumeImageLoading: function() {
        Log.log(this.name + ": resuming");
        if (!this.running) {
            this.running = true;
            this.load();
            if (this.config.showStatusIcon) {
                this.loadIcon();
            }
        }
    },

    load: function() {
        var self = this;

        var url = self.config.url + self.config.width + "/" + self.config.height + "/"
        if(self.config.grayscale) {
            url = url + (url.indexOf('?') > -1 ? '&' : '?') + "grayscale";
        }
        if(self.config.blur) {
            url = url + (url.indexOf('?') > -1 ? '&' : '?') + "blur";
            if(self.config.blurAmount > 1) {
                if(self.config.blurAmount > 10) { self.config.blurAmount = 10; }
                url = url + "=" + self.config.blurAmount;
            }
        }
        url = url + (url.indexOf('?') > -1 ? '&' : '?') + (new Date().getTime());
        var img = $('<img />').attr('src', url);

        img.on('load', function() {
                $('#randomPhoto-placeholder1').attr('src', url).animate({
                    opacity: self.config.opacity
                }, self.config.animationSpeed, function() {
                    $(this).attr('id', 'randomPhoto-placeholder2');
                });

                $('#randomPhoto-placeholder2').animate({
                    opacity: 0
                }, self.config.animationSpeed, function() {
                    $(this).attr('id', 'randomPhoto-placeholder1');
                });
        });

        // Only activate re-loading itself, if we are not in "pause" state
        if (this.running) {
            this.updateTimer = setTimeout(function() {
                self.load();
            }, (this.config.updateInterval * 1000));
        }
},

    loadIcon: function() {
        var pauseIcon = document.getElementById("randomPhotoIconPause");
        var playIcon = document.getElementById("randomPhotoIconPlay");
        if (this.running) {
            pauseIcon.classList.add("hidden");
            playIcon.classList.remove("hidden");
            if (this.config.statusIconMode === "fade") {
                pauseIcon.classList.remove("fading");
                playIcon.classList.add("fading");
            }
        } else {
            playIcon.classList.add("hidden");
            pauseIcon.classList.remove("hidden");
            if (this.config.statusIconMode === "fade") {
                playIcon.classList.remove("fading");
                pauseIcon.classList.add("fading");
            }
        }
    },

    getDom: function() {
        var wrapper = document.createElement("div");
        wrapper.id = "randomPhoto";
        wrapper.innerHTML = '<img id="randomPhoto-placeholder1" /><img id="randomPhoto-placeholder2" />';
        if (this.config.showStatusIcon) {
            var validatePosition = ['top_right', 'top_left', 'bottom_right', 'bottom_left'];
            if (validatePosition.indexOf(this.config.statusIconPosition) === -1) {
                this.config.statusIconPosition = 'top_right';
            }
            var statusIconObject = document.createElement("span");
            statusIconObject.id = "randomPhotoIcon";
            statusIconObject.className = this.config.statusIconPosition.replace("_", " ");
            statusIconObject.classList.add("dimmed");
            statusIconObject.innerHTML = '<i id="randomPhotoIconPause" class="fa fa-pause-circle hidden"></i><i id="randomPhotoIconPlay" class="fa fa-play-circle hidden"></i>';
            wrapper.appendChild(statusIconObject);
        }
        return wrapper;
    },

    getScripts: function() {
        return [
            this.file('node_modules/jquery/dist/jquery.min.js')
        ]
    },

    getStyles: function() {
        return [
            "MMM-RandomPhoto.css",
            "font-awesome.css"
        ];
    },

    notificationReceived: function(notification, payload, sender) {
        if (notification === "MODULE_DOM_CREATED") {
            if (this.config.startHidden) {
                this.hide()
            } else {
                this.resumeImageLoading();
            }
        }
        if (notification === "RANDOMPHOTO_NEXT") {
            // Don't call the pause or resume functions here, so we can actually work with both states ("paused" and "active"), so independent of what "this.running" is set to
            clearTimeout(this.updateTimer);
            this.load();
        }
        if (notification === "RANDOMPHOTO_TOGGLE") {
            if (this.running) {
                this.pauseImageLoading();
            } else {
                this.resumeImageLoading();
            }
        }
        if (notification === "RANDOMPHOTO_PAUSE") {
            this.pauseImageLoading();
        }
        if (notification === "RANDOMPHOTO_RESUME") {
            this.resumeImageLoading();
        }
    },

    suspend: function() {
        this.pauseImageLoading();
    },

    resume: function() {
        this.resumeImageLoading();
    }

});
