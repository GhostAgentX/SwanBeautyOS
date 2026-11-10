# Examples of using Banuba SDK

To start working with **Banuba SDK** examples, you need to have a client token. To receive it, please fill in our [form on banuba.com](https://www.banuba.com/face-filters-sdk), or contact us via <info@banuba.com>.

## Our GitHub[​](#our-github "Direct link to Our GitHub")

Visit our [GitHub page](https://github.com/Banuba) to see all available examples.

* iOS
* Android
* Web
* Flutter
* ReactNative
* macOS
* Desktop

## iOS samples (Swift)[​](#ios-samples-swift "Direct link to iOS samples (Swift)")

This repository contains basic samples how to use [Player API](/tutorials/development/api_overview.md).

<https://github.com/Banuba/banuba-sdk-ios-samples>

## Agora plugin example (Swift)[​](#agora-plugin-example-swift "Direct link to Agora plugin example (Swift)")

This example shows how to use **Banuba SDK** as an **Agora** plugin for a video call between two devices.

<https://github.com/Banuba/agora-plugin-filters-ios>

## Opentok example (Swift)[​](#opentok-example-swift "Direct link to Opentok example (Swift)")

This example demonstrates the use of **Banuba SDK** in conjunction with **Opentok SDK**.

<https://github.com/Banuba/opentok-ios-swift>

## WebRTC example (Objective-C)[​](#webrtc-example-objective-c "Direct link to WebRTC example (Objective-C)")

This example demonstrates how to use **Banuba SDK** in conjunction with **WebRTC**.

<https://github.com/Banuba/quickstart_webrtc_ios>

## Beauty example (Swift)[​](#beauty-example-swift "Direct link to Beauty example (Swift)")

This example demonstrates how to correctly use the **Makeup** effect.

info

This example uses **SPM**

<https://github.com/Banuba/beauty-ios>

## [ZEGOCLOUD](https://www.zegocloud.com) example (Swift)[​](#zegocloud-example-swift "Direct link to zegocloud-example-swift")

This example demonstrates integration with ZEGOCLOUD videocalling platform.

<https://github.com/Banuba/banuba_sdk_zegocloud_sdk_ios>

## ARCloud example (Swift)[​](#arcloud-example-swift "Direct link to ARCloud example (Swift)")

This example shows how to dynamically load effects from the network.

<https://github.com/Banuba/quickstart-ios-cpp>

## Quickstart example (Objective-C)[​](#quickstart-example-objective-c "Direct link to Quickstart example (Objective-C)")

This example shows how to use **Banuba SDK** in **Objective-C** application.

<https://github.com/Banuba/quickstart-ios-objc>

## Requirements[​](#requirements "Direct link to Requirements")

* Latest stable Android Studio
* Latest Gradle plugin
* Latest NDK

## Banuba SDK examples (Kotlin)[​](#banuba-sdk-examples-kotlin "Direct link to Banuba SDK examples (Kotlin)")

This example shows how to use **PlayerAPI** for various tasks. It uses the `Player`, `CameraInput`, `SurfaceOutput`, and `VideoOutput` classes.

<https://github.com/Banuba/banuba-sdk-android-samples>

## Agora plugin example (Kotlin)[​](#agora-plugin-example-kotlin "Direct link to Agora plugin example (Kotlin)")

An example of using **Banuba SDK** as an **Agora** plugin for a video call between two devices.

<https://github.com/Banuba/agora-plugin-filters-android>

## Opentok example (Java)[​](#opentok-example-java "Direct link to Opentok example (Java)")

This example demonstrates the use of **Banuba SDK** in conjunction with **Opentok SDK**.

<https://github.com/Banuba/opentok-android-java>

## WebRTC example (Kotlin)[​](#webrtc-example-kotlin "Direct link to WebRTC example (Kotlin)")

This example demonstrates how to use **Banuba SDK** in conjunction with **WebRTC**. In it, a **WebRTC** camera is used, and after processing, the frame is drawn onto the surface using **WebRTC**. This example based on **PlayerAPI**.

<https://github.com/Banuba/quickstart_webrtc_android>

## [ZEGOCLOUD](https://www.zegocloud.com) example (Java)[​](#zegocloud-example-java "Direct link to zegocloud-example-java")

This example demonstrates integration with ZEGOCLOUD videocalling platform.

<https://github.com/Banuba/banuba_sdk_zegocloud_sdk_android>

## Beauty example (Java)[​](#beauty-example-java "Direct link to Beauty example (Java)")

This example demonstrates how to correctly use the **Makeup** effect and how to call **MakeupAPI** scripts. This example is based on **PlayerAPI**.

<https://github.com/Banuba/beauty-android-java>

## Beauty example (Kotlin)[​](#beauty-example-kotlin "Direct link to Beauty example (Kotlin)")

This example demonstrates how to correctly use the **Makeup** effect and how to call **MakeupAPI** scripts.

<https://github.com/Banuba/beauty-android-kotlin>

## ARCloud example (Kotlin)[​](#arcloud-example-kotlin "Direct link to ARCloud example (Kotlin)")

This example shows how to dynamically load effects from the network. This example is based on **PlayerAPI**.

<https://github.com/Banuba/arcloud-android-kotlin>

## Quickstart[​](#quickstart "Direct link to Quickstart")

**[Quickstart Web](https://github.com/Banuba/quickstart-web)**

## Beauty[​](#beauty "Direct link to Beauty")

**[Beauty demo app](https://github.com/Banuba/beauty-web)**

## Vue[​](#vue "Direct link to Vue")

**[Vue demo app](https://github.com/Banuba/quickstart-web-vue)**

## Angular[​](#angular "Direct link to Angular")

**[Angular demo app](https://github.com/Banuba/quickstart-web-angular)**

## React[​](#react "Direct link to React")

**[React demo app](https://github.com/Banuba/quickstart-web-react)**

```
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

tip

See [Bundlers](/tutorials/development/installation.md#bundlers) for notes about specific bundlers and `locateFile` usage.

## Agora[​](#agora "Direct link to Agora")

**[Banuba Agora Extension](https://github.com/Banuba/agora-plugin-filters-web)**

**[Video call demo app](https://github.com/Banuba/videocall-web)**

## ZEGOCLOUD[​](#zegocloud "Direct link to ZEGOCLOUD")

**[ZEGOCLOUD sample](https://github.com/Banuba/banuba_sdk_zegocloud_sdk_web)**

## OpenTok (TokBox)[​](#opentok-tokbox "Direct link to OpenTok (TokBox)")

**[TokBox demo app](https://github.com/Banuba/videocall-tokbox-web)**

## Customizing video source[​](#customizing-video-source "Direct link to Customizing video source")

You can easily modify the built-in [Webcam](/generated/typedoc/classes/Webcam.html#constructor) module video by passing [parameters](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#properties_of_video_tracks) to it.

### Switching from front to back camera[​](#switching-from-front-to-back-camera "Direct link to Switching from front to back camera")

For example, you can use back camera of the device by passing [facingMode](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/facingMode) parameter to it:

```
// ...

// The default facingMode value is "user" which means front camera
// The "environment" value here means back camera
await player.use(new Webcam({ facingMode: "environment" }))

// ...
```

### Rendering WebAR video in full screen on mobile[​](#rendering-webar-video-in-full-screen-on-mobile "Direct link to Rendering WebAR video in full screen on mobile")

Simply add the following CSS to force WebAR AR video to fill viewport:

```
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

If you decide to specify the exact `width` and `height` for the [Webcam](/generated/typedoc/classes/Webcam.html#constructor), pay attention that on several mobile devices/operating systems webcam video width and height may be flipped. It's a known platform-specific [webcam bug](https://stackoverflow.com/questions/62538271/getusermedia-selfie-full-screen-on-mobile/62598616#62598616).

To work around it, swap the `width` and `height` values:

```
const desiredWidth = 360
const desiredHeight = 540

await player.use(new Webcam({
  width: desiredHeight,
  height: desiredWidth,
}))
```

Also, you may want to check out the [Video cropping](#video-cropping) section for more advanced scenarios.

### External MediaStream[​](#external-mediastream "Direct link to External MediaStream")

If the built-in [Webcam](/generated/typedoc/classes/Webcam.html#constructor) can not fit your needs you can use a custom [MediaStream](/generated/typedoc/classes/MediaStream.html) with [Player](/generated/typedoc/classes/Player.html#constructor):

```
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

See [MediaStream](/generated/typedoc/classes/MediaStream.html) docs for more details.

## Capturing processed video[​](#capturing-processed-video "Direct link to Capturing processed video")

You can easily capture the processed video, take screenshots, video recordings or pass the captured video to a WebRTC connection.

### Screenshot[​](#screenshot "Direct link to Screenshot")

```
import { ImageCapture /* ... */ } from "@banuba/webar"

// ...

const capture = new ImageCapture(player)
const photo = await capture.takePhoto()

// ...
```

See [ImageCapture.takePhoto()](/generated/typedoc/classes/ImageCapture.html#takePhoto) docs for more details.

### Video[​](#video "Direct link to Video")

```
import { VideoRecorder /* ... */ } from "@banuba/webar"

// ...

const recorder = new VideoRecorder(player)
recorder.start()
await new Promise((r) => setTimeout(r, 5000)) // wait for 5 sec
const video = await recorder.stop()

// ...
```

See [VideoRecorder](/generated/typedoc/classes/VideoRecorder.html) docs for more details.

### MediaStream[​](#mediastream "Direct link to MediaStream")

```
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

See [MediaStreamCapture](/generated/typedoc/classes/MediaStreamCapture.html) docs for more details.

## Video cropping[​](#video-cropping "Direct link to Video cropping")

You can adjust video frame dimensions via [Webcam](/generated/typedoc/classes/Webcam.html#constructor) constructor parameters:

```
const wcam = new Webcam({ width: 320, height: 240 })
```

But this approach is platform-dependent and varies between browsers, e.g. some browsers may be unable to produces frames of the requested dimensions and can yield frames of close but different dimensions instead (e.g. 352x288 instead of requested 320x240).

To work around this platform-specific limitations, you can leverage the built-in SDK crop modificator:

```
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

See [Player.use()](/generated/typedoc/classes/Player.html#use) and [InputOptions](//generated/typedoc/types/InputOptions.html) docs for more datails.

## Postprocessing[​](#postprocessing "Direct link to Postprocessing")

It's possible to post-process the video processed by WebAR SDK.

You can grab the idea from the code-snippet:

```
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

## Minimal sample[​](#minimal-sample "Direct link to Minimal sample")

A one-file example, a good starting point.

<https://github.com/Banuba/banuba-sdk-flutter/tree/master/example>

## Quickstart Flutter sample[​](#quickstart-flutter-sample "Direct link to Quickstart Flutter sample")

This project demonstrates how to apply effects, makeup; process photos.

<https://github.com/Banuba/quickstart-flutter-plugin/tree/master>

## Video call sample[​](#video-call-sample "Direct link to Video call sample")

This example demonstrates the use of **Banuba SDK** in conjunction with **AgoraRTC SDK** for a video call on Flutter. This example is forked from the [Flutter plugin of Agora](https://github.com/AgoraIO-Extensions/Agora-Flutter-SDK).

Banuba SDK is integrated in `JoinChannelVideo` subsample. See [videocall](/tutorials/development/videocall.md).

<https://github.com/Banuba/banuba-agora-flutter-sdk>

## ARCloud sample[​](#arcloud-sample "Direct link to ARCloud sample")

Read more about [ARCloud](/tutorials/development/guides/ar_cloud.md).

<https://github.com/Banuba/arcloud-flutter/tree/master/example>

## Minimal sample[​](#minimal-sample "Direct link to Minimal sample")

One-file example, good starting point. This a part of React Native over Banuba module.

<https://github.com/Banuba/banuba-sdk-react-native/tree/master/example>

## Videocall example[​](#videocall-example "Direct link to Videocall example")

This example demonstrates the use of **Banuba SDK** in conjunction with **AgoraRTC SDK** for a video call on React Native. This example is forked from [Agora module for React Native](https://github.com/AgoraIO-Extensions/react-native-agora).

Banuba SDK integrated in `JoinChannelVideo` subsample. See [videocall](/tutorials/development/videocall.md).

<https://github.com/Banuba/banuba-react-native-agora>

## macOS sample (Swift)[​](#macos-sample-swift "Direct link to macOS sample (Swift)")

This repository contains basic samples how to use Banuba SDK on macOS.

<https://github.com/Banuba/quickstart-macos-swift>

Examples bellow are written in C++ and will run both on Windows and macOS.

## Quickstart Desktop (C++)[​](#quickstart-desktop-c "Direct link to Quickstart Desktop (C++)")

The starting point for desktop integration in C++.

<https://github.com/Banuba/quickstart-desktop-cpp/tree/master>

Demonstrates:

1. [on-screen rendering with realtime camera](https://github.com/Banuba/quickstart-desktop-cpp/blob/master/realtime-camera-preview/main.cpp)
2. [photo processing](https://github.com/Banuba/quickstart-desktop-cpp/blob/master/single-image-processing/main.cpp)
3. [video stream processing](https://github.com/Banuba/quickstart-desktop-cpp/blob/master/videostream-processing/main.cpp)
