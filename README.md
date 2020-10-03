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
    }
},
```

## Notifications
You can control this module by sending a `RANDOMPHOTO_NEXT` notification.
If you do, the next image will bo shown and the updateInterval starts from 0

## Ideas
Thinking about implementing the following things:
- possibility to show the user comment from each image on screen (target selectable)
- possibility to stop and resume the automated slideshow (show icon indicator somewhere: pause / play)
- ...

## Dependencies
- [jquery](https://www.npmjs.com/package/jquery) (installed via `npm install`)

## Special Thanks
- [Michael Teeuw](https://github.com/MichMich) for creating the awesome [MagicMirror2](https://github.com/MichMich/MagicMirror) project that made this module possible.
- [Diego Vieira](https://github.com/diego-vieira) for [initially](https://github.com/diego-vieira/MMM-RandomPhoto) creating this module.