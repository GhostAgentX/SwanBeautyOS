# Stickers on Android

> Stickers on Android

# Stickers on Android  

Guide to using stickers in Video Editor SDK on Android.

## Giphy
Video Editor SDK has built in integration with [Giphy service](https://developers.giphy.com/docs/api/) for loading stickers. ```GIPHY``` doesn't charge for their content. The one thing they do require is attribution. Also, there is no commercial aspect to the current version of the product (no advertisements, etc.).
Any sticker effect is a GIF file.

To use stickers in your project you need to request personal [Giphy API key](https://support.giphy.com/hc/en-us/articles/360020283431-Request-A-GIPHY-API-Key).
Override instance of ```GifPickerConfigurations``` and set GIPHY API key to ```giphyApiKey``` in [VideoEditorModule](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/java/com/banuba/example/integrationapp/VideoEditorModule.kt#L53).

``` diff
factory<GifPickerConfigurations> {
    GifPickerConfigurations(
       // highlight-add-next-line
+      giphyApiKey = ....
    )
}
```

Stickers will appear in the container on editor screen once ```giphyApiKey``` is set.
