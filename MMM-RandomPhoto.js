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
        imageRepository: "picsum", // Select the image repository source. One of "picsum" (default / fallback) or "nextcloud"
        repositoryConfig: {
            // if imageRepository = "picsum" -> "url", "username" and "password" are ignored and can be left empty
            // if imageRepository = "nextcloud"
            //  -> "url" will point to your image directory, f.e.: "https://YOUR.NEXTCLOUD.HOST/remote.php/dav/files/USERNAME/PATH/TO/DIRECTORY/"
            //  -> if the share is private / internally shared only, add "username" and "password" for basic authentication. See documentation on how to create an "device" password:
            //     https://docs.nextcloud.com/server/latest/user_manual/en/session_management.html#managing-devices
            url: "https://picsum.photos/",
            username: "",
            password: "",
        },
        width: 1920,
        height: 1080,
        random: true, // Show random images? Has no effect if you select "picsum" as imageRepository - there it is always random
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
        this.imageList = null; // used for nextcloud image url list
        this.currentImageIndex = 0; // used for nextcloud image url list
        this.running = false;
        if (this.config.imageRepository.toLowerCase() === "nextcloud") {
            this.sendSocketNotification('SET_CONFIG', this.config);
            this.useNextCloud();
        } else {
            // picsum -> force URL
            this.config.repositoryConfig.url = "https://picsum.photos/";
            this.sendSocketNotification('SET_CONFIG', this.config);
        }
    },

    useNextCloud: function() {
        if (typeof this.config.repositoryConfig.url !== "undefined" && this.config.repositoryConfig.url !== null) {
            this.sendSocketNotification('FETCH_NEXTCLOUD_IMAGE_LIST');
        } else {
            Log.error("[" + this.name + "] Trying to use 'nextcloud' but did not specify any URL.");
        }
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
        var url = "";

        if (self.config.imageRepository.toLowerCase() === "nextcloud") {
            if (self.imageList && self.imageList.length > 0) {
                url = this.returnImageFromList();
                if (self.config.repositoryConfig.username && self.config.repositoryConfig.password) {
                    // basic auth data set, special handling required
                    url = this.retrieveImageBehindBasicAuth(url);
                }
            }
            if (!url) {
                return false;
            }
        } else {
            // picsum default / fallback
            url = self.config.repositoryConfig.url + self.config.width + "/" + self.config.height + "/"
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
        }
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

    returnImageFromList: function() {
        var indexToFetch = this.currentImageIndex;
        const imageList = this.imageList;

        if (this.config.random) {
            indexToFetch = Math.floor(Math.random() * imageList.length);
        }
        var imageSource = imageList[indexToFetch];
        console.log(indexToFetch, imageSource);

        // If we are not doing it random, increase the index counter
        if (!this.config.random) {
            indexToFetch++;
            if (indexToFetch >= imageList.length) {
                indexToFetch = 0;
            }
            this.currentImageIndex = indexToFetch;
        }
        return imageSource;
    },

    retrieveImageBehindBasicAuth: function(passedImageUrl) {
        var self = this;
        var basicAuth = btoa(self.config.repositoryConfig.username + ":" + self.config.repositoryConfig.password);
        Log.log("[" + self.name + "] -- DEBUG -- passedImageUrl: " + passedImageUrl);
        Log.log("[" + self.name + "] -- DEBUG -- basicAuth: " + basicAuth);

        /**
        const request = new Request(passedImageUrl, {
            method: "GET",
            headers: {
                "Authorization": "Basic " + basicAuth,
            },
            mode: "cors"
        });

        fetch(request)
            .then(response => {
                console.log("[" + self.name + "] Got response: " + response);
                return response;
            })
            .catch(err => {
                console.log("[" + this.name + "] ERROR: " + err);
                return false;
            });
        **/
        /**
        const requestOptions = {
            method: "GET",
            headers: {
                "Authorization": "Basic " + basicAuth,
            }
        };

        https.get(passedImageUrl, requestOptions, function(response) {
            var body = "";
            response.on("data", function(data) {
                body += data;
            });
            response.on("end", function() {
                console.log("[" + self.name + "] Got response: " + body);
                return body;
            });
        })
        .on("error", function(err) {
            console.log("[" + this.name + "] ERROR: " + err);
            return false;
        });
        **/
        
        jQuery.ajax({
            method: "GET",
            url: passedImageUrl,
            dataType: "image/jpg",
            crossDomain: false,
            headers: {
                "Authorization": "Basic " + basicAuth
            },
            //beforeSend: function (xhr) {
            //    xhr.setRequestHeader ("Authorization", "Basic " + btoa(self.config.repositoryConfig.username + ":" + self.config.repositoryConfig.password));
            //},
        })
        .done(function (data) {
            Log.log("[" + self.name + "] -- DEBUG -- Got data: " + data);
            return "data:image/png;base64," + data;
        })
        .fail(function( jqXHR, textStatus ) {
            Log.error("[" + self.name + "] Request failed: " + textStatus);
            console.dir(jqXHR);
            return false;
        });
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
            statusIconObject.classList.add("dimmed");
            this.config.statusIconPosition.split("_").forEach(function(extractedName) {
                statusIconObject.classList.add("rpi" + extractedName);
            });
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
                this.hide();
            } else {
                if (this.config.imageRepository !== "nextcloud") {
                    // only start "right away" if we display "picsum" images. Otherwise wait until we receive the "NEXTCLOUD_IMAGE_LIST" socketNotification
                    this.resumeImageLoading();
                }
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

    socketNotificationReceived: function(notification, payload) {
        if (notification === "NEXTCLOUD_IMAGE_LIST") {
            this.imageList = payload;
            // After we now received the image list, go ahead and display them
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
