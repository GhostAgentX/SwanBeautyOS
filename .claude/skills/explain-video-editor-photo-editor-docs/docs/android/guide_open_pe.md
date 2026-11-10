# Open Photo Editor SDK from Camera screen on Android

> Open Photo Editor SDK from Camera screen on Android

# Open Photo Editor SDK from Camera screen on Android

This guide demonstrates how to open [Photo Editor SDK](https://www.banuba.com/photo-editor-sdk) just after taking a photo on Video Editor Camera screen.  

All recorded video or taken images on Camera screen can be handled using ```MediaNavigationProcessor```.
Provide custom implementation of ```MediaNavigationProcessor``` in Koin module to override flow.

``` diff
class SampleIntegrationKoinModule {
    val module = module {
        ...
        
        // highlight-add-next-line
+        single<MediaNavigationProcessor> {
            object : MediaNavigationProcessor {
                override fun process(activity: Activity, mediaList: List<Uri>): Boolean {
                    // Filter media resources to find the target image for Photo Editor SDK
                    val pngs = mediaList.filter { it.path?.contains(".png") ?: false }
                    return if (pngs.isEmpty()) {
                        true
                    } else {
                        // Create ExportResult and close Video Editor SDK.
                        (activity as? VideoCreationActivity)?.closeWithResult(
                            ExportResult.Success(
                                emptyList(),
                                pngs.first(),
                                Uri.EMPTY,
                                Bundle()
                            )
                        )
                        false
                    }
                }
            }
        }
    }
```

Handle received ```ExportResult```  in your ```registerForActivityResult``` or ```Activity.onActivityForResult``` method.
```diff
private val createVideoRequest =
        registerForActivityResult(CustomExportResultVideoContract()) { exportResult ->
            exportResult?.let {
                    if (exportResult is ExportResult.Success) {
                        // Use exported preview file to open Photo Editor SDK
                        
                        // highlight-add-next-line
                          photoEditorExportResult.launch(
                            PhotoCreationActivity.startFromEditor(
                                applicationContext,
                                imageUri = exportResult.preview
                            )
                )
                           ...
                    }
            }
        }
 
     private val photoEditorExportResult =
        registerForActivityResult(PhotoExportResultContract()) { uri ->
            // Handle exported image result
        }
```
