# MMM-RandomPhoto
This a module for the [MagicMirror](https://github.com/MichMich/MagicMirror). It will show a random photo from an url.

## Installation
1. Navigate into your MagicMirror's `modules` folder and execute `git clone https://github.com/diego-vieira/MMM-RandomPhoto.git`.
2. cd `cd MMM-RandomPhoto`
3. Execute `npm install` to install the node dependencies.

## Config
The entry in `config.js` can include the following options:


|Option|Description|
|---|---|
|`opacity`|The opacity of the image.<br><br>**Type:** `double`<br>Default 0.3|
|`animationSpeed`|How long the fade out and fade in of photos should take.<br><br>**Type:** `int`<br>Default 500|
|`updateInterval`|How long before getting a new image.<br><br>**Type:** `int`<br>Default 60 seconds|
|`url`|URL to pull a new image from.<br><br>**Type:** `string`<br>Default https://unsplash.it/1920/1080/?random|

Here is an example of an entry in `config.js`
```
{
	module: 'MMM-RandomPhoto',
	position: 'fullscreen_below',
	config: {
		opacity: 0.3,
		animationSpeed: 500,
		updateInterval: 60,
		url: 'https://unsplash.it/1920/1080/?random'
	}
},
```

## Dependencies
- [jquery](https://www.npmjs.com/package/jquery) (installed via `npm install`)

## Special Thanks
- [Michael Teeuw](https://github.com/MichMich) for creating the awesome [MagicMirror2](https://github.com/MichMich/MagicMirror) project that made this module possible.
