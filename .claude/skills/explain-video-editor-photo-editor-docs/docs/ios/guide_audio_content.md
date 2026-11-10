# Audio content on iOS

> Audio content on iOS

# Audio content on iOS

Guide to integrating and customizing audio providers in Video Editor SDK.

## Overview
Audio content is the key part of making an awesome video.

The Video Editor SDK can play, trim, merge and add audio content to a video.

:::info
1. Banuba does not deliver audio content for the Video Editor SDK.
2. The Video Editor can apply audio files stored on the device. The SDK is not responsible for downloading audio content except for [Soundstripe](https://www.soundstripe.com/) and [Banuba Music](#connect-banuba-music).
3. Video Editor SDK supports only one music provider per launch.
:::

There are 2 approaches to using audio content:
1. ```AudioBrowser``` - a specific module and set of screens that include the built-in support of browsing and applying audio content within the Video Editor. The user does not leave the SDK while using audio.
2. ```External API``` - the client implements a specific API for managing audio content. The user leaves the SDK and is taken to an app screen when audio is requested.

## Audio Browser
Audio Browser is a specific iOS module that allows to browse, play and apply audio content within the Video Editor.  
It supports 3 sources for audio content:

1. ```Banuba Music``` - includes build in integration with Banuba Music,
2. ```Soundstripe``` - includes the built-in integration with the [Soundstripe](https://www.soundstripe.com/) API,
3. ```My Library``` - includes audio content available on the user's device.

Add the dependency below into your [Podfile](https://github.com/Banuba/ve-sdk-ios-integration-sample/blob/main/Example/Podfile#L16) to integrate ```AudioBrowser```:
```swift
pod 'BanubaAudioBrowserSDK', banuba_sdk_version
```

If you are using Swift Package Manager, please, visit the [SPM integration guide](./integration-ve.md#swift-package-manager).

## Connect Banuba Music

Over 35 GB of royalty-free tracks available from within the Video Editor SDK. Your users could check them out through an inbuilt music browser and legally include them in their content.

:::info
The feature is not activated by default.  
Please contact Banuba representatives to know more about using this feature.
:::

&nbsp;

Use ```BanubaMusicProvider``` implementation in [VideoEditorModule](https://github.com/Banuba/ve-sdk-ios-integration-sample/blob/main/Example/Example/VideoEditorModule.swift#L81):

```Swift
AudioBrowserConfig.shared.musicSource = .banubaMusic
```

## Connect Soundstripe
[Soundstripe](https://www.soundstripe.com/) is a service for providing the best audio tracks for creating video content. Your users will be able to add audio tracks while recording or editing video content.
:::info
The feature is not activated by default.  
Please, contact Banuba representatives to know more about using this feature.
:::

&nbsp;
&nbsp;

Set the ```.soundstripe``` source in the ```AudioBrowserConfig``` configuration to enable ```Soundstripe```. For example, in [VideoEditorModule](https://github.com/Banuba/ve-sdk-ios-integration-sample/blob/main/Example/Example/VideoEditorModule.swift#L81):
```Swift
AudioBrowserConfig.shared.musicSource = .soundstripe
```

## Connect My Library

```My Library``` is a default implementation in ```AudioBrowser``` . It allows a user to apply audio that is available on the device.  

Set the ```.localStorageWithMyFiles``` source in the ```AudioBrowserConfig``` configuration to enable ```My Library```. For example, in [VideoEditorModule](https://github.com/Banuba/ve-sdk-ios-integration-sample/blob/main/Example/Example/VideoEditorModule.swift#L100):

```Swift
AudioBrowserConfig.shared.musicSource = .localStorageWithMyFiles
```

## Connect External API
The Video Editor includes a special API for integrating your custom audio content provider and applying this content to the Video Editor.   
The user will be taken to your app's specific screen when audio is requested on the Video Editor screen i.e. the camera or editor.
Next, once the user picks audio content on your app screen, you need to follow API and return the user to the Video Editor.  
Any audio file should be stored on the device before applying.

To pass audio content to the Video Editor you need to implement a factory that conforms to the `MusicEditorExternalViewControllerFactory` protocol.
And put it to the `musicEditorFactory` property in `ExternalViewControllerFactory`.
Your factory should implement the following methods:

```swift
protocol MusicEditorExternalViewControllerFactory: AnyObject {
  /// contoller which will be used for presenting otherwise makeTrackSelectionViewController will be used
  var audioBrowserController: TrackSelectionViewController? { get set }

  /// should returns controller which provides audio content for Video Editor SDK
  /// - selectedAudioItem is currently selected audio item
  func makeTrackSelectionViewController(selectedAudioItem: AudioItem?) -> TrackSelectionViewController?
  /// should returns controller which provides effects audio content for Video Editor SDK
  /// Note: MainMusicViewControllerConfig should contains editButton with type .effect
  func makeEffectSelectionViewController(selectedAudioItem: AudioItem?) -> EffectSelectionViewController?
  /// should returns view for countdown animation in record button at music editor
  func makeRecorderCountdownAnimatableView() -> MusicEditorCountdownAnimatableView?
}
```
where `AudioItem` is an entity which includes information about the selected audio item in the Video Editor:
```swift
// MARK: - AudioItem protocol
protocol AudioItem {
  var uuid: UUID { get }
  var url: URL { get }
  var coverURL: URL? { get }
  var title: String? { get set }
  var additionalTitle: String? { get set }
  /// True - display track with which the video was recorded and allow users to edit it.
  /// False - track will be playing but not displayed.
  var isEditable: Bool { get set }
}
```

Your custom audio browser implementation should conform to the `TrackSelectionViewController` protocol:
```swift
class YourCustomAudioBrowser: UIViewController, TrackSelectionViewController {
  weak var trackSelectionDelegate: TrackSelectionViewControllerDelegate?
}
```
Using `trackSelectionDelegate` you can notify the Video Editor about actions in the audio browser with the following methods:
```swift
protocol TrackSelectionViewControllerDelegate: AnyObject {
  func trackSelectionViewController(
    viewController: TrackSelectionViewController,
    didSelectFile url: URL,
    coverURL: URL?,
    timeRange: CMTimeRange?,
    isEditable: Bool,
    title: String,
    additionalTitle: String?,
    uuid: UUID
  )
  
  func trackSelectionViewControllerDidCancel(
    viewController: TrackSelectionViewController
  )
  
  func trackSelectionViewControllerDiscardCurrentTrack(
    viewController: TrackSelectionViewController
  )
}
```

## Connect Apple Music

You can pass music from Apple Music to the Video Editor SDK.  
You should export media to a temporary directory and then
pass the music url to the Video Editor SDK using `trackSelectionDelegate`.  

In this sample, we show how to implement it:
```swift
let asset = AVURLAsset(url: url)
let destination = FileManager.default
  .temporaryDirectory
  .appendingPathComponent("\(NSUUID().uuidString).caf")
let exportSession = AVAssetExportSession(asset: asset, presetName: AVAssetExportPresetPassthrough)
exportSession?.outputURL = destination
exportSession?.outputFileType = AVFileType.caf
exportSession?.exportAsynchronously() {
  if let error = exportSession?.error {
    completion(nil, error as NSError)
  } else {
    completion(destination, nil)
  }
}
```
To present your custom audio browser in the Video Editor you need to set the created `ExternalViewControllerFactory` to [externalViewControllerFactory](https://github.com/Banuba/ve-sdk-ios-integration-sample/blob/main/Example/Example/VideoEditorModule.swift#L29).
