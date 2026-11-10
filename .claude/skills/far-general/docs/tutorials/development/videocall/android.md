# android

[Example of using video calls with the Banuba SDK](https://github.com/Banuba/banuba-sdk-android-samples/tree/master/videocall)

<br />

<br />

For a video call, you need to receive frames as an array of pixels frame by frame in RGBA format. This
can be done using `FrameOutput`. Just create a variable called `frameOutput` and add a callback that will
receive an array of pixels `framePixelBuffer`:

```kotlin
        frameOutput = FrameOutput { _, pb ->
            pb?.let { processFrame(it) }

        }
```

Now, when initializing the player, the created variable is set to `player.use(myInput, frameOutput)`.

## Follow these steps to configure Videocall

:::info important
To get started, add the **Banuba SDK** [integration code](/tutorials/development/basic_integration#integration) to your project.
:::

Add the **AgoraRTC SDK** dependency to your `build.gradle.kts`:

```kotlin
        viewBinding = true
```

This example is based on the [**Player API**](/tutorials/development/basic_integration#integration).
First, create the **Banuba SDK** core - `player`. Create a `surfaceOutput` that will draw the
processed image from the **Banuba SDK**. Create a `frameOutput` that will produce the processed
image and transfer it to **Agora** as an array of pixels. And create a camera `cameraDevice` and
manage it yourself. **Agora** also has its own camera module, but in this example the **Agora**
camera is not used, so `setExternalVideoSource(...)` is called to disable the **Agora** camera:

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

        // Set layer will take input frames from and where the player will display the result
        banubaPlayer?.use(
            CameraInput(requireNotNull(cameraDevice)),
            arrayOf(surfaceOutput, frameOutput)
        )

        binding.localSurfaceView.setOnTouchListener(
            PlayerTouchListener(
                this,
                requireNotNull(banubaPlayer)
            )
        )
        binding.localSurfaceView.setZOrderOnTop(true)

        val effects = BanubaSdkManager.loadEffects()
        effectsAdapter?.submitList(effects)

        // Apply first effect
        applyEffect(effects[0].path)
    }

```

Create the **Agora** core with which the videocall will be made - `agoraRtc`, inside we indicate
where the **Agora** will draw the received frames:

```kotlin
    private fun initAgora() {
        agoraRtc = RtcEngine.create(this, AGORA_APP_ID, object : IRtcEngineEventHandler() {
            @Deprecated("Deprecated in Java")
            override fun onFirstRemoteVideoDecoded(
                uid: Int,
                width: Int,
                height: Int,
                elapsed: Int
            ) {
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

## How it works

Frames from the **Banuba** camera are processed in the `player`, and then the
result is passed to the `onFrame(...)` handler. In the handler, frames are passed to the **Agora**
module via `agoraRtc.pushExternalVideoFrame(...)`. And then **Agora** transmits the launched frame
to the server, and this is how the video call works.

## Fully working code

```kotlin reference title="MainActivity.kt"
/**
 * Keys for Agora SDK
 */
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

        // Set layer will take input frames from and where the player will display the result
        banubaPlayer?.use(
            CameraInput(requireNotNull(cameraDevice)),
            arrayOf(surfaceOutput, frameOutput)
        )

        binding.localSurfaceView.setOnTouchListener(
            PlayerTouchListener(
                this,
                requireNotNull(banubaPlayer)
            )
        )
        binding.localSurfaceView.setZOrderOnTop(true)

        val effects = BanubaSdkManager.loadEffects()
        effectsAdapter?.submitList(effects)

        // Apply first effect
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
            override fun onFirstRemoteVideoDecoded(
                uid: Int,
                width: Int,
                height: Int,
                elapsed: Int
            ) {
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