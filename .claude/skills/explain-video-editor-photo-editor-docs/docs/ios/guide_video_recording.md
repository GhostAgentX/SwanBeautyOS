# Video recording integration guide on iOS

> Video recording integration guide on iOS

# Video recording integration guide on iOS

Guide to modifying video recording feature in Video Editor SDK.

## Quality details
The subsequent table describes video quality details used for video recording in various resolutions with h264 codec.
If h265 (HEVC) codec is used for recording a video, the values listed below will be reduced by approximately 34%:

| Recording speed            | 360p(360 x 640) | 480p(480 x 854) | 540p(540 x 960) |  HD(720 x 1280) | FHD(1080 x 1920) | QHD(2560 x 1440) | 4K(3860 x 2160) |
| -------------------------- | --------------- | --------------- | --------------- | --------------- | ---------------- | ---------------- | --------------- |
| 0.5x, 1x (Default), 2x, 3x | 1.2 Mbits       | 2 Mbits         | 2.4 Mbits       | 3.6 Mbits       | 5.8 Mbits        | 16 Mbits         | 36 Mbits        |

## Implement configurations
`VideoEditorConfig` is the core class used for customizing all features in the Video Editor SDK.
The class includes many internal config classes that are very useful if you want to create your custom experience.  

`RecorderConfiguration` is the main configuration class in `VideoEditorConfig` and is used for the video recording functionality:

| Property |               Values                | Description |
| ------------- |:-----------------------------------:| :------------- |
| videoResolution |    VideoResolutionConfiguration     | defines the resolution configuration for a video recording
| loopAudioWhileRecording |      Bool; Default  `true`      | defines if the audio used in the video recording should be looped
| isDynamicMusicTitle |      Bool; Default `false`      | defines if the music title on the screen changes when a new track is applied
| isDefaultFrontCamera |      Bool; Default `false`      | set `true` if you want to open camera in the front mode
| useHEVCCodecIfPossible |      Bool; Default `true`       | enables H265 codec for recording if it is available on the device
| isPhotoSequenceAnimationEnabled |      Bool; Default `false`      | should use animation for photo sequences
| isAudioRateEqualsVideoSpeed |      Bool; Default `false`      | the video speed selected by the user is applied to audio
| isGalleryButtonHidden |      Bool; Default `false`      | defines if the gallery button located in the bottom-right should be hidden. `true` will hide the button 
| supportMultiRecords |      Bool; Default `true`       | defines if the user can record multiple video files
| takeAudioDurationAsMaximum | Bool; Default `false` | limits the maximum length of a video recording to match the duration of the audio used in the recording 

The next very handy config class is `VideoEditorDurationConfig` that is responsible for customizing video recording durations:

:::warning

All values are in seconds.

:::

| Property |                           Values                            | Description |
| ------------- |:-----------------------------------------------------------:| :------------- |
| maximumVideoDuration |            TimeInterval > 0; Default `120.0`            | the maximum allowed video duration
| videoDurations | [TimeInterval] not empty; Default  `[60.0, 30.0, 15.0]` | the array of durations allowed for the video recording. The user sees a certain button and can change the duration by tapping. For example,  `60.0` means that the user can record multiple video sources with the total duration no more than `60.0` seconds.
| minimumDurationFromCamera |             TimeInterval > 0; Default `3.0`             | the minimum allowed video duration required to proceed and open the next screen
| minimumDurationFromGallery |             TimeInterval > 0; Default `0.3`             | the minimum allowed video duration displayed on the gallery screen
| minimumVideoDuration |             TimeInterval > 0; Default `1.0`             | the minimum allowed video source duration that can be recorded on the camera screen
| minimumTrimmedPartDuration |             TimeInterval > 0; Default `0.3`             | the minimum allowed video source duration to trim
| slideshowDuration |             TimeInterval > 0; Default `0.3`             | the slideshow video duration produced by an image

In this example, the maximum video recording duration is set to 30 seconds:
```swift
var config = VideoEditorConfig()
config.videoDurationConfiguration.maximumVideoDuration = 30.0
```

And `FeatureConfiguration` that helps to customize the use of some specific features on the camera screen where the 
video recording happens:

| Property |          Values           | Description |
| ------------- |:-------------------------:| :------------- |
| isDoubleTapForToggleCameraEnabled | Bool; Default `false` | enables switching between the front and the back camera facing by double tapping on the camera screen
| isMuteCameraAudioEnabled | Bool; Default `false` | indicates if the "mute microphone" button is visible on the camera screen   
| isSpeedBarEnabled | Bool; Default `true`  | enables the speed selection bar. If the bar is disabled, the speed recording will be interactively switched by tapping
| openAutomaticallyPIPSettingsDropdown | Bool; Default `false` | if this property is enabled, the PiP settings drop down view will be presented after opening the camera screen

## Configure the microphone state
The `RecorderConfiguration` class includes the `muteMicrophoneForPIP` property you can use to mute the sound in the PIP mode. The default value is `true`:

```swift
var config = VideoEditorConfig()
config.recorderConfiguration.muteMicrophoneForPIP = false
```

## Configure recording modes
The recording includes 3 modes for recording content implemented in `captureButtonModes` in the `RecorderConfiguration` class:
- `Photo`,
- `Video`,
- `Photo` and `Video` - **default**.

In this example, the recording mode is set to `Video` only:
```swift
var config = VideoEditorConfig()
config.recorderConfiguration.captureButtonModes = [.video]
```

## Configure the record button appearance

The record button is the main UI control on the camera screen which you can fully customize along with the animation that is played by tapping.

Implement the `RecordButtonProvider`, `RecordButton`, `RecordButtonDelegate` protocols to create your custom recording button experience:

```swift
public protocol RecordButtonProvider {
  func getButton() -> RecordButton
}

public protocol RecordButton: UIView {
  var delegate: RecordButtonDelegate? { get set }
  var configuration: RecordButtonConfiguration? { get set }
  func changeViewToIdleState()
  func changeViewToRecordingState()
}

public protocol RecordButtonDelegate: AnyObject {
  var captureButtonMode: CaptureButtonViewMode { get }
  func recordButtonDidTakePhoto(_ recordButton: RecordButton)
  func recordButtonDidCancelTakePhoto(_ recordButton: RecordButton)
  func recordButtonDidStartVideoRecording(_ recordButton: RecordButton)
  func recordButtonDidStopVideoRecording(_ recordButton: RecordButton)
  func recordButtonDidZoomingVideoRecording(_ recordButton: RecordButton, recognizer: UILongPressGestureRecognizer)
}
``` 
Set the new implementation of `RecordButtonProvider` to `RecorderConfiguration.recordButtonProvider`:
```swift
var config = VideoEditorConfig()
config.recorderConfiguration.recordButtonProvider = ...
```

## Picture in Picture

Picture in Picture, or `PIP`, is a video editing technique that lets you overlay two videos in the same video.
The multi-layer editing effect is perfect for reaction videos, slideshows, product demos, and more. This feature is similar to the TikTok duet feature.

&nbsp;

:::warning

The feature is disabled by default and can be enabled if the license supports it. Please, ask Banuba business representatives to include this feature into your license.

:::

The subsequent guide explains how to start and customize `PIP`.

First, create `VideoEditorLaunchConfig` in [ViewController](https://github.com/Banuba/ve-sdk-ios-integration-sample/blob/main/Example/Example/ViewController.swift#L65) 
and provide video content for the feature:

```swift
let launchConfig = VideoEditorLaunchConfig(
        entryPoint: entryPoint,
        hostController: self,
        videoItems: resultUrls,
        // highlight-add-next-line
        pipVideoItem: resultUrls[.zero],
        animated: true
)
self.presentVideoEditor(with: launchConfig)
```

`PIP` supports 4 modes that you can use:
- `Floating`,
- `TopBottom`,
- `React`,
- `LeftRight`.

Use `PIPSettingsConfiguration` to customize the PIP implementation:

| Property |          Values           | Description |
| ------------- |:-------------------------:| :------------- |
| backgroundConfiguration | BackgroundConfiguration | BackgroundConfiguration sets up the background view style
| dragIndicatorConfiguration | RoundedButtonConfiguration | the cursor color
| titleConfiguration | TextConfiguration | the title font for the controls
| layoutSettingsButtonsConfiguration | [PIPSelectableCellConfiguration] | the array of the pip cell configurations

In this example, 4 supported PIP modes are set:
```swift
var config = VideoEditorConfig()
config.pipSettingsConfiguration?.layoutSettingsButtonsConfiguration = [
  PIPSelectableCellConfiguration(identifier: .floating),
  PIPSelectableCellConfiguration(identifier: .react),
  PIPSelectableCellConfiguration(identifier: .topBottom),
  PIPSelectableCellConfiguration(identifier: .leftRight)
]
``` 

You can also change the position of the music button.
Use `additionalEffectsButtons` and provide custom `AdditionalEffectsButtonConfiguration` with the `.sound` identifier:
```swift
let config = VideoEditorConfig()

config.recorderConfiguration.additionalEffectsButtons = [
  AdditionalEffectsButtonConfiguration(
    identifier: .sound,
    imageConfiguration: ImageConfiguration(imageName: ""),
    selectedImageConfiguration: ImageConfiguration(imageName: ""),
    titlePosition: .bottom,
    position: .top
  ),
  ...
] 
```

The Video Editor supports 3 options for positioning the music button: `bottom`, `center`, `top`.
