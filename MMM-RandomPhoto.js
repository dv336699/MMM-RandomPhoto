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
        imageRepository: "picsum", // Select the image repository source. One of "picsum" (default / fallback), "localdirectory" or "nextcloud" (currently broken because of CORS bug in nextcloud)
        repositoryConfig: {
            // if imageRepository = "picsum" -> "path", "username" and "password" are ignored and can be left empty
            // if imageRepository = "nextcloud"
            //  -> "path" will point to your image directory URL, f.e.: "https://YOUR.NEXTCLOUD.HOST/remote.php/dav/files/USERNAME/PATH/TO/DIRECTORY/"
            //  -> if the share is private / internally shared only, add "username" and "password" for basic authentication. See documentation on how to create an "device" password:
            //     https://docs.nextcloud.com/server/latest/user_manual/en/session_management.html#managing-devices
            // if imageRepository = "localdirectory"
            //  -> "path" will point to your local directory, f.e.: "~/someReallyCoolPictures", "username" and "password" are ignored
            path: "https://picsum.photos/",
            username: "",
            password: "",
        },
        width: 1920,
        height: 1080,
        random: true, // Show random images? Has no effect if you select "picsum" as imageRepository - there it is always random
        grayscale: false,
        blur: false,
        blurAmount: 1, // between 1 and 10
        startHidden: false, // helpful if you use it as a screensaver and only want to show it f.e. after a specific time or with a specific touch gesture
        startPaused: false, // start in "paused" mode -> automatic image loading is paused
        showStatusIcon: true,
        statusIconMode: "show", // one of: "show" (default / fallback) or "fade"
        statusIconPosition: "top_right", // one of: "top_right" (default / fallback), "top_left", "bottom_right" or "bottom_left"
    },

    start: function() {
        this.updateTimer = null;
        this.imageList = null; // Used for nextcloud and localdirectory image list
        this.currentImageIndex = -1; // Used for nextcloud and localdirectory image list
        this.running = false;

        this.nextcloud = false;
        this.localdirectory = false;

        this.config.imageRepository = this.config.imageRepository.toLowerCase();
        if (this.config.imageRepository === "nextcloud") {
            this.nextcloud = true;
        } else if (this.config.imageRepository === "localdirectory") {
            this.localdirectory = true;
        }

        // Set blur amount to a max of 10px
        if(this.config.blurAmount > 10) { this.config.blurAmount = 10; }

        if (this.nextcloud || this.localdirectory) {
            this.sendSocketNotification('SET_CONFIG', this.config);
            this.fetchImageList();
        } else {
            // picsum -> force URL
            Log.log(this.name + " --- DEBUG ---: using picsum");
            this.config.repositoryConfig.path = "https://picsum.photos/";
            this.sendSocketNotification('SET_CONFIG', this.config);
        }
    },

    fetchImageList: function() {
        if (typeof this.config.repositoryConfig.path !== "undefined" && this.config.repositoryConfig.path !== null) {
            this.sendSocketNotification('FETCH_IMAGE_LIST');
        } else {
            Log.error("[" + this.name + "] Trying to use 'nextcloud' or 'localdirectory' but did not specify any 'config.repositoryConfig.path'.");
        }
    },

    pauseImageLoading: function() {
        clearTimeout(this.updateTimer);
        this.running = false;
        if (this.config.showStatusIcon) {
            this.loadIcon();
        }
    },

    resumeImageLoading: function(respectPausedState) {
        if (!this.running) {
            if (respectPausedState && this.config.startPaused) {
                this.running = false;
            } else {
                this.running = true;
            }
            this.load();
            if (this.config.showStatusIcon) {
                this.loadIcon();
            }
        }
    },

    load: function(mode="next") {
        var self = this;
        var url = "";

        if (self.localdirectory || self.nextcloud) {
            if (self.imageList && self.imageList.length > 0) {
                url = "/" + this.name + "/images/" + this.returnImageFromList(mode);
                
                jQuery.ajax({
                    method: "GET",
                    url: url,
                })
                .done(function (data) {
                    self.smoothImageChange(data);
                })
                .fail(function( jqXHR, textStatus ) {
                    Log.error("[" + self.name + "] Request failed: " + textStatus);
                    console.dir(jqXHR);
                    return false;
                });

            } else {
                Log.error("[" + self.name + "] No images to display. 'this.imageList': " + self.imageList);
                return false;
            }
        } else {
            // picsum default / fallback
            url = self.config.repositoryConfig.path + self.config.width + "/" + self.config.height + "/"
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
            self.smoothImageChange(url);
        }

        // Only activate re-loading itself, if we are not in "pause" state
        if (this.running) {
            this.updateTimer = setTimeout(function() {
                self.load();
            }, (this.config.updateInterval * 1000));
        }
    },

    smoothImageChange: function(url) {
        var self = this;
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
    },

    returnImageFromList: function(mode) {
        var indexToFetch = this.currentImageIndex;
        const imageList = this.imageList;

        if (this.config.random) {
            //Log.info("[" + this.name + "] -- DEBUG -- will fetch a random image");
            do {
                indexToFetch = Math.floor(Math.random() * imageList.length);
            } while (imageList.length > 1 && indexToFetch === this.currentImageIndex);
        } else {
            if (mode === "previous") {
                indexToFetch--;
                if (indexToFetch < 0) {
                    indexToFetch = (imageList.length - 1);
                }
            } else {
                indexToFetch++;
                if (indexToFetch >= imageList.length) {
                    indexToFetch = 0;
                }
            }
        }
        var imageSource = imageList[indexToFetch];
        Log.info(indexToFetch, imageSource);
        this.currentImageIndex = indexToFetch;

        return imageSource;
    },

    loadIcon: function(navigate="none") {
        var self = this;
        const statusIcon = document.getElementById("randomPhotoStatusIcon");

        let currentIndex = -1;
        let iconloadInProgress = false;

        // Animation stuff
        const animationSteps = [];
        const animateToNextState = () => {
            requestAnimationFrame( () => {
                currentIndex++;
                if (currentIndex < animationSteps.length) {
                    animationSteps[currentIndex]();
                    //console.log("animateToNextState(): " + animationSteps[currentIndex].toString());
                }
            });
        };
        const cleanupAnimation = () => {
            statusIcon.style.animation = null;
            iconloadInProgress = false;
        }

        // MutationObserver to listen to class change events
        const attrObserver = new MutationObserver((mutations) => {
            mutations.forEach(mu => {
                if (mu.attributeName === "class" && iconloadInProgress) {
                    animateToNextState();
                }
            });
        });
        attrObserver.observe(statusIcon, { attributes: true });

        // Eventlistener to listen to animation end events
        statusIcon.addEventListener("animationend", () => {
            animateToNextState();
        });

        // Some helper strings for fontawsome icons
        var translateStatus = "";
        if (self.running) {
            translateStatus = "play"
        } else {
            translateStatus = "pause"
        }

        // If we used the "next" / "previous" notifications
        if (navigate != "none") {
            if (!statusIcon.classList.contains("rpihidden")) {
                animationSteps.push(
                    () => statusIcon.style.animation = "fadeOut 1s",
                );
            }
            animationSteps.push(
                () => statusIcon.className = "far fa-arrow-alt-circle-" + navigate + " rpihidden",
                () => statusIcon.style.animation = "fadeInAndOut 2s",
                () => statusIcon.className = "far fa-" + translateStatus + "-circle rpihidden",
            );
            if (self.config.statusIconMode != "fade") {
                animationSteps.push(
                    () => statusIcon.style.animation = "fadeIn 1s",
                    () => statusIcon.classList.remove("rpihidden"),
                );
            }
            animationSteps.push(
                () => cleanupAnimation()
            );
            iconloadInProgress = true;
            animateToNextState();
        } else {
            if (!statusIcon.classList.contains("rpihidden")) {
                animationSteps.push(
                    () => statusIcon.style.animation = "fadeOut 1s",
                );
            }
            animationSteps.push(
                () => statusIcon.className = "far fa-" + translateStatus + "-circle rpihidden",
                () => statusIcon.style.animation = "fadeIn 1s",
                () => statusIcon.classList.remove("rpihidden"),
            );
            if (self.config.statusIconMode === "fade") {
                animationSteps.push(
                    () => statusIcon.style.animation = "fadeOut 4s",
                    () => statusIcon.classList.add("rpihidden"),
                );
            }
            animationSteps.push(
                () => cleanupAnimation()
            );
            iconloadInProgress = true;
            animateToNextState();
        }
    },

    getDom: function() {
        var wrapper = document.createElement("div");
        wrapper.id = "randomPhoto";

        var img1 = document.createElement("img");
        img1.id = "randomPhoto-placeholder1";
        var img2 = document.createElement("img");
        img2.id = "randomPhoto-placeholder2";

        // Only apply grayscale / blur css classes if we are NOT using picsum, as picsum is doing it via URL parameters
        if (this.nextcloud || this.localdirectory) {
            if (this.config.grayscale) {
                img1.classList.add("grayscale");
                img2.classList.add("grayscale");
            }
            if (this.config.blur) {
                img1.classList.add("blur");
                img2.classList.add("blur");
                img1.style.setProperty("--randomphoto-blur-value", this.config.blurAmount + "px");
                img2.style.setProperty("--randomphoto-blur-value", this.config.blurAmount + "px");
            }
        }

        wrapper.appendChild(img1);
        wrapper.appendChild(img2);
        //wrapper.innerHTML = '<img id="randomPhoto-placeholder1" /><img id="randomPhoto-placeholder2" />';
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
            statusIconObject.innerHTML = '<i id="randomPhotoStatusIcon" class="rpihidden"></i>';
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
                if (!this.nextcloud && !this.localdirectory) {
                    // only start "right away" if we display "picsum" images. Otherwise wait until we receive the "IMAGE_LIST" socketNotification
                    this.resumeImageLoading(true);
                }
            }
        }
        if (notification === "RANDOMPHOTO_NEXT") {
            // Don't call the pause or resume functions here, so we can actually work with both states ("paused" and "active"), so independent of what "this.running" is set to
            clearTimeout(this.updateTimer);
            this.load();
            if (this.config.showStatusIcon) {
                this.loadIcon("right");
            }
        }
        if (notification === "RANDOMPHOTO_PREVIOUS") {
            // Only allow this if we are NOT in random mode and NOT use picsum as a source
            if (!this.config.random && (this.nextcloud || this.localdirectory)) {
                clearTimeout(this.updateTimer);
                this.load("previous");
                if (this.config.showStatusIcon) {
                    this.loadIcon("left");
                }
            }
        }
        if (notification === "RANDOMPHOTO_TOGGLE") {
            if (this.running) {
                this.pauseImageLoading();
            } else {
                this.resumeImageLoading(false);
            }
        }
        if (notification === "RANDOMPHOTO_PAUSE") {
            this.pauseImageLoading();
        }
        if (notification === "RANDOMPHOTO_RESUME") {
            this.resumeImageLoading(false);
        }
    },

    socketNotificationReceived: function(notification, payload) {
        //Log.log("["+ this.name + "] received a '" + notification + "' with payload: " + payload);
        //console.dir(payload);
        if (notification === "IMAGE_LIST") {
            this.imageList = payload;
            // After we now received the image list, go ahead and display them (only when not starting as hidden)
            if(!this.config.startHidden) {
                this.resumeImageLoading(true);
            }
        }
    },

    suspend: function() {
        this.pauseImageLoading();
    },

    resume: function() {
        this.resumeImageLoading(true);
    }

});
