# Face Landmarks Guide

Landmarks are anchor points that show the relative position and shape of the main elements of the face. **Banuba SDK** provides the coordinates of the landmarks. To get them, follow these steps.

* iOS
* Android
* Web

1. Import the `BanubaEffectPlayer` framework into your project.

```
import BanubaEffectPlayer
```

2. Add `BNBFrameDataListener` to your ViewController

```
player.effectPlayer?.add(self as BNBFrameDataListener)
```

note

Remove `BNBFrameDataListener` when your ViewController is deinited

```
player.effectPlayer?.remove(self as BNBFrameDataListener)
```

3. Inherit the `BNBFrameDataListener` interface and add protocol stubs

```
extension ViewController: BNBFrameDataListener {
    func onFrameDataProcessed(_ frameData: BNBFrameData?) {

    }
}
```

4. You can get information about the coordinates of the landmarks from the `BNBFrameData`. The `getLandmarks`function returns an array of `NSNumber` with size of `2 * (landmarks number)`. The first value responds to the *X* coord of the first landmark and the second value responds to the *Y* coord of the first landmark and so on.

At first, these coordinates will be in the FRX (Camera) system, but you can transform them to the Screen system. You must set the variables `screenWidth` and `screenHeight` to the width and height of your screen beforehead.

After the transformation, you can get an array of points in the Screen coordinates in correspondence with the landmarks. In this example it is the `landmarksPoints` array.

```
extension ViewController: BNBFrameDataListener {
    func onFrameDataProcessed(_ frameData: BNBFrameData?) {

        guard let fD = frameData else { return }

        let recognitionResult = fD.getFrxRecognitionResult()
        let faces = recognitionResult?.getFaces()
        let landmarksCoordinates = faces?[0].getLandmarks()

        guard let landmarks = landmarksCoordinates else { return }

        if landmarks.count != 0 {
            // get transformation from FRX (Camera) coordinates to Screen coordinates
            let screenRect = BNBPixelRect(x:0, y:0, w:screenWidth, h:screenHeight)
            guard let frxResultTransformation = recognitionResult?.getTransform(),
            let commonToFrxResult = BNBTransformation.makeData(frxResultTransformation.basisTransform),
            let commonRect = commonToFrxResult.inverseJ()?.transform(frxResultTransformation.fullRoi),
            let commonToScreen = BNBTransformation.makeRects(commonRect,
                                                              targetRect: screenRect,
                                                              rot: BNBRotation.deg0, flipX: false, flipY: false),
            let FrxResultToCommon = commonToFrxResult.inverseJ(),
            let frxResultToScreen = FrxResultToCommon.chainRight(commonToScreen)  else { return }

            //create points from transformed coordinates
            var landmarksPoints: [CGPoint] = []
            for i in 0 ..< (landmarks.count / 2) {
                let xCoord = Float(truncating: landmarks[i * 2])
                let yCoord = Float(truncating: landmarks[i * 2 + 1])
                let pointBeforeTransformation = BNBPoint2d(x: xCoord, y: yCoord)

                let pointAfterTransformation = frxResultToScreen.transformPoint(pointBeforeTransformation)
                landmarksPoints.append(CGPoint(x: CGFloat(pointAfterTransformation.x),
                                                y: CGFloat(pointAfterTransformation.y)))
            }
        }
    }
}
```

1. Import the following files into your project:

```
import com.banuba.sdk.effect_player.FrameDataListener
import com.banuba.sdk.player.Player
import com.banuba.sdk.types.FrxRecognitionResult
import com.banuba.sdk.types.TransformableEvent
import com.banuba.sdk.types.Transformation
import com.banuba.sdk.types.FrameData
import com.banuba.sdk.types.FaceData
import com.banuba.sdk.types.PixelRect
import com.banuba.sdk.types.Point2d
import com.banuba.sdk.types.Rotation
```

2. Add `FrameDataListener` to your `ViewController`:

```
player.effectPlayer.addFrameDataListener(this)
```

And don't forget to remove the `FrameDataListener` when your `ViewController` is destroyed:

```
player.effectPlayer.removeFrameDataListener(this)
```

3. Inherit the `FrameDataListener` interface and override the `onFrameDataProcessed(...)` function:

```
class ViewController : FrameDataListener {
    override fun onFrameDataProcessed(frameData: FrameData?) {
        ...
    }
}
```

4. From FrameData you can get the information about the coordinates of the landmarks. The function `getLandmarks()` returns an array of `ArrayList<Float>` with a size of 2 \* (landmarks number). The first value corresponds to the X coord of the first landmark, the second value corresponds to the Y coord of the first landmark, and so on.

At first, these coordinates are in the FRX camera space, but you can transform them into the screen space. You must set the variables `mScreenWidth` and `mScreenHeight` to the width and height of your screen beforehand.

After the transformation, you can get an array of points in the Screen coordinates in correspondence with the landmarks. In this example, it is the `mLandmarksPoints` array.

```
class ViewController : FrameDataListener {
    val screenWidth = 720 /* input screen width */
    val screenHeight = 1280 /* input screen height */
    /* note: mLandmarksPoints - this variable is updated each frame in asynchronous mode.
    * To access it from another thread, adding synchronization is required. */
    val landmarksPoints: ArrayList<Point2d> = ArrayList() /* output landmarks points */

    override fun onFrameDataProcessed(frameData: FrameData?) {
        frameData ?: return
        
        val recognitionResult = frameData.frxRecognitionResult ?: return
        val faces = if (!recognitionResult.faces.isEmpty()) recognitionResult.faces else return
        
        /* note: The example only uses the first face data, but the SDK can recognize
        * and receive data from several faces. */
        val landmarks = if (!faces[0].landmarks.isEmpty()) faces[0].landmarks else return

        /* Create transformation for landmarks */
        val screenRect = PixelRect(0, 0, screenWidth, screenHeight)
        val frxResultTransformation = recognitionResult.transform
        val commonToFrxResult = Transformation.makeData(frxResultTransformation.basisTransform)!!
        val commonRect = commonToFrxResult.inverseJ()!!.transformRect(frxResultTransformation.fullRoi)
        val commonToScreen = Transformation.makeRects(commonRect, screenRect, Rotation.DEG_0, false, false)
        val frxResultToCommon = commonToFrxResult.inverseJ()!!
        val frxResultToScreen = frxResultToCommon.chainRight(commonToScreen)!!

        /* Create points from transformed coordinates */
        val countPoints = landmarks.size / 2
        for (i in 0..countPoints) {
            val xCoord = landmarks[i * 2]
            val yCoord = landmarks[i * 2 + 1]
            val pointBeforeTransformation = Point2d(xCoord, yCoord)
            val pointAfterTransformation = frxResultToScreen.transformPoint(pointBeforeTransformation)
            landmarksPoints.add(pointBeforeTransformation)
        }
    }
}
```

It is possible to retrieve face landmarks from the face recognition performed by SDK:

```
player.addEventListener(Player.FRAME_DATA_EVENT, ({ detail: frameData }) => {
  const hasFace = frameData.get("frxRecognitionResult.faces.0.hasFace")
  if (!hasFace) return console.log("Face not found")

  const landmarks = frameData.get("frxRecognitionResult.faces.0.landmarks")

  console.log("Landmarks:", landmarks)
})
```

The landmarks array stores flattened pairs of 68 points in form of `[x1, y1, x2, y2, ... , x68, y68]`.

warning

Pay attention that an effect with [Face Recognition](/tutorials/capabilities/glossary.md#frx-face-tracking) (e.g. [DebugWireframe](/generated/effects/DebugWireframe.zip)) must be applied to the player.

See the [FRAME\_DATA\_EVENT](/generated/typedoc/classes/Player.html#FRAME_DATA_EVENT) and [FrameData](/generated/typedoc/classes/FrameData.html#get) docs for more details and examples.

Now you can use the face landmarks in the your app. For example, you can display them like in the picture below.

![image](/assets/images/landmarks_68-938993fb47df6b72e725c2acf71386eb.png)

Still have questions about FaceAR SDK?

Visit our [FAQ](https://www.banuba.com/faq/) or [contact our support](/support/.md).
