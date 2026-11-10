# Share video screen on Android

> Share video screen on Android

# Share video screen on Android

Share video screen allows users to easily share an exported video using popular social media services and OS specific components.

:::info
This is an optional screen that you can add to your video editing flow.
:::

## Integration

Create new layout ```activity_video_sharing.xml``` file in ```res/layout``` folder. This layout is required for integrating
```VideoSharingFragment``` from the SDK.

``` xml
<androidx.fragment.app.FragmentContainerView xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    android:id="@+id/fragmentContainer"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:ignore="MissingDefaultResource" />
```

Next, create new ```VideoSharingActivity``` that will handle social media keys and start video sharing screen.
``` kotlin
class VideoSharingActivity : AppCompatActivity(R.layout.activity_video_sharing) {

    companion object {
        // Set up your Facebook app id
        const val FACEBOOK_APP_ID = ""
    }

    private val exportResult by lazy(LazyThreadSafetyMode.NONE) {
        intent?.getParcelableExtra<ExportResult.Success>(EXTRA_EXPORTED_SUCCESS)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val videoSharingFragment = VideoSharingFragment.newInstance(
            exportResult = exportResult,
            fbAppId = FACEBOOK_APP_ID
        )
        supportFragmentManager.addFragment(
            videoSharingFragment,
            VideoSharingFragment.TAG,
            R.id.fragmentContainer,
            false
        )
    }

    override fun onDestroy() {
        super.onDestroy()
        // SampleApp is an implementation available in main Video Editor Sample.
        // Release video editor dependencies when the user leaves this creen
        (application as? SampleApp)?.releaseVideoEditor()
    }
}
```
and specify ```VideoSharingActivity``` in ```AndroidManifest.xml``` file.

``` xml
<application 
    ...>
      <activity
            android:name=".VideoSharingActivity"
            android:configChanges="orientation|screenSize|screenLayout"
            android:exported="false"
            android:theme="@style/CustomIntegrationAppTheme"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="${applicationId}.ShowExportResult" />
                <category android:name="android.intent.category.DEFAULT" />
            </intent-filter>
        </activity>
</application>

```

Finally, start ```VideoSharingActivity``` to open video sharing screen. 
``` kotlin
val intent = Intent(getString(com.banuba.sdk.export.R.string.export_action_name, packageName)).apply {
    putExtra(EXTRA_EXPORTED_SUCCESS, exportResult)
}
startActivity(intent)
```
