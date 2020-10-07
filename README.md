# MMM-RandomPhoto
This a module for the [MagicMirror](https://github.com/MichMich/MagicMirror). It will show a random photo from an url.

## Installation
1. Navigate into your MagicMirror's `modules` folder and execute `git clone https://github.com/skuethe/MMM-RandomPhoto.git`.
2. cd `cd MMM-RandomPhoto`
3. Execute `npm install` to install the node dependencies.

## Config
The entry in `config.js` can include the following options:


|Option|Description|
|---|---|
|`opacity`|The opacity of the image.<br><br>**Type:** `double`<br>Default `0.3`|
|`animationSpeed`|How long the fade out and fade in of photos should take.<br><br>**Type:** `int`<br>Default `500`|
|`updateInterval`|How long before getting a new image.<br><br>**Type:** `int`<br>Default `60` seconds|
|`url`|URL to pull a new image from.<br><br>**Type:** `string`<br>Default `https://picsum.photos/`|
|`width`|The width of the image.<br><br>**Type:** `int`<br>Default `1920` px|
|`height`|The height of the image.<br><br>**Type:** `int`<br>Default `1080` px|
|`grayscale`|Should the image be grayscaled? <br><br>**Type:** `boolean`<br>Default `false`|
|`blur`|Should the image be blurred? <br><br>**Type:** `boolean`<br>Default `false`|
|`blurAmount`|If you want to blur it, how much? Allows a number between `1` and `10`.<br><br>**Type:** `int`<br>Default `1`|
|`startHidden`|Should the module start hidden?<br>Helpful if you use it as a "screensaver"<br><br>**Type:** `boolean`<br>Default `false`|
|`showStatusIcon`|Do you want to see the status of automatic image loading ("play" / "paused")?<br><br>**Type:** `boolean`<br>Default `true`|
|`statusIconMode`|Do you want to display the icon all the time or just fade in and out on status change?<br><br>**Type:** `string`<br>Possible values: `show` and `fade`<br>Default `show`|
|`statusIconPosition`|Where do you want to display the status icon?<br><br>**Type:** `string`<br>Possible values: `top_right`, `top_left`, `bottom_right` and `bottom_left`<br>Default `top_right`|

Here is an example of an entry in `config.js`
```
{
    module: 'MMM-RandomPhoto',
    position: 'fullscreen_below',
    config: {
        opacity: 0.3,
        animationSpeed: 500,
        updateInterval: 60,
        width: 1920,
        height: 1080,
        grayscale: true,
        startHidden: true,
        showStatusIcon: true,
        statusIconMode: "show",
        statusIconPosition: "top_right",
    }
},
```

## Notifications
You can control this module by sending specific notifications.
See the following list:

|Notification|Description|
|---|---|
|`RANDOMPHOTO_NEXT`|Don't wait for `updateInterval` to trigger and immidiately show the next image<br>Respects the current state of automatic image loading|
|`RANDOMPHOTO_TOGGLE`|Toggle the state of automatic image loading|
|`RANDOMPHOTO_PAUSE`|Pause the loading of new images|
|`RANDOMPHOTO_RESUME`|Resume the loading of new images|

## Ideas
Thinking about implementing the following things:
- possibility to show the user comment from each image on screen (target selectable)
- ...

## Dependencies
- [jquery](https://www.npmjs.com/package/jquery) (installed via `npm install`)

## Special Thanks
- [Michael Teeuw](https://github.com/MichMich) for creating the awesome [MagicMirror2](https://github.com/MichMich/MagicMirror) project that made this module possible.
- [Diego Vieira](https://github.com/diego-vieira) for [initially](https://github.com/diego-vieira/MMM-RandomPhoto) creating this module.