# Using video calls with the Banuba SDK

In our example, **AgoraRTC SDK** is used for video streaming. But the integration can be done based on any video streaming library.

important

You should have client tokens for both **AgoraRTC SDK** and **Banuba SDK**.<br /><!-- -->To receive **Banuba SDK** token, fill in the [form on banuba.com](https://www.banuba.com/facear-sdk/face-filters#form), or contact us via <info@banuba.com>.<br /><!-- -->To generate an **AgoraRTC SDK** tokens, visit [Agora website](https://www.agora.io/).

* iOS
* Android
* Web
* Flutter
* ReactNative

[Example of using video calls with the Banuba SDK](https://github.com/Banuba/banuba-sdk-ios-samples/tree/master/videocall)

<br />

<br />

## Installation[​](#installation "Direct link to Installation")

1. Add `banuba-sdk-podspecs` repo along with `AgoraRtcEngine_iOS` and `BanubaSdk` packages into the your `Podfile`. Alternatively you may use our [SPM modules](/tutorials/development/installation.md#spm-packages)

info

See the details about the **Banuba SDK** packages in [Installation](/tutorials/development/installation.md).

## Integration[​](#integration "Direct link to Integration")

1. Setup client tokens

videocall/videocall/ViewModel.swift

```swift
internal let agoraAppID =  <#Agora app id#>
internal let agoraClientToken = <# agora client token #>
internal let agoraChannelId = <# agora channel id #>
```

2. Initialize `BanubaSdkManager`

common/common/AppDelegate.swift

```swift
BanubaSdkManager.initialize(
    // This is array of paths where to search for resources. E.g. for effects
    resourcePath: [
        Bundle.main.bundlePath + "/effects",
        Bundle.main.bundlePath // also search directly in app bundle
    ],
    clientTokenString: banubaClientToken
)
```

3. Initialize `AgoraRtcEngineKit`, setup video/audio encoders and join the channel

videocall/videocall/ViewModel.swift

```swift
func rtcEngine(_ engine: AgoraRtcEngineKit, didJoinedOfUid uid: UInt, elapsed: Int) {
    let videoCanvas = AgoraRtcVideoCanvas()
    videoCanvas.uid = uid
    videoCanvas.view = view.remoteVideoView
    videoCanvas.renderMode = .hidden
    agoraKit.setupRemoteVideo(videoCanvas)
}

func rtcEngine(_ engine: AgoraRtcEngineKit, didOccurError errorCode: AgoraErrorCode) {
    print("❌ AgoraRtcEngineKit Error: \(errorCode)")
}

private func pushPixelBufferIntoAgoraKit(pixelBuffer: CVPixelBuffer) {
    let videoFrame = AgoraVideoFrame()
    videoFrame.format = 12
    videoFrame.time = CMTimeMakeWithSeconds(NSDate().timeIntervalSince1970, preferredTimescale: 1000)
    videoFrame.textureBuf = pixelBuffer
    agoraKit.pushExternalVideoFrame(videoFrame)
}

private func setupVideo() {
    agoraKit.enableVideo()
    agoraKit.enableAudio()
    agoraKit.setExternalVideoSource(true, useTexture: true, sourceType: .videoFrame)
    agoraKit.setChannelProfile(.liveBroadcasting)
    agoraKit.setClientRole(.broadcaster)
    agoraKit.setVideoEncoderConfiguration(
        AgoraVideoEncoderConfiguration(
            size: AgoraVideoDimension1280x720,
            frameRate: .fps30,
            bitrate: AgoraVideoBitrateStandard,
            orientationMode: .adaptative,
            mirrorMode: .enabled
        )
    )
}

private func joinChannel() {
    let option = AgoraRtcChannelMediaOptions()
    option.publishCustomAudioTrack = false
    option.publishCustomVideoTrack = true
    agoraKit.setDefaultAudioRouteToSpeakerphone(true)
    agoraKit.joinChannel(
        byToken: agoraClientToken,
        channelId: agoraChannelId,
        uid: 0,
        mediaOptions: option,
        joinSuccess: { _, _, _ in
            print("✅ Successfuly connected to channel")
        }
    )
    UIApplication.shared.isIdleTimerDisabled = true
}
```

4. Setup `Player`, load the effect and start `Camera` frames forwarding

videocall/videocall/ViewModel.swift

```swift
init(view: MainScreenProtocol) {
    self.view = view
    selectedEffect = EffectsFactory.arVideoCallEffects.first!
    player = Player()

    cameraDevice = CameraDevice(
        cameraMode: .FrontCameraSession,
        captureSessionPreset: .hd1280x720
    )

    agoraKit = AgoraRtcEngineKit.sharedEngine(withAppId: agoraAppID, delegate: nil)
    super.init()
    agoraKit.delegate = self

    let outputPixelBuffer = PixelBuffer(onPresent: { [weak self] (pixelBuffer) -> Void in
        self?.pushPixelBufferIntoAgoraKit(pixelBuffer: pixelBuffer!)
    })

    player.use(input: Camera(cameraDevice: cameraDevice))
    player.use(outputs: [view.localVideoView, outputPixelBuffer])
    player.play()
}
```

5. Run the application! 🎉 🚀 💅

[Example of using video calls with the Banuba SDK](https://github.com/Banuba/banuba-sdk-android-samples/tree/master/videocall)

<br />

<br />

For a video call, you need to receive frames as an array of pixels frame by frame in RGBA format. This can be done using `FrameOutput`. Just create a variable called `frameOutput` and add a callback that will receive an array of pixels `framePixelBuffer`:

videocall/src/main/java/com/banuba/sdk/example/videocall/MainActivity.kt

```kotlin
frameOutput = FrameOutput { _, pb ->
    pb?.let { processFrame(it) }
}
```

Now, when initializing the player, the created variable is set to `player.use(myInput, frameOutput)`.

## Follow these steps to configure Videocall[​](#follow-these-steps-to-configure-videocall "Direct link to Follow these steps to configure Videocall")

important

To get started, add the **Banuba SDK** [integration code](/tutorials/development/basic_integration.md#integration) to your project.

Add the **AgoraRTC SDK** dependency to your `build.gradle.kts`:

videocall/build.gradle.kts

```kotlin
viewBinding = true
```

This example is based on the [**Player API**](/tutorials/development/basic_integration.md#integration). First, create the **Banuba SDK** core - `player`. Create a `surfaceOutput` that will draw the processed image from the **Banuba SDK**. Create a `frameOutput` that will produce the processed image and transfer it to **Agora** as an array of pixels. And create a camera `cameraDevice` and manage it yourself. **Agora** also has its own camera module, but in this example the **Agora** camera is not used, so `setExternalVideoSource(...)` is called to disable the **Agora** camera:

videocall/src/main/java/com/banuba/sdk/example/videocall/MainActivity.kt

```kotlin
private fun initBanuba() {
    banubaPlayer = Player()
    surfaceOutput = SurfaceOutput(binding.localSurfaceView.holder)
    frameOutput = FrameOutput { _, pb ->
        pb?.let { processFrame(it) }
    }
}

@SuppressLint("ClickableViewAccessibility")
private fun prepareBanuba() {
    cameraDevice = CameraDevice(applicationContext, this)

    if (banubaPlayer == null) {
        Log.w(TAG, "Cannot prepare Banuba SDK: Banuba SDK is not initialized!")
        return
    }

    banubaPlayer?.use(
        CameraInput(requireNotNull(cameraDevice)),
        arrayOf(surfaceOutput, frameOutput)
    )

    binding.localSurfaceView.setOnTouchListener(
        PlayerTouchListener(this, requireNotNull(banubaPlayer))
    )
    binding.localSurfaceView.setZOrderOnTop(true)

    val effects = BanubaSdkManager.loadEffects()
    effectsAdapter?.submitList(effects)
    applyEffect(effects[0].path)
}
```

Create the **Agora** core with which the videocall will be made - `agoraRtc`, inside we indicate where the **Agora** will draw the received frames:

videocall/src/main/java/com/banuba/sdk/example/videocall/MainActivity.kt

```kotlin
private fun initAgora() {
    agoraRtc = RtcEngine.create(this, AGORA_APP_ID, object : IRtcEngineEventHandler() {
        @Deprecated("Deprecated in Java")
        override fun onFirstRemoteVideoDecoded(uid: Int, width: Int, height: Int, elapsed: Int) {
            runOnUiThread {
                val surfaceView = setupRemoteVideo(uid)
                binding.remoteVideoContainer.removeAllViews()
                binding.remoteVideoContainer.addView(surfaceView)
            }
        }
    })
}

private fun prepareAgora() {
    val rtc = agoraRtc ?: return
    rtc.setExternalVideoSource(true, false, Constants.ExternalVideoSourceType.VIDEO_FRAME)
    rtc.setChannelProfile(Constants.CHANNEL_PROFILE_LIVE_BROADCASTING)
    rtc.setClientRole(Constants.CLIENT_ROLE_BROADCASTER)
    rtc.setVideoEncoderConfiguration(
        VideoEncoderConfiguration(
            VideoEncoderConfiguration.VD_1280x720,
            VideoEncoderConfiguration.FRAME_RATE.FRAME_RATE_FPS_30,
            VideoEncoderConfiguration.STANDARD_BITRATE,
            VideoEncoderConfiguration.ORIENTATION_MODE.ORIENTATION_MODE_FIXED_PORTRAIT
        )
    )
    rtc.enableVideo()
    rtc.enableAudio()
}
```

And then initialize everything and set up a video call in the` onCreate(...)` method.

## How it works[​](#how-it-works "Direct link to How it works")

Frames from the **Banuba** camera are processed in the `player`, and then the result is passed to the `onFrame(...)` handler. In the handler, frames are passed to the **Agora** module via `agoraRtc.pushExternalVideoFrame(...)`. And then **Agora** transmits the launched frame to the server, and this is how the video call works.

## Fully working code[​](#fully-working-code "Direct link to Fully working code")

MainActivity.kt

```kotlin
const val AGORA_APP_ID = <#SET KEY#>
const val AGORA_CLIENT_TOKEN = <#SET KEY#>
const val AGORA_CHANNEL_ID = <#SET KEY#>

class MainActivity : AppCompatActivity(R.layout.main) {

    companion object {
        private const val TAG = "MainActivity"

        private val REQUIRED_PERMISSIONS = arrayOf(
            Manifest.permission.CAMERA,
            Manifest.permission.RECORD_AUDIO
        )
    }

    private lateinit var binding: MainBinding
    private var effectsAdapter: CustomEffectsListAdapter? = null

    private var banubaPlayer: Player? = null
    private var lensSelector = CameraDeviceConfigurator.LensSelector.FRONT
    private var cameraDevice: CameraDevice? = null

    private var surfaceOutput: SurfaceOutput? = null
    private var frameOutput: FrameOutput? = null

    private var agoraRtc: RtcEngine? = null

    private var muteAudio = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = MainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        initViews()
        initBanuba()
        initAgora()
    }

    override fun onStart() {
        super.onStart()
        if (checkAllPermissionsGranted()) {
            onPermissionsGranted()
        } else {
            requestPermissions(REQUIRED_PERMISSIONS, 0)
        }
    }

    override fun onResume() {
        super.onResume()
        banubaPlayer?.play()
    }

    override fun onPause() {
        super.onPause()
        banubaPlayer?.pause()
    }

    override fun onStop() {
        cameraDevice?.stop()
        super.onStop()
    }

    override fun onDestroy() {
        super.onDestroy()
        agoraRtc?.leaveChannel()
        RtcEngine.destroy()
        cameraDevice?.close()
        banubaPlayer?.close()
        surfaceOutput?.close()
        frameOutput?.close()
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<String>,
        results: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, results)
        if (checkAllPermissionsGranted()) {
            onPermissionsGranted()
        } else {
            Toast.makeText(
                applicationContext,
                "Please grant all required permissions to proceed.",
                Toast.LENGTH_LONG
            ).show()
            finish()
        }
    }

    private fun onPermissionsGranted() {
        prepareBanuba()
        prepareAgora()
        cameraDevice?.start()
        joinVideoCall()
    }

    private fun initBanuba() {
        banubaPlayer = Player()
        surfaceOutput = SurfaceOutput(binding.localSurfaceView.holder)
        frameOutput = FrameOutput { _, pb ->
            pb?.let { processFrame(it) }
        }
    }

    @SuppressLint("ClickableViewAccessibility")
    private fun prepareBanuba() {
        cameraDevice = CameraDevice(applicationContext, this)

        if (banubaPlayer == null) {
            Log.w(TAG, "Cannot prepare Banuba SDK: Banuba SDK is not initialized!")
            return
        }

        banubaPlayer?.use(
            CameraInput(requireNotNull(cameraDevice)),
            arrayOf(surfaceOutput, frameOutput)
        )

        binding.localSurfaceView.setOnTouchListener(
            PlayerTouchListener(this, requireNotNull(banubaPlayer))
        )
        binding.localSurfaceView.setZOrderOnTop(true)

        val effects = BanubaSdkManager.loadEffects()
        effectsAdapter?.submitList(effects)
        applyEffect(effects[0].path)
    }

    private fun toggleCameraFacing() {
        lensSelector = if (lensSelector == CameraDeviceConfigurator.LensSelector.BACK) {
            CameraDeviceConfigurator.LensSelector.FRONT
        } else {
            CameraDeviceConfigurator.LensSelector.BACK
        }
        cameraDevice?.configurator?.setLens(lensSelector)?.commit()
    }

    private fun applyAudioVolume() {
        val audioVolume = if (muteAudio) 0F else 1F
        banubaPlayer?.setEffectVolume(audioVolume)
    }

    private fun applyEffect(effectPath: String) {
        banubaPlayer?.loadAsync(effectPath)
    }

    private fun initAgora() {
        agoraRtc = RtcEngine.create(this, AGORA_APP_ID, object : IRtcEngineEventHandler() {
            @Deprecated("Deprecated in Java")
            override fun onFirstRemoteVideoDecoded(uid: Int, width: Int, height: Int, elapsed: Int) {
                runOnUiThread {
                    val surfaceView = setupRemoteVideo(uid)
                    binding.remoteVideoContainer.removeAllViews()
                    binding.remoteVideoContainer.addView(surfaceView)
                }
            }
        })
    }

    private fun prepareAgora() {
        val rtc = agoraRtc ?: return
        rtc.setExternalVideoSource(true, false, Constants.ExternalVideoSourceType.VIDEO_FRAME)
        rtc.setChannelProfile(Constants.CHANNEL_PROFILE_LIVE_BROADCASTING)
        rtc.setClientRole(Constants.CLIENT_ROLE_BROADCASTER)
        rtc.setVideoEncoderConfiguration(
            VideoEncoderConfiguration(
                VideoEncoderConfiguration.VD_1280x720,
                VideoEncoderConfiguration.FRAME_RATE.FRAME_RATE_FPS_30,
                VideoEncoderConfiguration.STANDARD_BITRATE,
                VideoEncoderConfiguration.ORIENTATION_MODE.ORIENTATION_MODE_FIXED_PORTRAIT
            )
        )
        rtc.enableVideo()
        rtc.enableAudio()
    }

    private fun joinVideoCall() {
        Log.d(TAG, "Join video call")
        agoraRtc?.setDefaultAudioRoutetoSpeakerphone(true)
        agoraRtc?.joinChannel(AGORA_CLIENT_TOKEN, AGORA_CHANNEL_ID, null, 0)
    }

    private fun setupRemoteVideo(uid: Int): SurfaceView =
        SurfaceView(this).apply {
            val videoCanvas = VideoCanvas(this, VideoCanvas.RENDER_MODE_HIDDEN, uid)
            agoraRtc?.setupRemoteVideo(videoCanvas)
        }

    private fun processFrame(pb: FramePixelBuffer) {
        val pixelData = ByteArray(pb.buffer.remaining())
        pb.buffer.get(pixelData)
        val videoFrame = AgoraVideoFrame().apply {
            timeStamp = System.currentTimeMillis()
            format = AgoraVideoFrame.FORMAT_RGBA
            height = pb.height
            stride = pb.bytesPerRow / pb.bytesPerPixel
            buf = pixelData
        }
        agoraRtc?.pushExternalVideoFrame(videoFrame)
    }

    private fun checkAllPermissionsGranted() = REQUIRED_PERMISSIONS.all {
        ContextCompat.checkSelfPermission(baseContext, it) == PackageManager.PERMISSION_GRANTED
    }

    private fun initViews() {
        invalidateViewState()

        effectsAdapter = CustomEffectsListAdapter(
            resources.displayMetrics.widthPixels,
            effectPreviews
        ) { effectPath, position ->
            applyEffect(effectPath)
            binding.effectsList.smoothScrollToPosition(position)
        }

        binding.effectsList.layoutManager = CustomEffectsListAdapter.CenterLayoutManager(this)
        binding.effectsList.adapter = effectsAdapter

        binding.switchCameraImage.setOnClickListener {
            toggleCameraFacing()
            invalidateViewState()
        }

        binding.muteAudioView.setOnClickListener {
            muteAudio = !muteAudio
            applyAudioVolume()
            invalidateViewState()
        }
    }

    private fun invalidateViewState() {
        with(binding) {
            muteAudioView.setImageResource(
                if (muteAudio) {
                    com.banuba.sdk.example.common.R.drawable.ic_audio_off
                } else {
                    com.banuba.sdk.example.common.R.drawable.ic_audio_on
                }
            )
        }
    }
}
```

* Agora
* OpenTok
* WebRTC

### Agora[​](#agora "Direct link to Agora")

tip

Check the official **[Banuba Agora Extension](https://github.com/Banuba/agora-plugin-filters-web)** for Web [@banuba/agora-extension](https://www.npmjs.com/package/@banuba/agora-extension).

Or if you need finer control, you may use the **Banuba WebAR** directly:

1. Import **AgoraRTC** and **Banuba WebAR**

index.html

```html
<script src="https://download.agora.io/sdk/release/AgoraRTC_N-4.14.0.js"></script>
```

index.html

```html
<script type="module">
import { Player, Effect, Module, MediaStream, MediaStreamCapture } from "https://cdn.jsdelivr.net/npm/@banuba/webar/dist/BanubaSDK.browser.esm.js"
```

2. Setup client tokens

AgoraAppId.js

```js
export const agoraAppId = "<Agora App ID>"
```

BanubaClientToken.js

```js
export const clientToken = "<Banuba Client Token>"
```

3. Initialize `Player`

index.html

```js
const player = await Player.create({ clientToken })
player.use(new MediaStream(await navigator.mediaDevices.getUserMedia({ video: true })))
await player.addModule(new Module("https://cdn.jsdelivr.net/npm/@banuba/webar/dist/modules/face_tracker.zip"))
player.applyEffect(new Effect("effects/TrollGrandma.zip"))
player.play()
```

4. Initialize `AgoraRTC`

index.html

```js
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
await client.join(agoraAppId, "test", null)
```

5. Connect `Player` to `AgoraRTC`

index.html

```js
const webar = new MediaStreamCapture(player)
const videoTrack = await AgoraRTC.createCustomVideoTrack({ mediaStreamTrack: webar.getVideoTracks()[0] })
await client.publish(videoTrack)
```

6. Run the application! 🎉 🚀 💅

tip

See [AgoraWebSDK NG API docs](https://agoraio-community.github.io/AgoraWebSDK-NG/api/en/interfaces/iagorartc.html#createcustomvideotrack) for details.

tip

See [Banuba Video call demo app](https://github.com/Banuba/videocall-web) for more code examples.

### OpenTok (TokBox)[​](#opentok-tokbox "Direct link to OpenTok (TokBox)")

```js
import "https://cdn.jsdelivr.net/npm/@opentok/client"
import { MediaStream, Player, Module, Effect, MediaStreamCapture } from "https://cdn.jsdelivr.net/npm/@banuba/webar/dist/BanubaSDK.browser.esm.js"

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

tip

See [TokBox Video API docs](https://tokbox.com/developer/sdks/js/reference/OT.html#initPublisher) for details.

tip

See [Banuba Video call (TokBox) demo app](https://github.com/Banuba/videocall-tokbox-web) for more code examples.

### WebRTC[​](#webrtc "Direct link to WebRTC")

Considering the [Fireship WebRTC demo](https://github.com/fireship-io/webrtc-firebase-demo/blob/main/main.js)

```js
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

Due to **Flutter** limitations, for every videocall solution you have to create a **native Flutter plugin**. We have developed one for integration with [Agora](https://docs.agora.io). It is expected that you will develop your own [Flutter plugin](https://docs.flutter.dev/packages-and-plugins/developing-packages) if **Agora** isn't suitable for you.

We have created [Agora Extension](https://docs.agora.io/en/video-calling/develop/use-an-extension?platform=flutter) which is accessible from **Flutter**.

[The sample](https://github.com/Banuba/banuba-agora-flutter-sdk) described below is a fork of [Flutter plugin of Agora](https://github.com/AgoraIO-Extensions/Agora-Flutter-SDK). Follow the instructions in `README.md` to run it.

These are the general steps to integrate the sample code into your app:

* Android
* iOS

1. Add the **Client Token** and extension properties keys constants

example/lib/examples/basic/join\_channel\_video/join\_channel\_video.dart

```dart
const banubaClientToken = <#Place client token here#>;

const banubaExtprovider = 'Banuba';
const banubaExtension = 'BanubaFilter';
const loadEffect = 'load_effect';
const unloadEffect = 'unload_effect';
const setEffectsPath = 'set_effects_path';
const setToken = 'set_banuba_license_token';
const evalJs = 'eval_js';
```

2. Add common methods to interact with **Banuba extension**

example/lib/examples/basic/join\_channel\_video/join\_channel\_video.dart

```dart
Future<void> enableExtension() async {
  if (Platform.isAndroid) {
    _engine.loadExtensionProvider(path: "banuba");
    _engine.loadExtensionProvider(path: "banuba-plugin");
  }

  await _engine.enableExtension(
      provider: banubaExtprovider,
      extension: banubaExtension,
      type: MediaSourceType.unknownMediaSource,
      enable: true);
}

Future<void> disableExtension() async {
  await _engine.enableExtension(
      provider: banubaExtprovider,
      extension: banubaExtension,
      type: MediaSourceType.unknownMediaSource,
      enable: false);
}

Future<void> intiBanuba() async {
  await enableExtension();
  await _engine.setExtensionProperty(
      provider: banubaExtprovider,
      extension: banubaExtension,
      key: setToken,
      value: banubaClientToken);
}

Future<void> loadBanubaEffect(String name) async {
  await _engine.setExtensionProperty(
      provider: banubaExtprovider,
      extension: banubaExtension,
      key: loadEffect,
      value: 'effects/' + name);
}
```

3. Initialize **Banuba** and load an **effect**

example/lib/examples/basic/join\_channel\_video/join\_channel\_video.dart

```dart
await intiBanuba();

await _engine.enableVideo();
await _engine.startPreview();

await loadBanubaEffect('Glasses');
```

4. Copy effects in [`assets/effects`](https://github.com/Banuba/banuba-agora-flutter-sdk/tree/main/example/assets/effects) folder

5. Add a reference to **Banuba Maven repo**

example/android/build.gradle

```groovy
allprojects {
    repositories {
        google()
        mavenCentral()
        maven {
            name = "BanubaMaven"
            url = uri("https://nexus.banuba.net/repository/maven-releases")
        }
    }
}
```

6. Add **Banuba dependencies** and prepare a task to copy effects into app

example/android/app/build.gradle

```groovy
dependencies {
    implementation "com.banuba.sdk:banuba_sdk:1.17.+"
    implementation 'com.banuba.sdk.android:agora-extension:1.5.+'
}

task copyEffects {
    copy {
        from '../../assets/effects'
        into 'src/main/assets/bnb-resources/effects'
    }
}
gradle.projectsEvaluated {
    preBuild.dependsOn(copyEffects)
}
```

1. Add **Client Token** and extension properties keys constants

example/lib/examples/basic/join\_channel\_video/join\_channel\_video.dart

```dart
const banubaClientToken = <#Place client token here#>;

const banubaExtprovider = 'Banuba';
const banubaExtension = 'BanubaFilter';
const loadEffect = 'load_effect';
const unloadEffect = 'unload_effect';
const setEffectsPath = 'set_effects_path';
const setToken = 'set_banuba_license_token';
const evalJs = 'eval_js';
```

2. Add common methods to interact with **Banuba extension**

example/lib/examples/basic/join\_channel\_video/join\_channel\_video.dart

```dart
Future<void> enableExtension() async {
  if (Platform.isAndroid) {
    _engine.loadExtensionProvider(path: "banuba");
    _engine.loadExtensionProvider(path: "banuba-plugin");
  }

  await _engine.enableExtension(
      provider: banubaExtprovider,
      extension: banubaExtension,
      type: MediaSourceType.unknownMediaSource,
      enable: true);
}

Future<void> disableExtension() async {
  await _engine.enableExtension(
      provider: banubaExtprovider,
      extension: banubaExtension,
      type: MediaSourceType.unknownMediaSource,
      enable: false);
}

Future<void> intiBanuba() async {
  await enableExtension();
  await _engine.setExtensionProperty(
      provider: banubaExtprovider,
      extension: banubaExtension,
      key: setToken,
      value: banubaClientToken);
}

Future<void> loadBanubaEffect(String name) async {
  await _engine.setExtensionProperty(
      provider: banubaExtprovider,
      extension: banubaExtension,
      key: loadEffect,
      value: 'effects/' + name);
}
```

3. Initialize **Banuba** and load an **effect**

example/lib/examples/basic/join\_channel\_video/join\_channel\_video.dart

```dart
await intiBanuba();

await _engine.enableVideo();
await _engine.startPreview();

await loadBanubaEffect('Glasses');
```

4. Copy effects in [`assets/effects`](https://github.com/Banuba/banuba-agora-flutter-sdk/tree/main/example/assets/effects) folder

5. Add Banuba dependencies to `Podfile`

example/ios/Podfile

```ruby
pod 'BanubaSdk', '1.17.4', :source => 'https://github.com/sdk-banuba/banuba-sdk-podspecs.git'
pod 'BanubaFiltersAgoraExtension', '2.5.0', :source => 'https://github.com/sdk-banuba/banuba-sdk-podspecs.git'
```

6. Add the `effects` folder added earlier into your project. Link it with your app: add the folder into `Runner` **Xcode** project (`File` -> `Add Files to 'Runner'...`).

Due to **React Native** limitations, for every videocall solution you have to create a **React native module**. We developed one for integration with [Agora](https://docs.agora.io). It is expected that you will develop your own [React native module](https://reactnative.dev/docs/native-modules-intro) if **Agora** isn't suitable for you.

We have created [Agora Extension](https://docs.agora.io/en/video-calling/develop/use-an-extension?platform=react-native) which is accessible from **React Native**.

[The sample](https://github.com/Banuba/banuba-react-native-agora) described below is a fork of [React Native around Agora](https://github.com/AgoraIO-Extensions/react-native-agora). Follow the instructions in `README.md` to run it.

These are general steps to integrate the sample code into your app:

* Android
* iOS

1. Add the **Client Token** and extension properties keys constants

example/src/examples/basic/JoinChannelVideo/JoinChannelVideo.tsx

```tsx
const banubaClientToken = '<#Place client token here#>'

const banubaExtprovider = 'Banuba';
const banubaExtension = 'BanubaFilter';
const loadEffect = 'load_effect';
const unloadEffect = 'unload_effect';
const setEffectsPath = 'set_effects_path';
const setToken = 'set_banuba_license_token';
const evelJs = 'eval_js';
```

2. Add the common methods to interact with **Banuba extension**

example/src/examples/basic/JoinChannelVideo/JoinChannelVideo.tsx

```tsx
protected enableExtension() {
  if (Platform.OS === 'android') {
    this.engine?.loadExtensionProvider(`banuba`);
    this.engine?.loadExtensionProvider(`banuba-plugin`);
  }
  const result =
    this.engine?.enableExtension(banubaExtprovider, banubaExtension, true) ?? -1;
  if (result < 0) {
    throw new Error('Failed to load Banuba extention library');
  }
}

protected disableExtension() {
  this.engine?.enableExtension(banubaExtprovider, banubaExtension, false);
}

protected intiBanuba() {
  this.enableExtension();
  this.engine?.setExtensionProperty(
    banubaExtprovider,
    banubaExtension,
    setToken,
    banubaClientToken
  );
}

protected loadEffect(name: string) {
  this.engine?.setExtensionProperty(
    banubaExtprovider,
    banubaExtension,
    loadEffect,
    'effects/' + name
  );
}
```

3. Initialize **Banuba** and load an **effect**

example/src/examples/basic/JoinChannelVideo/JoinChannelVideo.tsx

```tsx
this.intiBanuba();
this.loadEffect('Glasses');
```

warning

`intiBanuba()` must be called just after `engine.initialize(...)`, calling it later will cause an error during extention loading.

4. Copy effects in [`effects`](https://github.com/Banuba/banuba-react-native-agora/tree/main/example/effects) folder

5. Add a reference to the **Banuba Maven repo**

example/android/build.gradle

```groovy
allprojects {
    repositories {
        google()
        mavenCentral()
        maven {
            url("$rootDir/../node_modules/detox/Detox-android")
        }
        maven {
            name = "BanubaMaven"
            url = uri("https://nexus.banuba.net/repository/maven-releases")
        }
    }
}
```

6. Add **Banuba dependencies** and prepare a task to copy effects into app

example/android/app/build.gradle

```groovy
implementation 'com.banuba.sdk:banuba_sdk:1.17.+'
implementation 'com.banuba.sdk.android:agora-extension:1.5.+'
```

1. Add **Client Token** and extension properties keys constants

example/src/examples/basic/JoinChannelVideo/JoinChannelVideo.tsx

```tsx
const banubaClientToken = '<#Place client token here#>'

const banubaExtprovider = 'Banuba';
const banubaExtension = 'BanubaFilter';
const loadEffect = 'load_effect';
const unloadEffect = 'unload_effect';
const setEffectsPath = 'set_effects_path';
const setToken = 'set_banuba_license_token';
const evelJs = 'eval_js';
```

2. Add common methods to interact with the **Banuba extension**

example/src/examples/basic/JoinChannelVideo/JoinChannelVideo.tsx

```tsx
protected enableExtension() {
  if (Platform.OS === 'android') {
    this.engine?.loadExtensionProvider(`banuba`);
    this.engine?.loadExtensionProvider(`banuba-plugin`);
  }
  const result =
    this.engine?.enableExtension(banubaExtprovider, banubaExtension, true) ?? -1;
  if (result < 0) {
    throw new Error('Failed to load Banuba extention library');
  }
}

protected disableExtension() {
  this.engine?.enableExtension(banubaExtprovider, banubaExtension, false);
}

protected intiBanuba() {
  this.enableExtension();
  this.engine?.setExtensionProperty(
    banubaExtprovider,
    banubaExtension,
    setToken,
    banubaClientToken
  );
}

protected loadEffect(name: string) {
  this.engine?.setExtensionProperty(
    banubaExtprovider,
    banubaExtension,
    loadEffect,
    'effects/' + name
  );
}
```

3. Initialize **Banuba** and load an **effect**

example/src/examples/basic/JoinChannelVideo/JoinChannelVideo.tsx

```tsx
this.intiBanuba();
this.loadEffect('Glasses');
```

warning

`intiBanuba()` must be called immediately after `engine.initialize(...)`, calling it later will cause an error during extention loading.

4. Copy effects in [`effects`](https://github.com/Banuba/banuba-react-native-agora/tree/main/example/effects) folder

5. Add **Banuba dependencies** to `Podfile`

example/ios/Podfile

```ruby
source 'https://github.com/CocoaPods/Specs.git'
source 'https://github.com/sdk-banuba/banuba-sdk-podspecs.git'
```

6. Add the `effects` folder added earlier into your project. Link it with your app: add the folder into **Xcode** project (`File` -> `Add Files to '<Your project>'...`).
