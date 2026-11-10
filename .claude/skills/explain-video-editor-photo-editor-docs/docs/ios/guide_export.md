# Export media on iOS

> Export media on iOS

# Export media on iOS

Video Editor SDK allows to export a number of media files i.e. video and audio with various resolutions and other configurations.
Video is exported as ```.mp4``` file.

:::warning

Export is a very heavy computational task that takes time and the user has to wait for it to be done.
The execution time depends on:
1. the video duration - the longer the video, the longer the execution time;
2. a number of video sources - the more sources, the longer the execution time;
3. a number of effects and their usage in the video - the more effects and the bigger their usage, the longer the execution time;
4. a number of the exported videos - the more videos and audios you want to export, the longer the execution time;
5. the device hardware - the most powerful devices can execute export much quicker.

:::

Export only supports the ` Foreground`  mode where the user has to wait on the progress screen until the processing is done.  
The ` Background`  export is not allowed on iOS due to the [iOS Restrictions](https://developer.apple.com/documentation/metal/gpu_devices_and_work_submission/preparing_your_metal_app_to_run_in_the_background)

Here is a screen that is shown in the ` Foreground`  mode:

## Video codecs
The Video Editor supports the following video codec options:
1. ` HEVC`  - H265 codec. ` Default`  if the device supports this codec;
2. ` AVC_PROFILES`  - H264 codec with High Profile.

You can change the video codec for export by using the ` ExportVideoConfiguration.useHEVCCodecIfPossible`  property. 
In this example, the H264 is set in [VideoEditorModule](https://github.com/Banuba/ve-sdk-ios-integration-sample/blob/main/Example/Example/VideoEditorModule.swift#L56):

```diff
    let exportConfiguration = ExportVideoConfiguration(
          fileURL: destFile,
          quality: .auto,
          // highlight-add-next-line
+         useHEVCCodecIfPossible: false,
          watermarkConfiguration: watermarkConfiguration
        )
```

## Video quality

| 360p(360x640) | 480p(480x854) | QHD540(540x960) | HD(720x1280) | FHD(1080x1920) | QHD(1440x2560) | UHD(2160x3840) |
|----|---------------|-----------------|--------------|----------------|----------------|----------------|
| 1000  kb/s    | 2500 kb/s     | 3000  kb/s      | 5000   kb/s  | 8000 kb/s      | 16000    kb/s  | 36000  kb/s    |

The Video Editor has the built-in feature for detecting device performance capabilities and finding optimal video quality params for export.
You can provide a custom video resolution for the exported video by using the ` ExportVideoConfiguration.quality`  property:
```diff
  let hdExportConfiguration = ExportVideoConfiguration(
    fileURL: destFile,
    // highlight-add-next-line
+   quality: .videoConfiguration(ExportVideoInfo(resolution: .hd1280x720, useHEVCCodecIfPossible: true)),
    useHEVCCodecIfPossible: true,
    watermarkConfiguration: watermarkConfiguration
)
```

## Export storage
The Video Editor export method requires the file destination where the exported video will be stored.
First, create the destination file:
```swift
let manager = FileManager.default
let destFile = manager.temporaryDirectory.appendingPathComponent("tmp.mov")
```
and use it in ` ExportVideoConfiguration`:
```diff
  let hdExportConfiguration = ExportVideoConfiguration(
    // highlight-add-next-line
+   fileURL: destFile,
    quality: .videoConfiguration(ExportVideoInfo(resolution: .hd1280x720, useHEVCCodecIfPossible: true)),
    useHEVCCodecIfPossible: true,
    watermarkConfiguration: watermarkConfiguration
)
```

## Implement the export flow
You can create your own flow for exporting media files for your application.

Use ` ExportConfiguration`  to create an instance with the configurations that meet your product requirements.

Below there is a sample that exports 2 video files:
1. a video with the auto resolution **without** a watermark;
2. a video with the HD resolution **with** a watermark:

```Swift
let watermarkConfiguration = WatermarkConfiguration(
    watermark: ImageConfiguration(imageName: "Common.Banuba.Watermark"),
    size: CGSize(width: 204, height: 52),
    sharedOffset: 20,
    position: .rightBottom
)
        
let autoExportConfiguration = ExportVideoConfiguration(
    fileURL: destFile1,
    quality: .auto,
    useHEVCCodecIfPossible: true,
    watermarkConfiguration: nil
)

let hdExportConfiguration = ExportVideoConfiguration(
    fileURL: destFile2,
    quality: .videoConfiguration(ExportVideoInfo(resolution: .hd1280x720, useHEVCCodecIfPossible: true)),
    useHEVCCodecIfPossible: true,
    watermarkConfiguration: watermarkConfiguration
)
        
let exportConfig = ExportConfiguration(
    videoConfigurations: [autoExportConfiguration, hdExportConfiguration],
    isCoverEnabled: true,
    gifSettings: nil
)
```

Use the created ` ExportConfiguration`  to start the export by using  the ` BanubaVideoEditor.export()`  method:
```Swift
public func export(
    using configuration: ExportConfiguration,
    exportProgress: ((TimeInterval) -> Void)?,
    completion: @escaping ((_ error: Error?, _ exportCoverImages: ExportCoverImages?) -> Void)
)
``` 

## Handle the export result
The ` BanubaVideoEditor.export()` method allows to start the export and track the result.  
Provide:
1. ` ExportConfiguration` - where you set up all the required media content you want to make;
2. ` exportProgress`  - a callback that gets called when the export progress changes. Values are 0.0-1.0;
3. ` completion` - a callback that gets called when the export is finished with an error or not:
```swift
videoEditorSDK?.export(
      using: exportConfiguration,
      exportProgress: { progress in
        DispatchQueue.main.async {
          // Export is in progress. You can show progress view. Progress is 0.0 - 1.0
          ...
        }
      },
      completion: { [weak self] error, exportCoverImages in
        DispatchQueue.main.async {
            // Export finishes. Use 'error' value to detect the state of export.
            // Hide progress view
        
            // You can clear exported session if you do no need it anymore
            //self?.videoEditorSDK?.clearSessionData()
        }
```
:::tip

If the export is finished successfully, you can use the instance of ` ExportConfiguration`  as a result and access the media files and its metadata.

:::

## Add a watermark
:::warning

A watermark is not added to the exported video by default.

:::

You can use your custom watermark for a video. First, create the instance of ` WatermarkConfiguration`  to
```swift
let watermarkConfiguration = WatermarkConfiguration(
     watermark: ImageConfiguration(imageName: "Common.Banuba.Watermark"),
     size: CGSize(width: 204, height: 52),
     sharedOffset: 20,
     position: .rightBottom
)
```
where ` position`  is used for locating the watermark image in a video:
```swfit
public enum WatermarkPosition {
    case leftTop
    case leftBottom
    case rightTop
    case rightBottom
}
```
Next, set ` watermarkConfiguration`  to every instance of ` ExportVideoConfiguration`  where you want to add a watermark 
in [VideoEditorModule](https://github.com/Banuba/ve-sdk-ios-integration-sample/blob/main/Example/Example/VideoEditorModule.swift#L57):
```diff
let hdExportConfiguration = ExportVideoConfiguration(
      fileURL: destFile,
      quality: .hd1280x720,
      useHEVCCodecIfPossible: true,
      // highlight-add-next-line
+     watermarkConfiguration: watermarkConfiguration
)
```

## Export the GIF preview
The Video Editor allows to export a preview of the video as a GIF file.  
The instance of ` GifSettings`  is required in ` ExportConfiguration`  to export a preview 
during the export. You can specify this property in [VideoEditorModule](https://github.com/Banuba/ve-sdk-ios-integration-sample/blob/main/Example/Example/VideoEditorModule.swift#L63):

```diff
let exportConfig = ExportConfiguration(
    videoConfigurations: [exportConfiguration],
    isCoverEnabled: true,
    // highlight-add-next-line
+   gifSettings: GifSettings(duration: 0.3)
)
```

## Get the audio track of exported video
You can get the video's audio track after its successfull export using the `BanubaVideoEditor.exportAudio()` method:

```Swift
public func exportAudio(
    fileUrl: URL,
    audioSettings: [String: Any] = VESettings.audio,
    completion: @escaping (Bool, Error?) -> Void
)
```
:::tip

Learn about the available options on the [Apple Developer Portal](https://developer.apple.com/documentation/avfoundation/audio_settings) to provide custom audio quality settings.

:::

## Get the information about the music tracks used during creation of exported video
You can use the `musicMetadata` property of `BanubaVideoEditor` class to get the array of `MusicEditorTrack` entities containing the information about the corresponding music tracks. 
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

## Export metadata analytics
While exporting media content, the Video Editor generates simple metadata analytics that you can use to analyze what media content your users make.
 
Metadata is a JSON string and can be received once the export is finished successfully:
```swift
let metadataJson: String? = videoEditorSDK?.metadata?.analyticsMetadataJSON
```
The JSON sample:
```json
{
  "export_success": true, // defines if the export finished succesffully
  "aspect_ratio": "original", // aspect ration used in exported video
  "video_resolutions": ["1080x1920"], // list of video resolutions used in export
  "camera_effects": [], // list of effects of features used on camera screen while recording video
  "ppt_effects": {
    "visual": 2, // num of visual effects i.e. Glitch, VHS used in exported video
    "speed": 1, //  num of speed effects used in exported video
    "mask": 6, // num of AR masks used in exported video
    "color": 3, // num of color effects used in exported video
    "text": 1, // num of text effects used in exported video
    "sticker": 1, // num of sticker effects used in exported video
    "blur": 1 // num of blur effects used in exported video
  },
  "sources": {
    "camera": 0, // num of video sources recorded on camera screen(not PIP)
    "gallery": 1, // num of video sources selected in the gallery
    "pip": 0, // num of video recorded with PIP
    "slideshow": 0, // num of video exported as slideshow
    "audio": 0 // num of audi tracks
  },
  "export_duration": 12.645, // export processing duration
  "video_duration": 20.11, // exported video duration
  "video_count": 1, // num of exported video files
  "os_version": "11", // OS version
  "sdk_version": "1.26.6" // VE SDK version
}
```
