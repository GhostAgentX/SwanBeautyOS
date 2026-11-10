# Face AR and AR Cloud products on Android

> Face AR and AR Cloud products on Android

# Face AR and AR Cloud products on Android

[Banuba Face AR SDK](https://www.banuba.com/facear-sdk/face-filters) product is used on camera and editor screens for applying various AR effects while making video content.

## Overview
Any Face AR effect is a folder that includes a number of files required for Face AR SDK to play this effect.

:::tip
Make sure ```preview.png``` file is included in effect folder. You can use this file as a preview for AR effect.
:::

## Integrate Face AR

:::info
```Banuba Face AR SDK``` integration is included in the [Github sample](https://github.com/Banuba/ve-sdk-android-integration-sample).
:::

Follow next steps to integrate ```Banuba Face AR SDK``` into your project.  
First, add Gradle ```com.banuba.sdk:effect-player-adapter``` dependency in [app gradle file](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/build.gradle#L74).

```diff
    def banubaSdkVersion = '1.53.2'
    ...
    // highlight-add-next-line
+   implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
    ...
```

Add ```BanubaEffectPlayerKoinModule().module``` in the [VideoEditorModule](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/java/com/banuba/example/integrationapp/VideoEditorModule.kt#L40)
```diff
startKoin {
    androidContext(this@IntegrationApp)    
    modules(
        ...
        // highlight-add-next-line
+       BanubaEffectPlayerKoinModule().module
    )
}
```

## Add and Manage effects
There are 3 options for adding and managing AR effects:
1. Store all effects in [assets/bnb-resources/effects](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/assets/bnb-resources/effects) folder in the app.
2. Store color effects in [assets/bnb-resources/luts](https://github.com/Banuba/ve-sdk-android-integration-sample/tree/main/app/src/main/assets/bnb-resources/luts) folder in the app.
3. Use [AR Cloud](https://www.banuba.com/faq/what-is-ar-cloud) for storing effects on a server.

:::tip 
You can use both options i.e. store just a few AR effects in ```assets``` and 100 or more AR effects  on ```AR Cloud```.
:::

## Integrate AR Cloud
```AR Cloud``` is a cloud solution for storing Banuba Face AR effects on the server and used by Face AR and Video Editor products.  
Any AR effect downloaded from ```AR Cloud``` is cached on the user's device.

Follow next steps to integrate ```AR Cloud``` into your project.  
First, add Gradle ```com.banuba.sdk:ar-cloud``` dependency in [app gradle file](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/build.gradle).

```diff
    def banubaSdkVersion = '1.53.2'
    ...
    // highlight-add-next-line
+   implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
    ...
```

Next, add ```ArCloudKoinModule``` module to [Koin modules](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/java/com/banuba/example/integrationapp/VideoEditorModule.kt#L67).
```diff
startKoin {
   ...
   
   modules(
      VeSdkKoinModule().module,
      ...
      // highlight-add-next-line
+     ArCloudKoinModule().module,
      ...
   )
}
```

Next, override ```ArEffectsRepositoryProvider``` in [VideoEditorModule](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/java/com/banuba/example/integrationapp/VideoEditorModule.kt#L91).

```kotlin
   single<ArEffectsRepositoryProvider>(createdAtStart = true) {
      ArEffectsRepositoryProvider(
         arEffectsRepository = get(named("backendArEffectsRepository")),
         ioDispatcher = get(named("ioDispatcher"))
      )
    }
```

## Change order effects
By default, all AR effects are listed in alphabetical order. AR effects from ```assets``` are listed in order.

Create new class ```CustomMaskOrderProvider``` and implement ```OrderProvider``` to provide custom order.

```kotlin
class CustomMaskOrderProvider : OrderProvider {
    override fun provide(): List<String> = listOf("Background", "HeadphoneMusic")
}
```
:::info  
These are names of specific directories in ```assets/bnb-resources/effects``` or on ```AR Cloud```.
:::

Next, use ```CustomMaskOrderProvider``` in [VideoEditorModule](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/java/com/banuba/example/integrationapp/VideoEditorModule.kt#L75)
```kotlin
single<OrderProvider>(named("maskOrderProvider")) {
   CustomMaskOrderProvider()
}
```

## Disable Face AR SDK
Video Editor SDK can be used without Face AR SDK.

Remove ```BanubaEffectPlayerKoinModule().module``` from [VideoEditorModule](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/java/com/banuba/example/integrationapp/VideoEditorModule.kt#L62)
```diff
startKoin {
    androidContext(this@IntegrationApp)    
    modules(
        ...
        // highlight-remove-next-line
-       BanubaEffectPlayerKoinModule().module
    )
}
```
and remove Gradle dependency ```com.banuba.sdk:effect-player-adapter```
```diff
    ...
    // highlight-remove-next-line
-   implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
    ...
```
