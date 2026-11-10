# web

* Agora
* OpenTok
* WebRTC

### Agora

:::tip
Check the official **[Banuba Agora Extension](https://github.com/Banuba/agora-plugin-filters-web)** for Web [@banuba/agora-extension](https://www.npmjs.com/package/@banuba/agora-extension).
:::

Or if you need finer control, you may use the **Banuba WebAR** directly:

1. Import **AgoraRTC** and **Banuba WebAR**
```js
  <script src="https://download.agora.io/sdk/web/AgoraRTC_N-4.2.0.js"></script>
```
```js
    import { Effect, Webcam, Player, Module, Dom, MediaStreamCapture } from "https://cdn.jsdelivr.net/npm/@banuba/webar/dist/BanubaSDK.browser.esm.min.js"
```

2. Setup client tokens
```js
window.AGORA_APP_ID = "PUT YOUR APP ID HERE"
window.AGORA_TOKEN = "PUT YOUR TOKEN HERE"
window.AGORA_CHANNEL_NAME = "PUT YOUR CHANNEL NAME HERE"

```
```js
window.BANUBA_CLIENT_TOKEN = "PUT YOUR CLIENT TOKEN HERE"
```

3. Initialize `Player`
```js
      const wcam = new Webcam({ width: 640, height: 480 })
      const [player, modules] = await Promise.all([
        Player.create({
          devicePixelRatio: 1,
          clientToken: window.BANUBA_CLIENT_TOKEN,
        }),
        // Find more about available modules:
        // https://docs.banuba.com/face-ar-sdk-v1/generated/typedoc/classes/Module.html
        Module.preload(["background", "face_tracker"].map(m => `https://cdn.jsdelivr.net/npm/@banuba/webar/dist/modules/${m}.zip`)),
      ])

      await player.addModule(...modules)

      player.use(wcam)
      Dom.render(player, "#webar")
```

4. Initialize `AgoraRTC`
```js
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "h264" })

      await client.join(
        window.AGORA_APP_ID,
        window.AGORA_CHANNEL_NAME,
        window.AGORA_TOKEN,
      )
```

5. Connect `Player` to `AgoraRTC`
```js
      const stream = new MediaStreamCapture(player)
      const video = await AgoraRTC.createCustomVideoTrack({ mediaStreamTrack: stream.getVideoTrack() })
      const audio = await AgoraRTC.createMicrophoneAudioTrack()

      await client.publish([ video, audio ])
```

6. Run the application! 🎉 🚀 💅

:::tip
See [AgoraWebSDK NG API docs](https://agoraio-community.github.io/AgoraWebSDK-NG/api/en/interfaces/iagorartc.html#createcustomvideotrack) for details.
:::

:::tip
See [Banuba Video call demo app](https://github.com/Banuba/videocall-web) for more code examples.
:::

  </TabItem>
  <TabItem value="opentok" label="OpenTok">

### OpenTok (TokBox)

```ts
import "https://cdn.jsdelivr.net/npm/@opentok/client"
import { MediaStream, Player, Module Effect, MediaStreamCapture } from "https://cdn.jsdelivr.net/npm/@banuba/webar/dist/BanubaSDK.browser.esm.js"

// ...

const camera = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
const player = await Player.create({ clientToken: "xxx-xxx-xxx" })
await player.addModule(new Module("https://cdn.jsdelivr.net/npm/@banuba/webar/dist/modules/background.zip"))

const webar = new MediaStreamCapture(player)

await player.use(new MediaStream(camera))
player.applyEffect(new Effect("BackgroundBlur.zip"))
player.play()

// original audio
const audio = camera.getAudioTracks()[0]
// webar processed video
const video = webar.getVideoTracks()[0]

const session = OT.initSession("OT API KEY", "OT SESSION ID")
session.connect("OT SESSION TOKEN", async () => {
  const publisher = await OT.initPublisher(
    "publisher",
    {
      insertMode: "append",
      audioSource: audio,
      videoSource: video,
      width: "100%",
      height: "100%",
    },
    () => {},
  )

  session.publish(publisher, () => {})
})

// ...
```
:::tip
See [TokBox Video API docs](https://tokbox.com/developer/sdks/js/reference/OT.html#initPublisher) for details.
:::

:::tip
See [Banuba Video call (TokBox) demo app](https://github.com/Banuba/videocall-tokbox-web) for more code examples.
:::

  </TabItem>
  <TabItem value="webrtc" label="WebRTC">

### WebRTC

Considering the [Fireship WebRTC demo](https://github.com/fireship-io/webrtc-firebase-demo/blob/main/main.js)

```ts
import {
  MediaStream as BanubaMediaStream,
  Player,
  Module,
  Effect,
  MediaStreamCapture,
} from "https://cdn.jsdelivr.net/npm/@banuba/webar/dist/BanubaSDK.browser.esm.js"

// ...

webcamButton.onclick = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  remoteStream = new MediaStream()

  const player = await Player.create({ clientToken: "xxx-xxx-xxx" })
  await player.addModule(new Module("https://cdn.jsdelivr.net/npm/@banuba/webar/dist/modules/background.zip"))

  const webar = new MediaStreamCapture(player)

  await player.use(new BanubaMediaStream(localStream))
  player.applyEffect(new Effect("BackgroundBlur.zip"))
  player.play()

  // original audio
  const audio = localStream.getAudioTracks()[0]
  // webar processed video
  const video = webar.getVideoTracks()[0]

  localStream = new MediaStream([audio, video])

  // Push tracks from local stream to peer connection
  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream)
  })

  // ...
}
```
  </TabItem>
</Tabs>
