# AR Cloud Guide

AR Cloud is a client-server solution that helps to save space in your application. This is a product used to store AR filters on a server instead of in the SDK code. After being selected by the user for the first time, the filter is going to be downloaded from the server and then saved on the phone's memory.

* iOS
* Android
* Flutter

[Example of using AR cloud](https://github.com/Banuba/arcloud-ios-swift)

<br />

<br />

**Banuba AR Cloud SDK** delivery solution includes the `BanubaARCloudSDK.xcframework` with `BanubaUtilities.xcframework` libraries that should be placed into [Frameworks folder](https://github.com/Banuba/arcloud-ios-swift/tree/master/Frameworks) directory or added as an [SPM](https://www.swift.org/package-manager/) dependecies to your project.

You can find these libraries here: [BanubaARCloudSDK.xcframework](https://github.com/Banuba/BanubaARCloudSDK-IOS), [BanubaUtilities.xcframework](https://github.com/Banuba/BanubaUtilities-iOS)

## Follow these steps to integrate AR Cloud:[​](#follow-these-steps-to-integrate-ar-cloud "Direct link to Follow these steps to integrate AR Cloud:")

1. Set up `banubaArCloudURL`

arcloud-ios-swift/BanubaClientToken.swift

```
loading...
```

![Icon](/img/icons/github.svg "GitHub")

2. Initialize **Banuba AR Cloud SDK**

arcloud-ios-swift/ARCloud/ARCloudManager.swift

```
loading...
```

![Icon](/img/icons/github.svg "GitHub")

3. Fetch the available effects list using the `getAREffects` method

arcloud-ios-swift/ARCloud/ARCloudManager.swift

```
loading...
```

![Icon](/img/icons/github.svg "GitHub")

4. Download the effect, using the `downloadArEffect` method

arcloud-ios-swift/ARCloud/ARCloudManager.swift

```
loading...
```

![Icon](/img/icons/github.svg "GitHub")

[Example of using AR cloud](https://github.com/Banuba/arcloud-android-kotlin/)

<br />

<br />

## Follow these steps to configure AR Cloud:[​](#follow-these-steps-to-configure-ar-cloud "Direct link to Follow these steps to configure AR Cloud:")

## Installation of the ArCloud library[​](#installation-of-the-arcloud-library "Direct link to Installation of the ArCloud library")

To start using **Banuba SDK** with **ArCloud** from GitHub Packages, add a custom maven repo to your `build.gradle`:

build.gradle

```
loading...
```

![Icon](/img/icons/github.svg "GitHub")

Add the `ar-cloud` dependency to your build.gradle:

effect\_player\_arcloud\_example/build.gradle

```
loading...
```

![Icon](/img/icons/github.svg "GitHub")

### Initialization of the ArCloudKoinModule module in Koin[​](#initialization-of-the-arcloudkoinmodule-module-in-koin "Direct link to Initialization of the ArCloudKoinModule module in Koin")

**Koin** - this is a framework to help you build any kind of Kotlin & Kotlin Multiplatform application, from Android mobile and Multiplatform apps to backend Ktor server applications. You can read more about **Koin** [here](https://insert-koin.io/).

In this example, we use **Koin** for dependency injection.

effect\_player\_arcloud\_example/src/main/java/com/banuba/sdk/example/effect\_player\_arcloud\_example/Application.kt

```
loading...
```

![Icon](/img/icons/github.svg "GitHub")

note

`ArCloudKoinModule` is the AR Cloud module which should be initialized and placed before `MainKoinModule`.

`MainKoinModule` is the **Koin** module which should be implemented in your application. It is required for configuring AR Cloud dependencies.

### Configuring of AR Cloud dependencies in DI layer[​](#configuring-of-ar-cloud-dependencies-in-di-layer "Direct link to Configuring of AR Cloud dependencies in DI layer")

[MainKoinModule.kt](https://github.com/Banuba/arcloud-android-kotlin/blob/master/effect_player_arcloud_example/src/main/java/com/banuba/sdk/example/effect_player_arcloud_example/arcloud/MainKoinModule.kt)

effect\_player\_arcloud\_example/src/main/java/com/banuba/sdk/example/effect\_player\_arcloud\_example/Application.kt

```
loading...
```

![Icon](/img/icons/github.svg "GitHub")

These are additional important classes:

* [ArCloudMasksActivity](https://github.com/Banuba/arcloud-android-kotlin/blob/master/effect_player_arcloud_example/src/main/java/com/banuba/sdk/example/effect_player_arcloud_example/arcloud/ArCloudMasksActivity.kt) - this is the main UI module that configures `Player` with dependent UI components.
* [EffectWrapper](https://github.com/Banuba/arcloud-android-kotlin/blob/master/effect_player_arcloud_example/src/main/java/com/banuba/sdk/example/effect_player_arcloud_example/arcloud/EffectWrapper.kt) - this is a data class that wraps an effect taken from an **AR cloud**.
* [EffectsAdapter](https://github.com/Banuba/arcloud-android-kotlin/blob/master/effect_player_arcloud_example/src/main/java/com/banuba/sdk/example/effect_player_arcloud_example/arcloud/EffectsAdapter.kt) - this is an adapter for the RecyclerView component used to populate effects data.
* [EffectsViewModel](https://github.com/Banuba/arcloud-android-kotlin/blob/master/effect_player_arcloud_example/src/main/java/com/banuba/sdk/example/effect_player_arcloud_example/arcloud/EffectsViewModel.kt) - the [ViewModel](https://developer.android.com/topic/libraries/architecture/viewmodel) component which is responsible for loading and providing the effect data.

You can use all classes mentioned above as examples or implement your own solution.

Usage of this feature is described on the [ARCloud plugin page on Flutter Pub](https://pub.dev/packages/banuba_arcloud).

Real **examples** can be found in [quickstart-flutter-plugin](https://github.com/Banuba/quickstart-flutter-plugin/blob/master/lib/page_arcloud.dart) and the source code of **Banuba** [arcloud-flutter](https://github.com/Banuba/arcloud-flutter/tree/master/example).

Still have questions about FaceAR SDK?

Visit our [FAQ](https://www.banuba.com/faq/) or [contact our support](/support/.md).
