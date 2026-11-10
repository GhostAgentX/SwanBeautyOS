# Launching Photo Editor on Android

> Launching Photo Editor on Android

# Launching Photo Editor on Android  

Guide to launching Photo Editor SDK.

## Prerequisites
:exclamation: The license token **IS REQUIRED** to use Photo Editor SDK in your app.  
Please check [Requirements](requirements-pe.md#license-token) out guide if the license token is not set.

## Initialize SDK
Create an instance of ```BanubaPhotoEditor```  by using the license token
``` kotlin
val photoEditorSDK = BanubaPhotoEditor.initialize(LICENSE_TOKEN)
```
```photoEditorSDK``` is ```null``` when the license token is incorrect i.e. empty, truncated.
If ```photoEditorSDK``` is not ```null``` you can proceed and start video editor.

Next, we strongly recommend [checking](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/java/com/banuba/example/integrationapp/MainActivity.kt#L110) your license state before staring video editor
```kotlin
photoEditorSDK.getLicenseState { isValid ->
   if (isValid) {
      // ✅ License is active, all good
      // Start Photo Editor SDK
   } else {
      // ❌ Use of Photo Editor is restricted. License is revoked or expired.
   }
}
```

:::danger
Photo editing content unavailable screen will appear if the user starts Photo Editor SDK with revoked or expired license.
:::

## Start editor

Import classes
```kotlin
import com.banuba.sdk.pe.BanubaPhotoEditor
import com.banuba.sdk.pe.PhotoCreationActivity
import com.banuba.sdk.pe.PhotoExportResultContract
```

Start Photo Editor SDK and handle exported results.  
[See example](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/java/com/banuba/example/integrationapp/MainActivity.kt#L79).

```kotlin

val photoEditorExportResult =
    registerForActivityResult(PhotoExportResultContract()) { uri ->
        // Handle exported image result
        Log.d(TAG, "Image exported $uri")
    }

// Start Photo Editor SDK
photoEditorExportResult.launch(PhotoCreationActivity.startFromGallery(this))
```

## Disable publishing image to Gallery

```kotlin
startPhotoEditor(PhotoCreationActivity.startFromGallery(
this@MainActivity,
config = PhotoEditorConfig.Builder(context = this).saveToGallery(false).build()
))
```
