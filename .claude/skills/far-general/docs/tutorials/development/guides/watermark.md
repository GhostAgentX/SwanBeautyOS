# Watermark Guide

A watermark is a small image that is superimposed on top of the entire video.

* iOS
* Android

If you want to apply a watermark to a recorded video, you should use the `video.watermark` property.

```
guard let watermark = UIImage(named: "YOUR_WATERMARK_IMAGE") else { return }
let offset = CGPoint(x: 20.0, y: 20.0)
let watermarkInfo = WatermarkInfo(image: watermark,
    corner: .bottomLeft, offset: offset, targetNormalizedWidth: 0.2)
let video = Video(cameraDevice: cameraDevice)
player.use(input: camera, outputs: [playerView.uiView, video])
video.watermark = watermarkInfo
video.record(...)
```

If you want to apply a watermark to a video, you should create a `WatermarkInfo` structure:

```
val watermark: Drawable = ContextCompat.getDrawable(this, R.drawable.my_watermark_res)!!
val width = 101
val height = 24
val aspectRatio = width.toFloat() / height.toFloat()

val sizeProvider = { viewportSize: Size ->
    val targetWidth = (viewportSize.width * 0.5f).toInt()
    val targetHeight = (targetWidth / aspectRatio).toInt()
    Size(targetWidth, targetHeight)
}

val watermarkGravity = Gravity.BOTTOM // or Gravity.RIGHT
val positionProvider = GravityPositionProviderAdapter(sizeProvider, watermarkGravity)

val myWatermarkInfo = WatermarkInfo(watermark, sizeProvider, positionProvider, width, height, true)
```

Apply the watermark in the `VideoOutput.start` method:

```
videoOutput.start(..., myWatermarkInfo)
```

Still have questions about FaceAR SDK?

Visit our [FAQ](https://www.banuba.com/faq/) or [contact our support](/support/.md).
