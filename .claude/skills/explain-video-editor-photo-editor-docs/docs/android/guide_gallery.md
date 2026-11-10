# Gallery screen on Android

> Gallery screen on Android

# Gallery screen on Android  

Video Editor SDK includes built in gallery functionality where the user can pick any video or image and use it while making video.

:::info
Gallery is integrated by default.
:::

## Integration

The following guide will help you to integrate gallery to your project if it was not added before.

Add module ```com.banuba.sdk:ve-gallery-sdk:1.53.2``` to [gradle](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/build.gradle#L73) file
and specify ```GalleryKoinModule``` module in [VideoEditorModule](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/java/com/banuba/example/integrationapp/VideoEditorModule.kt#L39)
```diff
startKoin {
    androidContext(this@IntegrationApp)
        modules(
            ...
            // highlight-add-next-line
+           GalleryKoinModule().module
        )
}
```

## Customizations

You can control options ```Videos``` and ```Photos``` by overriding instance of ```EditorConfig``` in [VideoEditorModule](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/java/com/banuba/example/integrationapp/VideoEditorModule.kt#L51) .

```diff
      single {
            EditorConfig(
                // highlight-add-next-line
+                gallerySupportsVideo = ..., // true - show Videos, false - hide. Defaul - true
                // highlight-add-next-line
+                gallerySupportsImage = ..., // true - show Photos, false - hide. Default - true
            )
        }
```

## Implement custom gallery

Video editor allows to replace default gallery with your custom. Please follow implementation guide.  
First, create ```CustomMediaContentProvider``` class that implements ```ContentFeatureProvider<List<Uri>, Fragment>```.
This class describes a contract between Video Editor and specific Fragment from your project for gallery.

```kotlin
class CustomMediaContentProvider : ContentFeatureProvider<List<Uri>, Fragment> {

    private var activityResultLauncher: ActivityResultLauncher<Intent>? = null

    private val activityResultCallback: (List<Uri>?) -> Unit = {
        activityResultCallbackInternal(it)
    }
    private var activityResultCallbackInternal: (List<Uri>?) -> Unit = {}

    override fun init(hostComponent: WeakReference<Fragment>) {
        activityResultLauncher = hostComponent.get()?.registerForActivityResult(
            ProvideMediaContentContract(),
            activityResultCallback
        )
    }

    override fun requestContent(
        context: Context,
        extras: Bundle
    ): ContentFeatureProvider.Result<List<Uri>> = ContentFeatureProvider.Result.RequestUi(
        intent = SelectExternalContentActivity.newGetMediaIntent(context).apply {
            putExtras(extras)
        }
    )

    override fun handleResult(
        hostComponent: WeakReference<Fragment>,
        intent: Intent,
        block: (List<Uri>?) -> Unit
    ) {
        activityResultCallbackInternal = block
        activityResultLauncher?.launch(intent)
    }
}
```

Method `init` is invoked in Video Editor to register `onActivityResult` callback and receive media content.
`com.banuba.sdk.core.domain.ProvideMediaContentContract` class is used to manage data bundle that is passed between video editor and your custom media provider implementation.

Method `requestContent` is used to create `Intent` for starting your custom Activity with gallery.
`extras` argument contains metadata for media content selection and should be passed into your custom media provider.

`handleResult` method connects `onActivityResult` callback within Video Editor with the media content provided by `CustomGalleryActivity`.

Next, obtain media request params in your `CustomGalleryActivity.onCreate()`

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        intent.extras?.let { extras ->
            val params = ProvideMediaContentContract.obtainParams(extras)
            ...
        }
```

`Params` object contains data about request from video editor
```kotlin
    data class Params(
        val mode: OpenGalleryMode,
        val types: List<MediaType>,
        val maxCount: Int,
        val minCount: Int,
        val supportedFormats: List<String>
    )
```

`mode` - is a type of request (NORMAL, FEATURE_BACKGROUND, ADD_TO_TRIMMER)
`types` - list of requested media types (Video, Image)  
`supportedFormats` - list of media file extensions that are supported by SDK

Deliver media data from `CustomGalleryActivity` to Video Editor SDK

```kotlin
val resultIntent = Intent().apply {
            putParcelableArrayListExtra(
                ProvideMediaContentContract.EXTRA_MEDIA_CONTENT_RESULT,
                ArrayList(selectedMedia)
            )
        }
setResult(Activity.RESULT_OK, resultIntent)
```

`selectedMedia` is a list of media Uris with **content://** scheme.

Finally, provide `CustomMediaContentProvider` in `VideoEditorModule.kt` Koin module.

```kotlin
    factory<ContentFeatureProvider<List<Uri>, Fragment>>(named("mediaDataProvider"), override = true) { (external: Boolean?) ->
        CustomMediaContentProvider()
    }
```
and remove module `GalleryKoinModule` from the list of modules.
```diff
   startKoin {
            androidContext(applicationContext)
            allowOverride(true)

            modules(
                ...
                // highlight-remove-next-line
-               GalleryKoinModule().module,
                ...
            )
        }
```
