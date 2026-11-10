# FAQ on iOS

> FAQ on iOS

# FAQ on iOS

These are the answers to the most common questions asked about our SDK.

## How do I start the Video Editor with a preselected audio track?

To do so, add the MediaTrack instance as a parameter to `VideoEditorLaunchConfig` which is used for starting the Video Editor method:

```swift
let cameraLaunchConfig = VideoEditorLaunchConfig(
  entryPoint: .camera,
  hostController: self,
  musicTrack: MediaTrack(...),
  animated: true
)

videoEditorSDK?.presentVideoEditor(
  withLaunchConfiguration: cameraLaunchConfig,
  completion: nil
)
```

## What are the available entry points of the Video Editor?

The Video Editor supports multiple launch entry points that are declared in `PresentEventOptions.EntryPoint` to meet all your requirements:
``` swift
public enum EntryPoint: String, Codable {
  case camera
  case pip
  case trimmer
  case editor
  case drafts
  case gallery
}
```

To open the Video Editor at the desired screen, use `VideoEditorLaunchConfig` that should be passed to the `presentVideoEditor` method of the `BanubaVideoEditor` class:
``` swift
public func presentVideoEditor(
  withLaunchConfiguration configuration: VideoEditorLaunchConfig,
  completion: (() -> Void)?
) {}
```

1. Launch from the Camera screen where the user can record a video or take a picture:
``` swift
let launchConfig = VideoEditorLaunchConfig(
  entryPoint: .camera,
  hostController: UIViewController,
  musicTrack: MediaTrack,
  animated: Bool
)
videoEditorSDK.presentVideoEditor(
  withLaunchConfiguration: launchConfig,
  completion: nil
)
```

2. Launch from the Camera screen in the Picture-in-Picture (PIP) mode:  
:::important  
The Video Editor will not open in the PIP mode if your license token does not support the PIP feature.
:::

``` swift
let launchConfig = VideoEditorLaunchConfig(
  entryPoint: .pip,
  hostController: UIViewController,
  pipVideoItem: URL,
  animated: Bool
)
videoEditorSDK.presentVideoEditor(
  withLaunchConfiguration: launchConfig,
  completion: nil
)
```

3. Launch from the Trimmer screen where the user can trim a video, add transitions and move to the editing screen for adding effects:
``` swift
let launchConfig = VideoEditorLaunchConfig(
  entryPoint: .trimmer,
  hostController: UIViewController,
  videoItems: [URL],
  musicTrack: MediaTrack,
  animated: Bool
)
videoEditorSDK.presentVideoEditor(
  withLaunchConfiguration: launchConfig,
  completion: nil
)
```

4. Launch from the Editor screen where the user can add effects to a video:
``` swift
let launchConfig = VideoEditorLaunchConfig(
  entryPoint: .editor,
  hostController: UIViewController,
  videoItems: [URL],
  musicTrack: MediaTrack,
  animated: Bool
)
videoEditorSDK.presentVideoEditor(
  withLaunchConfiguration: launchConfig,
  completion: nil
)
```

5. Launch from the Drafts screen where the user can pick any non-completed draft and proceed with making a video:
``` swift
let launchConfig = VideoEditorLaunchConfig(
  entryPoint: .drafts,
  hostController: UIViewController,
  animated: Bool
)
videoEditorSDK.presentVideoEditor(
  withLaunchConfiguration: launchConfig,
  completion: nil
)
```

6. Launch from the Gallery screen where the user can select videos or photos and proceed to the Editor screen:
``` swift
let launchConfig = VideoEditorLaunchConfig(
  entryPoint: .gallery,
  hostController: UIViewController,
  animated: Bool
)
videoEditorSDK.presentVideoEditor(
  withLaunchConfiguration: launchConfig,
  completion: nil
)
```

## How do I use the Video Editor several times from different entry points?

Before you want to use VideoEditor again, you need to deinitialize your current editor instance in your [entry point class scope](https://github.com/Banuba/ve-sdk-ios-integration-sample/blob/d9733e78a6a752dd8fad849f6aa6d5553eb07f56/Example/Example/ViewController.swift#L675). You need to set 'yourVideoEditorSdkInstance' = nil after following the funcs called [done](https://github.com/Banuba/ve-sdk-ios-integration-sample/blob/d9733e78a6a752dd8fad849f6aa6d5553eb07f56/Example/Example/ViewController.swift#L660) and [cancel](https://github.com/Banuba/ve-sdk-ios-integration-sample/blob/d9733e78a6a752dd8fad849f6aa6d5553eb07f56/Example/Example/ViewController.swift#L678):

```swift
// Video Editor Delegate implementation example
extension ViewController: BanubaVideoEditorDelegate {
  func videoEditorDone(_ videoEditor: BanubaVideoEditor) {
    // User finished editing sessoin, need to dismiss video editor and export video
    videoEditorSDK?.dismissVideoEditor(
      animated: true
    ) { [weak self] in
      self?.exportVideo(...) { ... in
         self?.'yourVideoEditorSdkInstance' = nil
      }
    }
  }
  
  func videoEditorDidCancel(
    _ videoEditor: BanubaVideoEditor
  ) {
    // User canceled editing sessoin, need to dismiss video editor
    videoEditorSDK?.dismissVideoEditor(
      animated: true,
      completion: {
        self?.'yourVideoEditorSdkInstance' = nil
      }
    )
  }
}
```

Use the following approach if you want to [create the BanubaVideoEditor instance](https://github.com/Banuba/ve-sdk-ios-integration-sample/blob/d9733e78a6a752dd8fad849f6aa6d5553eb07f56/Example/Example/ViewController.swift#L42) again. 

For example, as your tap button action:

```swift
@IBAction func videoEditorButtonTapped(_ sender: UIButton) {
  if 'yourVideoEditorSdkInstance' == nil {
    'yourVideoEditorSdkInstance' = BanubaVideoEditor(...)
  }
}
```

## How do I add a color filter (LUT)?

Color Filters (LUTs) are special graphic files that are placed in the / [luts directory](https://github.com/Banuba/ve-sdk-ios-integration-sample/tree/main/Example/Example/luts) inside the main project folder.

To add your own icon to be used in order to represent that specific effect on the list, you must place it in the / [assets folder](https://github.com/Banuba/ve-sdk-ios-integration-sample/tree/main/Example/Example/Assets.xcassets/ColorEffectsPreview).

The icon resource name must match the image file name in the / luts directory and end with `_preview`.

The display name for the resource is set in the [localization files](https://github.com/Banuba/ve-sdk-ios-integration-sample/tree/main/Example/Example/en.lproj/Localizable.strings#L275).

The key for the translation string must start with `com.banuba.filter.name.{lut file name}` and end with the name of the lut file.

## I want to enable the slideshow animation.

To be able to turn on the slideshow animation, use the following property of the `RecorderConfiguration` and `CombinedGalleryConfiguration` entities:

```swift
let config = VideoEditorConfig()

config.combinedGalleryConfiguration.isPhotoSequenceAnimationEnabled = true
config.recorderConfiguration.isPhotoSequenceAnimationEnabled = true
```
## I want to change the cursor color.

All you need is just to set your color into the `cursorColor` parameter in the `MainOverlayViewControllerConfig` entity:

```swift
let config = VideoEditorConfig()

config.overlayEditorConfiguration.mainOverlayViewControllerConfig.cursorColor = .white
```

## How can I get the track name of the audio used in my video after the export?

```swift
/// Video Editor main entity and entry point.
/// Can present and hide root view controller.
/// Has default export method.
public class BanubaVideoEditor {
  /// Simple metadata of music composition settings
  public var musicMetadata: MusicEditorMetadata? { get }
  ...
}
```
`MusicEditorMetadata` contains the array of `MusicEditorTrack` which contains the following fields: 

```swift
// MARK: - MusicEditorTrack
public struct MusicEditorTrack: Codable {
  ///Track URL
  public var url: URL
  ///Track original URL
  public var originalURL: URL
  ///Track title
  public var title: String
  ///Track id
  public var id: Int32
  /// Track volume
  public var volume: Float
  ...
}
```
or if you want to know what track was played on the camera screen, you can use:

```swift
/// Video Editor main entity and entry point.
/// Can present and hide root view controller.
/// Has default export method.
public class BanubaVideoEditor {
  /// Music track which will be played on camera recording
  public var musicTrack: MediaTrack? { get }
  ...
}
```
## I want to change the font.

You can change the font for the whole Video Editor by calling in `VideoEditorConfig` this method:
 
```swift
func applyFont(_ font: UIFont)
```
or change the font for each screen separately by calling the appropriate methods:
```swift
func updateFullScreenActivityFonts(_ font: UIFont)

func updateRecorderFonts(_ font: UIFont)

func updateAlbumsFonts(_ font: UIFont)

func updateEditorFonts(_ font: UIFont)

func updateToastFonts(_ font: UIFont)

func updateTextEditorFonts(_ font: UIFont)

func updateSlideShowFonts(_ font: UIFont)

func updateTrimVideoFonts(_ font: UIFont)

func updateTrimVideosFonts(_ font: UIFont)

func updateFilterFonts(_ font: UIFont)

func updateExtendedVideoCoverSelectionFonts(_ font: UIFont)

func updateAlertFonts(_ font: UIFont)
```

Changing the font does not affect its size. The font size will be taken by default or specified by you in the entity configuration.

## I want to use custom icons.

Any icon in the mobile Video Editor SDK can be replaced. This is how:

1. load custom images to the Assets catalog;
2. locate the screen with the icon you want to change in the [VideoEditorConfig](https://github.com/Banuba/ve-sdk-ios-integration-sample/tree/main/Example/Example/VideoEditorModule.swift#L75) entity. More examples: [Camera Screen](guide_camera.md), [Editor Screen](guide_editor.md);
3. find the specific element and override it with the resource name or use UIImage if available.

## The “luts” file couldn’t be opened because there is no such file.

This error occurs because your application bundle doesn't contain the required luts folder.

You need to copy the [luts](https://github.com/Banuba/ve-sdk-ios-integration-sample/tree/main/Example/Example/luts) folder to your project.

## I want to add audio filters.

The filters' availability depends on the token. However, in order for them to be available, you need to add an implementation of the `VoiceFilterProvider` entity.

Here is an example on how to inherit `VoiceFilterProvider` to your own entity:

```swift
import BanubaMusicEditorSDK
import UIKit

/// Example voice filter provider
struct ExampleVoiceFilterProvider: VoiceFilterProvider {
  private let filters: [VoiceFilter]
  
  // MARK: - VoiceFilterProvider
  
  func provideFilters() -> [VoiceFilter] {
    return filters
  }
  
  init() {
    filters = [
      VoiceFilter(
        type: .elf,
        title: NSLocalizedString("com.banuba.musicEditor.elf", comment: "Elf filter title"),
        image: UIImage(named:"elf")
      ),
      VoiceFilter(
        type: .baritone,
        title: NSLocalizedString("com.banuba.musicEditor.baritone", comment: "Baritone filter title"),
        image: UIImage(named:"baritone")
      ),
      VoiceFilter(
        type: .echo,
        title: NSLocalizedString("com.banuba.musicEditor.echo", comment: "Echo filter title"),
        image: UIImage(named:"echo")
      ),
      VoiceFilter(
        type: .giant,
        title: NSLocalizedString("com.banuba.musicEditor.giant", comment: "Giant filter title"),
        image: UIImage(named:"giant")
      ),
      VoiceFilter(
        type: .robot,
        title: NSLocalizedString("com.banuba.musicEditor.robot", comment: "Robot filter title"),
        image: UIImage(named:"robot")
      ),
      VoiceFilter(
        type: .squirrel,
        title: NSLocalizedString("com.banuba.musicEditor.squirrel", comment: "Squirrel filter title"),
        image: UIImage(named:"squirrel")
      )
    ]
  }
}
```

Then the instance of ExampleVoiceFilterProvider needs to be passed to the configuration:

```swift
var config = VideoEditorConfig()

config.musicEditorConfiguration.audioTrackLineEditControllerConfig.voiceFilterProvider = ExampleVoiceFilterProvider()
```

## I want to change icons and name for effects.

The name of the icon for the effect must match the identifier of the effect.
Below there is a table with the name, ID and icon of the default effects:

| Default image effect | Name      | ID      |
| ---------- | ---------  | ----------- |
|  | Acid whip | 102000
|  | Cathode | 102001
|  | DV Cam | 102002
|  | Flash | 102003
|  | Glitch | 102004
|  | Glitch 2 | 102005
|  | Heat Map | 102006
|  | Lumiere | 102007
|  | Mirror | 102008
|  | Mirror 2 | 102009
|  | Pixel Dynamic | 102010
|  | Pixel Static | 102011
|  | Polaroid | 102012
|  | Rave | 102013
|  | Soul | 102014
|  | Stars | 102015
|  | TV-Foam | 102016
|  | Transition | 102017
|  | Transition 2 | 102018
|  | VHS | 102019
|  | VHS 2 | 102020
|  | Zoom | 102021
|  | Zoom 2 | 102022
|  | 0.5x | 104000
|  | 2x | 104001

In order to change the name of the effect, you need to do it in the [localization file](https://github.com/Banuba/ve-sdk-ios-integration-sample/tree/main/Example/Example/en.lproj/Localizable.strings#L254).

## I want to get the exported video metadata.

In order to find out which filter, effects, masks and music were applied to the video, you need to refer to the instance of the `BanubaVideoEditor` entity.

The instance:
``` swift
let videoEditorSDK = BanubaVideoEditor(
  ...
)

// to get color filter
let videoFilter = videoEditorSDK?.metadata?.colorOnVideoMetadata
// to get effects
let videoEffects = videoEditorSDK?.metadata?.effectsOnVideoMetadata
// to get gifs
let videoGif = videoEditorSDK?.metadata?.gifOnVideoMetadata
// to get texts
let videoText = videoEditorSDK?.metadata?.textOnVideoMetadata
// to get music track from record screen
let videoMusicTrack = videoEditorSDK?.musicTrack
// to get music tracks from editor screen
let videoTracks = videoEditorSDK?.musicMetadata?.tracks
```

## I want to change the codec type from h264 to h265.

All you need is to just set `useHEVCCodecIfPossible` to `true` in the `VideoEditorConfig, ExportVideoInfo or ExportVideoConfiguration` entities.
The first one you need when you're creating `BanubaVideoEditor`, the two last ones - when you're preparing a video for export:

```swift
let exportVideoInfo = ExportVideoInfo(
  resolution: ...,
  useHEVCCodecIfPossible: true
)

let configuration = ExportVideoConfiguration(
  fileURL: ...,
  quality: ...,
  useHEVCCodecIfPossible: true,
  watermarkConfiguration: ...
)
```

## How do I specify the video file saving directory?

In `ExportVideoConfiguration` set the desired path in the fileURL parameter:

```swift
let exportVideoConfigurations: [ExportVideoConfiguration] = [
  ExportVideoConfiguration(
    fileURL: fileURL,
    quality: .auto,
    useHEVCCodecIfPossible: true,
    watermarkConfiguration: watermarkConfiguration
  )
]
```

## How do I change the language (how do I add new locale support)?

There is no special language switching mechanism in the Video Editor SDK (VE SDK).

Out of the box, the VE SDK includes support for two locales: English (default) and Russian. If you need to support any other locales, you can do it according to the standard iOS way. See how to [create locale directories and resource files](https://developer.apple.com/documentation/xcode/localization) for more details. After adding a new locale resource file into your application with the integrated VE SDK, you need to re-define the VE SDK strings keys with the new locale string values.
To do that, you need to add all the needed string keys in the new locale `Localizable.strings` file. You can find the main VE SDK string keys you need in the [Localizable.strings](https://github.com/Banuba/ve-sdk-ios-integration-sample/tree/main/Example/Example/en.lproj/Localizable.strings) file.
The newly added locale will be applied after the device language is changed by the system settings.

## How can I change the extension of the exported video?

To save the video in the format you want, you just need to add the appropriate `PathComponent` when creating the video URL:
```swift
let videoURL = manager.temporaryDirectory.appendingPathComponent("tmp.mov")
```

See an example in the [sample](https://github.com/Banuba/ve-sdk-ios-integration-sample/tree/main/Example/Example/ViewController.swift#L238).

See all the formats supported for the video export [here](guide_export.md).

## I want to change the order of masks, video effects or filters.

The SDK allows to reorder masks and filters in the way you need. To achieve this, use the `preferredLutsOrder` and `preferredMasksOrder` properties:

``` swift
let config = VideoEditorConfig()

// Sorting for the record screen
config.recorderConfiguration.recorderEffectsConfiguration.preferredLutsOrder = [
  "egypt",
  "norway",
  "japan"
  ...
]

config.recorderConfiguration.recorderEffectsConfiguration.preferredMasksOrder = [
  "XYScanner",
  "Background"
  ...
]

// Sorting for the post processing screen
config.filterConfiguration.preferredLutsOrder = [
  "byers",
  "sunset",
  "vinyl"
  ...
]

config.filterConfiguration.preferredMasksOrder = [
  "XYScanner",
  "Background"
  ...
]

config.filterConfiguration.preferredVideoEffectOrderAndSet = [
  VisualEffectApplicatorType.acid,
  VisualEffectApplicatorType.dvCam
  ...
]
```

## Is it possible to disable the Trim screen?

It is possible to turn off the trimmer screen after the camera screen.

The trimmer screen will still be accessible after importing media files from the gallery.

To disable it, just change the `supportsTrimRecordedVideo` property to `false` in the `FeatureConfiguration` entity:

``` swift
func createVideoEditorConfig() -> VideoEditorConfig {
  var config = VideoEditorConfig()
  ...
  // Default is false
  config.featureConfiguration.supportsTrimRecordedVideo = true
  ...
  return config
}
```

## Is it possible to disable the transition effects?

Transitions are visual effects applying to the segue between two videos. They are provided with the Banuba Video Editor SDK **by default**.

To disable or enable transitions, set the `useTransitions` flag inside the `FeatureConfiguration` class to false or true respectively:
 
 ``` swift
/// Allows you to use transition effects between videos
/// Defaults is true
public var useTransitions: Bool
 ```
 
Example:
 
 ``` swift
let config = VideoEditorConfig()
config.featureConfiguration.useTransitions = true
 ```

:::note
Transition effects are not being played if the closest video (either to the left or to the right of the transition icon) is very short.
:::

## How can I convert one or several still images to a video programmatically?

If you would like to create a video from UIImage instances without opening the Video Editor, you can use our API SDK tailored for solutions with the custom built UI, namely the `exportSlideshowImages` method of the `VEExport` class.

## Is it possible to store localization strings in a file other than Localizable.strings?

Sometimes other 3rd party dependencies overwrite the `Localizable.strings` file stored in the app bundle during compilation. In such cases it is also possible to store the localization strings in the `Banuba.strings` file. 

## How to change the default animation (exposure view) shown after tapping on the camera preview?

Create a class conforming to `ExternalViewControllerFactory` that implements the `exposureViewFactory` property. In the following example the default view factory `DefaultExposureViewFactory` provided by the SDK is used:

```swift
class ExampleViewControllerFactory: ExternalViewControllerFactory {
    var exposureViewFactory: AnimatableViewFactory?
    var musicEditorFactory: MusicEditorExternalViewControllerFactory?
    var countdownTimerViewFactory: CountdownTimerViewFactory?

    init() {
        exposureViewFactory = DefaultExposureViewFactory()
    }
}
```

Pass the instance of your factory to the `externalViewControllerFactory` argument of `BanubaVideoEditor`:

```swift
let videoEditorSDK = BanubaVideoEditor(
    token: ...,
    configuration: ...,
    // highlight-add-next-line
+   externalViewControllerFactory: ExampleViewControllerFactory()
)
```

## How to change the default countdown timer shown on the camera screen?

Create a class conforming to `ExternalViewControllerFactory` that implements the `countdownTimerViewFactory` property. In the following example the view factory that provides the built-in class `CountdownView` is implemented:

```swift
class ExampleViewControllerFactory: ExternalViewControllerFactory {
    var exposureViewFactory: AnimatableViewFactory?
    var musicEditorFactory: MusicEditorExternalViewControllerFactory?
    var countdownTimerViewFactory: CountdownTimerViewFactory?
    
    init() {
        countdownTimerViewFactory = CountdownTimerViewControllerFactory()
    }
    
    /// Example countdown timer view factory for Recorder countdown animation
    class CountdownTimerViewControllerFactory: CountdownTimerViewFactory {
        func makeCountdownTimerView() -> CountdownTimerAnimatableView {
            let countdownView = CountdownView()
            countdownView.frame = UIScreen.main.bounds
            countdownView.font = countdownView.font.withSize(102.0)
            countdownView.digitColor = .white
            return countdownView
        }
    }
}
```

Pass the instance of your factory to the `externalViewControllerFactory` argument of `BanubaVideoEditor`:

```swift
let videoEditorSDK = BanubaVideoEditor(
    token: ...,
    configuration: ...,
    // highlight-add-next-line
+   externalViewControllerFactory: ExampleViewControllerFactory()
)
```

## How to change the global color appearance (palette) of the SDK?

Create an instance of `VideoEditorColorsPalette` with the desired colors and assign it to `VideoEditorConfig`:

```swift
var config = VideoEditorConfig()

config.setupColorsPalette(
    VideoEditorColorsPalette(
        primaryColor: .white,
        secondaryColor: .black,
        accentColor: .white,
        effectButtonColorsPalette: EffectButtonColorsPalette(
            defaultIconColor: .white,
            defaultBackgroundColor: .clear,
            selectedIconColor: .black,
            selectedBackgroundColor: .white
        ),
        addGalleryItemBackgroundColor: .white,
        addGalleryItemIconColor: .black,
        timelineEffectColorsPalette: TimelineEffectColorsPalette.default
    )
)
```

## How to change the video preview resizing mode at Recording Screen

Starting from the 1.35.0 version of the SDK the `RecorderConfiguration` has the property called `previewScalingMode` with two possible options `aspectFill` and `aspectFit`:

```swift
/// Specifies options of scaling the video preview from camera at recorder screen
public enum RecorderPreviewScalingMode {
  /// Fill entire preview screen with camera video feed
  case aspectFill
  /// Fit camera video in the screen so that entire video is always visible
  case aspectFit
}

var config = VideoEditorConfig()
config.recorderConfiguration.previewScalingMode = .aspectFit
```

By default the `aspectFill` option is used. It provides the same preview scaling behaviour as in previous releases of the SDK.

## How to collect logs when I encounter an issue?

If you encounter a crash or other issue and are unsure how to provide logs to the support team, follow steps provided below:

1. Connect your iPhone to your Mac via USB or Wi-Fi.
2. Open Xcode → go to Window → Devices and Simulators.
3. In the list, select your device.
4. In the right panel, click Open Console.
5. You will now see all system and app logs in real time.
6. To view only logs for your app, use the Filter by process field and enter the app’s Bundle ID.

Once you’ve collected the logs, copy them into a separate text file and send it to the [support team](https://www.banuba.com/support) for further investigation.
