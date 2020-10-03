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
    },

    start: function() {
        this.updateTimer = null;
        this.load();
    },

    load: function() {
        var self = this;

        var url = self.config.url + self.config.width + "/" + self.config.height + "/"
        if(grayscale) {
            url = url + (url.indexOf('?') > -1 ? '&' : '?') + "grayscale";
        }
        if(blur) {
            url = url + (url.indexOf('?') > -1 ? '&' : '?') + "blur";
            if(blurAmount > 1) {
                if(blurAmount > 10) { blurAmount = 10; }
                url = url + "=" + blurAmount;
            }
        }
        url = url + (url.indexOf('?') > -1 ? '&' : '?') + (new Date().getTime());
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
        });

        this.updateTimer = setTimeout(function() {
            self.load();
        }, (self.config.updateInterval * 1000));
        
    },

    getDom: function() {
        var wrapper = document.createElement("div");
        wrapper.id = "randomPhoto";
        wrapper.innerHTML = '<img id="mmm-photos-placeholder1" /><img id="mmm-photos-placeholder2" />';
        return wrapper;
    },

    getScripts: function() {
        return [
            this.file('node_modules/jquery/dist/jquery.min.js')
        ]
    }

    getStyles: function() {
        return [
            "MMM-RandomPhoto.css"
        ];
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "RANDOMPHOTO_NEXT"){
            clearTimeout(this.updateTimer);
            this.load();
        }
    }

});
