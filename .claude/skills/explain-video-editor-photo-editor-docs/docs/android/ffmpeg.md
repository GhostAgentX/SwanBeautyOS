# Use of FFmpeg

> Use of FFmpeg

# Use of FFmpeg  

Banuba Video Editor SDK uses FFmpeg version ```5.3.0 ```

## Guidelines to use FFmpeg dependency in your app:

Add Banuba FFmpeg dependency from gradle file.
```groovy
implementation "com.banuba.sdk:ffmpeg:5.3.0"
```

Add the following code in your Activity to check whether everything is correct:

```kotlin
com.banuba.sdk.ve.processing.FFmpeg(context = this).execute(emptyArray()).run {
    waitFor()
    Log.d("FFmpeg", errorStream.reader().readText())
}
```
The output should contain information about version of FFmpeg libraries.

We recommend using our FFMpeg functionality, as it offers a very wide range of tools.
