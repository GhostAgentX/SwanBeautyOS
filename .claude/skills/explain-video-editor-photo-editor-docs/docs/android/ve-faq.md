# FAQ on Android

> FAQ on Android

# FAQ on Android  

These are the answers to the most common questions asked about our SDK.

### I want to start VideoEditor with a preselected audio track

To open Video Editor SDK you should create an intent by utilizing any avilable function inside **VideoCreationActivity**: **startFromCamera()**, **startFromTrimmer()** or **startFromEditor()**. All these functions have an argument called **audioTrackData** where you should pass preselected audio track or null (by default). For example, to open an SDK from the camera screen with the track use the code snippet below:

```kotlin
startActivity(
    VideoCreationActivity.startFromCamera(
                context = applicationContext,
                audioTrackData = preselectedTrackData
            )
)
```

**audioTrackData** is an object of TrackData class

```kotlin
data class TrackData(
    val id: UUID,
    val title: String,
    val localUri: Uri,
    val artist: String? = null
)
```

### How to add other text fonts that are used in the editor screen

To add other text fonts that are used in the editor screen follow the next steps:

1. Add font files to the `app/src/main/res/font/` directory;

2. Add fonts names to the  ```strings.xml ``` resource file:
```xml
<string name="font_1_title" translatable="false">Font 1 Title</string>
<string name="font_N_title" translatable="false">Font N Title</string>
```

3. Add `font_resources.xml` with fonts array declaration to the `app/src/main/res/values/` directory. The format of `font_resources.xml` should be the next one:
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <array name="font_resources">
        <item>@array/font_1_resource</item>    <!-- link to the font description array -->
        <item>@array/font_N_resource</item>
    </array>

    <array name="font_1_resource">
        <item>@string/font_1_title</item>      <!-- font name -->
        <item>@font/font_1</item>              <!-- link to the font file -->
    </array>

    <array name="font_N_resource">
        <item>@string/font_N_title</item>
        <item>@font/font_N</item>
    </array>
</resources>
```

4. The final step is to pass your custom `font_resources` id to the `MainTextOnVideoTypefaceProvider` in the ```SampleIntegrationKoinModule``` to override the default implementation:

    ```kotlin
    single<TextOnVideoTypefaceProvider> {
        MainTextOnVideoTypefaceProvider(
            context = get(),
            fontsArrayResId = R.array.font_resources
        )
    }
    ```

### Optimizing app size

The easiest way to gain immediate app size savings when publishing to Google Play is by uploading your app as an [**Android App Bundle**](https://developer.android.com/guide/app-bundle), which is a new upload format that includes all your app’s compiled code and resources. Google Play’s new app serving model then uses your app bundle to generate and serve optimized APKs for each user’s device configuration, so they download only the code and resources they need to run your app.

As a result, the final size of our library for one of the platform types (`armeabi-v7a`,` arm64-v8a`, `x86`,` x86_64`) will be **24-26 MB** less than indicated in the documentation

### How do I change the language (how do I add new locale support)?

There is no special language switching mechanism in the Video Editor SDK.

Out of the box, the VE SDK supports `English` locale. If you need to support any other locales, you can do it according to the standard Android way.
See how [Create locale directories and resource files](https://developer.android.com/training/basics/supporting-devices/languages#CreateDirs) for more details.
After adding a new locale resource file into your application with integrated VE SDK,
you need to re-define the VE SDK strings keys with new locale string values.
To do that you need to add all needed string keys in the new locale `strings.xml` file.
The newly added locale will be applied after the device language is changed by system settings.

If you need to change language programmatically in your application, see the next links how it can be done:
[one](https://www.geeksforgeeks.org/how-to-change-the-whole-app-language-in-android-programmatically/),
[two](https://medium.com/swlh/android-app-specific-language-change-programmatically-using-kotlin-d650a5392220)

### How do I use the Video Editor several times from different entry points?

Before you want to use VideoEditor again, you need to release ```Video Editor SDK```: 

```kotlin
private fun releaseVideoEditor() {
    releaseUtilityManager()
    stopKoin()
    videoEditor = null
}

private fun releaseUtilityManager() {
    val utilityManager = try {
        getKoin().getOrNull<EditorUtilityManager>()
    } catch (e: InstanceCreationException) {
        Log.w(TAG, "EditorUtilityManager was not initialized!", e)
        null
    }

    utilityManager?.release()
}
```

```EditorUtilityManager``` is NULL when the token is expired or revoked.

### I want to change icons and name for effects.

Effect customization is implemented by android resources with well-defined names which follow a strict scheme.

| Customization | Resource type | Resource name template | Example
| :---: | :---: | :---: | :---: |
| Title | string | visual_effect_\{id\}, time_effect_\{id\} | visual_effect_flash
| Icon | drawable | ic_visual_effect_\{id\}, ic_time_effect_\{id\} | ic_time_effect_rapid
| Color | color | visual_effect_color_\{id\}, time_effect_color_\{id\} | visual_effect_color_vhs

To change appearance o the effect, you should place any android resources named according to the scheme presented above into res folder of your app. The resource depends on the item you want to customize (string for the title, drawable for the icon, color for the color on the timeline).

Effects identifiers are presented in the table below:

| Effect      | Type | String identifier | Default icon |
| :---------- | :---:| :--------------:  | :----------: |
| Acid-whip | visual | acid_whip|  
| Cathode | visual | cathode |  
| Flash | visual | flash |  
| Glitch | visual | glitch |  
| Glitch 2 | visual | glitch2 |  
| Glitch 3 | visual | glitch3 |  
| Heat map | visual | heat_map |  
| DSLR Kaleidoscope | visual | dslr_kaleidoscope |  
| Kaleidoscope | visual | kaleidoscope |  
| Lumiere | visual | lumiere |  
| Pixel dynamic | visual | pixel_dynamic |  
| Pixel static | visual | pixel_static |  
| Polaroid | visual | polaroid |  
| Rave | visual | rave |  
| Soul | visual | soul |  
| Stars | visual | stars |  
| Transition 1 | visual | transition1 |  
| Transition 2 | visual | transition2 |  
| Transition 3 | visual | transition3 |  
| Transition 4 | visual | transition4 |  
| TV Foam | visual | tv_foam |  
| DV Cam | visual | dv_cam |  
| VHS | visual | vhs |  
| VHS 2 | visual | vhs2 |  
| Zoom | visual | zoom |  
| Zoom 2 | visual | zoom2 |  
| Slow mo | time | slow_motion |  
| Rapid | time | rapid |  

For example, to change the title of ```Flash``` visual effect to ```SuperFlash``` add it in  ```strings.xml``` in your app.
```xml
<string name="visual_effect_flash">SuperFlash</string>
```

You can change the color on the timeline for any visual effect. For example, for ```VHS```  you should add color resource with the name ```visual_effect_color_vhs``` into ```colors.xml``` file in your app.

### I want to change the order of masks, video effects or filters.

The SDK allows to reorder masks and filters in the way you need. To achieve this, create a class ```CustomColorFilterOrderProvider``` and implement ```OrderProvider```:

```kotlin
class CustomColorFilterOrderProvider : OrderProvider {
    override fun provide() = listOf(
        "egypt",
        "byers",
        "chile",
        "hyla",
        "new_zeland",
        "korben",
        "canada",
        "remy",
        "england",
        "retro",
        "norway",
        "neon",
        "japan",
        "instant",
        "lux",
        "sunset",
        "bubblegum",
        "chroma",
        "lilac",
        "pinkvine",
        "spark",
        "sunny",
        "vinyl",
        "glitch",
        "grunge"
    )
}
```

:::important
These are names of specific color filters located in ```assets/bnb-resources/luts```.  
:::

Next, use ```CustomColorFilterOrderProvider``` in [VideoEditorModule](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/java/com/banuba/example/integrationapp/VideoEditorModule.kt#L60)

```kotlin
single<OrderProvider>(named("colorFilterOrderProvider")) {
    CustomColorFilterOrderProvider()
}
```

### Is it possible to disable the transition effects?

Transitions are visual effects applying to the segue between two videos. They are provided with the Banuba Video Editor SDK **by default**.

To disable or enable transitions, set the `supportsTransitions` flag in the `EditorConfig` class to false or true respectively:

``` kotlin
single <EditorConfig>{
    EditorConfig(supportsTransitions = false)
}
```

:::important
Transition effects are not being played if the closest video (either to the left or to the right of the transition icon) is very short.
:::

### How can I convert one or several still images to a video programmatically?

If you would like to create a video from the images instances without opening the Video Editor, you can use the methods from the ```Utils``` object in the [GitHub Sample](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/java/com/banuba/example/integrationapp/Utils.kt#L72-L131).

### How to change the style appearance of the SDK?

Extend ```VideoCreationTheme``` style to customize Video Editor appearance for your app.

```xml
<style name="CustomIntegrationAppTheme" parent="VideoCreationTheme">
...
</style>
```

Specify your style in ```AndroidManifest.xml``` file for ```VideoCreationActivity```.

```xml
<activity
    android:name="com.banuba.sdk.ve.flow.VideoCreationActivity"
    android:screenOrientation="portrait"
    android:theme="@style/CustomIntegrationAppTheme"
    android:windowSoftInputMode="adjustResize"
    tools:replace="android:theme" />
```

[GitHub example](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/res/values/themes.xml)

### Is it possible to disable the Trim screen?

It is possible to turn off the trimmer screen after the camera screen.

The trimmer screen will still be accessible after importing media files from the gallery.

To disable it, just change the `supportsTrimRecordedVideo` property to `false` in the `EditorConfig`:

``` kotlin
single <EditorConfig>{
    EditorConfig(supportsTrimRecordedVideo = false)
}
```

### How to change the video scaling on the editor screen?

Yon can change video scaling on the editor screen while playback by providing ```PlayerScaleType``` [VideoEditorModule](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/java/com/banuba/example/integrationapp/VideoEditorModule.kt#L60). To ensure that the video will be fully shown - use ```CENTER_INSIDE``` (keep in mind that if device and video resolutions are different black lines will appear), to fill the screen - use ```FIT_SCREEN_HEIGHT``` (it fills the screen only if video has aspect ratio 9:16)

``` kotlin
factory<PlayerScaleType>(named("editorVideoScaleType"), override = true) {
     PlayerScaleType.CENTER_INSIDE
}
```

The default value is ```PlayerScaleType.FIT_SCREEN_HEIGHT```.

### How to collect logs when I encounter an issue?

If you encounter a crash or other issue and are unsure how to provide logs to the support team, please refer to the official Android documentation on how to capture a bug report:

[https://developer.android.com/studio/debug/bug-report](https://developer.android.com/studio/debug/bug-report)

After following the instructions, please send the generated bug report file to the [support team](https://www.banuba.com/support) for further investigation.

### FFmpeg build issue
Below are the steps to resolve the issue while building the project.
1. Add the ```android.bundle.enableUncompressedNativeLibs=false``` in the ```gradle.properties```

``` properties
android.bundle.enableUncompressedNativeLibs=false
```

2. Add ```android:extractNativeLibs="true"``` in ```AndroidManifest.xml``` file
``` xml
<application
    ...
    android:extractNativeLibs="true"
    ...
>
```

### How to integrate custom FFmpeg dependency.
Check out [step-by-step guide](ffmpeg.md) to integrate custom FFmpeg dependency.
