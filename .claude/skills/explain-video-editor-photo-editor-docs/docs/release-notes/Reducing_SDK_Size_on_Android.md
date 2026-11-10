# **Reducing SDK Size on Android**

### Overview
This document describes how to reduce the size of Video Editor and Photo Editor SDKs in your app bundle by integrating with cut resources. Download and place these resources at runtime.
### Implementation
All changes are available in [PullRequest](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/284)
1. Upgrade to the latest SDK builds. Additionally exclude a number of dependencies in `com.banuba.sdk:effect-player-adapter`
```Kotlin

    def banubaSdkVersion = '1.51.0'
    implementation "com.banuba.sdk:ffmpeg:5.1.3"
    implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
    implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
    implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
    implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
    implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
    implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
    implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
    implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
    implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"

    implementation ("com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}") {
        // As a result only sdk_core, sdk_api will be used
        exclude group: 'com.banuba.sdk', module: 'scripting'
        exclude group: 'com.banuba.sdk', module: 'face_tracker'
        exclude group: 'com.banuba.sdk', module: 'effect_player'
        exclude group: 'com.banuba.sdk', module: 'skin'
        exclude group: 'com.banuba.sdk', module: 'eyes'
        exclude group: 'com.banuba.sdk', module: 'lips'
        exclude group: 'com.banuba.sdk', module: 'hair'
        exclude group: 'com.banuba.sdk', module: 'background'
        exclude group: 'com.banuba.sdk', module: 'occlusion'
        exclude group: 'com.banuba.sdk', module: 'visual_clip'
        exclude group: 'com.banuba.sdk', module: 'correctors'
        exclude group: 'com.banuba.sdk', module: 'makeup'
        exclude group: 'com.banuba.sdk', module: 'brows'
        exclude group: 'com.banuba.sdk', module: 'banuba_sdk_resources'
    }

    implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
    implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
    implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
    implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"

  
    def banubaPESdkVersion = '1.3.5'
    implementation("com.banuba.sdk:pe-sdk:${banubaPESdkVersion}")
```
1. Exclude the main Photo Editor effect from Android assets in the main build. Otherwise, the effect will be bundled into your APK from the SDK. This effect is also included in `bnb-resources.zip `
```Kotlin
 aaptOptions {
        ignoreAssetsPattern "!photo_editor"
    }
```
1. Put `bnb-resources.zip` file to your server. This file contains Face AR resources and Photo Editor adapted to VE SDK 1.51ю0
bnb-resources.zip

1. Request extracting resources for Video Editor SDK by using new config in Video Editor Koin module
```Kotlin
val module = module {
       ...

     single(named("extractExternalResources")) { true }
 }
```
1. Request extract resources for Photo Editor SDK by using new property in PhotoEditorConfig. And pass this config in start method.
```Kotlin
 val extras = Bundle().apply {
	 putBoolean(PhotoCreationActivity.EXTRA_EXTRACT_EXTERNAL_RESOURCES, true)
 }
 // Start Photo Editor SDK
 startPhotoEditor(
		 PhotoCreationActivity.startFromGallery(
	     this@MainActivity,
       extras = extras
     )
 )
```
1. In app runtime download `bnb-resources.zip` and put it to `data/data/$package/files` dir. See screenshot.

![](https://prod-files-secure.s3.us-west-2.amazonaws.com/3e459574-fd13-4256-9979-b2d0064ec916/926dc7cb-3578-41a9-b519-7154765570ad/Screenshot_2024-10-15_at_3.17.12_PM.png)
> 💡 
You can Upload this file to `data/data/$package/files`  manually in Device Explorer for testing purposes.

> ❗ 
IMPORTANT : Launch the SDK only when `bnb-resources.zip` is in `data/data/$package/files` . Zip file will be extracted by SDK