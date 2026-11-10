# Getting Started

## Get the client token[​](#get-the-client-token "Direct link to Get the client token")

To start working with **Banuba SDK** in your project, you need to have a client token. To receive it, please fill in the [form on banuba.com](https://www.banuba.com/face-filters-sdk), or contact us via <info@banuba.com>.

* iOS
* Android
* Web
* Flutter
* ReactNative
* Desktop

## Installation[​](#installation "Direct link to Installation")

1. Add [BanubaSdk SPM packages](/tutorials/development/installation.md?ios-packages=spm#spm-packages) into your project

info

Details about the **SPM** and **CocoaPods** packages see in [Installation](/tutorials/development/installation.md).

## Integration[​](#integration "Direct link to Integration")

1. Setup `banubaClientToken`

common/common/AppDelegate.swift

```
loading...
```

![Icon](/img/icons/github.svg "GitHub")

2. Initialize `BanubaSdkManager`

common/common/AppDelegate.swift

```
loading...
```

![Icon](/img/icons/github.svg "GitHub")

3. Create `Player` and `load` the effect

camera/camera/ViewController.swift

```
loading...
```

![Icon](/img/icons/github.svg "GitHub")

4. Run the application! 🎉 🚀 💅

tip

See more use cases and code samples in the [GitHub repo](https://github.com/Banuba/banuba-sdk-ios-samples).

## Installation[​](#installation "Direct link to Installation")

To get started, add the **Banuba SDK** packages to your project.

Add the custom maven repo to your `build.gradle.kts`:

camera/settings.gradle.kts

```
loading...
```

![Icon](/img/icons/github.svg "GitHub")

And add the dependency on **Banuba SDK** package to your `build.gradle.kts`:

common/build.gradle.kts

```
loading...
```

![Icon](/img/icons/github.svg "GitHub")

info

Details about the packages see in [Installation](/tutorials/development/installation.md).

## Integration[​](#integration "Direct link to Integration")

camera/src/main/java/com/banuba/sdk/example/camera/MainActivity.kt

```
loading...
```

![Icon](/img/icons/github.svg "GitHub")

## Requirements[​](#requirements "Direct link to Requirements")

* [Nodejs](https://nodejs.org/en/) installed
* Browser with [WebGL 2.0](https://caniuse.com/#feat=webgl2) and higher

## Integration[​](#integration "Direct link to Integration")

1. Setup the client token

BanubaClientToken.js

```
loading...
```

![Icon](/img/icons/github.svg "GitHub")

2. Import the required types from the [@banuba/webar](https://www.npmjs.com/package/@banuba/webar) NPM package

index.html

```
loading...
```

![Icon](/img/icons/github.svg "GitHub")

info

See the details about the NPM package in [Installation](/tutorials/development/installation.md).

3. Initialize `Player` and apply the `Effect`

index.html

```
loading...
```

![Icon](/img/icons/github.svg "GitHub")

index.html

```
loading...
```

![Icon](/img/icons/github.svg "GitHub")

index.html

```
loading...
```

![Icon](/img/icons/github.svg "GitHub")

4. Run a local web server from a terminal inside the folder

```
npx live-server
```

5. Open [localhost:8080](http://localhost:8080) and start clicking 🎉 🚀 💅

tip

Follow the instructions of the demo app [README.md](https://github.com/Banuba/quickstart-web/blob/master/README.md) to get more info.

note

The demo app leverages [jsDelivr](https://jsdelivr.com/) CDN for ease of getting started, for a real life application please use the [@banuba/webar](https://www.npmjs.com/package/@banuba/webar) npm package.

[Banuba SDK](https://pub.dev/packages/banuba_sdk) for [Flutter](https://docs.flutter.dev/) is available for iOS and Android and provides the following functionality:

* Load and interact with any Effect (including the `Makeup` effect).
* Still image processing.
* Interaction with Camera (open/close, take photo, flashlight control, facing).
* Screen recording.
* [Videocall](/tutorials/development/videocall.md) powered by [Agora](https://docs.agora.io/).

If this is not enough, you should go with native integration.

## Integration guide[​](#integration-guide "Direct link to Integration guide")

* Android
* iOS

1. Add `banuba_sdk` plugin:

```
flutter pub add banuba_sdk
```

2. Add code from [the basic sample](https://github.com/Banuba/banuba-sdk-flutter/blob/master/example/lib/main.dart) into your app. Don't forget to `initialize` `BanubaSdkManager` with the Client Token:

example/lib/main.dart

```
loading...
```

![Icon](/img/icons/github.svg "GitHub")

3. Add `effects` folder into your project. Link it with your app: add the following code into app `build.gradle`.

example/android/app/build.gradle

```
loading...
```

![Icon](/img/icons/github.svg "GitHub")

1. Add `banuba_sdk` plugin:

```
flutter pub add banuba_sdk
```

2. Link to **Banuba SDK** podspecs in `ios/Podfile`:

```
source 'https://github.com/sdk-banuba/banuba-sdk-podspecs.git'
```

3. Add code from [the basic sample](https://github.com/Banuba/banuba-sdk-flutter/blob/master/example/lib/main.dart) into your app. Don't forget to `initialize` `BanubaSdkManager` with the Client Token:

example/lib/main.dart

```
loading...
```

![Icon](/img/icons/github.svg "GitHub")

4. Add `effects` folder into your project. Link it with your app: add the
   <br />
   <!-- -->
   folder into `Runner` **Xcode** project (`File` -> `Add Files to 'Runner'...`).

[Banuba SDK](https://www.npmjs.com/package/@banuba/react-native) for [React Native](https://reactnative.dev/) available for iOS and Android and provides the following functionality:

* Load and interact with any Effect (including `Makeup` effect).
* Interaction with camera (open/close).
* Screen recording (screenshots and video).
* [Videocall](/tutorials/development/videocall.md) powered by [Agora](https://docs.agora.io/).

If this is not enough, you should go with native integration.

## Integration guide[​](#integration-guide "Direct link to Integration guide")

* Android
* iOS

1. Add `@banuba/react-native` dependency

```
yarn add @banuba/react-native
```

2. Add our **Maven repository**

example/android/build.gradle

```
loading...
```

![Icon](/img/icons/github.svg "GitHub")

3. Add [`effects` folder](https://github.com/Banuba/banuba-sdk-react-native/tree/master/example/effects) and add a task to copy them into app

example/android/app/build.gradle

```
loading...
```

![Icon](/img/icons/github.svg "GitHub")

4. Copy code from [this file](https://github.com/Banuba/banuba-sdk-react-native/blob/master/example/src/App.tsx) into your app. Don't forget to intialize the SDK with the Client Token

example/src/App.tsx

```
loading...
```

![Icon](/img/icons/github.svg "GitHub")

1. Add `@banuba/react-native` dependency

```
yarn add @banuba/react-native
```

2. Add our podspecs repo to your `Podfile`

example/ios/Podfile

```
loading...
```

![Icon](/img/icons/github.svg "GitHub")

3. Add [`effects` folder](https://github.com/Banuba/banuba-sdk-react-native/tree/master/example/effects) and link it to Xcode project: `(File -> Add Files to ...)`

4. Copy code from [this file](https://github.com/Banuba/banuba-sdk-react-native/blob/master/example/src/App.tsx) into your app. Don't forget to intialize the SDK with the Client Token

example/src/App.tsx

```
loading...
```

![Icon](/img/icons/github.svg "GitHub")

The steps below apply to desktop integration (**Windows** and/or **macOS**) with **C++**.

1. Download **Banuba SDK** binaries [from GitHub](https://github.com/Banuba/FaceAR-SDK-desktop-releases).

2. Integrate libraries downloaded on the previous step into your build system. If you use **CMake**, consider our [quickstart-desktop-cpp](https://github.com/Banuba/quickstart-desktop-cpp) sample.

for Windows

Besides the **Banuba SDK** itself, you will require third party libraries from the `bin` folder.

3. Create rendering context or copy and paste into your project [ready-to-use helpers](https://github.com/Banuba/quickstart-desktop-cpp/tree/master/helpers/src) sources based on [GLFW](https://www.glfw.org/)

4. Setup `BNB_CLIENT_TOKEN`

helpers/src/BanubaClientToken.hpp

```
loading...
```

![Icon](/img/icons/github.svg "GitHub")

5. Initialize **Banuba SDK** with the **Client Token** and path to resources from the archive with the binaries. Create `Player`, `Camera`, `Input` and `Output` and load the **effect**.

realtime-camera-preview/main.cpp

```
loading...
```

![Icon](/img/icons/github.svg "GitHub")

6. Run the application! 🎉 🚀 💅

info

The **effects** are also resources, you may initialize **Banuba SDK** with several resource paths (one for effects and one for SDK assets).

for macOS

Resources for **MacOS** are inside `BanubaEffectPlayer.xcframework`.

Still have questions about FaceAR SDK?

Visit our [FAQ](https://www.banuba.com/faq/) or [contact our support](/support/.md).
