# Virtual Makeup API

danger

**This is deprecated feature**. [We recommend you to use Prefabs](/effects/prefabs/overview.md)

Banuba provides the Makeup API designed to help you integrate augmented reality beauty try-on features into your app. The AR makeup features fit into e-commerce try-on apps, makeovers, selfie editors and portrait retouching software. It aims to overlay realistic makeup onto the face to showcase the product or let users change their appearance.

[](pathname:///generated/effects/Makeup.zip)

[Download example](pathname:///generated/effects/Makeup.zip)

tip

[Read more about how to use and combine](/effects/makeup_deprecated/makeup_usage.md) Makeup API and Face Beauty API features.

The Beauty module allows to enhance the face with the following built-in features:

## Face Makeup[​](#face-makeup "Direct link to Face Makeup")

Sets texture as composite makeup (i.e. all-in-one: eyelashes, shadows, eyeliner, etc).

* `Makeup.set("makeup_texture.png")` - sets an image-file as a makeup texture. The file should be placed into the effect's folder.
  <!-- -->
  * Supported formats: `.jpeg`, `.jpg`, `.png`, `.ktx`, `.gif`.

- config.js
- Java
- Swift
- JavaScript

```
/* Feel free to add your custom code below */

Makeup.set("example_makeup.png")
```

```
// Effect mCurrentEffect = ...

mCurrentEffect.evalJs("Makeup.set('example_makeup.png')", null);
```

```
// var currentEffect: BNBEffect = ...

currentEffect?.evalJs("Makeup.set('example_makeup.png')", resultCallback: nil)
```

```
await effect.evalJs("Makeup.set('example_makeup.png')")
```

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/Makeup-56cc767d4fda7de0c6c77d44b779ac40.jpg)

Drag

### Highlighting[​](#highlighting "Direct link to Highlighting")

Set highlighter color.

* `Makeup.highlighter("R G B A")` - set highlighter color in R G B A format (separated with space). Each value should be in a range from 0 to 1 (including decimal).

- config.js
- Java
- Swift
- JavaScript

```
/* Feel free to add your custom code below */

Makeup.highlighter("0.75 0.74 0.74 0.4")
```

```
// Effect mCurrentEffect = ...

mCurrentEffect.evalJs("Makeup.highlighter('0.75 0.74 0.74 0.4')", null);
```

```
// var currentEffect: BNBEffect = ... 

currentEffect?.evalJs("Makeup.highlighter('0.75 0.74 0.74 0.4')", resultCallback: nil)
```

```
await effect.evalJs("Makeup.highlighter('0.75 0.74 0.74 0.4')")
```

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/highlighter-a09bcfd376fe0db096ec2278c36bac0f.jpg)

Drag

**Set a custom highlighter texture**

* `Makeup.highlighter("highlighter.png")` - sets an image-file as a highlighter texture. The file should be placed into the effect's folder.
  <!-- -->
  * Supported formats: `.jpeg`, `.jpg`, `.png`, `.ktx`, `.gif`.

- config.js
- Java
- Swift
- JavaScript

```
/* Feel free to add your custom code below */

Makeup.highlighter("highlighter.png")
```

```
// Effect mCurrentEffect = ...

mCurrentEffect.evalJs("Makeup.highlighter('highlighter.png')", null);
```

```
// var currentEffect: BNBEffect = ... 

currentEffect?.evalJs("Makeup.highlighter('highlighter.png')", resultCallback: nil)
```

```
await effect.evalJs("Makeup.highlighter('highlighter.png')") 
```

### Contouring[​](#contouring "Direct link to Contouring")

Sets contour color.

* `Makeup.contour("R G B A")` - set contour color in R G B A format (separated with space). Each value should be in a range from 0 to 1 (including decimal).

- config.js
- Java
- Swift
- JavaScript

```
/* Feel free to add your custom code below */

Makeup.contour("0.3 0.1 0.1 0.6")
```

```
// Effect mCurrentEffect = ...

mCurrentEffect.evalJs("Makeup.contour('0.3 0.1 0.1 0.6')", null);
```

```
// var currentEffect: BNBEffect = ...

currentEffect?.evalJs("Makeup.contour('0.3 0.1 0.1 0.6')", resultCallback: nil)
```

```
await effect.evalJs("Makeup.contour('0.3 0.1 0.1 0.6')")
```

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/contour-59178fb2d6a2d71b883e26139a6f65aa.jpg)

Drag

**Set a custom contour texture**

* `Makeup.contour("contour.png")` - sets an image-file as a contour texture. The file should be placed into the effect's folder.
  <!-- -->
  * Supported formats: `.jpeg`, `.jpg`, `.png`, `.ktx`, `.gif`.

- config.js
- Java
- Swift
- JavaScript

```
/* Feel free to add your custom code below */

Makeup.contour("contour.png")
```

```
// Effect mCurrentEffect = ...

mCurrentEffect.evalJs("Makeup.contour('contour.png')", null);
```

```
// var currentEffect: BNBEffect = ...

currentEffect?.evalJs("Makeup.contour('contour.png')", resultCallback: nil)
```

```
await effect.evalJs("Makeup.contour('contour.png')")
```

### Foundation[​](#foundation "Direct link to Foundation")

Foundation is a combination of two [Beauty API](/effects/makeup_deprecated/face_beauty.md) features: [`Skin.color()`](/effects/makeup_deprecated/face_beauty.md#skin-color) and [`Skin.softening()`](/effects/makeup_deprecated/face_beauty.md#skin-smoothing-skin-softening).

info

Requires [Skin segmentation](/tutorials/capabilities/sdk_features.md#face-ar-sdk-neural-network-features) Neural Network.

* config.js
* Java
* Swift
* JavaScript

```
/* Feel free to add your custom code below */

// set skin color
Skin.color("0.73 0.39 0.08 0.3")
// set softening strength (skin smoothing)
Skin.softening(1)
```

```
// Effect mCurrentEffect = ...

// set skin color
mCurrentEffect.evalJs("Skin.color('0.73 0.39 0.08 0.3')", null);
// set softening strength (skin smoothing)
mCurrentEffect.evalJs("Skin.softening(1)", null);
```

```
// var currentEffect: BNBEffect = ...

// set skin color
currentEffect?.evalJs("Skin.color('0.73 0.39 0.08 0.3')", resultCallback: nil)
// set softening strength (skin smoothing)
currentEffect?.evalJs("Skin.softening(1)", resultCallback: nil)
```

```
// set skin color
await effect.evalJs("Skin.color('0.73 0.39 0.08 0.3')")
// set softening strength (skin smoothing)
await effect.evalJs("Skin.softening(1)")
```

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/foundation-f79656a2dea0a0cb33ae9954459fc02c.jpg)

Drag

### Blush[​](#blush "Direct link to Blush")

Set blush color.

* `Makeup.blushes("R G B A")` - set blushes color in R G B A format (separated with space). Each value should be in a range from 0 to 1 (including decimal).

- config.js
- Java
- Swift
- JavaScript

```
/* Feel free to add your custom code below */

Makeup.blushes("0.7 0.1 0.2 0.5")
```

```
// Effect mCurrentEffect = ...

mCurrentEffect.evalJs("Makeup.blushes('0.7 0.1 0.2 0.5')", null);
```

```
// var currentEffect: BNBEffect = ...

currentEffect?.evalJs("Makeup.blushes('0.7 0.1 0.2 0.5')", resultCallback: nil)
```

```
await effect.evalJs("Makeup.blushes('0.7 0.1 0.2 0.5')")
```

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/blush-0e2e26991bbfbf30ee310457cbc0fa3a.jpg)

Drag

**Set a custom blush texture**

* `Makeup.blushes("blushes.png")` - sets an image-file as a blushes texture. The file should be placed into the effect's folder.
  <!-- -->
  * Supported formats: `.jpeg`, `.jpg`, `.png`, `.ktx`, `.gif`.

- config.js
- Java
- Swift
- JavaScript

```
/* Feel free to add your custom code below */

Makeup.blushes("blush.png")
```

```
// Effect mCurrentEffect = ...

mCurrentEffect.evalJs("Makeup.blushes('blush.png')", null);
```

```
// var currentEffect: BNBEffect = ...

currentEffect?.evalJs("Makeup.blushes('blush.png')", resultCallback: nil)
```

```
await effect.evalJs("Makeup.blushes('blush.png')")
```

### Softlight[​](#softlight "Direct link to Softlight")

Highlights a face like a directional flashlight.

* `Softlight.strength(n)` - changes softlight intensity, where **n** - any value from 0 to 1 (including decimal). Values > 1 may be also provided.
* `Softlight.clear()` - reset softlight, equals to `Softlight.strength(0)`.

- config.js
- Java
- Swift
- JavaScript

```
// Set softlight strength
Softlight.strength(1)

// Reset softlight
Softlight.clear()
```

```
// Effect mCurrentEffect = ...

// Set softlight strength
mCurrentEffect.evalJs("Softlight.strength(1)", null);

// Reset softlight
mCurrentEffect.evalJs("Softlight.clear()", null);
```

```
// var currentEffect: BNBEffect = ...

// Set softlight strength
currentEffect?.evalJs("Softlight.strength(1)", resultCallback: nil)

// Reset softlight
currentEffect?.evalJs("Softlight.clear()", resultCallback: nil)
```

```
// Set softlight strength
await effect.evalJs("Softlight.strength(1)")

// Reset softlight
await effect.evalJs("Softlight.clear()")
```

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/Softlight-cbb459a901f91b9511924ae35b82dec7.jpg)

Drag

## Brows makeup[​](#brows-makeup "Direct link to Brows makeup")

Set brows color.

* `Brows.color("R G B A")` - set brows color in R G B A format (separated with space). Each value should be in a range from 0 to 1 (including decimal).
* `Brows.clear()`- clears brows color.

- config.js
- Java
- Swift
- JavaScript

```
// Set brows color
Brows.color("0.172 0.125 0.105 0.732")

// Reset brows color
Brows.clear()
```

```
// Effect mCurrentEffect = ...

// Set brows color
mCurrentEffect.evalJs("Brows.color('0.172 0.125 0.105 0.732')", null);

// Reset brows color
mCurrentEffect.evalJs("Brows.clear()", null);
```

```
// var currentEffect: BNBEffect = ...

// Set brows color
currentEffect?.evalJs("Brows.color('0.172 0.125 0.105 0.732')", resultCallback: nil)

// Reset brows color
currentEffect?.evalJs("Brows.clear()", resultCallback: nil)
```

```
// Set brows color
await effect.evalJs("Brows.color('0.172 0.125 0.105 0.732')")

// Reset brows color
await effect.evalJs("Brows.clear()")
```

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/brows-2703f25e2ff6933315668262ab5f9bd0.jpg)

Drag

## Eye makeup[​](#eye-makeup "Direct link to Eye makeup")

### Eyeliner[​](#eyeliner "Direct link to Eyeliner")

Set eyeliner color.

* `Makeup.eyeliner("R G B A")` - set eyeliner color in R G B A format (separated with space). Each value should be in a range from 0 to 1 (including decimal).

- config.js
- Java
- Swift
- JavaScript

```
/* Feel free to add your custom code below */

Makeup.eyeliner("0 0 0")
```

```
// Effect mCurrentEffect = ...

mCurrentEffect.evalJs("Makeup.eyeliner('0 0 0')", null);
```

```
// var currentEffect: BNBEffect = ...

currentEffect?.evalJs("Makeup.eyeliner('0 0 0')", resultCallback: nil)
```

```
await effect.evalJs("Makeup.eyeliner('0 0 0')")
```

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/eyeliner-92fa652bb6068a9432490887ad80f046.jpg)

Drag

**Set a custom eyeliner texture**

* `Makeup.eyeliner("eyeliner.png")` - sets an image-file as an eyeliner texture. The file should be placed into the effect's folder.
  <!-- -->
  * Supported formats: `.jpeg`, `.jpg`, `.png`, `.ktx`, `.gif`.

- config.js
- Java
- Swift
- JavaScript

```
/* Feel free to add your custom code below */

Makeup.eyeliner("eyeliner.png")
```

```
// Effect mCurrentEffect = ...

mCurrentEffect.evalJs("Makeup.eyeliner('eyeliner.png')", null);
```

```
// var currentEffect: BNBEffect = ...

currentEffect?.evalJs("Makeup.eyeliner('eyeliner.png')", resultCallback: nil)
```

```
await effect.evalJs("Makeup.eyeliner('eyeliner.png')")
```

### Eyeshadow[​](#eyeshadow "Direct link to Eyeshadow")

Set eyeshadow color.

* `Makeup.eyeshadow("R G B A")` - set eyeshadow color in R G B A format (separated with space). Each value should be in a range from 0 to 1 (including decimal).

- config.js
- Java
- Swift
- JavaScript

```
/* Feel free to add your custom code below */

Makeup.eyeshadow("0.6 0.5 1 0.6")
```

```
// Effect mCurrentEffect = ...

mCurrentEffect.evalJs("Makeup.eyeshadow('0.6 0.5 1 0.6')", null);
```

```
// var currentEffect: BNBEffect = ...

currentEffect?.evalJs("Makeup.eyeshadow('0.6 0.5 1 0.6')", resultCallback: nil)
```

```
await effect.evalJs("Makeup.eyeshadow('0.6 0.5 1 0.6')")
```

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/eyeshadow-2079f8ae8253e3db7c06a5d04b057109.jpg)

Drag

**Set a custom eyeshadow texture**

* `Makeup.eyeshadow("eyeshadow.png")` - sets an image-file as an eyeshadow texture. The file should be placed into the effect's folder.
  <!-- -->
  * Supported formats: `.jpeg`, `.jpg`, `.png`, `.ktx`, `.gif`.

- config.js
- Java
- Swift
- JavaScript

```
/* Feel free to add your custom code below */

Makeup.eyeshadow("eyeshadow.png")
```

```
// Effect mCurrentEffect = ...

mCurrentEffect.evalJs("Makeup.eyeshadow('eyeshadow.png')", null);
```

```
// var currentEffect: BNBEffect = ...

currentEffect?.evalJs("Makeup.eyeshadow('eyeshadow.png')", resultCallback: nil)
```

```
await effect.evalJs("Makeup.eyeshadow('eyeshadow.png')")
```

### Eyelashes[​](#eyelashes "Direct link to Eyelashes")

Set eyelashes color.

* `Makeup.lashes("R G B A")` - set eyelashes color in R G B A format (separated with space). Each value should be in a rage from 0 to 1 (including decimal).

- config.js
- Java
- Swift
- JavaScript

```
/* Feel free to add your custom code below */

Makeup.lashes("0 0 0")
```

```
// Effect mCurrentEffect = ...

mCurrentEffect.evalJs("Makeup.lashes('0 0 0')", null);
```

```
// var currentEffect: BNBEffect = ...

currentEffect?.evalJs("Makeup.lashes('0 0 0')", resultCallback: nil)
```

```
await effect.evalJs("Makeup.lashes('0 0 0')")
```

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/eyelashes-5ebbf4d5d38bba778b494ff5d793a159.jpg)

Drag

**Set a custom eyelashes texture**

* `Makeup.lashes("eyelashes.png")` - sets an image-file as an eyelashes texture. The file should be placed into the effect's folder.
  <!-- -->
  * Supported formats: `.jpeg`, `.jpg`, `.png`, `.ktx`, `.gif`.

- config.js
- Java
- Swift
- JavaScript

```
/* Feel free to add your custom code below */

Makeup.lashes("eyelashes.png")
```

```
// Effect mCurrentEffect = ...

mCurrentEffect.evalJs("Makeup.lashes('eyelashes.png')", null);
```

```
// var currentEffect: BNBEffect = ...

currentEffect?.evalJs("Makeup.lashes('eyelashes.png')", resultCallback: nil)
```

```
await effect.evalJs("Makeup.lashes('eyelashes.png')")
```

### Makeup.clear[​](#makeupclear "Direct link to Makeup.clear")

Global method for Makeup. Clears all Makeup features that have been set.

* config.js
* Java
* Swift
* JavaScript

```
Makeup.clear()
```

```
mCurrentEffect.evalJs("Makeup.clear()", null);
```

```
currentEffect?.evalJs("Makeup.clear()", resultCallback: nil)
```

```
await effect.evalJs("Makeup.clear()")
```

## Lipstick[​](#lipstick "Direct link to Lipstick")

### Matt[​](#matt "Direct link to Matt")

Set lips matte color.

* `Lips.matt("R G B A")` - set lips matte color in R G B A format (separated with space). Each value should be in a range from 0 to 1 (including decimal).
* `Lips.clear()`- clears lips color.

- config.js
- Java
- Swift
- JavaScript

```
// Set lips color 
Lips.matt("0.85 0.43 0.5 0.8")

// Reset lips color 
Lips.clear()
```

```
// Effect mCurrentEffect = ...

// Set lips color
mCurrentEffect.evalJs("Lips.matt('0.85 0.43 0.5 0.8')", null);

// Reset lips color
mCurrentEffect.evalJs("Lips.clear()", null);
```

```
// var currentEffect: BNBEffect = ...

// Set lips color
currentEffect?.evalJs("Lips.matt('0.85 0.43 0.5 0.8')", resultCallback: nil)

// Reset lips color 
currentEffect?.evalJs("Lips.clear()", resultCallback: nil)
```

```
// Set lips color 
await effect.evalJs("Lips.matt('0.85 0.43 0.5 0.8')")

// Reset lips color 
await effect.evalJs("Lips.clear()")
```

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/lips_matt-01491f0b700df825a8a4fd2170a82261.jpg)

Drag

### Shiny[​](#shiny "Direct link to Shiny")

Set lips shiny color.

* `Lips.shiny("R G B A")` - set shiny lips color in R G B A format (separated with space). Each value should be in a range from 0 to 1 (including decimal).
* `Lips.clear()`- clears lips color.

- config.js
- Java
- Swift
- JavaScript

```
// Set lips color 
Lips.shiny("1 0 0.49 1")

// Reset lips color 
Lips.clear()
```

```
// Effect mCurrentEffect = ...

// Set lips color
mCurrentEffect.evalJs("Lips.shiny('1 0 0.49 1')", null);

// Reset lips color
mCurrentEffect.evalJs("Lips.clear()", null);
```

```
// var currentEffect: BNBEffect = ...

// Set lips color 
currentEffect?.evalJs("Lips.shiny('1 0 0.49 1')", resultCallback: nil)

// Reset lips color 
currentEffect?.evalJs("Lips.clear()", resultCallback: nil)
```

```
// Set lips color 
await effect.evalJs("Lips.shiny('1 0 0.49 1')")

// Reset lips color 
await effect.evalJs("Lips.clear()")
```

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/lips_shiny-815cce33a3d095ae1ebbb034b6bfd7f9.jpg)

Drag

### Glitter[​](#glitter "Direct link to Glitter")

Set lips glitter color.

* `Lips.glitter("R G B A")` - set lips glitter color in R G B A format (separated with space). Each value should be in a range from 0 to 1 (including decimal).
* `Lips.clear()`- clears lips color.

- config.js
- Java
- Swift
- JavaScript

```
// Set lips color
Lips.glitter("0.552 0 0 1")

// Reset lips color 
Lips.clear()
```

```
// Effect mCurrentEffect = ...

// Set lips color
mCurrentEffect.evalJs("Lips.glitter('0.552 0 0 1')", null);

// Reset lips color
mCurrentEffect.evalJs("Lips.clear()", null);
```

```
// var currentEffect: BNBEffect = ...

// Set lips color 
currentEffect?.evalJs("Lips.glitter('0.552 0 0 1')", resultCallback: nil)

// Reset lips color 
currentEffect?.evalJs("Lips.clear()", resultCallback: nil)
```

```
// Set lips color
await effect.evalJs("Lips.glitter('0.552 0 0 1')")

// Reset lips color 
await effect.evalJs("Lips.clear()")
```

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/lips_glitter-3a5f273825b856d74fa6567e3a99b915.jpg)

Drag

### Extended lips options[​](#extended-lips-options "Direct link to Extended lips options")

It is possible to set up extended lips parameters which are usually pre-defined in Matte, Shiny or Glitter lips.

**Common options**

* `Lips.color("R G B A")` - set lips color in R G B A format (separated with space). Each value should be in a range from 0 to 1 (including decimal).
* `Lips.brightness(n)` - changes lips brightness intensity, where n - any value from 0 to 2 (including decimal). 0 stands for the minimal brightness (black color), 1 stands for standard brightness. Values > 2 may be also provided.

**Shine options**

* `Lips.saturation(n)` - changes shine saturation intensity, where n - any value from 0 to 1 (including decimal).
* `Lips.shineIntensity(n)` - changes shine intensity, where n - any value from 0 to 2 (including decimal). Values > 2 may be also provided.
* `Lips.shineBleeding(n)` - changes shine blending strength, where n - any value from 0 to 1 (including decimal). Values > 1 may be also provided.
* `Lips.shineScale(n)` - changes shine scale, where n - any value from 0 to 1 (including decimal). 0 stands for the minimal scale (shine disabled), 1 stands for standard scale. Values > 1 may be also provided.

**Glitter options**

* `Lips.glitterGrain(n)` - changes glitter grain strength, where n - any value from 0 to 2 (including decimal). Values > 2 may be also provided.
* `Lips.glitterIntensity(n)` - changes glitter intensity, where n - any value from 0 to 2 (including decimal). Values > 2 may be also provided.
* `Lips.glitterBleeding(n)` - changes glitter blending strength, where n - any value from 0 to 2 (including decimal). Values > 2 may be also provided.

- config.js
- Java
- Swift
- JavaScript

```
/* Feel free to add your custom code below */

Lips.color("1 0 0 1")
Lips.brightness(1)
Lips.saturation(1)
Lips.shineIntensity(2)
Lips.shineBleeding(1)
Lips.shineScale(1)
Lips.glitterGrain(1)
Lips.glitterIntensity(1)
Lips.glitterBleeding(1)
```

```
// Effect mCurrentEffect = ...

mCurrentEffect.evalJs("Lips.color('1 0 0 1')", null);
mCurrentEffect.evalJs("Lips.brightness(1)", null);
mCurrentEffect.evalJs("Lips.saturation(1)", null);
mCurrentEffect.evalJs("Lips.shineIntensity(2)", null);
mCurrentEffect.evalJs("Lips.shineBleeding(1)", null);
mCurrentEffect.evalJs("Lips.shineScale(1)", null);
mCurrentEffect.evalJs("Lips.glitterGrain(1)", null);
mCurrentEffect.evalJs("Lips.glitterIntensity(1)", null);
mCurrentEffect.evalJs("Lips.glitterBleeding(1)", null);
```

```
// var currentEffect: BNBEffect = ...

currentEffect?.evalJs("Lips.color('1 0 0 1')", resultCallback: nil)
currentEffect?.evalJs("Lips.brightness(1)", resultCallback: nil)
currentEffect?.evalJs("Lips.saturation(1)", resultCallback: nil)
currentEffect?.evalJs("Lips.shineIntensity(2)", resultCallback: nil)
currentEffect?.evalJs("Lips.shineBleeding(1)", resultCallback: nil)
currentEffect?.evalJs("Lips.shineScale(1)", resultCallback: nil)
currentEffect?.evalJs("Lips.glitterGrain(1)", resultCallback: nil)
currentEffect?.evalJs("Lips.glitterIntensity(1)", resultCallback: nil)
currentEffect?.evalJs("Lips.glitterBleeding(1)", resultCallback: nil)
```

```
await effect.evalJs("Lips.color('1 0 0 1')")
await effect.evalJs("Lips.brightness(1)")
await effect.evalJs("Lips.saturation(1)")
await effect.evalJs("Lips.shineIntensity(2)")
await effect.evalJs("Lips.shineBleeding(1)")
await effect.evalJs("Lips.shineScale(1)")
await effect.evalJs("Lips.glitterGrain(1)")
await effect.evalJs("Lips.glitterIntensity(1)")
await effect.evalJs("Lips.glitterBleeding(1)")
```

## Lips liner[​](#lips-liner "Direct link to Lips liner")

Set lips liner color.

* `LipsLiner.color("R G B A")` - set lips liner color in R G B A format (separated with space). Each value should be in a range from 0 to 1 (including decimal).
* `LipsLiner.clear()`- clears lips liner color.

- config.js
- Java
- Swift
- JavaScript

```
// Set lips color 
LipsLiner.color("1.0 0.7 0.8 0.8")

// Reset lips color 
LipsLiner.clear()
```

```
// Effect mCurrentEffect = ...

// Set lips color
mCurrentEffect.evalJs("LipsLiner.color('1.0 0.7 0.8 0.8')", null);

// Reset lips color
mCurrentEffect.evalJs("LipsLiner.clear()", null);
```

```
// var currentEffect: BNBEffect = ...

// Set lips color
currentEffect?.evalJs("LipsLiner.color('1.0 0.7 0.8 0.8')", resultCallback: nil)

// Reset lips color 
currentEffect?.evalJs("LipsLiner.clear()", resultCallback: nil)
```

```
// Set lips color 
await effect.evalJs("LipsLiner.color('1.0 0.7 0.8 0.8')")

// Reset lips color 
await effect.evalJs("LipsLiner.clear()")
```

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/LipsLiner-bd67dbd8f788ec675fc8d6d0185170b0.jpg)

Drag
