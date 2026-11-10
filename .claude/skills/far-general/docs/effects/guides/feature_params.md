# How to change feature parameters using scripting api

Since v1.6.1, Banuba SDK provides an oportunity to change some feature parameters using scripting engine:

```
    bnb.scene.addFeatureParam(bnb.FeatureID.ID, [])
```

The first parameter is the feature id with a type bnb.FeatureID. The second parameter is the Array of bnb.FeatureParameter. bnb.FeatureParameter is similiar to vector4 type and contains x,y,z,w fields.

## List of all features with changing parameters[​](#list-of-all-features-with-changing-parameters "Direct link to List of all features with changing parameters")

| feature      | type name                |
| ------------ | ------------------------ |
| ring         | bnb.FeatureID.RING       |
| nails        | bnb.FeatureID.NAILS      |
| acne removal | bnb.FeatureID.FACE\_ACNE |

## Ring[​](#ring "Direct link to Ring")

As an input, the Ring feature takes only the first element of the array where x is the id of selected finger. At the the moment, this feature supports 4 fingers:

* Index - 0
* Middle - 1
* Ring - 2
* Small - 3

Here is example of how to set the middle finger:

* config.js
* Java
* Swift

```
  let middle_finger_id = 1;
  let param = new bnb.FeatureParameter(middle_finger_id,0,0,0);
  bnb.scene.addFeatureParam(bnb.FeatureID.RING, [param])
```

```
// Effect mCurrentEffect = ...

String script =
    "" "
    let middle_finger_id = 1;
let param = new bnb.FeatureParameter(middle_finger_id, 0, 0, 0);
bnb.scene.addFeatureParam(bnb.FeatureID.RING, [param])
    "" ";

    mCurrentEffect.evalJs(script, null);
```

```
// var currentEffect: BNBEffect = ...
  let script = """
      let middle_finger_id = 1;
      let param = new bnb.FeatureParameter(middle_finger_id,0,0,0);
      bnb.scene.addFeatureParam(bnb.FeatureID.RING, [param])
  """;
  currentEffect?.evalJs(script, resultCallback: nil)
```

## Acne Removal[​](#acne-removal "Direct link to Acne Removal")

The Acne Removal feature takes the first element of the array:

* x - width of the surface
* y - height of the surface
* z - fit mode

```
    bnb.FeatureParameter(Width, Height, FitMode, 0)
```

The Fit Mode is a number with specified indeces:

* 0 - fit image on ui view by width
* 1 - fit image on ui view by height
* 2 - fit image inside ui view
* 3 - fit image outside ui view

This parameter is important for manual selecting of acne positions using touches or clicks because your view size and image size can be different. All other elements of the array are acne rects in your ui view coodinate system.

Example:

* config.js
* Java
* Swift

```
  let uiWidth = bnb.scene.getSurfaceWidth(); //touch surface similiar to render surface
  let uiHeight =  bnb.scene.getSurfaceHeight(); //touch surface similiar to render surface
  let fitMode = 1;// fit by height
  let uiInfo =  new bnb.FeatureParameter(uiWidth,uiHeight,fitMode,0);
  let acneSize = 50;

  let acneRect_1 = new bnb.FeatureParameter(400,500,acneSize,acneSize); //acne rect
  let acneRect_2 = new bnb.FeatureParameter(250,250,acneSize,acneSize); //acne rect

  bnb.scene.addFeatureParam(bnb.FeatureID.FACE_ACNE, [uiInfo, acneRect_1, acneRect_2])
```

```
// Effect mCurrentEffect = ...

String script =
    "" "
    let uiWidth = bnb.scene.getSurfaceWidth(); // touch surface similiar to render surface
let uiHeight = bnb.scene.getSurfaceHeight();   // touch surface similiar to render surface
let fitMode = 1;                               // fit by height
let uiInfo = new bnb.FeatureParameter(uiWidth, uiHeight, fitMode, 0);
let acneSize = 50;

let acneRect_1 = new bnb.FeatureParameter(400, 500, acneSize, acneSize); // acne rect
let acneRect_2 = new bnb.FeatureParameter(250, 250, acneSize, acneSize); // acne rect

bnb.scene.addFeatureParam(bnb.FeatureID.FACE_ACNE, [uiInfo, acneRect_1, acneRect_2])
    "" ";

    mCurrentEffect.evalJs(script, null);
```

```
// var currentEffect: BNBEffect = ...
  let script = """
      let uiWidth = bnb.scene.getSurfaceWidth(); //touch surface similiar to render surface
      let uiHeight =  bnb.scene.getSurfaceHeight(); //touch surface similiar to render surface
      let fitMode = 1;// fit by height
      let uiInfo =  new bnb.FeatureParameter(uiWidth,uiHeight,fitMode,0);
      let acneSize = 50;

      let acneRect_1 = new bnb.FeatureParameter(400,500,acneSize,acneSize); //acne rect
      let acneRect_2 = new bnb.FeatureParameter(250,250,acneSize,acneSize); //acne rect

      bnb.scene.addFeatureParam(bnb.FeatureID.FACE_ACNE, [uiInfo, acneRect_1, acneRect_2])
  """;
  currentEffect?.evalJs(script, resultCallback: nil)
```
