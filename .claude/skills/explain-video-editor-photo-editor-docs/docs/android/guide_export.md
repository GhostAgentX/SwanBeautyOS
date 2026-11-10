# Export media on Android

> Export media on Android

# Export media on Android

Video Editor SDK allows to export a number of media files i.e. video and audio with various resolutions and other configurations. 
Video is exported as ```.mp4``` file.

:::info
Export is a very heavy computational task that takes time and the user has to wait.
Execution time depends on
1. Video duration - the longer video the longer execution time.
2. Number of video sources - the many sources the longer execution time.
3. Number of effects and their usage in video - the more effects and their usage the longer execution time.
4. Number of exported video - the more video and audio you want to export the longer execution time.
5. Device hardware - the most powerful devices can execute export much quicker and with higher resolution.
:::

Export supports 2 modes:
- ```Foreground``` - the user has to wait on progress screen until processing is done. **Default**
- ```Background``` - the user can close the editor and open an app specific screen. A certain notification is sent when processing is done.

```ForegroundExportFlowManager``` and ```BackgroundExportFlowManager``` are corresponding implementations.

Here is a screen that is shown in ```Foreground``` mode.

## Video quality

Video Editor supports video codec options:
1. ```HEVC``` - H265 codec. **Default**
2. ```AVC_PROFILES``` - H264 codec with profiles
3. ```BASELINE``` - H264 codec without profiles

The following table presents list of video resolution and bitrate values for codec ```H264(AVC_PROFILES)```.

| 240p(240x426) | 360p(360x640) | 480p(480x854) | QHD540(540x960) | HD(720x1280) | FHD(1080x1920) | QHD(1440x2560) | UHD(2160x3840) |
|---------------|------------|---------------|-----------------|--------------|----------------|----------------|----------------|
| 1000   kb/s   | 1200  kb/s     | 2000 kb/s         | 2400  kb/s          | 3600   kb/s  | 5800 kb/s      | 10000    kb/s      | 20000  kb/s        |

:::info
Video Editor includes built-in feature for detecting device performance capabilities and finding ```auto``` video quality for exported video.
:::

## Export storage
All exported media files are stored in ```export``` directory on the device storage.

You can specify another directory by overriding ```exportDir``` dependency in [VideoEditorModule](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/java/com/banuba/example/integrationapp/VideoEditorModule.kt#L51).  
Default implementation is
```kotlin
    single(named("exportDir")) {
        get<Context>().getExternalFilesDir("")?.toUri()
            ?.buildUpon()
            ?.appendPath("export")
            ?.build() 
            ?: throw NullPointerException("exportDir cannot be null!")
    }
```

## Implement export flow
:::info
Default implementation exports single video file with auto quality(based on device hardware capabilities).
:::

You can create your own export flow to meet your requirements.

First, specify list of media files to export. Create new class  ```CustomExportParamsProvider``` and implement ```ExportParamsProvider```. 
Method ```provideExportParams``` returns ```List<ExportParams>``` which is a list of media files to export.

The following implementation exports single video with ```HD``` and ```auto``` quality 

```kotlin
class CustomExportParamsProvider(
    private val exportDir: Uri,
    private val watermarkBuilder: WatermarkBuilder
) : ExportParamsProvider {

    override fun provideExportParams(
        effects: Effects,
        videoRangeList: VideoRangeList,
        musicEffects: List<MusicEffect>,
        videoVolume: Float
    ): List<ExportParams> {
        val exportSessionDir = exportDir.toFile().apply {
            deleteRecursively()
            mkdirs()
        }
        
       // Video is in HD resolution
       val exportVideoHD = ExportParams.Builder(VideoResolution.Exact.HD)
          .effects(effects)
          .fileName("export_video_hd")
          .videoRangeList(videoRangeList)
          .destDir(exportSessionDir)
          .musicEffects(musicEffects)
          .volumeVideo(videoVolume)
          .build()

       // Video is in auto resolution
       val exportVideoAuto = ExportParams.Builder()
          .effects(effects)
          .fileName("export_video_auto")
          .videoRangeList(videoRangeList)
          .destDir(exportSessionDir)
          .musicEffects(musicEffects)
          .volumeVideo(videoVolume)
          .build()

        return listOf(exportVideoHD, exportVideoAuto)
    }
}
``` 

Use constructor ```ExportParams.Builder()``` or specific method ```videoResolution()```to set up custom video quality.
```diff
   val exportVideoHD = 
    // highlight-add-next-line
+            ExportParams.Builder(VideoResolution.Exact.HD)
          .effects(effects)
          .fileName("export_video_hd")
          .videoRangeList(videoRangeList)
          .destDir(exportSessionDir)
          .musicEffects(musicEffects)
          .volumeVideo(videoVolume)
          .build()
``` 

:::warning
Please keep in mind that low level devices might not be able to export video with high quality.
Our recommendations
   1. Use  ```HD``` or ```VGA480``` resolutions with codec ```H264(AVC_PROFILES)```
   2. Do not specify certain video quality. In this case  ```auto``` quality will be used.
:::

Next, specify ```CustomExportParamsProvider``` implementation in [VideoEditorModule](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/java/com/banuba/example/integrationapp/VideoEditorModule.kt#L51)

```kotlin
    factory<ExportParamsProvider> {
        CustomExportParamsProvider(
            exportDir = get(named("exportDir")),
            watermarkBuilder = get()
        )
    }
```

Finally, use the most suitable export mode for your application in [VideoEditorModule](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/java/com/banuba/example/integrationapp/VideoEditorModule.kt#L51).
```ForegroundExportFlowManager``` is used by default.

## Use AVC codec

The SDK prefers ```H265(HEVC)``` codec by default for exporting video file. 
You can specify ```H264(AVC_PROFILES)``` by setting ```false``` to ```useHevcIfPossible```.

:::info
```H264(AVC_PROFILES)``` is recommended for low level devices
:::

```diff
 ExportParams.Builder(VideoResolution.Exact.HD)
           ...
          // highlight-add-next-line
+          useHevcIfPossible(false)
           .build(),
``` 

## Add watermark
Watermark is not added to exported video by default.

Create new class ```CustomWatermarkProvider``` and implement ```WatermarkProvider``` to use your custom watermark image.
```kotlin
   private class CustomWatermarkProvider(private val context: Context) : WatermarkProvider {
       
     override fun getWatermarkBitmap(): Bitmap? {
         val watermarkDrawableRes = ... // R.drawable.
         val watermark = BitmapFactory.decodeResource(
            context.resources,
             watermarkDrawableRes
         )
         return watermark
    }
}
```
and specify it in [VideoEditorModule](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/java/com/banuba/example/integrationapp/VideoEditorModule.kt#L51)
```kotlin
factory<WatermarkProvider> {
    CustomWatermarkProvider()
}
```

Use extension method ```Effects.withWatermark``` for adding a watermark to ```ExportParams.Builder```.
```diff
 ExportParams.Builder(VideoResolution.Exact.HD)
            // highlight-add-next-line
+          .effects(effects.withWatermark(watermarkBuilder, WatermarkAlignment.BottomRight(marginRightPx = 16.toPx)))
            ...
           .build(),
``` 

where ```WatermarkBuilder``` provides watermark drawable and ```alignment``` is used where to locate drawable
```kotlin
    WatermarkAlignment {
        TOP_LEFT,
        TOP_RIGHT,
        BOTTOM_LEFT,
        BOTTOM_RIGHT
    }
```

## Export soundtrack track

You can export video and audio soundtrack file separately.
For example, 
```Kotlin
    val extraSoundtrackUri = Uri.parse(exportSessionDir.toString()).buildUpon()
        .appendPath("exported_soundtrack.${MediaFileNameHelper.DEFAULT_SOUND_FORMAT}")
        .build()

    val exportVideoAndSoundtrack = ExportParams.Builder(VideoResolution.Exact.HD)
       .fileName("export_extra_soundtrack")
       .videoRangeList(videoRangeList)
       .destDir(exportSessionDir)
       .musicEffects(musicEffects)
       .extraAudioFile(extraSoundtrackUri)
       .volumeVideo(videoVolume)
       .build()
```
and add ```exportVideoAndSoundtrack``` to the list of exported video files in your custom ```ExportParamsProvider```.

## Handle export result
The result is returned to your controller in [registerForActivityResult](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/java/com/banuba/example/integrationapp/MainActivity.kt#L27) method as an instance of ```ExportResult```.
```kotlin
private val createVideoRequest =
        registerForActivityResult(CustomExportResultVideoContract()) { exportResult ->
            exportResult?.let {
                    if (exportResult is ExportResult.Success) {
                        // Get uri of first exported video file
                        val videoUri = exportResult.videoList.getOrNull(0)
                           ...
                    }
            }
        }
```

```ExportResult``` class
```kotlin
    sealed class ExportResult {

        object Inactive : ExportResult()

        object Stopped : ExportResult()

        data class Progress(
            val preview: Uri
        ) : ExportResult()

        @Parcelize
        data class Success(
            val videoList: List<ExportedVideo>,
            val preview: Uri,
            val metaUri: Uri,
            val additionalExportData: Parcelable? = null
        ) : ExportResult(), Parcelable

        @Parcelize
        data class Error(val type: ExportError) : ExportResult(), Parcelable
}
```

Instance of ```ExportResult.Success``` is returned with all export data when export finishes successfully.  
```ExportResult.Error``` is returned when an error is occurred while exporting media content.

## Export in background
If you want to export media in the background and avoid showing progress screen to your user you can use ```BackgroundExportFlowManager``` implementation in [VideoEditorModule](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/java/com/banuba/example/integrationapp/VideoEditorModule.kt#L51) 
and provide your custom implementations.
```kotlin
        single<ExportFlowManager> {
            BackgroundExportFlowManager(
              exportDataProvider = get(),
              exportSessionHelper = get(),
              exportNotificationManager = get(),
              exportDir = get(named("exportDir")),
              shouldClearSessionOnFinish = true,
              publishManager = get(),
              errorParser = get(),
              exportBundleProvider = get(),
              eventConverter = get()
            )
        }
```

Next, specify Android ```CustomActivity``` that opens after export  in ```AndroidManifest.xml``` file and set special ``` <intent-filter>``` .
Please use ```applicationId``` as a part of intent action name to make it unique among other possible intent actions

    ```kotlin
    <activity android:name=".CustomActivity">
        <intent-filter>
          <action android:name="${applicationId}.ShowExportResult" />
          <category android:name="android.intent.category.DEFAULT" />
        </intent-filter>
    </activity>
    ```

Create new class ```CustomExportResultHandler``` and implement ```ExportResultHandler``` that will start your Activity mentioned above.
```kotlin
    class CustomExportResultHandler : ExportResultHandler {

        override fun doAction(activity: AppCompatActivity, result: ExportResult.Success?) {
            val intent = Intent("${activity.packageName}.ShowExportResult").apply {
                result?.let { putExtra(EXTRA_EXPORTED_SUCCESS, it) }
                addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            }
            activity.startActivity(intent)
        }
    }
```
**Note**: action that is passed into ```Intent``` constructor **must be the same** as the action name from activity intent filter above.

Next, add ```ExportFlowManager``` dependency using Koin and observe for ```ExportResult``` in ```CustomActivity```

```kotlin
    class CustomActivity: AppCompatActivity() {
        private val exportFlowManager: ExportFlowManager by inject()
  
        override fun onCreate(savedInstanceState: Bundle?) {
            super.onCreate(savedInstanceState)
            exportFlowManager.resultData.nonNull().observe(this) { exportResult ->
                //...
            }
        }
    }
```

**Optional**. Provide ```ExportNotificationManager``` to manage notifications about exporting process state.
There are 3 options:
1. Remove notifications all notifications
    ```kotlin
    class EmptyExportNotificationManger() : ExportNotificationManager {
        fun showExportStartedNotification(){}
        fun showSuccessfulExportNotification(result: ExportResult.Success){}
        fun showFailedExportExportNotification(){}
    }
    ```
and provide this implementation in [VideoEditorModule](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/java/com/banuba/example/integrationapp/VideoEditorModule.kt#L75):

```kotlin
    single<ExportNotificationManager> {
       EmptyExportNotificationManger()
    }
```

2. Customize default implementation

You can override the following android resources:
- R.string.export.notification_started - for message about started export
- R.string.export_notification_success - for message about succeeded export
- R.string.export_notification_fail - for message about failed export
- R.drawable.ic_export_notification - for notification icon in system bar

3. Provide custom implementation of ```ExportNotificationManager``` in [VideoEditorModule](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/java/com/banuba/example/integrationapp/VideoEditorModule.kt#L75)
```kotlin
    single<ExportNotificationManager> {
       CustomExportNotificationManger()
    }
```

## Export GIF preview
Video Editor allows to export preview of a video as a GIF file.

Use ```GifMaker.Params``` in your ```CustomExportParamsProvider``` to create params for exporting GIF preview
 ```kotlin
     data class Params(
        val destFile: File,
        val sourceVideoRangeMs: LongRange = 0..1000L,
        val fps: Int = 15,
        val width: Int = 240,
        val useDithering: Boolean = true,
        val reverse: Boolean = true
    )
 ```
where
- `destFile` - where to store the file
- `sourceVideoRangeMs` - is a range of exported video that will be used to create gif image
- `fps` - frames per second within gif image
- `width` - width of gif image in pixels
- `useDithering` - flag that apply or remove dithering effect (in simple words make an image of better quality)
- `reverse` - flag to reverse playback inside gif

Use ```interactivePreview``` method in ```ExportParams.Builder``` to enable exporting GIF

 ```diff
ExportParams.Builder(sizeProvider.videoResolution)
                .effects(effects)
                .fileName("export_video")
                .videoRangeList(videoRangeList)
                .destDir(exportSessionDir)
                .musicEffects(musicEffects)
                .extraAudioFile(extraSoundtrackUri)
                .volumeVideo(videoVolume)
                // highlight-add-next-line
 +              .interactivePreview(gifPreviewParams)
                .build()
 ```

## Get audio used in export
You can get all audio used in exported video when export finished successfully.
```ExportBundleHelper.getExportedMusicEffect``` requires ```additionalExportData``` value of ```ExportResult.Success```.
The result is ```List<MusicEffectExportData>``` where ```MusicEffectExportData``` is
```kotlin
    @Parcelize
    data class MusicEffectExportData(
        val title: String,
        val type: MusicEffectType,
        val uri: Uri
    ) : Parcelable
```

`MusicEffectType` contains next values:
1. `TRACK` - audio tracks that were added on  the `Editor` screen
2. `VOICE` - voice record track that was added on the `Editor` screen
3. `CAMERA_TRACK` - audio track that was added on the `Camera` screen

## Export metadata analytics
Video Editor generates simple metadata analytics while exporting media content that you can use to analyze what media content your users make.  
Metadata is a JSON string and can be returned from ```ExportResult.Success``` in this way
```kotlin
//"exportResult" is an instance of ExportResult.Success object
val outputBundle = exportResult.additionalExportData.getBundle(ExportBundleProvider.Keys.EXTRA_EXPORT_OUTPUT_INFO)
val analytics = outputBundle?.getString(ExportBundleProvider.Keys.EXTRA_EXPORT_ANALYTICS_DATA)
```
```ExportBundleProvider.Keys``` includes all constants you can use for parsing.

Sample
```JSON
{
  "export_success": true, // defines if the export finished succesffully
  "aspect_ratio": "original", // aspect ration used in exported video
  "video_resolutions": ["1080x1920"], // list of video resolutions used in export
  "camera_effects": [], // list of effects of features used on camera screen while recording video
  "ppt_effects": {
    "visual": 2, // num of visual effects i.e. Glitch, VHS used in exported video
    "speed": 1, //  num of speed effects used in exported video
    "mask": 6, // num of AR masks used in exported video
    "color": 3, // num of color effects used in exported video
    "text": 1, // num of text effects used in exported video
    "sticker": 1, // num of sticker effects used in exported video
    "blur": 1 // num of blur effects used in exported video
  },
  "sources": {
    "camera": 0, // num of video sources recorded on camera screen(not PIP)
    "gallery": 1, // num of video sources selected in the gallery
    "pip": 0, // num of video recorded with PIP
    "slideshow": 0, // num of video exported as slideshow
    "audio": 0 // num of audi tracks
  },
  "export_duration": 12.645, // export processing duration
  "video_duration": 20.11, // exported video duration
  "video_count": 1, // num of exported video files
  "os_version": "11", // OS version
  "sdk_version": "1.26.6" // VE SDK version
}
```
