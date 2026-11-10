# web

## Quickstart

**[Quickstart Web](https://github.com/Banuba/quickstart-web)**

## Beauty

**[Beauty demo app](https://github.com/Banuba/beauty-web)**

## Vue

**[Vue demo app](https://github.com/Banuba/quickstart-web-vue)**

## Angular

**[Angular demo app](https://github.com/Banuba/quickstart-web-angular)**

## React

**[React demo app](https://github.com/Banuba/quickstart-web-react)**

```ts
import React, { useEffect } from "react"
import data from "@banuba/webar/BanubaSDK.data"
import wasm from "@banuba/webar/BanubaSDK.wasm"
import simd from "@banuba/webar/BanubaSDK.simd.wasm"
import FaceTracker from "@banuba/webar/face_tracker.zip"
import Glasses from "/path/to/Glasses.zip"
import { Webcam, Player, Module, Effect, Dom } from "@banuba/webar"

export default function WebARComponent() {
  // componentDidMount
  useEffect(() => {
    let webcam

    Player.create({
      clientToken: "xxx-xxx-xxx",
      locateFile: {
        "BanubaSDK.data": data,
        "BanubaSDK.wasm": wasm,
        "BanubaSDK.simd.wasm": simd,
      },
    }).then(async (player) => {
      await player.addModule(new Module(FaceTracker))
      await player.use(webcam = new Webcam())
      player.applyEffect(new Effect(Glasses))
      Dom.render(player, "#webar")
    })

    // componentWillUnmount
    return () => {
      webcam?.stop()
      Dom.unmount("#webar")
    }
  })

  return <div id="webar"></div>
}
```

:::tip
See [Bundlers](../installation.md#bundlers) for notes about specific bundlers and `locateFile` usage.
:::

## Agora

**[Banuba Agora Extension](https://github.com/Banuba/agora-plugin-filters-web)**

**[Video call demo app](https://github.com/Banuba/videocall-web)**

## ZEGOCLOUD

**[ZEGOCLOUD sample](https://github.com/Banuba/banuba_sdk_zegocloud_sdk_web)**

## OpenTok (TokBox)

**[TokBox demo app](https://github.com/Banuba/videocall-tokbox-web)**

## Customizing video source

You can easily modify the built-in 
[Webcam](pathname:///generated/typedoc/classes/Webcam.html#constructor) module 
video by passing 
[parameters](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#properties_of_video_tracks) 
to it.

### Switching from front to back camera

For example, you can use back camera of the device by passing [facingMode](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/facingMode) parameter to it:

```ts
// ...

// The default facingMode value is "user" which means front camera
// The "environment" value here means back camera
await player.use(new Webcam({ facingMode: "environment" }))

// ...
```

### Rendering WebAR video in full screen on mobile

Simply add the following CSS to force WebAR AR video to fill viewport:

```html
<style>
  /* The simplest way to force Banuba WebAR canvas to fill viewport */
  #webar > canvas {
    width: 100vw;
    height: 100vh;
    object-fit: cover;
  }
</style>

<script type="module">
  import { Webcam, Player, Dom } from "https://cdn.jsdelivr.net/npm/@banuba/webar/dist/BanubaSDK.browser.esm.js"

  Player.create({ clientToken: "xxx-xxx-xxx" })
    .then(async (player) => {
      await player.use(new Webcam())
      Dom.render(player, "#webar")
    })
</script>
```

If you decide to specify the exact `width` and `height` for the 
[Webcam](pathname:///generated/typedoc/classes/Webcam.html#constructor), pay 
attention that on several mobile devices/operating systems webcam video width 
and height may be flipped. It's a known platform-specific 
[webcam bug](https://stackoverflow.com/questions/62538271/getusermedia-selfie-full-screen-on-mobile/62598616#62598616).

To work around it, swap the `width` and `height` values:

```js
const desiredWidth = 360
const desiredHeight = 540

await player.use(new Webcam({
  width: desiredHeight,
  height: desiredWidth,
}))
```

Also, you may want to check out the [Video cropping](#video-cropping) section for more advanced scenarios.

### External MediaStream

If the built-in 
[Webcam](pathname:///generated/typedoc/classes/Webcam.html#constructor) can not 
fit your needs you can use a custom 
[MediaStream](pathname:///generated/typedoc/classes/MediaStream.html) with 
[Player](pathname:///generated/typedoc/classes/Player.html#constructor):

```ts
import { MediaStream /* ... */ } from "@banuba/webar"

// ...

/* process video from the camera */
const camera = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
await player.use(new MediaStream(camera))

/* or even from another canvas */
const canvas = $("canvas").captureStream()
await player.use(new MediaStream(canvas))

// ...
```

See [MediaStream](pathname:///generated/typedoc/classes/MediaStream.html) docs 
for more details.

## Capturing processed video

You can easily capture the processed video, take screenshots, video recordings or pass the captured video to a WebRTC connection.

### Screenshot

```ts
import { ImageCapture /* ... */ } from "@banuba/webar"

// ...

const capture = new ImageCapture(player)
const photo = await capture.takePhoto()

// ...
```

See 
[ImageCapture.takePhoto()](pathname:///generated/typedoc/classes/ImageCapture.html#takePhoto) 
docs for more details.

### Video

```ts
import { VideoRecorder /* ... */ } from "@banuba/webar"

// ...

const recorder = new VideoRecorder(player)
recorder.start()
await new Promise((r) => setTimeout(r, 5000)) // wait for 5 sec
const video = await recorder.stop()

// ...
```

See [VideoRecorder](pathname:///generated/typedoc/classes/VideoRecorder.html) docs for more details.

### MediaStream

```ts
import { MediaStreamCapture /* ... */ } from "@banuba/webar"

// ...

// the capture is an instance of window.MediaStream
const capture = new MediaStreamCapture(player)

// so it can be used as a video source
$("video").srcObject = capture

// or can be added to a WebRTC peer connection
const connection = new RTCPeerConnection()
connection.addTrack(capture.getVideoTrack())

// ...
```

See 
[MediaStreamCapture](pathname:///generated/typedoc/classes/MediaStreamCapture.html) 
docs for more details.

## Video cropping

You can adjust video frame dimensions via 
[Webcam](pathname:///generated/typedoc/classes/Webcam.html#constructor) 
constructor parameters:

```ts
const wcam = new Webcam({ width: 320, height: 240 })
```

But this approach is platform-dependent and varies between browsers, e.g. some browsers may be unable to produces frames of the requested dimensions and can yield frames of close but different dimensions instead (e.g. 352x288 instead of requested 320x240).

To work around this platform-specific limitations, you can leverage the built-in SDK crop modificator:

```ts
const desiredWidth = 320
const desiredHeight = 240

function crop(renderWidth, renderHeight) {
  const dx = (renderWidth - desiredWidth) / 2
  const dy = (renderHeight - desiredHeight) / 2

  return [dx, dy, desiredWidth, desiredHeight]
}

await player.use(webcam, { crop })
```

This way you can get the desired frame size regardless of the platform used.

See [Player.use()](pathname:///generated/typedoc/classes/Player.html#use) and 
[InputOptions](pathname:////generated/typedoc/types/InputOptions.html) docs 
for more datails.

## Postprocessing

It's possible to post-process the video processed by WebAR SDK.

You can grab the idea from the code-snippet:

```ts
import { MediaStreamCapture /* ... */ } from "@banuba/webar"

// ...

const capture = document.createElement("video")
capture.autoplay = true
capture.srcObject = new MediaStreamCapture(player)

const canvas = document.getElementById("postprocessed")
const ctx = canvas.getContext("2d")
const fontSize = 48 * window.devicePixelRatio

function postprocess() {
  canvas.width = capture.videoWidth
  canvas.height = capture.videoHeight

  ctx.drawImage(capture, 0, 0)

  ctx.font = `${fontSize}px serif`
  ctx.fillStyle = "red"
  ctx.fillText("A Watermark", 0.5 * fontSize, 1.25 * fontSize)
}

;(function loop() {
  postprocess()
  requestAnimationFrame(loop)
})()
```

See [Capturing processed video](#capturing-processed-video) > [MediaStream](#mediastream) for details.
