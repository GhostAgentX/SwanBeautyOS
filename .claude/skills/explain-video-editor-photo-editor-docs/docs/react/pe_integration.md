# Integration Guide on React Native

> Integration Guide on React Native

# Integration Guide on React Native

This guide helps to complete full Photo Editor SDK integration.

## Configuration

### IOS

:::important
Please make sure Bridge Header file exits in ios folder.
:::

#### Add specs to Podfile

Add the following specs at the top of your [Podfile](https://github.com/Banuba/pe-sdk-react-native/blob/master/example/ios/Podfile)
```
platform :ios, '15.0'
source 'https://github.com/CocoaPods/Specs.git'
source 'https://github.com/Banuba/specs.git'
source 'https://github.com/sdk-banuba/banuba-sdk-podspecs.git'
```

#### Add permissions

Specify the required iOS permissions used by the SDK in your [Info.plist](https://github.com/Banuba/pe-sdk-react-native/blob/master/example/ios/PeSdkReactNativeExample/Info.plist)
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
