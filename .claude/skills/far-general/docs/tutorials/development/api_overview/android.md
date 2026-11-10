# android

**Player API** is a set of classes and methods that help facilitate and speed up the integration of
the Banuba SDK into applications. The **Player API** concept distinguishes three main entities:
**Input**, **Player**, and **Output**.

Basic **Player API** packages:

* `com.banuba.sdk.input` - all the classes responsible for the input data, the Input entity.
* `com.banuba.sdk.player` - the rendering thread and the `Player`, the Player entity.
* `com.banuba.sdk.output` - all the classes responsible for the output data, the Output entity.
* `com.banuba.sdk.frame` - the pixel buffer used for both input and output.

## Input

**Input** receives frames from a camera, image, or user input and provides them to the `Player`.
The `Player` can only work with one Input at a time.

* `CameraInput` - this class provides frames from the front or rear camera in real time.
* `ProtoInput` - this class provides frames as photos taken by the camera or loaded from a file.
* `StreamInput` - this class provides user frames from user data.
* `VideoInput` - this class provides frames from a video file.

## Player

The **Player** class requests frames from **Input**, then processes these frames and
passes the results to one or more **Outputs**. By default, frame processing works automatically. 
Optionally, you can enable on-demand processing.

## Output

**Output** receives the result of the work from the **Player** and renders it to the surface or a texture,
writes it into a file, or provides the user with frames in a supported format.
* `FrameOutput` - provides the user with data in the form of a buffer of pixels.
* `SurfaceOutput` - this class renders frames to the `SurfaceView`.
* `TextureOutput` - this class renders frames to the `TextureView`.
* `VideoOutput` - this class writes frames to a video file.

## Input and Output of user data

The **Input** and the **Output** can operate on a pixel buffer.
* `FramePixelBuffer` - provides access to an array of pixels as a byte buffer. In the `StreamInput`
class, it is used as the input data buffer, and in the `FrameOutput` class, it is used as the output
data buffer.
* `FramePixelBufferFormat` - pixel buffer format can be one of: `RGBA`, `I420_BT601_FULL`,
`I420_BT601_VIDEO`, `I420_BT709_FULL` or `I420_BT709_VIDEO`.

## Use cases

### CameraDevice

The camera device is associated with the device's physical camera. All camera settings are made
using this class.

```kotlin
// Variable declaration somewhere inside the activity
private val cameraDevice by lazy(LazyThreadSafetyMode.NONE) {
    CameraDevice(requireNotNull(this.applicationContext), this@MainActivity)
}

...

// Somewhere in the initialization code
/* You can change the camera settings at any time as follows. */
cameraDevice.configurator
    .setLens(CameraDeviceConfigurator.LensSelector.BACK) /* Set back camera as input */
    .setVideoCaptureSize(CameraDeviceConfigurator.SD_CAPTURE_SIZE) /* Video capturing size 640, 480 */
    .setImageCaptureSize(CameraDeviceConfigurator.HD_CAPTURE_SIZE) /* Image capture size 1280, 720 */
    .commit() /* You must call this method to apply the new settings. */
/* But if you're happy with the camera's default settings, then you can safely
skip manual settings. */
/* We start the camera and then player starts taking frames */
/* You must obtain permission before calling the cameraDevice.start() method. */
cameraDevice.start()

...

// Somewhere in the interruption code
/* After this method, the camera will stop capturing frames and transmitting
them to player */
cameraDevice.stop()
```

### CameraInput

Allows to receive and process frames from the `CameraDevice`. The `Player` will only process the most
recently received frame, all other frames will be discarded. Frames will be processed in
online mode.

```kotlin
// Somewhere in the initialization code
/* There is no need to create a variable for this class since this class is only used
to transfer frames from the camera to the player. But it is necessary that cameraDevice
is created */
player.use(CameraInput(cameraDevice), ...)
```

### PhotoInput

Allows you to process photos from the `CameraDevice`, from the Android [`Bitmap`](https://developer.android.com/reference/android/graphics/Bitmap),
from the Android [`Image`](https://developer.android.com/reference/android/media/Image),
or from the [`FramePixelBuffer`](#framepixelbuffer) with or without a given orientation and
mirroring. The photo will be processed in the offline mode.

```kotlin
// Somewhere in the image processing code
val photoInput = PhotoInput()
player.use(photoInput, ...)
/* cameraDevice must be created and started before taking a photo */
photoInput.take(cameraDevice, object: CameraDevice.IErrorOccurred {
    override fun onError(exception: Exception) {
        /* Did an error occur? Now we just ignore it */
    }
})
```

### StreamInput

Pushes the user data stream to the `Player`. User data can come from anywhere, for example, received
over the network. Frames will be processed in online mode.

```kotlin
// Variable declaration 
private val streamInput by lazy(LazyThreadSafetyMode.NONE) {
    StreamInput()
}

...

// Somewhere in the initialization code
player.use(streamInput, ...)

...

// somewhere in the code when receiving the next frame
/* You can see an example of creating a FramePixelBuffer below
in section 1FramePixelBuffer */
val frame = FramePixelBuffer(...)
/* myFrameTimestampInNanoseconds - it is not necessary to put the timestamp,
you can always transmit 0. But if you use VideoOutput, then recording in the video file
will be based on the time that you put here. Be careful with the timestamp; note
that it must be transmitted in nanoseconds. */
streamInput.push(frame, myFrameTimestampInNanoseconds)
```

### VideoInput

Used when you need to process a video file, all the frames will be processed sequentially one by
one. Must be used with `MANUAL` player rendering. Supported video formats depend on the
specific device and installed **Android** codecs. Frames will be processed in offline mode.

```kotlin
// Variable declaration
private val videoInput by lazy(LazyThreadSafetyMode.NONE) {
    VideoInput()
}

...

// Somewhere in the initialization code
/* Asynchronous video file processing */
videoInput.processVideoFile(File("path_to/my_video.mp4"), object: VideoInput.IVideoFrameStatus {
    override fun onStart() {
        /* Start of video extraction */
        /* We switch the player to the manual mode so that we can process the video file
        frame by frame */
        player.setRenderMode(Player.RenderMode.MANUAL)
    }
    override fun onFrame() {
        /* The video frame was extracted and pushed to the player */
        /* We call synchronous rendering so that the player has time to process the frame */
        player.render()
    }
    override fun onError(throwable: Throwable) {
        /* Did an error occur? Now we just ignore it */
    }
    override fun onFinish() {
        /* Processing of the video file has completed. If there were any errors and
        nothing was read from the video file, then this function is always called if
        function onStart() was called. We also return the player to the previous
        rendering mode */
        player.setRenderMode(Player.RenderMode.LOOP)
    }
})

...

// Somewhere in the interruption code
/* If processing the current video file is no longer needed, then call this method */
videoInput.stopProcessing()
```

### FramePixelBufferFormat

Pixel buffer format can be one of:

* `BPC8_RGBA` - 4 bytes per pixel, analogue of android type [`Bitmap.Config.ARGB_8888`](https://developer.android.com/reference/android/graphics/Bitmap.Config).
* `I420_BT601_FULL` - yuv i420 image encoded by standard bt601 full range.
* `I420_BT601_VIDEO` - yuv i420 image encoded by standard bt601 video range.
* `I420_BT709_FULL` - yuv i420 image encoded by standard bt709 full range.
* `I420_BT709_VIDEO` - yuv i420 image encoded by standard bt709 video range.

### FramePixelBuffer

A wrapper for pixel images that can store images of different formats and provide convenient access to
all image parameters.

```kotlin title="example of creating RGBA FramePixelBuffer"
/* The format BPC8_RGBA has a single plane of densely packed pixels */
val myWidth = 400 /* width of the image */
val myHeight = 300 /* height of the image */
val myPixelStride = 4 /* 4 because BPC8_RGBA format and the pixels are tightly packed */
val myRowStride = myWidth * myPixelStride /* Stride is bytes per row of pixels */
val myArrayOfPixels: ByteBuffer = ... /* array of pixels with RGBA data 400x300 pixels */
val frame = FramePixelBuffer(myArrayOfPixels,
    intArrayOf(0 /* 0 because the pixels start from a zero byte in the buffer */),
    intArrayOf(myRowStride),
    intArrayOf(myPixelStride),
    myWidth,
    myHeight,
    FramePixelBufferFormat.BPC8_RGBA
)
```

```kotlin title="example of creating YUV FramePixelBuffer"
/* You can read more about YUV format here:
https://learn.microsoft.com/en-us/windows/win32/medfound/recommended-8-bit-yuv-formats-for-video-rendering
*/
/* Any format I420_*** has a single plane of densely packed pixels */
val myWidth = 400 /* width of the image */
val myHeight = 300 /* height of the image */
val myArrayOfPixels: ByteBuffer = ... /* array of pixels with i420 data 400x300 pixels */
val myYPlanePixelStride = 1 /* 1 because i420 format and the pixels are tightly packed */
val myUPlanePixelStride = 1 /* 1 because i420 format and the pixels are tightly packed */
val myVPlanePixelStride = 1 /* 1 because i420 format and the pixels are tightly packed */
val myYPlaneRowStride = myWidth /* in this case the stride is equal to the width */
val myUPlaneRowStride = myWidth /* in this case the stride is equal to the width */
val myVPlaneRowStride = myWidth /* in this case the stride is equal to the width */
val myOffsetToYPlane = 0 /* plane Y starts from the beginning of buffer myArrayOfPixels */
val myOffsetToUPlane = myOffsetToYPlane + myYPlanePixelStride * myHeight
val myOffsetToVPlane = myOffsetToUPlane + myUPlanePixelStride * myHeight / 4
val frame = FramePixelBuffer(myArrayOfPixels,
    intArrayOf(myOffsetToYPlane, myOffsetToUPlane, myOffsetToVPlane),
    intArrayOf(myYPlaneRowStride, myUPlaneRowStride, myVPlaneRowStride),
    intArrayOf(myYPlanePixelStride, myUPlanePixelStride, myVPlanePixelStride),
    myWidth,
    myHeight,
    FramePixelBufferFormat.I420_BT601_FULL
)
```

### Player

The main class with which you can manage **Banuba SDK**, **effects** and the entire rendering process.
Rendering in this class is done in a separate thread, the **render thread**.

```kotlin
// Variable declaration
private val player by lazy(LazyThreadSafetyMode.NONE) {
    Player()
}

...

// Somewhere in the initialization code
/* Initialization of the Banuba SDK must occur before the player starts working,
otherwise there will be a crash indicating an error */
BanubaSdkManager.initialize(this, <#MY BANUBA CLIENT TOKEN#>);
/* cameraDevice and textureOutput must be created and declared before use */
/* In fact, you can specify more than one output as an output. The number of outputs
is not limited. But every additional one affects performance. If this is an output to
the surface, then you won’t notice the difference. But if this is rendering into
a video file, then the performance directly depends on the capabilities of the phone.
You can use multiple outputs as follows:
player.use(CameraInput(cameraDevice), intArrayOf(myOutput1, myOutput2, ..., myOutputN)) */
player.use(CameraInput(cameraDevice), textureOutput)
/* Loading any effect */
player.loadAsync("PineappleGlasses")
/* And running the player */
player.play()

...

// Somewhere in the destruction code
/* After you are done using the player, you must free all resources by calling
method close() */
player.close()
```

### PlayerTouchListener

This class represents user clicks in **Banuba SDK**. This is required by some **effects**, and is one way
to interact with them.

```kotlin
// Somewhere in the initialization code
/* The player must be created and declared before use. The mySurfaceView is a UI element
and must also exist in the layout */
mySurfaceView.setOnTouchListener(PlayerTouchListener(this.applicationContext, player));
```

### FrameOutput

Allows you to receive the processing result frames in the form of an array of pixels in the
desired format and in the desired orientation.

```kotlin
// Variable declaration
private val frameOutput by lazy(LazyThreadSafetyMode.NONE) {
    FrameOutput(object : FrameOutput.IFramePixelBufferProvider {
        override fun onFrame(output: IOutput, framePixelBuffer: FramePixelBuffer?) {
            /* This is your code for working with the framePixelBuffer */
        }
    })
}

...

// Somewhere in the initialization code
frameOutput.setFormat(FramePixelBufferFormat.I420_BT601_FULL)
frameOutput.setOrientation(Orientation.UP, false)
player.use(..., frameOutput)

...

// Somewhere in the destruction code
/* After finishing using the frameOutput, you must free all the resources by calling the close()
method */
frameOutput.close()
```

### SurfaceOutput

Allows you to display the processing result on an [SurfaceView](https://developer.android.com/reference/android/view/SurfaceView).

```kotlin
// Variable declaration
/* The mySurfaceView is a UI element and must exist in the layout */
private val surfaceOutput by lazy(LazyThreadSafetyMode.NONE) {
    SurfaceOutput(mySurfaceView.holder)
}

...

// Somewhere in the initialization code
player.use(..., surfaceOutput)

...

// Somewhere in the destruction code
/* After finishing using the surfaceOutput, you must free all resources by calling the close()
method */
surfaceOutput.close()
```

### TextureOutput

Allows you to display the processing result on an [TextureView](https://developer.android.com/reference/android/view/TextureView).

```kotlin
// Variable declaration
/* The myTextureView is a UI element and must exist in the layout */
private val textureOutput by lazy(LazyThreadSafetyMode.NONE) {
    TextureOutput(myTextureView)
}

...

// Somewhere in the initialization code
player.use(..., textureOutput)

...

// Somewhere in the destruction code
/* After finishing using the textureOutput, you must free all resources by calling the close()
method */
textureOutput.close()
```

### VideoOutput

The class allows you to record the processing result to a video file.

```kotlin
// Variable declaration
private val videoOutput by lazy(LazyThreadSafetyMode.NONE) {
        VideoOutput()
    }

...

// Somewhere in the initialization code
player.use(..., videoOutput)
/* Before you start recording a video, you must obtain permission to record 
to the storage. */
videoOutput.startRecording(File("path_to/my_output_video.mp4"))

...

// Somewhere in the interruption code
/* It is necessary to interrupt video recording when it is no longer needed */
videoOutput.stopRecording()

...

// Somewhere in the destruction code
/* After you are done using the videoOutput, you must free all the resources by calling
the close() method */
videoOutput.close()
```
