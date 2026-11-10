# Integration Guide on Flutter

> Integration Guide on Flutter

# Integration Guide on Flutter

This guide helps to complete full Photo Editor SDK integration.

## Import it
Use in your Dart code

``` dart
import 'package:pe_sdk_flutter/pe_sdk_flutter.dart';
```

## Configuration

### Android

#### Update gradle files

:::important
if your project supports [Flutter Gradle plugin](https://docs.flutter.dev/release/breaking-changes/flutter-gradle-plugin-apply#androidsettings-gradle).
:::

Update your [project gradle](https://github.com/Banuba/ve-sdk-flutter/blob/master/example/android/build.gradle#L1) with the following code:

```
buildscript {
    ext.kotlin_version = '2.1.0'
    repositories {
        google()
        mavenCentral()
    }

    dependencies {
        classpath 'com.android.tools.build:gradle:8.1.2'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
    }
}
```

### IOS

#### Add specs to Podfile

Add the following specs at the top of your [Podfile](https://github.com/Banuba/ve-sdk-flutter/blob/master/example/ios/Podfile)

```
platform :ios, '15.0'

source 'https://cdn.cocoapods.org/'
source 'https://github.com/Banuba/specs.git'
source 'https://github.com/sdk-banuba/banuba-sdk-podspecs.git'
```

#### Add permissions

Specify the required iOS permissions used by the SDK in your [Info.plist](https://github.com/Banuba/ve-sdk-flutter/blob/master/example/ios/Runner/Info.plist)
```
<key>NSPhotoLibraryUsageDescription</key>
<string>This app requires access to the photo library.</string>
```

## Limit processor architectures on Android
Banuba Photo Editor on Android supports the following processor architectures - ```arm64-v8a```, ```armeabi-v7a```, ```x86-64```.
Please keep in mind that each architecture adds extra MBs to your app.
To reduce the app size you can filter architectures in your ```app/build.gradle file```.

```groovy
...
defaultConfig {
    ...
    // Use only ARM processors
    ndk {
        abiFilters 'armeabi-v7a', 'arm64-v8a'
    }
}
```
