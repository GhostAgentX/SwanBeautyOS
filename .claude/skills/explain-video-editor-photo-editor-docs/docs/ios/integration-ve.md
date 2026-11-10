# Integration Video Editor on iOS

> Integration Video Editor on iOS

# Integration Video Editor on iOS

## Installation

### CocoaPods
:::warning
CocoaPods version 1.12.1 or newer is required. Check your version with pod --version and upgrade if needed.
:::

To integrate the Video Editor SDK via CocoaPods:

The List of the required Video Editor dependencies is present in the sample project's [Podfile](https://github.com/Banuba/ve-sdk-ios-integration-sample/blob/main/Example/Podfile).

Complete the following steps to get the Video Editor SDK dependencies using CocoaPods:
1. Install CocoaPods (if not already installed) using Homebrew:

```sh
brew install cocoapods
```

2. Initialize CocoaPods in your project folder:
```sh
pod init
```

3. Add sources and pods to your Podfile:

```ruby
source 'https://cdn.cocoapods.org/'
source 'https://github.com/Banuba/specs.git'
source 'https://github.com/sdk-banuba/banuba-sdk-podspecs.git'

banuba_sdk_version = '1.53.2'
banuba_face_ar_sdk_version = '1.53.1'

pod 'BanubaVideoEditorSDK', banuba_sdk_version
pod 'BanubaSDKSimple', banuba_face_ar_sdk_version
pod 'BanubaSDK', banuba_face_ar_sdk_version
pod 'BanubaARCloudSDK', banuba_sdk_version      # optional
pod 'BanubaAudioBrowserSDK', banuba_sdk_version # optional
```
4. Install the pods:

```sh
pod install --repo-update
```

5. Open the generated ```.xcworkspace``` in Xcode and run the project.

### Swift Package Manager

Learn the [SPM Getting Started Guide](https://developer.apple.com/documentation/swift_packages/adding_package_dependencies_to_your_app) if you are new to SPM.

SPM integration is available in the [spm branch](https://github.com/Banuba/ve-sdk-ios-integration-sample/tree/spm).

:::note
The following guide is compatible with the VE SDK v1.31.3 and newer. If you are looking for a way to install v1.31.2 or older with SPM, please, visit the [legacy docs](https://github.com/Banuba/ve-sdk-ios-integration-sample/blob/main/mdDocs/quickstart.md#spm)
:::

Complete the following steps to get the Video Editor SDK dependencies using SPM:

1. open `App project`  and navigate to the `Package Dependencies` tab;
2. for every package that needs to be installed click the `plus` button and type its repo url;
3. choose `Exact Version` and type the newest SDK version.

Check out the [Mandatory modules](./mandatory-modules.md) guide to learn more about the modules included in the Video Editor SDK and their compatibility with the Face AR SDK.

## Info.plist Updates

Add the iOS permissions required by the SDK (camera, microphone, photo library, media library) to your [Info.plist](https://github.com/Banuba/ve-sdk-ios-integration-sample/blob/main/Example/Example/Info.plist):

```xml
<key>NSAppleMusicUsageDescription</key>
<string>This app requires access to the media library</string>
<key>NSCameraUsageDescription</key>
<string>This app requires access to the camera.</string>
<key>NSMicrophoneUsageDescription</key>
<string>This app requires access to the microphone.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app requires access to the photo library.</string>
```

## Localization

Add [English Localized Strings](https://github.com/Banuba/ve-sdk-ios-integration-sample/blob/main/Example/Example/en.lproj/Localizable.strings) file to the project.

## Video Editor Module Setup
Custom behavior of Video Editor SDK in your app is implemented by using a number of configuration classes in the SDK.

First, create new class [VideoEditorModule](https://github.com/Banuba/ve-sdk-ios-integration-sample/blob/main/Example/Example/VideoEditorModule.swift) for implementing configurations.
```swift
class VideoEditorModule {
  
}
```
Next, create ```VideoEditorConfig``` for implementing custom video editor configurations.
```swift
class VideoEditorModule {
  func createConfiguration() -> VideoEditorConfig {
      var config = VideoEditorConfig()
      ...
      return config
  }
}
```

## Launch
Create instance of ```BanubaVideoEditor```  by using the license token.
```swift
let videoEditorSDK = BanubaVideoEditor(
      token: AppDelegate.licenseToken,
      configuration: config,
      externalViewControllerFactory: viewControllerFactory
    )
```
```videoEditorSDK``` is ```nil``` when the license token is incorrect i.e. empty, truncated.
If ```videoEditorSDK``` is not ```nil``` you can proceed and start video editor.

Check your license state before starting video editor:
```swift
videoEditorSDK?.getLicenseState(completion: { [weak self] isValid in
      if isValid {
        print("✅ License is active, all good")
      } else {
        print("❌ License is either revoked or expired")
      }
      ...
      completion(isValid)
    })
```
:::warning
Video content unavailable screen will appear if you start Video Editor SDK with revoked or expired license.
:::

The [implementation](https://github.com/Banuba/ve-sdk-ios-integration-sample/blob/main/Example/Example/ViewController.swift#L45) below starts Video Editor from camera screen.
```swift
 let cameraLaunchConfig = VideoEditorLaunchConfig(
        entryPoint: .camera,
        hostController: self,
        musicTrack: nil, // Paste a music track as a track preset at the camera screen to record video with music
        animated: true
)

videoEditorModule.presentVideoEditor(with: cameraLaunchConfig)
```

## Implement export

The Video Editor SDK can export multiple files at once.
To set up export:

1. Make an ExportConfiguration object. Add one or more ExportVideoConfiguration objects to it. Each one stands for a video or audio file.

2. Call BanubaVideoEditor.export() and pass your ExportConfiguration to start.

Check the [export implementation](https://github.com/Banuba/ve-sdk-ios-integration-sample/blob/main/Example/Example/ViewController.swift#L250) in the sample.

Read the [Export integration guide](https://docs.banuba.com/ve-pe-sdk/docs/ios/guide_export) for more details.
