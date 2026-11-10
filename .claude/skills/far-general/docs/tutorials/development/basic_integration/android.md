# android

## Installation

To get started, add the **Banuba SDK** packages to your project.

Add the custom maven repo to your `build.gradle.kts`:

```kotlin

dependencyResolutionManagement {
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

And add the dependency on **Banuba SDK** package to your `build.gradle.kts`:

```kotlin
    api("$bnbComSdk:sdk_api:$bnbVersion")
    // Face tracking is used in most effects
    api("$bnbComSdk:face_tracker:$bnbVersion")
    // Required to change background
    api("$bnbComSdk:background:$bnbVersion")
    // These dependency are usually required for Makeup and beauty
    api("$bnbComSdk:makeup:$bnbVersion")
    api("$bnbComSdk:eyes:$bnbVersion")
}
```

:::info
Details about the packages see in [Installation](/tutorials/development/installation/).
:::

## Integration

```kotlin
/**
 * Sample activity that shows how to apply masks with Banuba SDK.
 * Some Banuba masks can change their appearance if tapping on them.
 */
class MainActivity : BaseActivity(R.layout.main) {

    private val surfaceView by lazy(LazyThreadSafetyMode.NONE) {
        findViewById<SurfaceView>(R.id.surfaceView)
    }

    private val showMaskButton by lazy(LazyThreadSafetyMode.NONE) {
        findViewById<Button>(R.id.showMaskButton)
    }
    companion object {
        private const val MASK_NAME = "effects/TrollGrandma"
    }

    // The player executes the main pipeline
    private val player by lazy(LazyThreadSafetyMode.NONE) {
        Player()
    }

    // This camera device will pass frames to the CameraInput
    private val cameraDevice by lazy(LazyThreadSafetyMode.NONE) {
        CameraDevice(requireNotNull(this.applicationContext), this@MainActivity)
    }

    // The result will be displayed on the surface
    private val surfaceOutput by lazy(LazyThreadSafetyMode.NONE) {
        SurfaceOutput(surfaceView.holder)
    }

    @SuppressLint("ClickableViewAccessibility")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Set layer will take input frames from and where the player will display the result
        player.use(CameraInput(cameraDevice), surfaceOutput)

        // Set custom OnTouchListener to change mask style.
        surfaceView.setOnTouchListener(PlayerTouchListener(this, player))

        var shouldApply = false
        showMaskButton.setOnClickListener {
            shouldApply = !shouldApply

            showMaskButton.text = if (shouldApply) "Hide mask" else "Show mask"

            // The mask is loaded asynchronously and applied
            player.loadAsync(if (shouldApply) MASK_NAME else "")
        }
    }

    override fun onStart() {
        super.onStart()
        // We start the camera and then player starts taking frames
        cameraDevice.start()
    }

    override fun onResume() {
        super.onResume()
        // Running the player
        player.play()
    }

    override fun onPause() {
        super.onPause()
        // Pause the player when activity is inactive
        player.pause()
    }

    override fun onStop() {
        // After this method, the camera will stop capturing frames and transmitting them to player
        cameraDevice.stop()
        super.onStop()
    }

    override fun onDestroy() {
        // After you are done using the player, you must free all resources by calling close() method
        cameraDevice.close()
        surfaceOutput.close()
        player.close()
        super.onDestroy()
    }
}
```
