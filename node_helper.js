require("url");
const https = require("https");
const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({

    fetchNextcloudImageList: function() {
        var self = this;
        const urlParts = new URL(this.config.repositoryConfig.url);
        const requestOptions = {
            method: "PROPFIND",
            headers: {
                "Authorization": "Basic " + new Buffer.from(this.config.repositoryConfig.username + ":" + this.config.repositoryConfig.password).toString("base64")
            }
        };

        //console.log("[" + this.name + "] --- DEBUG --- urlParts: " + urlParts);
        //console.log("[" + this.name + "] --- DEBUG --- this.config.repositoryConfig.url: " + this.config.repositoryConfig.url);

        var matches = [];
        https.get(this.config.repositoryConfig.url, requestOptions, function(response) {
            var body = "";
            response.on("data", function(data) {
                body += data;
            });
            response.on("end", function() {
                //console.log("[" + self.name + "] Got response: " + body);
                matches = body.match(/href>([^<]+)/g);
                matches.shift(); // delete first array entry, because it contains the link to the current folder
                if (matches && matches.length > 0) {
                    matches.forEach(function(item, index) {
                        matches[index] = urlParts.origin + item.replace("href>", "");
                        console.log("[" + self.name + "] Found entry: " + matches[index]);
                    });
                    self.sendSocketNotification("NEXTCLOUD_IMAGE_LIST", matches);
                    return;
                } else {
                    console.log("[" + this.name + "] WARNING: did not get any images from nextcloud url");
                    return false;
                }
            });
        })
        .on("error", function(err) {
            console.log("[" + this.name + "] ERROR: " + err);
            return false;
        });
    },

    socketNotificationReceived: function(notification, payload) {
        console.log("["+ this.name + "] received a '" + notification + "' with payload: " + payload);
        if (notification === "SET_CONFIG") {
            this.config = payload;
        }
        if (notification === "FETCH_NEXTCLOUD_IMAGE_LIST") {
            this.fetchNextcloudImageList();
        }
    },

});