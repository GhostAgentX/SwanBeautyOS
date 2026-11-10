# Virtual Background API

Banuba provides the Virtual Background API designed to help you integrate augmented reality background separation into your app. It aims to change your background to hide everything behind you.

[](pathname:///generated/effects/Background_doc.zip)

[Download example](pathname:///generated/effects/Background_doc.zip)

## How to add a background to an effect[​](#how-to-add-a-background-to-an-effect "Direct link to How to add a background to an effect")

Assume you have an effect, say [Afro](pathname:///generated/effects/Afro.zip), and want to add a background image to it, say [beach.png](pathname:///img/effect/combine_effect_vbg/beach.png) .

To accomplish this, connect the built-in Background module to the effect via `evalJs`. Now, you can set the image as background texture:

* Java
* Swift

```
// Effect mCurrentEffect = ...

// Connect the built-in background module (once per effect)
mCurrentEffect.evalJs("Background = require('bnb_js/background')", null);
// Then, set the background texture
mCurrentEffect.evalJs("Background.texture('/absolute/path/to/beach.png')", null);
```

```
// var currentEffect: BNBEffect = ...

// Connect the built-in background module (once per effect)
currentEffect?.evalJs("Background = require('bnb_js/background')", resultCallback: nil);
// Then, set the background texture
currentEffect?.evalJs("Background.texture('/absolute/path/to/beach.png')", resultCallback: nil);
```

### Combine VBG with a WebAR effect (AR 3D Mask)[​](#combine-vbg-with-a-webar-effect-ar-3d-mask "Direct link to Combine VBG with a WebAR effect (AR 3D Mask)")

On the Web platform, the file system is represented by the effect itself. It means you should put the desired image inside the effect folder before the `evalJs` call.

One way to accomplish this is to put the image directly into the effect archive:

1. Unpack the effect archive
2. Put the image into the effect folder, say as `images/beach.png`
3. Compress the effect folder and use the new archive instead of the original one

This way you should be able to set the image using the relative path:

```
// const player = await Player.create(...)
// const effect = new Effect(...)
// await player.applyEffect(effect)

// Connect the built-in background module (once per effect)
await effect.evalJs("Background = require('bnb_js/background')")
// Then, set the background texture
await effect.evalJs("Background.texture('images/beach.png')")
```

Another way is to upload an image to the effect's file system on demand. You can leverage the `Effect.writeFile()` API to accomplish this:

```
// const player = await Player.create(...)
// const effect = new Effect(...)
// await player.applyEffect(effect)

// Load the image file however you like, e.g from a remote server
const image = await fetch("/path/to/beach.png").then(r => r.arrayBuffer())
await effect.writeFile("images/beach.png", image)

// Connect the built-in background module (once per effect)
await effect.evalJs("Background = require('bnb_js/background')")
// Then, set the background texture
await effect.evalJs("Background.texture('images/beach.png')")
```

**Preview**

![Right image compare](/assets/images/original-7af4345d086ee096ce3656413c269b22.jpg)![Left image compare](/assets/images/vbg-e9db7c61e2572f49df1134d25b033cd3.jpg)

Drag

The Virtual Background API allows to change background with the following built-in features:

## Background texture[​](#background-texture "Direct link to Background texture")

Sets the background behind the user to a texture.

* `Background.texture('image.png')` - sets an image or a video file as a background texture. The file should be placed into the effect's folder.
* [Supported formats.](/tutorials/capabilities/technical_specification.md#video-formats-support)

- config.js
- Java
- Swift
- JavaScript

```
/* Feel free to add your custom code below */

Background.texture('image.png')
```

```
// Effect mCurrentEffect = ...

mCurrentEffect.evalJs("Background.texture('image.png')", null);
```

```
// var currentEffect: BNBEffect = ...

currentEffect?.evalJs("Background.texture('image.png')", resultCallback: nil)
```

```
await effect.evalJs("Background.texture('image.png')")
```

**Preview**

![Right image compare](/assets/images/original_wide-2f360425a0e0a779832de176b75c4354.jpg)![Left image compare](/assets/images/BackgroundTexture-fe6299595a550a13eec111677e4e2539.jpg)

Drag

### Background texture content mode[​](#background-texture-content-mode "Direct link to Background texture content mode")

Scales the background content mode.

* `Background.contentMode(mode)` - sets a content mode of background texture.
* Available mods: `scale_to_fill`, `fill`, `fit`.

- config.js
- Java
- Swift
- JavaScript

```
/* Feel free to add your custom code below */

Background.texture('image.png')
Background.contentMode('fit')
```

```
// Effect mCurrentEffect = ...

mCurrentEffect.evalJs("Background.texture('image.png')", null);
mCurrentEffect.evalJs("Background.contentMode('fit')", null);
```

```
// var currentEffect: BNBEffect = ... 

currentEffect?.evalJs("Background.texture('image.png')", resultCallback: nil)
currentEffect?.evalJs("Background.contentMode('fit')", resultCallback: nil)
```

```
await effect.evalJs("Background.texture('image.png')")
await effect.evalJs("Background.contentMode('fit')")
```

![Right image compare](/assets/images/original_wide-2f360425a0e0a779832de176b75c4354.jpg)![Left image compare](/assets/images/BackgroundContentModeFit-b2b07f464dccc49e433763ee6d1a99b7.jpg)

Drag

### Background texture rotation[​](#background-texture-rotation "Direct link to Background texture rotation")

Rotates the background texture clockwise in degrees.

* `Background.rotation(angle)` - sets background image rotation angle. Angle should be provided in degrees.

- config.js
- Java
- Swift
- JavaScript

```
/* Feel free to add your custom code below */

Background.texture('image.png')
Background.rotation(90)
```

```
// Effect mCurrentEffect = ...

mCurrentEffect.evalJs("Background.texture('image.png')", null);
mCurrentEffect.evalJs("Background.rotation(90)", null);
```

```
// var currentEffect: BNBEffect = ... 

currentEffect?.evalJs("Background.texture('image.png')", resultCallback: nil)
currentEffect?.evalJs("Background.rotation(90)", resultCallback: nil)
```

```
await effect.evalJs("Background.texture('image.png')")
await effect.evalJs("Background.rotation(90)")
```

**Preview**

![Right image compare](/assets/images/original_wide-2f360425a0e0a779832de176b75c4354.jpg)![Left image compare](/assets/images/BackgroundRotation-bab2be0102d207bd6ae9427b96e95ece.jpg)

Drag

### Background texture scale[​](#background-texture-scale "Direct link to Background texture scale")

Scales the background texture.

* `Background.scale(factor)` - sets the scale factor of background texture.

- config.js
- Java
- Swift
- JavaScript

```
/* Feel free to add your custom code below */

Background.texture('image.png')
Background.scale(2)
```

```
// Effect mCurrentEffect = ...

mCurrentEffect.evalJs("Background.texture('image.png')", null);
mCurrentEffect.evalJs("Background.scale(2)", null);
```

```
// var currentEffect: BNBEffect = ... 

currentEffect?.evalJs("Background.texture('image.png')", resultCallback: nil)
currentEffect?.evalJs("Background.scale(2)", resultCallback: nil)
```

```
await effect.evalJs("Background.texture('image.png')")
await effect.evalJs("Background.scale(2)")
```

**Preview**

![Right image compare](/assets/images/original_wide-2f360425a0e0a779832de176b75c4354.jpg)![Left image compare](/assets/images/BackgroundScale-07b26044692d8592b470084f1a12587f.jpg)

Drag

## Background blur[​](#background-blur "Direct link to Background blur")

Sets the background blur radius.

* `Background.blur(radius)` - set the background blur radius in range from 0 to 1.

- config.js
- Java
- Swift
- JavaScript

```
/* Feel free to add your custom code below */

Background.blur(0.6)
```

```
// Effect mCurrentEffect = ...

mCurrentEffect.evalJs("Background.blur(0.6)", null);
```

```
// var currentEffect: BNBEffect = ...

currentEffect?.evalJs("Background.blur(0.6)", resultCallback: nil)
```

```
await effect.evalJs("Background.blur(0.6)")
```

**Preview**

![Right image compare](/assets/images/BackgroundTexture-fe6299595a550a13eec111677e4e2539.jpg)![Left image compare](/assets/images/BackgroundBlur-72d90fc5c1e1f874b4f53f8ddcf212eb.jpg)

Drag

## Background transparency[​](#background-transparency "Direct link to Background transparency")

Sets background transparency value.

* `Background.transparency(value)` - set background transparency value in range from 0 to 1. 0 - transparent background disabled , 1 - fully transparent background enabled

- config.js
- Java
- Swift
- JavaScript

```
/* Feel free to add your custom code below */

Background.transparency(1)
```

```
// Effect mCurrentEffect = ...

mCurrentEffect.evalJs("Background.transparency(1)", null);
```

```
// var currentEffect: BNBEffect = ...

currentEffect?.evalJs("Background.transparency(1)", resultCallback: nil)
```

```
await effect.evalJs("Background.transparency(1)")
```

**Preview**

![Right image compare](/assets/images/original_wide-2f360425a0e0a779832de176b75c4354.jpg)![Left image compare](/assets/images/BackgroundTransparent-1648360dee4dd0da0f4aa673866738e8.png)

Drag
