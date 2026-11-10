# Face AR and AR Cloud products on iOS

> Face AR and AR Cloud products on iOS

# Face AR and AR Cloud products on iOS

[Banuba Face AR SDK](https://www.banuba.com/facear-sdk/face-filters) product is used on camera and editor screens for applying various AR effects while making video content.

## Overview
Any Face AR effect is a folder that includes a number of files required for the Face AR SDK to play this effect.

:::warning

Make sure every effect folder includes the ` preview.png`  file. This file is used as a preview for the AR effect.

:::

## Integrate Face AR

:::info
```Banuba Face AR SDK``` integration is included in the [Github sample](https://github.com/Banuba/ve-sdk-ios-integration-sample/).
:::

Add the dependency below to the [Podfile](https://github.com/Banuba/ve-sdk-ios-integration-sample/blob/main/Example/Podfile#L19) to integrate `Banuba Face AR SDK` into your project:

```ruby
pod 'BanubaSDK', '1.53.1'
```

## Manage effects
There are 2 options for managing AR effects:
1. ` bundleEffects`  folder - 
   use [bundleEffects](https://github.com/Banuba/ve-sdk-ios-integration-sample/blob/main/Example/Example/bundleEffects) folder,
2. ` AR Cloud`  Effects - which are stored on the remote server.

:::warning

Please, keep the name ` bundleEffects`, otherwise, the app will not start. Create the `bundleEffects` folder if it does not exist.

:::

:::tip

You can use both options i.e. store just a few AR effects in `bundleEffects` and 100 or more AR effects on `AR Cloud`.

:::

## Integrate AR Cloud
`AR Cloud` is a cloud solution for storing the Banuba Face AR effects on the server and is used by the Face AR and Video Editor products.  
Any AR effect downloaded from `AR Cloud` is cached on the user's device.

Add the dependency below to the [Podfile](https://github.com/Banuba/ve-sdk-ios-integration-sample/blob/main/Example/Podfile#L11) to integrate `AR Cloud` into your project:
```ruby
pod 'BanubaARCloudSDK', '1.53.2'
```

Since the link to your AR Cloud bucket is included into the license token, AR effects will appear once you set the license token with the AR Cloud link.

## Change the effects order
By default, all AR effects are listed in alphabetical order. AR effects from `bundleEffects` are listed in the beginning.

Provide your ordered list of effects to `preferredMasksOrder` in `VideoEditorConfig`:
```swift
 videoEditorConfig.recorderConfiguration.recorderEffectsConfiguration.preferredMasksOrder = [
   "XYScanner",
   "Background"
   ...
 ]
``` 

:::warning

These are the names of specific directories located in `bundleEffects` or on `AR Cloud`.

:::

## Disable Face AR SDK
The Video Editor SDK can work without the Face AR SDK.
Change the [Podfile](https://github.com/Banuba/ve-sdk-ios-integration-sample/blob/main/Example/Podfile) to disable the Face AR SDK:
```diff
   banuba_face_ar_sdk_version = '1.53.1'
   // highlight-remove-start
-  pod 'BanubaSDK', banuba_face_ar_sdk_version
   // highlight-remove-end
   // highlight-add-next-line
+  pod 'BanubaSDKSimple', banuba_face_ar_sdk_version
```

:::tip

Please, keep in mind that you can remove all AR effects from [bundleEffects](https://github.com/Banuba/ve-sdk-ios-integration-sample/blob/main/Example/Example/bundleEffects) 
if your license does not include the Face AR product.

:::
