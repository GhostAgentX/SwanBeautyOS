# Known Issues

* Web

## MediaStreamCapture stream freezes when a browser tab becomes inactive in Safari[​](#mediastreamcapture-stream-freezes-when-a-browser-tab-becomes-inactive-in-safari "Direct link to MediaStreamCapture stream freezes when a browser tab becomes inactive in Safari")

Starting from the 15.3 release Safari began to pause [MediaStream](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream)s obtained from [canvas.captureStream()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream), which used internally by WebAR's [MediaStreamCapture](/generated/typedoc/classes/MediaStreamCapture.html), when the browser's tab [is not visible](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API#properties_added_to_the_document_interface). This leads to the video freeze of the WebRTC call app participant using WebAR SDK when the participant minimizes or hides the browser or the browser's tab running the app. Unfortunately, currently there is no known workaround for this issue.

## Page running WebAR SDK consumes too much memory[​](#page-running-webar-sdk-consumes-too-much-memory "Direct link to Page running WebAR SDK consumes too much memory")

The most likely reason is a memory leak caused by a dangling [Player](/generated/typedoc/classes/Player.html#constructor) instance which can not be automatically collected by the browser's GC. Consider the code:

```
let webcam

document.querySelector("#start").onclick = async () => {
  const player = await Player.create({ clientToken: "xxx-xxx-xxx" })

  await player.use((webcam = new Webcam()))
  player.play()

  Dom.render(player, "#webar")
}

document.querySelector("#stop").onclick = () => {
  webcam.stop()

  Dom.unmount("#webar")
}
```

Sequence of clicks on the `#start` followed by a click on the `#stop` leads to a memory leak, since the `player` object is still held in the browser memory. To fix it, you should call [Player.destroy()](/generated/typedoc/classes/Player.html#destroy) once the `player` object is not needed anymore. The following fixed code will not cause a memory leak:

```
let webcam, player

document.querySelector("#start").onclick = async () => {
  player = await Player.create({ clientToken: "xxx-xxx-xxx" })

  await player.use((webcam = new Webcam()))
  player.play()

  Dom.render(player, "#webar")
}

document.querySelector("#stop").onclick = () => {
  webcam.stop()

  Dom.unmount("#webar")

  // destroy the player object to prevent accidental memory leaks
  player.destroy()
}
```

note

If the app has such a "start - stop - repeat" logic, you may also consider to cache the `player` object instead of constantly re-creating it:

```
let player, webcam 

document.querySelector("#start").onclick = async () => {
  // reuse the player instance instead of re-creation
  if (!player) player = await Player.create({ clientToken: "xxx-xxx-xxx" })

  await player.use((webcam = new Webcam()))
  player.play()

  Dom.render(player, "#webar")
}

document.querySelector("#stop").onclick = () => {
  webcam.stop()

  Dom.unmount("#webar")

  // no need to destroy the player since it will be reused on the next "#start" click
}
```

## Page running WebAR SDK crashes[​](#page-running-webar-sdk-crashes "Direct link to Page running WebAR SDK crashes")

One of the most widespread reasons is a memory leak which drains all the device's RAM. Please check out the [Page running WebAR SDK consumes too much memory](#page-running-webar-sdk-consumes-too-much-memory) section.

If that's not your case, please [contact support](/support/.md) and submit the issue.

## Effect animations are delayed in Safari[​](#effect-animations-are-delayed-in-safari "Direct link to Effect animations are delayed in Safari")

This is [a known Safari bug](https://bugs.webkit.org/show_bug.cgi?id=232076), and for your convenience we provide you with [the ready-to-go fix](/js/range-requests.sw.js).

Assume you have an html page from the [Basic Integration](/tutorials/development/basic_integration.md) section. Download the [range-requests.sw.js](/js/range-requests.sw.js) file and put it next to the WebAR running page. To fix the Safari playback issue prepend the `navigator.serviceWorker.register("./range-requests.sw.js")` to the page's script and point Player to proxy video requests to the service worker:

```
<!DOCTYPE html>
<html>
  <head>
    <title>Banuba SDK Web AR</title>
  </head>
  <body>
    <div id="webar"></div>
    <script type="module">
      import {
        Webcam,
        Effect,
        Module,
        Player,
        Dom,
      } from "https://cdn.jsdelivr.net/npm/@banuba/webar/dist/BanubaSDK.browser.esm.js"

      // Fixes video range requests in Safari that cause AR effects animation delay
      navigator.serviceWorker.register("./range-requests.sw.js")

      const run = async () => {
        const player = await Player.create({
          clientToken: "PUT YOUR CLIENT TOKEN HERE",
          // point the player to proxy video requests to the service worker
          proxyVideoRequestsTo: "___range-requests___/",
        })
        await player.addModule(new Module("https://cdn.jsdelivr.net/npm/@banuba/webar/dist/modules/face_tracker.zip"))

        await player.use(new Webcam())
        player.applyEffect(new Effect("Rorschach.zip"))
        Dom.render(player, "#webar")
      }

      run()
    </script>
  </body>
</html>
```

You can verify the fix with help of the [Rorschach](/generated/effects/Rorschach.zip) animated effect.

note

You may want to conditionally include the fix for Safari but not for the other browsers. Check the [quickstart-web](https://github.com/Banuba/quickstart-web) demo app for a possible implementation.

note

If your app already has a ServiceWorker in your app, simply import the [range-requests.sw.js](/js/range-requests.sw.js) into it:

```
importScripts("range-requests.sw.js")
```

Still have questions about FaceAR SDK?

Visit our [FAQ](https://www.banuba.com/faq/) or [contact our support](/support/.md).
