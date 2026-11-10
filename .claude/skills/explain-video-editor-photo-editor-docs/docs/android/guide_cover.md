# Cover image on Android

> Cover image on Android

# Cover image on Android  

Cover image screen allows users to pick any frame of video as image or choose an image from gallery.

```CoverProvider``` supports 2 modes
- ```EXTENDED``` - enables the screen
- ```NONE``` - disables the screen. The user is taken to export screen.

```EXTENDED``` is **default** mode in the SDK.

You can change the mode in [VideoEditorModule](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/java/com/banuba/example/integrationapp/VideoEditorModule.kt#L75)
``` kotlin
single<CoverProvider>(override = true) {
    CoverProvider.EXTENDED
}
```

## Resources

You can override the following string resources in your app.

| ResourceId   |      Value      |
|--------------| :----------- |
| cover_image_text | Choose cover | 
| cover_progress_text | Please, wait |
| err_cover_image | Failed to create cover image |
