# Face Beauty API

danger

**This feature is deprecated**. [We recommend you to use Prefabs](/effects/prefabs/overview.md)

Banuba provides the Beauty API designed to help you integrate face modification and touch-up functionality into your app. The beautification features fit into a variety of use cases, e.g. live streaming, video chats and video conferencing apps, selfie editors, and portrait retouching software. It aims to make the user feel comfortable about the camera experience.

[](pathname:///generated/effects/Makeup.zip)

[Download example](pathname:///generated/effects/Makeup.zip)

tip

[Read more about how to use and combine](/effects/makeup_deprecated/makeup_usage.md) Makeup API and Face Beauty API features.

note

Please [contact us](/support/.md) if you wish to use Makeup API features in iOS version 14.x.

The Beauty module allows to enhance the face via the following built-in features:

## Teeth Whitening[​](#teeth-whitening "Direct link to Teeth Whitening")

Allows for a beautiful smile.

* `Teeth.whitening(n)` - changes whitening texture intensity, where **n** - any value from 0 to 1 (including decimal).

- config.js
- Java
- Swift
- JavaScript

```
/* Feel free to add your custom code below */

// set teeth whitening strength
Teeth.whitening(1)
```

```
// Effect mCurrentEffect = ...

// set teeth whitening strength
mCurrentEffect.evalJs("Teeth.whitening(1)", null);
```

```
// var currentEffect: BNBEffect = ...

// set teeth whitening strength
currentEffect?.evalJs("Teeth.whitening(1)", resultCallback: nil)
```

```
// set teeth whitening strength
await effect.evalJs("Teeth.whitening(1)")
```

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/teeth-ad89bfabc20c76750c21b2348693680b.jpg)

Drag

## Face morphing[​](#face-morphing "Direct link to Face morphing")

Slims down the cheeks and nose to make it more delicate.

* `FaceMorph.eyebrows({spacing: value, height: value, bend: value})` - set eyebrows morph params: spacing - Adjusting the space between the eyebrows \[-1;1], height - Raising/lowering the eyebrows \[-1;1], bend - Adjusting the bend of the eyebrows \[-1;1]
* `FaceMorph.eyes({rounding: value, enlargement: value, height: value, spacing: value, squint: value, lower_eyelid_pos: value, lower_eyelid_size: value, down: value, eyelid_upper: value, eyelid_lower: value})` - set eyes morph params: rounding - Adjusting the roundness of the eyes \[0;1], enlargement - Enlarging the eyes \[0;1], height - Raising/lowering the eyes \[-1;1], spacing - Adjusting the space between the eyes \[-1;1], squint - Making the person squint by adjusting the eyelids \[-1;1], lower\_eyelid\_pos - Raising/lowering the lower eyelid \[-1;1], lower\_eyelid\_size - Enlarging/shrinking the lower eyelid \[-1;1], down - Eyes down \[0;1], eyelid\_upper - Eyelid upper \[0;1], eyelid\_lower - Eyelid lower \[0;1]
* `FaceMorph.nose({width: value, length: value, tip_width: value, down_up: value, sellion: value})` - set nose morph params: width - Adjusting the nose width \[-1;1], length - Adjusting the nose length \[-1;1], tip\_width - Adjusting the nose tip width \[0;1], down\_up - Nose down/up \[0;1], sellion - Nose sellion \[0;1]
* `FaceMorph.lips({size: value, height: value, thickness: value, mouth_size: value, smile: value, shape: value, sharp: value})` - set lips morph params: size - Adjusting the width and vertical size of the lips \[-1;1], height - Raising/lowering the lips \[-1;1], thickness - Adjusting the thickness of the lips \[-1;1], mouth\_size - Adjusting the size of the mouth \[-1;1], smile - Making a person smile \[0;1], shape - Adjusting the shape of the lips \[-1;1], sharp - Lips Sharp \[0;1]
* `FaceMorph.face({narrowing: value, v_shape: value, cheekbones_narrowing: value, cheeks_narrowing: value, jaw_narrowing: value, chin_shortening: value, chin_narrowing: value, sunken_cheeks: value, cheeks_jaw_narrowing: value, jaw_wide_thin: value, chin: value, forehead: value})` - set face morph params: narrowing - Narrowing the face \[0;1], v\_shape - Shrinking the chin and narrowing the cheeks \[0;1], chekbones\_narrowing - Narrowing the cheekbones \[-1;1], cheeks\_narrowing - Narrowing the cheeks \[0;1], jaw\_narrowing - Narrowing the jaw \[0;1], chin\_shortening - Decreasing the length of the chin \[0;1], chin\_narrowing - Narrowing the chin \[0;1], sunken\_cheeks - Sinking the cheeks and emphasizing the cheekbones \[0;1], cheeks\_jaw\_narrowing - Narrowing the cheeks and the jaw \[0;1], jaw\_wide\_thin - Jaw wide/thin \[0;1], chin - Face Chin \[0;1], forehead - Forehead \[0;1]
* `FaceMorph.clear()`- resets morph

- config.js
- Java
- Swift
- JavaScript

```
// Set FaceMorph effects
FaceMorph.eyebrows({spacing: 0.6, height: 0.3, bend: 1.0})
FaceMorph.eyes({rounding: 0.6, enlargement: 0.3, height: 0.3, spacing: 0.3, squint: 0.3, lower_eyelid_pos: 0.3, lower_eyelid_size: 0.3})
FaceMorph.face({narrowing: 0.6, v_shape: 0.3, cheekbones_narrowing: 0.3, cheeks_narrowing: 0.3, jaw_narrowing: 0.7, chin_shortening: 0.3, chin_narrowing: 0.3, sunken_cheeks: 0.1, cheeks_jaw_narrowing: 0.2})
FaceMorph.nose({width: 0.3, length: 0.2, tip_width: 0.1})
FaceMorph.lips({size: 0.4, height: 1.0, thickness: 0.1, mouth_size: 0.2, smile: 0.8, shape: 0.4})

// Reset all the FaceMorph effects
FaceMorph.clear()
```

```
// Effect mCurrentEffect = ...

// Set FaceMorph effects
mCurrentEffect.evalJs("FaceMorph.eyebrows({spacing: 0.6, height: 0.3, bend: 1.0})", null);
mCurrentEffect.evalJs("FaceMorph.eyes({rounding: 0.6, enlargement: 0.3, height: 0.3, spacing: 0.3, squint: 0.3, lower_eyelid_pos: 0.3, lower_eyelid_size: 0.3})", null);
mCurrentEffect.evalJs("FaceMorph.face({narrowing: 0.6, v_shape: 0.3, cheekbones_narrowing: 0.3, cheeks_narrowing: 0.3, jaw_narrowing: 0.7, chin_shortening: 0.3, chin_narrowing: 0.3, sunken_cheeks: 0.1, cheeks_jaw_narrowing: 0.2})", null);
mCurrentEffect.evalJs("FaceMorph.nose({width: 0.3, length: 0.2, tip_width: 0.1})", null);
mCurrentEffect.evalJs("FaceMorph.lips({size: 0.4, height: 1.0, thickness: 0.1, mouth_size: 0.2, smile: 0.8, shape: 0.4})", null);

// Reset FaceMorph effects
mCurrentEffect.evalJs("FaceMorph.clear()", null);
```

```
// var currentEffect: BNBEffect = ...

// Set FaceMorph effects
currentEffect?.evalJs("FaceMorph.eyebrows({spacing: 0.6, height: 0.3, bend: 1.0})", resultCallback: nil)
currentEffect?.evalJs("FaceMorph.eyes({rounding: 0.6, enlargement: 0.3, height: 0.3, spacing: 0.3, squint: 0.3, lower_eyelid_pos: 0.3, lower_eyelid_size: 0.3})", resultCallback: nil)
currentEffect?.evalJs("FaceMorph.face({narrowing: 0.6, v_shape: 0.3, cheekbones_narrowing: 0.3, cheeks_narrowing: 0.3, jaw_narrowing: 0.7, chin_shortening: 0.3, chin_narrowing: 0.3, sunken_cheeks: 0.1, cheeks_jaw_narrowing: 0.2})", resultCallback: nil)
currentEffect?.evalJs("FaceMorph.nose({width: 0.3, length: 0.2, tip_width: 0.1})", resultCallback: nil)
currentEffect?.evalJs("FaceMorph.lips({size: 0.4, height: 1.0, thickness: 0.1, mouth_size: 0.2, smile: 0.8, shape: 0.4})", resultCallback: nil)

// Reset FaceMorph effects
currentEffect?.evalJs("FaceMorph.clear()", resultCallback: nil)
```

```
// Set FaceMorph effects
await effect.evalJs("FaceMorph.eyebrows({spacing: 0.6, height: 0.3, bend: 1.0})")
await effect.evalJs("FaceMorph.eyes({rounding: 0.6, enlargement: 0.3, height: 0.3, spacing: 0.3, squint: 0.3, lower_eyelid_pos: 0.3, lower_eyelid_size: 0.3})")
await effect.evalJs("FaceMorph.face({narrowing: 0.6, v_shape: 0.3, cheekbones_narrowing: 0.3, cheeks_narrowing: 0.3, jaw_narrowing: 0.7, chin_shortening: 0.3, chin_narrowing: 0.3, sunken_cheeks: 0.1, cheeks_jaw_narrowing: 0.2})")
await effect.evalJs("FaceMorph.nose({width: 0.3, length: 0.2, tip_width: 0.1})")
await effect.evalJs("FaceMorph.lips({size: 0.4, height: 1.0, thickness: 0.1, mouth_size: 0.2, smile: 0.8, shape: 0.4})")

// Reset FaceMorph effects
await effect.evalJs("FaceMorph.clear()")
```

**Preview**

![Right image compare](/assets/images/original2-f74f044be90519e96c2b58b2db7ddce2.jpg)![Left image compare](/assets/images/morph-082d96aed26822a507fd45581b8b49f4.jpg)

Drag

## Photo filters (LUTs)[​](#photo-filters-luts "Direct link to Photo filters (LUTs)")

Applies color filters to the entire image.

* `Filter.set("lut_texture.png")` - set lut filter texture,
* `Filter.strength(n)` - set lut filter strength, where **n** - any value from 0 to 1 (including decimal), but also larger values may be passed, like 2, 3, etc;
* `Filter.clear()`- clears filter.

- config.js
- Java
- Swift
- JavaScript

```
// Set lut filter characteristics
Filter.set("lut_texture.png")
Filter.strength(1)

// Clear filter
Filter.clear()
```

```
// Effect mCurrentEffect = ...

// Set lut filter characteristics
mCurrentEffect.evalJs("Filter.set('lut_texture.png')", null);
mCurrentEffect.evalJs("Filter.strength(1)", null);

// Clear filter
mCurrentEffect.evalJs("Filter.clear()", null);
```

```
// var currentEffect: BNBEffect = ...

// Set lut filter characteristics
currentEffect?.evalJs("Filter.set('lut_texture.png')", resultCallback: nil)
currentEffect?.evalJs("Filter.strength(1)", resultCallback: nil)

// Clear filter
currentEffect?.evalJs("Filter.clear()", resultCallback: nil)
```

```
// Set lut filter characteristics
await effect.evalJs("Filter.set('lut_texture.png')")
await effect.evalJs("Filter.strength(1)")

// Clear filter
await effect.evalJs("Filter.clear()")
```

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/Filter-db9e7fe33e0c0309c76a9abad0226df7.jpg)

Drag

## Skin[​](#skin "Direct link to Skin")

### Skin smoothing (Skin softening)[​](#skin-smoothing-skin-softening "Direct link to Skin smoothing (Skin softening)")

Makes the skin look younger by smoothing wrinkles.

* `Skin.softening(n)` - set softening intensity, where **n** - any value from 0 to 1 (including decimal).

- config.js
- Java
- Swift
- JavaScript

```
/* Feel free to add your custom code below */

Skin.softening(1)
```

```
// Effect mCurrentEffect = ...

mCurrentEffect.evalJs("Skin.softening(1)", null);
```

```
// var currentEffect: BNBEffect = ...

currentEffect?.evalJs("Skin.softening(1)", resultCallback: nil)
```

```
await effect.evalJs("Skin.softening(1)")
```

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/SkinSoftening-e7800133c7d654b8372366266bdbf026.jpg)

Drag

### Skin color[​](#skin-color "Direct link to Skin color")

Changes the face and neck skin color.

* `Skin.color("R G B A")` - set skin color in R G B A format (separated with space). Each value should be in a range from 0 to 1 (including decimal),
* `Skin.clear()` - clears skin color and softening.

info

Requires [Skin segmentation](/tutorials/capabilities/sdk_features.md#face-ar-sdk-neural-network-features) Neural Network.

* config.js
* Java
* Swift
* JavaScript

```
// Set skin color
Skin.color("0.8 0.6 0.1 0.4")

// Reset skin color
Skin.clear()
```

```
// Effect mCurrentEffect = ...

// Set skin color
mCurrentEffect.evalJs("Skin.color('0.8 0.6 0.1 0.4')", null);

// Reset skin color
mCurrentEffect.evalJs("Skin.clear()", null);
```

```
// var currentEffect: BNBEffect = ...

// Set skin color
currentEffect?.evalJs("Skin.color('0.8 0.6 0.1 0.4')", resultCallback: nil)

// Reset skin color
currentEffect?.evalJs("Skin.clear()", resultCallback: nil)
```

```
// Set skin color
await effect.evalJs("Skin.color('0.8 0.6 0.1 0.4')")

// Reset skin color
await effect.evalJs("Skin.clear()")
```

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/SkinColor-34d47f813d6ab2280eaf6e3793f8d14d.jpg)

Drag

## Background separation[​](#background-separation "Direct link to Background separation")

info

Requires [Background separation](/tutorials/capabilities/sdk_features.md#face-ar-sdk-neural-network-features) Neural Network.

tip

If you need only the background separation effect, see [Virtual Background API](/effects/virtual_background.md).

### Background texture[​](#background-texture "Direct link to Background texture")

Sets the file as the background texture.

* `Background.texture("bg_image.png")` - sets an image file as a background texture.
  <!-- -->
  * Supported formats: `.jpeg`, `.jpg`, `.png`, `.ktx`, `.gif`.
* `Background.texture("bg_video.mp4")` - sets the video file as a background texture. Visit [technical specification](/tutorials/capabilities/technical_specification.md#video-formats-support) for supported video formats.

- config.js
- Java
- Swift
- JavaScript

```
/* Feel free to add your custom code below */

Background.texture("bg_colors_tile.png")
```

```
// Effect mCurrentEffect = ...

mCurrentEffect.evalJs("Background.texture('bg_colors_tile.png')", null);
```

```
// var currentEffect: BNBEffect = ...

currentEffect?.evalJs("Background.texture('bg_colors_tile.png')", resultCallback: nil)
```

```
await effect.evalJs("Background.texture('bg_colors_tile.png')")
```

**Preview**

![Right image compare](/assets/images/original_wide-2f360425a0e0a779832de176b75c4354.jpg)![Left image compare](/assets/images/BackgroundTexture-fe6299595a550a13eec111677e4e2539.jpg)

Drag

### Background transparency[​](#background-transparency "Direct link to Background transparency")

Sets the background transparency.

* `Background.transparency(n)` - set transperany value from 0 to 1 (including decimal).

- config.js
- Java
- Swift
- JavaScript

```
/* Feel free to add your custom code below */

Background.transparency(0.5)
```

```
// Effect mCurrentEffect = ...

mCurrentEffect.evalJs("Background.transparency(0.5)", null);
```

```
// var currentEffect: BNBEffect = ...

currentEffect?.evalJs("Background.transparency(0.5)", resultCallback: nil)
```

```
await effect.evalJs("Background.transparency(0.5)")
```

**Preview**

![Right image compare](/assets/images/BackgroundTexture-fe6299595a550a13eec111677e4e2539.jpg)![Left image compare](/assets/images/BackgroundTransparent-2ee7764a986084bc8020b1342daef38c.jpg)

Drag

### Background rotation[​](#background-rotation "Direct link to Background rotation")

Rotates the background texture clockwise in degrees.

* `Background.rotation(deg)` - set rotation value from 0 360 degrees. The value should be divisible by 90 degrees.

- config.js
- Java
- Swift
- JavaScript

```
/* Feel free to add your custom code below */

Background.rotation(90)
```

```
// Effect mCurrentEffect = ...

mCurrentEffect.evalJs("Background.rotation(90)", null);
```

```
// var currentEffect: BNBEffect = ...

currentEffect?.evalJs("Background.rotation(90)", resultCallback: nil)
```

```
await effect.evalJs("Background.rotation(90)")
```

### Background scale[​](#background-scale "Direct link to Background scale")

Scales the background texture.

* `Background.scale(n)` - multiplies the background texture size on given value.

- config.js
- Java
- Swift
- JavaScript

```
/* Feel free to add your custom code below */

Background.scale(2)
```

```
// Effect mCurrentEffect = ...

mCurrentEffect.evalJs("Background.scale(2)", null);
```

```
// var currentEffect: BNBEffect = ...

currentEffect?.evalJs("Background.scale(2)", resultCallback: nil)
```

```
await effect.evalJs("Background.scale(2)")
```

### Background contentMode[​](#background-contentmode "Direct link to Background contentMode")

Sets the background texture content mode.

* `Background.contentMode("mode")` - set mode type, possible values: `fill`, `fit`, `scale_to_fill`.

- config.js
- Java
- Swift
- JavaScript

```
/* Feel free to add your custom code below */

Background.contentMode("fill")
```

```
// Effect mCurrentEffect = ...

mCurrentEffect.evalJs("Background.contentMode('fill')", null);
```

```
// var currentEffect: BNBEffect = ...

currentEffect?.evalJs("Background.contentMode('fill')", resultCallback: nil)
```

```
await effect.evalJs("Background.contentMode('fill')")
```

### Background blur[​](#background-blur "Direct link to Background blur")

Blurs the background behind the user.

* `Background.blur(n)` - sets the background blur radius in \[0, 1] range.

- config.js
- Java
- Swift
- JavaScript

```
/* Feel free to add your custom code below */

Background.blur(0.2)
```

```
// Effect mCurrentEffect = ...

mCurrentEffect.evalJs("Background.blur(0.2)", null);
```

```
// var currentEffect: BNBEffect = ...

currentEffect?.evalJs("Background.blur(0.2)", resultCallback: nil)
```

```
await effect.evalJs("Background.blur(0.2)")
```

**Preview**

![Right image compare](/assets/images/BackgroundTexture-fe6299595a550a13eec111677e4e2539.jpg)![Left image compare](/assets/images/BackgroundBlur-19465ffc736d1651b18c01ea8d99b1ef.jpg)

Drag

### Background clear[​](#background-clear "Direct link to Background clear")

Removes the background color and texture, resets any settings applied.

* config.js
* Java
* Swift
* JavaScript

```
/* Feel free to add your custom code below */

Background.clear()
```

```
// Effect mCurrentEffect = ...

mCurrentEffect.evalJs("Background.clear()", null);
```

```
// var currentEffect: BNBEffect = ...

currentEffect?.evalJs("Background.clear()", resultCallback: nil)
```

```
await effect.evalJs("Background.clear()")
```

## Hair coloring[​](#hair-coloring "Direct link to Hair coloring")

info

Requires [Hair segmentation](/tutorials/capabilities/sdk_features.md#face-ar-sdk-neural-network-features) Neural Network.

### Single color[​](#single-color "Direct link to Single color")

Dyes hair with one color.

* `Hair.color("R G B A")` - set hair color in R G B A format (separated with space). Each value should be in a rage from 0 to 1 (including decimal),
* `Hair.clear()` - clears hair color (including gradient and hair strands).

- config.js
- Java
- Swift
- JavaScript

```
// Set hair color
Hair.color("0.39 0.14 0.14 0.8")

// Reset hair color
Hair.clear()
```

```
// Effect mCurrentEffect = ...

// Set hair color
mCurrentEffect.evalJs("Hair.color('0.39 0.14 0.14 0.8')", null);

// Reset hair color
mCurrentEffect.evalJs("Hair.clear()", null);
```

```
// var currentEffect: BNBEffect = ...

// Set hair color
currentEffect?.evalJs("Hair.color('0.39 0.14 0.14 0.8')", resultCallback: nil

// Reset hair color
currentEffect?.evalJs("Hair.clear()", resultCallback: nil)
```

```
// Set hair color
await effect.evalJs("Hair.color('0.39 0.14 0.14 0.8')")

// Reset hair color
await effect.evalJs("Hair.clear()")
```

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/HairColor-90c31b1560331c076aac589c7f741ce8.jpg)

Drag

### Hair gradient[​](#hair-gradient "Direct link to Hair gradient")

Dyes hair with 1 to 5 colors.

* `Hair.color("start_color_rgba", "end_color_rgba")` - set hair gradient in R G B A format (separated with space). Each rgba value should be in a rage from 0 to 1 (including decimal),

- config.js
- Java
- Swift
- JavaScript

```
/* Feel free to add your custom code below */

Hair.color("0.19 0.06 0.25", "0.09 0.25 0.38")
```

```
// Effect mCurrentEffect = ...

mCurrentEffect.evalJs("Hair.color('0.19 0.06 0.25', '0.09 0.25 0.38')", null);
```

```
// var currentEffect: BNBEffect = ...

currentEffect?.evalJs("Hair.color('0.19 0.06 0.25', '0.09 0.25 0.38')", resultCallback: nil)
```

```
await effect.evalJs("Hair.color('0.19 0.06 0.25', '0.09 0.25 0.38')")
```

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/HairGradient-b253876cdcdbb46c8ae69f129ebcdbb5.jpg)

Drag

### Hair strands painting[​](#hair-strands-painting "Direct link to Hair strands painting")

Dyes hair strands with 1 to 5 colors.

* `Hair.strands("R G B A", "R G B A", "R G B A", ...)` - set hair strands in R G B A format (separated with space) with 5 color maximum.

info

Requires [Hair strands painting](/tutorials/capabilities/sdk_features.md#face-ar-sdk-neural-network-features) Add-On.

* config.js
* Java
* Swift
* JavaScript

```
/* Feel free to add your custom code below */

Hair.strands("0.80 0.40 0.40 1.0", "0.83 0.40 0.40 1.0", "0.85 0.75 0.75 1.0", "0.87 0.60 0.60 1.0", "0.99 0.65 0.65 1.0")
```

```
// Effect mCurrentEffect = ...

mCurrentEffect.evalJs("Hair.strands('0.80 0.40 0.40 1.0', '0.83 0.40 0.40 1.0', '0.85 0.75 0.75 1.0', '0.87 0.60 0.60 1.0', '0.99 0.65 0.65 1.0')", null);
```

```
// var currentEffect: BNBEffect = ...

currentEffect?.evalJs("Hair.strands('0.80 0.40 0.40 1.0', '0.83 0.40 0.40 1.0', '0.85 0.75 0.75 1.0', '0.87 0.60 0.60 1.0', '0.99 0.65 0.65 1.0')", resultCallback: nil);
```

```
await effect.evalJs("Hair.strands('0.80 0.40 0.40 1.0', '0.83 0.40 0.40 1.0', '0.85 0.75 0.75 1.0', '0.87 0.60 0.60 1.0', '0.99 0.65 0.65 1.0')")
```

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/HairStrand-cd7d7af6e94d76429c69883f0ad7a201.jpg)

Drag

## Eyes beautification[​](#eyes-beautification "Direct link to Eyes beautification")

info

Requires [Eye segmentation](/tutorials/capabilities/sdk_features.md#face-ar-sdk-neural-network-features) Neural Network.

### Eyes coloring[​](#eyes-coloring "Direct link to Eyes coloring")

Changes the color of the iris as in virtual lens try on.

* `Eyes.color("R G B A")` - set eyes color in R G B A format (separated with space). Each value should be in a rage from 0 to 1 (including decimal),
* `Eyes.clear()` - clears eyes color including flare and whitening.

- config.js
- Java
- Swift
- JavaScript

```
// Set eyes color 
Eyes.color("0 0.2 0.8 0.64")

// Reset eyes color
Eyes.clear()
```

```
// Effect mCurrentEffect = ...

// Set eyes color
mCurrentEffect.evalJs("Eyes.color('0 0.2 0.8 0.64')", null);

// Reset eyes color
mCurrentEffect.evalJs("Eyes.clear()", null);
```

```
// var currentEffect: BNBEffect = ...

// Set eyes color
currentEffect?.evalJs("Eyes.color('0 0.2 0.8 0.64')", resultCallback: nil)

// Reset eyes color
currentEffect?.evalJs("Eyes.clear()", resultCallback: nil)
```

```
// Set eyes color
await effect.evalJs("Eyes.color('0 0.2 0.8 0.64')")

// Reset eyes color
await effect.evalJs("Eyes.clear()")
```

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/eyescolor-fc2dcb06828e09ff46183aadd16ce026.jpg)

Drag

### Eye flare[​](#eye-flare "Direct link to Eye flare")

Makes eyes more expressive adding flare.

* `Eyes.flare(n)` - sets the eyes flare strength from 0 to 1.

- config.js
- Java
- Swift
- JavaScript

```
/* Feel free to add your custom code below */

Eyes.flare("1")
```

```
// Effect mCurrentEffect = ...

mCurrentEffect.evalJs("Eyes.flare(1)", null);
```

```
// var currentEffect: BNBEffect = ...

currentEffect?.evalJs("Eyes.flare(1)", resultCallback: nil)
```

```
await effect.evalJs("Eyes.flare(1)")
```

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/EyesFlare-aaa9dfc2204ee98f6874e0556099d0c8.jpg)

Drag

### Eyes whitening[​](#eyes-whitening "Direct link to Eyes whitening")

Makes the look more expressive by whitening eyes.

* `Eyes.whitening(n)` - sets the eyes sclera whitening strength from 0 to 1.

- config.js
- Java
- Swift
- JavaScript

```
/* Feel free to add your custom code below */

Eyes.whitening(1)
```

```
// Effect mCurrentEffect = ...

mCurrentEffect.evalJs("Eyes.whitening(1)", null);
```

```
// var currentEffect: BNBEffect = ...

currentEffect?.evalJs("Eyes.whitening(1)", resultCallback: nil)
```

```
await effect.evalJs("Eyes.whitening(1)")
```

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/EyesWhitening-53c06893890dff12356d60e292ee7b23.jpg)

Drag

## Eye bags removal[​](#eye-bags-removal "Direct link to Eye bags removal")

Removes eye bags. Works in offline mode only (for photo or video processing).

info

Requires [Eye bags removal](/tutorials/capabilities/sdk_features.md#face-ar-sdk-neural-network-features) Add-On.

* `EyeBagsRemoval.enable()` - enables eye bags removal,
* `EyeBagsRemoval.disable()` - disables eye bags removal.

- config.js
- Java
- Swift

```
/* Feel free to add your custom code below */

// Enable eye bags removal
EyeBagsRemoval.enable()

// Disable eye bags removal
EyeBagsRemoval.disable()
```

```
// Effect mCurrentEffect = ...

// Enable eye bags removal
mCurrentEffect.evalJs("EyeBagsRemoval.enable()", null);

// Disable eye bags removal
mCurrentEffect.evalJs("EyeBagsRemoval.disable()", null);
```

```
// var currentEffect: BNBEffect = ...

// Enable eye bags removal
currentEffect?.evalJs("EyeBagsRemoval.enable()", resultCallback: nil)

// Disable eye bags removal
currentEffect?.evalJs("EyeBagsRemoval.disable()", resultCallback: nil)
```

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/EyeBagsRemoval-d7c8bc7aee12c5f8af08a777ff5ac0c6.jpg)

Drag
