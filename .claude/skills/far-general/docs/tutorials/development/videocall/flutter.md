# flutter

Due to **Flutter** limitations, for every videocall solution you have to create a **native Flutter plugin**. We have developed one for integration with [Agora](https://docs.agora.io). It is expected that you will develop your own [Flutter plugin](https://docs.flutter.dev/packages-and-plugins/developing-packages) if **Agora** isn't suitable for you.

We have created [Agora Extension](https://docs.agora.io/en/video-calling/develop/use-an-extension?platform=flutter) which is accessible from **Flutter**.

[The sample](https://github.com/Banuba/banuba-agora-flutter-sdk) described below is a fork of [Flutter plugin of Agora](https://github.com/AgoraIO-Extensions/Agora-Flutter-SDK). Follow the instructions in `README.md` to run it.

These are the general steps to integrate the sample code into your app:

* Android
* iOS

1. Add the **Client Token** and extension properties keys constants

example/lib/examples/basic/join\_channel\_video/join\_channel\_video.dart

```dart
const banubaClientToken = <#Place client tokwn here#>;

const banubaExtprovider = 'Banuba';
const banubaExtension = 'BanubaFilter';
const loadEffect = 'load_effect';
const unloadEffect = 'unload_effect';
const setEffectsPath = 'set_effects_path';
const setToken = 'set_banuba_license_token';
const evalJs = 'eval_js';
```

![Icon](/img/icons/github.svg "GitHub")

2. Add common methods to interact with **Banuba extension**

example/lib/examples/basic/join\_channel\_video/join\_channel\_video.dart

```dart
/*
   * Banuba integration
   */

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

![Icon](/img/icons/github.svg "GitHub")

3. Initialize **Banuba** and load an **effect**

example/lib/examples/basic/join\_channel\_video/join\_channel\_video.dart

```dart
await intiBanuba();

    await _engine.enableVideo();
    await _engine.startPreview();

    await loadBanubaEffect('Glasses');
```

![Icon](/img/icons/github.svg "GitHub")

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

![Icon](/img/icons/github.svg "GitHub")

6. Add **Banuba dependencies** and prepare a task to copy effects into app

example/android/app/build.gradle

```groovy
dependencies {
    def devFile = project.file("${rootProject.projectDir.getParentFile().parentFile}/android/.plugin_dev")
    if (devFile.exists()) {
        implementation fileTree(dir: "${rootProject.projectDir.getParentFile().parentFile}/android/libs", include: ["*.aar"])
    }
    implementation "org.jetbrains.kotlin:kotlin-stdlib-jdk7:$kotlin_version"

    implementation "com.banuba.sdk:banuba_sdk:1.17.+"
    implementation 'com.banuba.sdk.android:agora-extension:1.5.+'
}

// Add the lines below to copy effects into App:
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

![Icon](/img/icons/github.svg "GitHub")

1. Add **Client Token** and extension properties keys constants

example/lib/examples/basic/join\_channel\_video/join\_channel\_video.dart

```dart
const banubaClientToken = <#Place client tokwn here#>;

const banubaExtprovider = 'Banuba';
const banubaExtension = 'BanubaFilter';
const loadEffect = 'load_effect';
const unloadEffect = 'unload_effect';
const setEffectsPath = 'set_effects_path';
const setToken = 'set_banuba_license_token';
const evalJs = 'eval_js';
```

![Icon](/img/icons/github.svg "GitHub")

2. Add common methods to interact with **Banuba extension**

example/lib/examples/basic/join\_channel\_video/join\_channel\_video.dart

```dart
/*
   * Banuba integration
   */

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

![Icon](/img/icons/github.svg "GitHub")

3. Initialize **Banuba** and load an **effect**

example/lib/examples/basic/join\_channel\_video/join\_channel\_video.dart

```dart
await intiBanuba();

    await _engine.enableVideo();
    await _engine.startPreview();

    await loadBanubaEffect('Glasses');
```

![Icon](/img/icons/github.svg "GitHub")

4. Copy effects in [`assets/effects`](https://github.com/Banuba/banuba-agora-flutter-sdk/tree/main/example/assets/effects) folder

5. Add Banuba dependencies to `Podfile`

example/ios/Podfile

```Podfile
pod 'BanubaSdk', '1.17.4', :source => 'https://github.com/sdk-banuba/banuba-sdk-podspecs.git'
  pod 'BanubaFiltersAgoraExtension', '2.5.0', :source => 'https://github.com/sdk-banuba/banuba-sdk-podspecs.git'
```

![Icon](/img/icons/github.svg "GitHub")

6. Add the `effects` folder added earlier into your project. Link it with your app: add the folder into `Runner` **Xcode** project (`File` -> `Add Files to 'Runner'...`).
