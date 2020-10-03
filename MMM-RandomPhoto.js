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
        url: 'https://picsum.photos/',
        width: 1920,
        height: 1080,
        grayscale: false,
        blur: false,
        blurAmount: 1, // between 1 and 10
        startHidden: false,
    },

    start: function() {
        this.updateTimer = null;
        if(this.config.startHidden) {
            this.hide();
        } else {
            this.load();
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

        this.updateTimer = setTimeout(function() {
            self.load();
        }, (self.config.updateInterval * 1000));
        
    },

    getDom: function() {
        var wrapper = document.createElement("div");
        wrapper.id = "randomPhoto";
        wrapper.innerHTML = '<img id="randomPhoto-placeholder1" /><img id="randomPhoto-placeholder2" />';
        return wrapper;
    },

    getScripts: function() {
        return [
            this.file('node_modules/jquery/dist/jquery.min.js')
        ]
    },

    getStyles: function() {
        return [
            "MMM-RandomPhoto.css"
        ];
    },

    notificationReceived: function(notification, payload, sender) {
        if (notification === "RANDOMPHOTO_NEXT") {
            clearTimeout(this.updateTimer);
            this.load();
        }
    },

    suspend: function() {
        Log.info(this.name + ": suspending");
        clearTimeout(this.updateTimer);
    },

     resume: function() {
        Log.info(this.name + ": resuming");
        this.load();
    }

});
