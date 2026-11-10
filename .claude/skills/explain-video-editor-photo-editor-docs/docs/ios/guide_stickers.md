# Stickers on iOS

> Stickers on iOS

# Stickers on iOS

Guide to using stickers in Video Editor SDK on Android.

## Giphy

Video Editor SDK has built in integration with [Giphy service](https://developers.giphy.com/docs/api/) for loading stickers. ```GIPHY``` doesn't charge for their content. The one thing they do require is attribution. Also, there is no commercial aspect to the current version of the product (no advertisements, etc.).
Any sticker effect is a GIF file.

To use stickers in your project you need to request personal [Giphy API key](https://support.giphy.com/hc/en-us/articles/360020283431-Request-A-GIPHY-API-Key).
Set your personal Giphy Api Key into the `giphyAPIKey` parameter of the `GifPickerConfiguration` entity in the [VideoEditorModule](https://github.com/Banuba/ve-sdk-ios-integration-sample/blob/main/Example/Example/VideoEditorModule.swift#L83):

```swift
var config = VideoEditorConfig()
config.gifPickerConfiguration.giphyAPIKey = "YOUR GIPHY KEY"
```

Stickers will appear in the container on editor screen once ```giphyAPIKey``` is set. The placeholder of the search bar is specified by the `com.banuba.searchGif.placeholder` key in the `Localizable.strings` file.
