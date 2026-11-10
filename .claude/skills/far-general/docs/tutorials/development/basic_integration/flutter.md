# Flutter

[Banuba SDK](https://pub.dev/packages/banuba_sdk) for [Flutter](https://docs.flutter.dev/) is available for iOS and Android and provides the following functionality:

* Load and interact with any Effect (including the `Makeup` effect).
* Still image processing.
* Interaction with Camera (open/close, take photo, flashlight control, facing).
* Screen recording.
* Video calls via Agora — requires a **separate fork** [banuba-agora-flutter-sdk](https://github.com/Banuba/banuba-agora-flutter-sdk), not part of `banuba_sdk`.

If this is not enough, you should go with native integration.

## Integration guide

### 1. Add the SDK package

```bash
flutter pub add banuba_sdk
```

### 2. Android - `android/app/build.gradle`

```groovy
android {
    defaultConfig {
        minSdkVersion 26
        ndk { abiFilters 'armeabi-v7a', 'arm64-v8a' }
    }
}

dependencies {
    implementation "com.banuba.sdk:face_tracker:$project.bnb_sdk_version"
    implementation "com.banuba.sdk:background:$project.bnb_sdk_version"
}

task copyEffects {
    copy {
        from flutter.source + '/effects'
        into 'src/main/assets/bnb-resources/effects'
    }
}

gradle.projectsEvaluated {
    preBuild.dependsOn(copyEffects)
}
```

### 3. iOS - `ios/Podfile`

Add the Banuba source before the CocoaPods CDN source:

```ruby
source 'https://github.com/sdk-banuba/banuba-sdk-podspecs.git'
source 'https://github.com/CocoaPods/Specs.git'
$bnb_sdk_version = '~> 1.18.0'
```

Then run:
```bash
cd ios && pod install && cd ..
```

### 4. `lib/main.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:async';
import 'dart:io';
import 'package:permission_handler/permission_handler.dart';
import 'package:banuba_sdk/banuba_sdk.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> with WidgetsBindingObserver {
  final _banubaSdkManager = BanubaSdkManager();
  final _epWidget = EffectPlayerWidget(key: null);

  @override
  void initState() {
    super.initState();
    initPlatformState();
  }

  Future<void> initPlatformState() async {
    await _banubaSdkManager.initialize(
        [], '<#Place your token here#>', SeverityLevel.info);

    if (!mounted) return;
    setState(() {});

    requestPermissions().then((granted) {
      if (granted) {
        openCamera();
      } else {
        SystemNavigator.pop();
      }
    });
  }

  Future<void> openCamera() async {
    await _banubaSdkManager.openCamera();
    await _banubaSdkManager.attachWidget(_epWidget.banubaId);
    await _banubaSdkManager.startPlayer();
    await _banubaSdkManager.loadEffect('effects/TrollGrandma', false);
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(home: _epWidget);
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _banubaSdkManager.startPlayer();
    } else {
      _banubaSdkManager.stopPlayer();
    }
  }
}

Future<bool> requestPermissions() async {
  final perms = [Permission.camera, Permission.microphone];
  for (final p in perms) {
    if (!await p.isGranted && !await p.request().isGranted) return false;
  }
  return true;
}
```

### 5. Effects folder

Place `effects/` at the Flutter project root (sibling of `lib/`). The Gradle `copyEffects` task copies it into Android assets automatically. For iOS, add the folder to the Xcode `Runner` project (`File → Add Files to 'Runner'...`).
