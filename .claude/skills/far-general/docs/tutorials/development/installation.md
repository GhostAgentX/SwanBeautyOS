# Adding Banuba SDK to your project

* iOS
* Android
* Web
* Desktop

- CocoaPods
- Swift Package Manager

## CocoaPods packages[​](#cocoapods-packages "Direct link to CocoaPods packages")

To start using **Banuba SDK** with [**CocoaPods**](https://guides.cocoapods.org/using/using-cocoapods.html), add a **custom repository** and desired **packages** to your `Podfile`:

Podfile

```
platform :ios, '13.0'

source 'https://github.com/CocoaPods/Specs.git'
source 'https://github.com/sdk-banuba/banuba-sdk-podspecs.git'

target 'quickstart-ios-objc' do
  use_frameworks!
  pod 'BanubaSdk', '> 1'
end
```

![Icon](/img/icons/github.svg "GitHub")

Then install pods:

```
pod install --repo-update
```

See [banuba-sdk-podspecs](https://github.com/sdk-banuba/banuba-sdk-podspecs) repo for the list of all available packages and versions.

The complete example, configured for **CocoaPods** usage, can be found in our [Objective-C](https://github.com/Banuba/quickstart-ios-objc) quickstart example.

## SPM packages[​](#spm-packages "Direct link to SPM packages")

**Banuba SDK** provides [Swift Package Manager](https://www.swift.org/package-manager/) packages in the custom repositories.

Add **Banuba SDK** packages, to your Xcode project:

1. **File** > **Add Package Dependencies...**
2. Search for the package, for example <https://github.com/sdk-banuba/BNBSdkApi>
3. Press the **Add Package** button. After verifying the package, press **Add Package** again.

See the [sdk-banuba](https://github.com/sdk-banuba?tab=repositories\&q=swift+package\&type=\&language=\&sort=) repositories for the list of all available packages and versions.

The complete example, configured for **SPM** usage, can be found in our [Beauty-iOS](https://github.com/Banuba/banuba-sdk-ios-samples) quickstart example.

## How to choose required packages[​](#how-to-choose-required-packages "Direct link to How to choose required packages")

warning

Only use the packages with the same version! Packages with different versions (even minor) may conflict or work incorrectly with each other.

tip

If **feature** or **effect** works incorrect, see application **logs**, to figure out which package is missed.

Add packages depends on the specific **features** or **effects**, which your app will use. It is your responsibility to include everything required for the desired behaviour.<br /><!-- -->See detailed [packages description](#list-of-all-available-packages) in the table below.

Example of the packages set for [Face Tracking](/tutorials/capabilities/glossary.md#frx-face-tracking) and [Background Separation](/tutorials/capabilities/glossary.md#background-separation):

* BNBSdkApi
* BNBFaceTracker
* BNBBackground

See detailed [packages description](#list-of-all-available-packages) in the table below.

## List of all available packages[​](#list-of-all-available-packages "Direct link to List of all available packages")

| Package name          | Description                                                                                                                                                                                                                        |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BNBSdkApi             | platform-specific API, like `Player`, `Input`, `Output`, etc                                                                                                                                                                       |
| BNBSdkCore            | provides the functionality of the native `EffectPlayer`.                                                                                                                                                                           |
| BNBEffectPlayer       | contains the necessary shaders, used by `sdk_core` package and provides the following features: math utilities, texture utilities, morphing, beautification, etc.                                                                  |
| BNBScripting          | includes the basic functionality used by the effect api, see [Effects](/effects/overview.md).                                                                                                                                      |
| BNBFaceTracker        | package consists of neural network models used to track face and its features: lips, eyes, etc. Include it whenever you deal with tracking. See more about [Face Tracking](/tutorials/capabilities/glossary.md#frx-face-tracking). |
| BNBFaceAttributes     | package consists of neural network models used to extract face attributes: skin color, gender, face shape etc.                                                                                                                     |
| BNBFaceMatch          | package provides facilities to measure how faces are similar on two photos                                                                                                                                                         |
| BNBMakeup             | provides prefabs for [Makeup](/effects/prefabs/makeup.md).                                                                                                                                                                         |
| BNBLips               | provides neural network models for lips segmentation. See more about [Lips Segmentation](/tutorials/capabilities/glossary.md#lips-segmentation).                                                                                   |
| BNBHair               | provides neural network models for hair segmentation. See more about [Hair Segmentation](/tutorials/capabilities/glossary.md#hair-segmentation).                                                                                   |
| BNBHands              | provides neural network models for hand, nail, and finger segmentation.                                                                                                                                                            |
| BNBEyes               | provides neural network models for eyes segmentation. See more about [Eye Segmentation](/tutorials/capabilities/glossary.md#eye-segmentation).                                                                                     |
| BNBSkin               | provides neural network models for skin segmentation. See more about [Skin Segmentation](/tutorials/capabilities/glossary.md#skin-segmentation).                                                                                   |
| BNBBackground         | provides neural network models for background separation. See more about [Background Separation](/tutorials/capabilities/glossary.md#background-separation).                                                                       |
| BNBBody               | provides neural network model to recognize the human body in full and separate it from the background in images and videos.                                                                                                        |
| BNBAcneEyebagsRemoval | provides neural network models for acne removal and eye bag removal.                                                                                                                                                               |
| BNBNeck               | provides neural network models for neck segmentation.                                                                                                                                                                              |
| BNBResources          | includes all the resources of the all packages. **Use it when you don't care about the size or you need all the features!**                                                                                                        |
| BNBPoseEstimation     | private                                                                                                                                                                                                                            |
| BanubaSdk             | depends on the all the packages for the operation of all available features. **Use it when you don't care about the size or you need all the features!**                                                                           |

## Packages[​](#packages "Direct link to Packages")

**Maven**

To start using **Banuba SDK** , add a custom maven repo to your `build.gradle.kts`:

build.gradle.kts

```
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

![Icon](/img/icons/github.svg "GitHub")

Refer to our [Maven](https://nexus.banuba.net/#browse/browse:maven-releases) to find the list of all available packages and their versions.

## How to choose required packages[​](#how-to-choose-required-packages "Direct link to How to choose required packages")

warning

Use only the packages with the same version! Packages with different versions (even minor) may conflict or work incorrectly with each other.

tip

If **feature** or **effect** works incorrect, see application **logs**, to figure out which package is missed.

Add packages depends on the specific **features** or **effects**, which your app will use. It is your responsibility to include everything required for the desired behaviour.<br /><!-- -->See detailed [packages description](#list-of-all-available-packages) in the table below.

build.gradle.kts

```
loading...
```

![Icon](/img/icons/github.svg "GitHub")

## List of all available packages[​](#list-of-all-available-packages "Direct link to List of all available packages")

| Package name                          | Description                                                                                                                                                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| com.banuba.sdk.sdk\_api               | platform-specific APIs, like `Player`, `Input`, `Output`, etc.                                                                                                                                                     |
| com.banuba.sdk.sdk\_core              | provides the functionality of the native `EffectPlayer`.                                                                                                                                                           |
| com.banuba.sdk.effect\_player         | contains the necessary shaders, used by `sdk_core` package and provides the following features: math utilities, texture utilities, morphing, beautification, etc.                                                  |
| com.banuba.sdk.scripting              | includes the basic functionality used by the effect api, see [Effects](/effects/overview.md).                                                                                                                      |
| com.banuba.sdk.face\_tracker          | consists of neural network models used to track a face and its features: lips, eyes, etc. Include it whenever you deal with tracking. See more about [FRX](/tutorials/capabilities/glossary.md#frx-face-tracking). |
| com.banuba.sdk.face\_attributes       | package consists of neural network models used to extract face attributes: skin color, gender, face shape etc.                                                                                                     |
| com.banuba.sdk.face\_match            | package provides facilities to measure how faces are similar on two photos                                                                                                                                         |
| com.banuba.sdk.makeup                 | provides prefabs for [Makeup](/effects/prefabs/makeup.md).                                                                                                                                                         |
| com.banuba.sdk.lips                   | provides neural network models for lips segmentation. See more about [Lips Segmentation](/tutorials/capabilities/glossary.md#lips-segmentation).                                                                   |
| com.banuba.sdk.hair                   | provides neural network models for hair segmentation. See more about [Hair Segmentation](/tutorials/capabilities/glossary.md#hair-segmentation).                                                                   |
| com.banuba.sdk.hands                  | provides neural network models for hand, nail, and finger segmentation.                                                                                                                                            |
| com.banuba.sdk.eyes                   | provides neural network models for eyes segmentation. See more about [Eye Segmentation](/tutorials/capabilities/glossary.md#eye-segmentation).                                                                     |
| com.banuba.sdk.skin                   | provides neural network models for skin segmentation. See more about [Skin Segmentation](/tutorials/capabilities/glossary.md#skin-segmentation).                                                                   |
| com.banuba.sdk.background             | provides neural network models for background separation. See more about [Background Separation](/tutorials/capabilities/glossary.md#background-separation).                                                       |
| com.banuba.sdk.body                   | provides neural network model to recognize the human body in full and separate it from the background in images and videos.                                                                                        |
| com.banuba.sdk.acne\_eyebags\_removal | provides neural network models for acne removal and eye bag removal.                                                                                                                                               |
| com.banuba.sdk.neck                   | provides neural network models for neck segmentation.                                                                                                                                                              |
| com.banuba.sdk.banuba\_sdk\_resources | includes all the resources of the all packages. **Use it when you don't care about the size or you need all the features!**                                                                                        |
| com.banuba.sdk.pose\_estimation       | private                                                                                                                                                                                                            |
| com.banuba.sdk.banuba\_sdk            | depends on the all the packages for the operation of all available features. **Use it when you don't care about the size or you need all the features!**                                                           |

## NPM Package[​](#npm-package "Direct link to NPM Package")

**[Banuba WebAR](https://www.npmjs.com/package/@banuba/webar)** is delivered as an NPM package, which includes executables (`.js`, `.wasm`, `.simd.wasm`) and resources modules (`modules/*.zip`).

```
npm i @banuba/webar
```

## Resources Modules[​](#resources-modules "Direct link to Resources Modules")

| Module name                | Description                                                                                                                                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| face\_tracker.zip          | consists of neural network models used to track a face and its features: lips, eyes, etc. Include it whenever you deal with tracking. See more about [FRX](/tutorials/capabilities/glossary.md#frx-face-tracking). |
| face\_attributes.zip       | package consists of neural network models used to extract face attributes: skin color, gender, face shape etc.                                                                                                     |
| face\_match.zip            | package provides facilities to measure how faces are similar on two photos                                                                                                                                         |
| makeup.zip                 | provides prefabs for [Makeup](/effects/prefabs/makeup.md).                                                                                                                                                         |
| lips.zip                   | provides neural network models for lips segmentation. See more about [Lips Segmentation](/tutorials/capabilities/glossary.md#lips-segmentation).                                                                   |
| hair.zip                   | provides neural network models for hair segmentation. See more about [Hair Segmentation](/tutorials/capabilities/glossary.md#hair-segmentation).                                                                   |
| hands.zip                  | provides neural network models for hand, nail, and finger segmentation.                                                                                                                                            |
| eyes.zip                   | provides neural network models for eyes segmentation. See more about [Eye Segmentation](/tutorials/capabilities/glossary.md#eye-segmentation).                                                                     |
| skin.zip                   | provides neural network models for skin segmentation. See more about [Skin Segmentation](/tutorials/capabilities/glossary.md#skin-segmentation).                                                                   |
| background.zip             | provides neural network models for background separation. See more about [Background Separation](/tutorials/capabilities/glossary.md#background-separation).                                                       |
| body.zip                   | provides neural network model to recognize the human body in full and separate it from the background in images and videos.                                                                                        |
| acne\_eyebags\_removal.zip | provides neural network models for acne removal and eye bag removal.                                                                                                                                               |
| neck.zip                   | provides neural network models for neck segmentation.                                                                                                                                                              |
| pose\_estimation.zip       | private                                                                                                                                                                                                            |

## Bundlers[​](#bundlers "Direct link to Bundlers")

**[Banuba WebAR](https://www.npmjs.com/package/@banuba/webar)** depends on `BanubaSDK.data` and `BanubaSDK.wasm` (or `BanubaSDK.simd.wasm` if you are targeting [SIMD](/tutorials/development/guides/optimization.md#speed-up-webar-sdk-on-modern-browsers)) files. By default the SDK expects these files to be accessible from the application root i.e. by the `/BanubaSDK.data`, `/BanubaSDK.wasm` `/BanubaSDK.simd.wasm` links. It must be taken into consideration when working with application bundlers like [Vite](https://vitejs.dev/), [Rollup](https://rollupjs.org/guide/en/) or [Webpack](https://webpack.js.org/).

Generally speaking one should be able to put `BanubaSDK.data`, `BanubaSDK.wasm` and `BanubaSDK.simd.wasm` files into the application assets folder (usually `public/`) and get the SDK loading these files properly.

But you may want to place the files somewhere else, that case the [locateFile](/generated/typedoc/types/SDKOptions.html) property of the [Player.create()](/generated/typedoc/classes/Player.html#create) method should help you to set-up SDK properly.

* Vite
* Rollup
* Webpack

### Vite[​](#vite "Direct link to Vite")

```
import { Player, Module /* ... */ } from "@banuba/webar"
// vite uses special ?url syntax to import files as URLs
import data from "@banuba/webar/BanubaSDK.data?url"
import wasm from "@banuba/webar/BanubaSDK.wasm?url"
import simd from "@banuba/webar/BanubaSDK.simd.wasm?url"

import FaceTracker from "@banuba/webar/face_tracker.zip?url"
import Background from "@banuba/webar/background.zip?url"

// ...

const player = await Player.create({
  clientToken: "xxx-xxx-xxx",
  // point BanubaSDK where to find these vital files
  locateFile: {
    "BanubaSDK.data": data,
    "BanubaSDK.wasm": wasm,
    "BanubaSDK.simd.wasm": simd,
  },
})

await player.addModule(new Module(FaceTracker), new Module(Background))

// ...
```

tip

See Vite [Explicit URL imports](https://vitejs.dev/guide/assets.html#explicit-url-imports) docs for details.

### Rollup[​](#rollup "Direct link to Rollup")

```
import { Player, Module /* ... */ } from "@banuba/webar"
// you need to set-up @rollup/plugin-url for the import syntax to work
import data from "@banuba/webar/BanubaSDK.data"
import wasm from "@banuba/webar/BanubaSDK.wasm"
import simd from "@banuba/webar/BanubaSDK.simd.wasm"

import FaceTracker from "@banuba/webar/face_tracker.zip"
import Background from "@banuba/webar/background.zip"

// ...

const player = await Player.create({
  clientToken: "xxx-xxx-xxx",
  // point BanubaSDK where to find these vital files
  locateFile: {
    "BanubaSDK.data": data,
    "BanubaSDK.wasm": wasm,
    "BanubaSDK.simd.wasm": simd,
  },
})

await player.addModule(new Module(FaceTracker), new Module(Background))

// ...
```

tip

See [@rollup/plugin-url](https://www.npmjs.com/package/@rollup/plugin-url#include) docs for details.

### Webpack[​](#webpack "Direct link to Webpack")

Depending on the version of **Webpack** used, you may have to add following rule to the `module.rules` section of the `webpack.config.js`:

```
module.exports = {
  module: {
    rules: [
      // ...
      {
        test: /\.wasm$/,
        type: 'javascript/auto',
        loader: 'file-loader',
      },
      // ...
    ],
    },
  },
}
```

Now import of `.wasm` files as URLs should work properly:

```
import { Player, Module /* ... */ } from "@banuba/webar"
import data from "@banuba/webar/BanubaSDK.data"
import wasm from "@banuba/webar/BanubaSDK.wasm"
import simd from "@banuba/webar/BanubaSDK.simd.wasm"

import FaceTracker from "@banuba/webar/face_tracker.zip"
import Background from "@banuba/webar/background.zip"

// ...

const player = await Player.create({
  clientToken: "xxx-xxx-xxx",
  // point BanubaSDK where to find these vital files
  locateFile: {
    "BanubaSDK.data": data,
    "BanubaSDK.wasm": wasm,
    "BanubaSDK.simd.wasm": simd,
  },
})

await player.addModule(new Module(FaceTracker), new Module(Background))

// ...
```

info

See the related [Webpack issue](https://github.com/webpack/webpack/issues/7352) for details.

**Banuba SDK** for desktop platforms (i.e. **Windows** and **MacOS**) is distributed via [GitHub Releases](https://github.com/Banuba/FaceAR-SDK-desktop-releases/releases).

Release archives for **Windows** are packed in `.zip` (`bnd_sdk.zip`), for **MacOS** in `.tar.gz` (`bnb_sdk.tar.gz`).

Archives for **Windows** and **MacOS** contains identical C++ API, **MacOS** archive also contains **Objective-C** API identical to **iOS**. As usual, **Objecive-C** API is designed to be callable from **Swift**.

Still have questions about FaceAR SDK?

Visit our [FAQ](https://www.banuba.com/faq/) or [contact our support](/support/.md).
