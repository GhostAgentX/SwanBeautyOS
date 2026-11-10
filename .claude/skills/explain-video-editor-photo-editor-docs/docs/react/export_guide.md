# Export media on React Native

> Export media on React Native

# Export media on React Native

## Overview

Video Editor SDK allows to export a number of video files with various resolutions and other configurations. Video is exported as `.mp4` for Android and `.mov` for IOS file.

Refer to our main docs [Android](https://docs.banuba.com/ve-pe-sdk/docs/android/guide_export) and [IOS](https://docs.banuba.com/ve-pe-sdk/docs/ios/guide_export) to learn more about media export in the Video Editor.

## Implement export flow

:::note
Default implementation exports single video file with auto quality(based on device hardware capabilities).
:::

Create a new instance of `ExportData` to export 2 videos with `HD` and `auto` qualities:

```javascript
  private exportData = new ExportData({
    exportedVideos: [
      new ExportedVideo({
        fileName: 'export_hd',
        videoResolution: VideoResolution.fhd1080p,
      }),
      new ExportedVideo({
        fileName: 'export_auto',
        videoResolution: VideoResolution.auto,
      }),
    ],
  });
```

Next, specify it in the [start method](https://github.com/Banuba/ve-sdk-react-native/blob/master/example/src/App.tsx#L125) of the Video Editor:

```diff
videoEditor.openFromCamera(
    LICENSE_TOKEN,
    this.featuresConfig,
+   this.exportData
  )
```

## Use AVC codec

You can specify `H264(AVC_PROFILES)` by setting `false` to `useHevcIfPossible`.

```diff
private exportData = new ExportData({
    exportedVideos: [
      new ExportedVideo({
        fileName: 'export_hd',
        videoResolution: VideoResolution.fhd1080p,
+       useHevcIfPossible: false
      }),
    ],
})
```

## Add watermark

Watermark is not added to exported video by default.

Add watermark to assets catalog in [Android](https://github.com/Banuba/ve-sdk-react-native/tree/master/example/android/app/src/main/assets/) and [IOS](https://github.com/Banuba/ve-sdk-react-native/tree/master/example/ios/VideoEditorReactNativeExample/Images.xcassets/) module.

:::important
Plugin support watermark image in the ```.png``` format.
:::

### Android

Add assets folder in the [android](https://github.com/Banuba/ve-sdk-react-native/tree/master/example/android/app/src/main/assets/) module and provide the ```sourceSets``` in the [build.gradle](https://github.com/Banuba/ve-sdk-react-native/tree/master/example/android/app/build.gradle) android app module:

```diff
  android {
    ...
+   sourceSets {
+       main {
+           assets.srcDirs += 'src/main/assets'
+       }
    }
    ...
  }
```

### IOS

Add watermark to [Images.xcassets](https://github.com/Banuba/ve-sdk-react-native/tree/master/example/ios/VideoEditorReactNativeExample/Images.xcassets/).

### Example

Provide watermark to ```Export Data``` instance:

```diff
private exportData = new ExportData({
    exportedVideos: [
      new ExportedVideo({
        fileName: 'export_hd',
        videoResolution: VideoResolution.fhd1080p,
      }),
    ],
+   watermark: new Watermark({
+     imagePath: 'watermark.png',
+     alignment: WatermarkAlignment.topLeft,
+   }),
});
```
