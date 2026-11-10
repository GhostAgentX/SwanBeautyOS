# Android

<details>
<summary><strong>2020</strong></summary>

  ### [1.0.10]
## Migration guide
  EditorEffectProvider became parameterized interface, to apply for MaskEffects, VisualEffects and TimedEffects just make them as EditorEffectProvider<IEffectDrawable> implementation
  ProvideTrackContract changed. Instead of EXTRA_MUSIC_EDITOR_ACTION we have EXTRA_TRACK_TYPE key
  CameraAnimationProvider.VideoState changed. it has 2 parameters: availableDurationMs & maxDurationMs. If you have implementation with RecordButtonView and RecordingButtonOuterView you should pass these parameters into startAnimation of outer view and overwrite the method itself:
  ```Kotlin
  fun startAnimation(availableDurationMs: Long,
                   maxDurationMs: Long) {
    circleWidth = context.dimen(R.dimen.record_button_circle_progress_width)
    animator.duration = maxDurationMs
    animator.cancel()
    animator.currentPlayTime = maxDurationMs - availableDurationMs
}
  ```
  Update Kotlin to 1.4.10 version (need to update to avoid crash with FunctionReferenceImpl instance)
  Update config video editor.json: add supportsMultiChoiceByLongTap flag for gallery section.
  ### [1.0.11]
## Migration guide
  If you use **ContentFeatureProvider** interface, refactor its handleResult method according to the use case. For external activity as a feature provider it looks like:
  ```Kotlin
  override fun handleResult(
            hostFragment: WeakReference<Fragment>,
            intent: Intent?,
            block: (TrackData?) -> Unit
    ) {
        hostFragment.get()
                ?.registerForActivityResult(ProvideTrackContract()) { result: TrackData? ->
                    block(result)
                }?.launch(intent)
    }
  ```
  Style that inherited from SearchViewStyle should change all its attributes names to:
  ```XML
  stickers_*** -> editor_***
  ```
  ### [1.0.12]
  
## List of changes
  - bugfixes (20 issues resolved)
  - change GIF size when first added
  
## Migration guide
  
Add to camera.config has a new item: FPS regulator. Put it false, if you want to try adaptive FPS. This makes the items in the camera lighter. This is experimental
  ```JSON
  "useFixedFPS30": true
  ```
  
  
  ### [1.0.13]
  
  
## **Migration guide**
  1. Dependencies for AR related managers was restructured. 
  Inside video editor Koin module **CameraSdkManager** implementation should be **deleted** (now it is provided from ve-sdk-flow module) and **IUtilityManager** implementation should be **added**:
  ```Kotlin
  ~~override val banubaSdkManager: BeanDefinition<CameraSdkManager> =
        single(override = true, createdAtStart = true) {
            val context = get<Application>().applicationContext
            val effectsResourceManager = EffectsResourceManager(
                assetManager = context.assets,
                storageDir = context.filesDir
            )
            val utilityManager: IUtilityManager = BanubaClassFactory.createUtilityManager(
               context, effectsResourceManager
            )
            val effectPlayerProvider: AREffectPlayerProvider = get()
            BanubaCameraSdkManager.createInstance(
                context,
                effectsResourceManager,
                effectPlayerProvider,
                utilityManager
            )
        }~~
override val utilityManager: BeanDefinition<IUtilityManager> = single(override = true) {
        BanubaClassFactory.createUtilityManager(
            context = get(),
            resourceManager = get()
        )
    }
  ```
  
  1. Add com.banuba.sdk:effect-player-adapter:1.0.13 to dependencies
  1. **CameraTimerProvider** was removed. Implement **CameraTimerAnimationProvider**, **CameraTimerActionProvider **instead
  1. Update resources for effect player:
  1. Download [https://drive.google.com/file/d/1whnJ6lUJlrOeCdNYDfrapsiSmnSAq2is/view?usp=sharing](https://drive.google.com/file/d/1whnJ6lUJlrOeCdNYDfrapsiSmnSAq2is/view?usp=sharing)
  1. Paste new files into assets/bnb-resources/flow/ folder
  1. In file **view_camera_overlay.xml** use **com.banuba.sdk.cameraui.ui.widget.ItemPickerView **instead of **com.banuba.sdk.cameraui.ui.widget.SpeedPickerView. **Skip this step, if you don't have **view_camera_overlay.xml.**
  1. **assetMerger.gradle** script no longer needed so it could be removed
## List of changes
  - bugfixes and crashes (20 issues resolved)
  - Face AR SDK v 0.32 ([https://docs.banuba.com/face-ar-sdk/overview/releases/](https://docs.banuba.com/face-ar-sdk/overview/releases/))
  - Audiobrowser
  
  ### [1.0.13.1]
  
  
### How to enable Hands Free feature:
  
  Add class
  ```Kotlin
  internal class VideoEditorTimerAnimationProvider(context: Context) : CameraTimerAnimationProvider {

    companion object {
        private const val MAX_TIMER_DURATION_MS = 10 * 1000L
    }

    private val animationView by lazy(LazyThreadSafetyMode.NONE) {
        LottieAnimationView(context).apply {
            val size = context.dimenPx(R.dimen.camera_timer_animation_size)
            layoutParams = FrameLayout.LayoutParams(size, size).apply {
                gravity = Gravity.CENTER
            }
            setAnimation(R.raw.camera_timer_animation_10)
        }
    }

    override val isInProgress: Boolean
        get() = animationView.isAnimating

    override fun provideView() = animationView.apply {
        speed = -1F
    }

    override fun animate(state: TimerEntry) {
        if (state.durationMs > MAX_TIMER_DURATION_MS) throw IllegalArgumentException("timer duration > 10 sec")
        animationView.playAnimation()
        animationView.progress = state.durationMs.toFloat() / MAX_TIMER_DURATION_MS
    }

    override fun pause() {
        animationView.pauseAnimation()
    }

    override fun cancel() {
        animationView.cancelAnimation()
    }

    override fun setCallback(listener: AnimatorCallback?) {
        animationView.removeAllAnimatorListeners()
        animationView.addAnimatorListener(listener)
    }
}
  ```
  
  In video editor koin module add
  ```Kotlin
  override val cameraTimerAnimationProvider: BeanDefinition<CameraTimerAnimationProvider> =
    factory(override = true) {
        VideoEditorTimerAnimationProvider(context = get())
    }

override val cameraTimerActionProvider: BeanDefinition<CameraTimerActionProvider> =
    single(override = true) {
        HandsFreeTimerActionProvider()
    }
  ```
  
  Add this file to videoeditor module **res/raw**
  camera_timer_animation_10.json
### List of changes
  - Hands free feature
</details>

<details>
<summary><strong>2021</strong></summary>

  ### [1.0.14]
## **Migration guide**
  1. Face AR SDK integration changed. Please remove 
  -  **android_nn, flow, frx, MoMoFRX*** *folders* *in assets/bnb-resources 
  -  **assetsMerger.gradle** script
  Correct **assets/bnb-resources** folder should look like as shown below
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/a74261f2-24d4-4aae-8525-de862fac6998/Untitled.png)
  
  1. EditorEffects.kt does not include **masks **variable** **anymore.
  ```Kotlin
  EditorEffects(
            visual = visualEffects,
            time = timeEffects,
            equalizer = emptyList()
        )
  ```
  
  1. IEditorSessionHelper.kt was renamed to EditorSessionHelper.kt
  1. The following dependencies were added to the SDK as transitive dependencies and you can remove them from your app/build.gradle.
  ```Kotlin
  ~~implementation 'androidx.core:core-ktx:1.3.2'
implementation 'androidx.appcompat:appcompat:1.2.0'
implementation 'androidx.constraintlayout:constraintlayout:2.0.2'
implementation 'androidx.lifecycle:lifecycle-extensions:2.2.0'
implementation 'androidx.lifecycle:lifecycle-livedata-ktx:2.2.0'
implementation 'androidx.fragment:fragment-ktx:1.3.0-beta01'
implementation "androidx.recyclerview:recyclerview-selection:1.1.0-rc03"
implementation 'com.google.android.material:material:1.2.1'
implementation 'org.koin:koin-androidx-viewmodel:2.1.6'
implementation "com.airbnb.android:lottie:3.4.0"
implementation "com.github.bumptech.glide:glide:4.11.0"~~
  ```
  1. BanubaClassFactory.createUtilityManager() method changed. It requires only android.content.Context
  ```Kotlin
  override val utilityManager: BeanDefinition<IUtilityManager> = single(override = true) {
        BanubaClassFactory.createUtilityManager(
            context = get()
        )
    }
  ```
  
  1. AR masks are a separate module now. Please add dependency in your app/build.gradle file com.banuba.sdk:ar-cloud-sdk dependency
  ```Kotlin
  implementation "com.banuba.sdk:ar-cloud-sdk:1.0.14"
  ```
  1. Make sure you are not using **com.banuba.sdk:effect-player** dependency in your app/build.gradle file.
  1. Add **ArCloudKoinModule** module to Koin for Video Editor SDK.
   
  ```Kotlin
  class IntegrationKotlinApp : Application() {

    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidContext(this@IntegrationKotlinApp)

            // pass the customized Koin module that implements required dependencies.
            modules(
                    VideoEditorKoinModule().module,
                    ArCloudKoinModule().module
            )
        }
    }
}
  ```
  
  1. Remove **GiphyStickerLoader** implementation from video editor module. Now it is included in the SDK by default.
  1. Remove **GlideImageLoader **implementation from video editor module. Now it is included in the SDK by default.
  1. Override **cameraTimerStateProvider** for your custom implementation of FlowEditorModule.kt
  ```Kotlin
  override val cameraTimerStateProvider: BeanDefinition<CameraTimerStateProvider> =
	factory {
	    YourTimerStateProvider()
	}

internal class YourTimerStateProvider : CameraTimerStateProvider {

    override val timerStates = listOf(
        TimerEntry(
            durationMs = 0,
            iconResId = R.drawable.ic_stopwatch_off
        ),
        TimerEntry(
            durationMs = 3000,
            iconResId = R.drawable.ic_stopwatch_on
        )
    )
}
  ```
  1. Layout of fragment_dialog_alert has changed. Add following code to fragment_dialog_alert.xml below TextView with id 'alertTitleText'
  ```XML
  <TextView
    android:id="@+id/alertDescriptionText"
    style="@style/AlertDialogDescriptionStyle"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    tools:text="Description" />
  ```
  Add new style to styles.xml
  ```XML
  <style name="AlertDialogDescriptionStyle">
    <item name="android:fontFamily">@font/roboto</item>
    <item name="android:textColor">@color/black</item>
    <item name="android:textSize">16sp</item>
    <item name="android:layout_marginTop">16dp</item>
</style>
  ```
  Full example of fragment_dialog_alert.xml:
  ```XML
  <?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:id="@+id/alertParentView"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:background="@drawable/bg_alert_dialog"
    android:orientation="vertical"
    android:padding="24dp">

    <TextView
        android:id="@+id/alertTitleText"
        style="@style/AlertDialogTitleStyle"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent"
        tools:text="Reset all?" />

    <TextView
        android:id="@+id/alertDescriptionText"
        style="@style/AlertDialogDescriptionStyle"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent"
        tools:text="Description" />

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="24dp"
        android:orientation="horizontal">

        <TextView
            android:id="@+id/alertPositiveButton"
            style="@style/AlertDialogActionButton.Positive"
            android:layout_marginEnd="4dp"
            tools:text="Да" />

        <TextView
            android:id="@+id/alertNegativeButton"
            style="@style/AlertDialogActionButton.Negative"
            android:layout_marginStart="4dp"
            tools:text="Нет" />

    </LinearLayout>
</LinearLayout>
  ```
  
  1. Check ContentFeatureProvider<TrackData> implementation. Example:  
  [Banuba/ve-sdk-android-integration-sample](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/mddocs/audio_content.md#step-3)
## List of changes
  - Reset music track;
  - Icons on camera and editor screens now got titles;
  - Re-ask permissions to files, camera and mic if denied;
  - Remember camera state (front, back);
  - Performance optimization, affected more robust app work at 20-60%. Some tracked cases:

  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/74c9c9e8-e108-40c0-b82b-0ce80242e67d/Untitled.png)
  *1180* is an SDK version 1.0.13, *1207* is a build with a new 1.0.14 version
  - Bugfixes;
  - UX improvements;
  
  
  ### [1.0.15]
  *Released on March 11, 2021*
  
## **Migration guide**
  > 👉 Here is the example of the PR sample of this update: [https://github.com/Banuba/ve-sdk-android-integration-sample/pull/62](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/62)
### New modules and dependencies
  1. `ar-cloud-sdk` module **has been** **moved** into a separate repository. To plug it in, add a new url into your **project level build.gradle**. You can use the same **user** and **password** values for credentials as used for https://github.com/Banuba/banuba-ve-sdk:
  ```Kotlin
  allprojects {
	repositories {
		...
		maven {
            name = "ARCloudPackages"
            url = uri("https://github.com/Banuba/banuba-ar")
						credentials {
                username = <The same username as for banuba-ve-sdk repo>
                password = <The same password as for banuba-ve-sdk repo>
            }
        }
		...
	}
}
  ```
  Also **change the name** of dependency: 
  ```Kotlin
  ~~implementation "com.banuba.sdk:ar-cloud-sdk:1.0.14"~~
implementation "com.banuba.sdk:ar-cloud:1.0.15"
  ```
  
  1. NEW module **banuba-token-storage-sdk **is released for token managing. Add a dependency **com.banuba.sdk:banuba-token-storage-sdk** into your **app/build.gradle** file:
  ```Kotlin
  implementation "com.banuba.sdk:banuba-token-storage-sdk:1.0.15"
  ```
  Token which is stored in `effect_player_token` string resource will be automatically handled by `TokenStorageKoinModule`.
  
  > ❗ **NOTE:** you do not need to pass Face AR SDK token in any place other than `effect_player_token` string resource.
  
  1. Remove custom implementations of ~~`AREffectPlayerProvider`~~ and ~~`IUtilityManager`~~ interfaces from Koin modules. They are now provided by default in `BanubaEffectPlayerKoinModule` module. Also, this module handles a token provided by `video_editor_token` string resource. You do not need to pass Video Editor token in any place other than `video_editor_token` string resource.

  1. Add  both `BanubaEffectPlayerKoinModule` and `TokenStorageKoinModule` modules to `startKoin` function:  
  ```Kotlin
  class YourCustomApp : Application() {

    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidContext(this@YourCustomApp)

            modules(
										VideoEditorKoinModule().module,
										BanubaEffectPlayerKoinModule().module,
										TokenStorageKoinModule().module
                    
            )
        }
    }
}
  ```
### Design/styles (related to redesign, changes in `VideoCreationTheme`)
  
  > ❗ **Note: every new attribute is provided with the default style, so if you do not need any customizations (i.e. change the font or background) you can omit adding these attributes.**
  
#### Camera screen:
  Delete attributes and styles: ~~`videoTimelineCheckedStyle`~~, ~~`videoTimelineUncheckedStyle`~~, ~~`videoTimelineCheckedIconStyle`~~ , because Normal and Slideshow tabs on **Camera screen **were removed.
#### Gallery creen
  **Gallery screen **now it has two tabs - **Video and Photo.** It is merged with a former **Slideshow** flow.
  1. Add `galleryTabLayoutStyle` and `galleryTabTextColors` attributes. For your custom style inside `galleryTabLayoutStyle` attribute you can use the following style as a parent:
  ```Kotlin
  <style name="GalleryTabLayoutStyle" parent="Widget.Design.TabLayout">
        <item name="android:layout_width">match_parent</item>
        <item name="android:layout_height">wrap_content</item>
        <item name="tabIndicatorColor"><!-- your custom color resource --></item>
        <item name="tabTextColor"><!-- your custom color resource --></item>
        <item name="tabSelectedTextColor"><!-- your custom color resource --></item>
        <item name="tabBackground"><!-- your custom color resource --></item>
        <item name="tabTextAppearance">@style/GalleryTabTextAppearance</item>
    </style>
  ```
  For `galleryTabTextColors` use color resource with 3 different states as follows  
  ```Kotlin
  <selector xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:color=<!-- your custom color resource --> android:state_enabled="true" android:state_selected="false" />
    <item android:color=<!-- your custom color resource --> android:state_enabled="false" android:state_selected="false" />
    <item android:color=<!-- your custom color resource --> android:state_selected="true" />
</selector>
  ```
  1. Remove ~~`gallery_light_status_bar`~~ and ~~`gallery_icon_back`~~.
#### Editor screen
  1. Remove ~~`editorCancelStyle`~~ and ~~`editorDoneStyle`~~ attributes. 
  1. Add `editorPlaybackControllerParentStyle`, `editorPlaybackControllerCancelStyle`, `editorPlaybackControllerPlayStyle`, `editorPlaybackControllerDoneStyle`. All these attributes are set up by default with the styles named appropriately. Now all action buttons that cancel or apply any user action are provided by these **new attributes. **Examples of styles that can be passed into new attributes are: 
  ```Kotlin
  <style name="CustomEditorPlaybackControllerParentStyle" parent="EditorPlaybackControllerParentStyle" />

<style name="CustomEditorPlaybackControllerCancelStyle" parent="EditorPlaybackControllerCancelStyle">
        <item name="android:src"><!-- your custom drawable resource i.e. svg or png icon --></item>
        <item name="android:padding">12dp</item>
    </style>

<style name="CustomEditorPlaybackControllerPlayStyle" parent="EditorPlaybackControllerPlayStyle">
        <item name="android:src"><!-- your custom drawable resource i.e. svg or png icon --></item>
        <item name="android:padding">8dp</item>
    </style>

<style name="CustomEditorPlaybackControllerDoneStyle" parent="EditorPlaybackControllerDoneStyle">
        <item name="android:src"><!-- your custom drawable resource i.e. svg or png icon --></item>
        <item name="android:padding">12dp</item>
    </style>
  ```
  1. Change the parent style under `editorTextDoneStyle` attribute. It uses now `EditorTextDoneStyle` as a parent instead of `EditorDoneStyle`: 
  ```Kotlin
  <style name="YourCustomEditorTextDoneStyle" parent="**EditorTextDoneStyle**">
        <item name="android:textColor"><!-- your custom color resource --></item>
    </style>
  ```
  1. Remove ~~`editor_icon_playback_visible`~~ attribute from `EditorOverlayStyle` if you override it. Now the playback icon is placed into the view that defined inside `editorPlaybackControllerPlayStyle` attribute. Previously, it was placed in the center of the screen.
#### Music Editor screen
  1. Remove ~~`musicEditorStyle`~~  attribute. All music editor icons related to **video playback** are placed into `editorPlaybackControllerXXX` styles (mentioned above in Editor screen section of this migration guide), where XXX is an appropriate icon name (see above the changes on the editor screen).
  1. Add `musicEditorPlaybackControllerParentStyle` attribute to customize the appearance of the view that holds **video playback** icons or the default will be used.
  1. Remove ~~`musicEditorVideoVolumeStyle`~~, ~~`musicEditorVideoVolumeContainerBackground`~~, ~~`hideBottomViewsInEditVolume`~~ attributes. 
  1. Add `musicEditorVideoVolumeContainerStyle`, `musicEditorVideoVolumeTitleStyle`, `musicEditorVideoVolumeValueStyle`, `musicEditorVideoVolumeProgressBarStyle` . They all setup an appearance of the bottom sheet controlling video volume on the music editor screen. Examples of your custom styles are: 
  ```Kotlin
  <style name="CustomMusicEditorVideoVolumeContainerStyle" parent="MusicEditorVideoVolumeContainerStyle">
	<item name="android:background"><!-- your custom drawable resource i.e. svg or png icon --></item>
</style>

<style name="CustomMusicEditorVideoVolumeTitleStyle" parent="MusicEditorVideoVolumeTitleStyle" />

<style name="CustomMusicEditorVideoVolumeValueStyle" parent="MusicEditorVideoVolumeValueStyle">
	<item name="android:textColor"><!-- your custom color resource --></item>
	<item name="android:textSize">16sp</item>
</style>

<style name="CustomMusicEditorVideoVolumeProgressBarStyle" parent="MusicEditorVideoVolumeProgressBarStyle">
	<item name="android:maxHeight">3dp</item>
	<item name="android:progressDrawable"><!-- your custom drawable resource i.e. svg or png icon --></item>
	<item name="android:progressTint"><!-- your custom color resource --></item>
	<item name="android:thumbTint"><!-- your custom color resource --></item>
</style>
  ```
  
  1. Add `musicEditorVoiceRecordingControllerParentStyle`, `musicEditorVoiceRecordingControllerCancelStyle`, `musicEditorVoiceRecordingControllerDoneStyle`, `musicEditorVoiceRecordingControllerResetStyle` attributes to customize voice recording screen on the music editor. Examples of your custom styles are: 
  ```Kotlin
  <style name="CustomVoiceRecordingControllerParentStyle" parent="VoiceRecordingControllerParentStyle" />

<style name="CustomVoiceRecordingControllerCancelStyle" parent="VoiceRecordingControllerCancelStyle">
	<item name="android:padding">12dp</item>
	<item name="android:src"><!-- your custom drawable resource i.e. svg or png icon --></item>
</style>

<style name="CustomVoiceRecordingControllerResetStyle" parent="VoiceRecordingControllerResetStyle">
	<item name="android:background"><!-- your custom drawable resource i.e. svg or png icon --></item>
	<item name="android:drawableLeft">@null</item>
	<item name="android:drawablePadding">0dp</item>
</style>

<style name="CustomVoiceRecordingControllerDoneStyle" parent="VoiceRecordingControllerDoneStyle">
	<item name="android:padding">12dp</item>
	<item name="android:src"><!-- your custom drawable resource i.e. svg or png icon --></item>
</style>
  ```
  1. Add `editorTextColorItemBackground` attribute with your custom drawable. This resource is used to select color on the text editor screen: 
  ```Kotlin
  <?xml version="1.0" encoding="utf-8"?>
<selector xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:state_activated="true">
        <shape android:shape="oval">
            <stroke android:width="6dp" android:color="@color/white" />
        </shape>
    </item>
    <item>
        <shape android:shape="oval">
            <stroke android:width="2dp" android:color="@color/white" />
        </shape>
    </item>
</selector>
  ```
#### Trimmer screen
  1. Remove ~~`trimmer_hint_visible`~~ attribute. It is not used anywhere in the SDK.
  1. Add `trimmerContentHintStyle` and `trimmerThumbHintIconStyle` attributes. They add a hint inside the trimmer screen and a little icon on the video thumbnails appropriately: 
  ```Kotlin
  <style name="CustomTrimmerContentHintStyle" parent="TrimmerContentHintStyle">
	<item name="android:visibility">visible</item>
</style>

<style name="CustomTrimmerThumbHintIconStyle" parent="TrimmerThumbHintIconStyle" />
  ```
#### Alerts
  1. **New alert window**  was added for requesting permissions. To customize this dialog `permissionsDialogContainerStyle`, `permissionsDialogDescriptionStyle`, `permissionsDialogActionButtonStyle` attributes with default styles were added: 
  ```Kotlin
  <style name="PermissionsDialogContainer">
	<item name="android:padding">24dp</item>
	<item name="android:background"><!-- your custom drawable resource i.e. svg or png icon --></item>
</style>

<style name="PermissionsDialogDescription">
	<item name="android:textSize">16sp</item>
	<item name="android:textColor"><!-- your custom color resource --></item>
	<item name="android:lineSpacingExtra">5sp</item>
	<item name="android:textAlignment">textStart</item>
	<item name="android:gravity">start</item>
</style>

<style name="PermissionsDialogActionButton">
	<item name="android:textSize">16sp</item>
	<item name="android:layout_width">0dp</item>
	<item name="android:layout_height">wrap_content</item>
	<item name="android:fontFamily"><!-- your custom font resource --></item>
	<item name="android:padding">8dp</item>
	<item name="android:textColor"><!-- your custom color resource --></item>
	<item name="android:gravity">center</item>
	<item name="android:background"><!-- your custom drawable resource i.e. svg or png icon --></item>
	<item name="android:foreground">?android:selectableItemBackgroundBorderless</item>
</style>
  ```
  1. **New alert** was added in case the user **returns to the camera screen** and some action was not finished. Icon (if you show icons for alerts) can be set up under `alert_camera_return_to_camera` theme attribute, and string resources: title - `alert_return_to_camera` and buttons - `alert_return_to_camera_positive`, `alert_return_to_camera_negative`.
  
  
#### WARNING: Resources
  A bulk of default drawable resources was removed from SDK. You need check if any of them are used within your app and provide your own resources instead.
### Export
  1. `ExportFlowManager` has two different implementations: `BackgroundExportFlowManager` to export video in the background and `ForegroundExportFlowManager` to make it in the foreground. You should remove your custom implementation and use **one of **mentioned above, for example: 
  ```Kotlin
  override val exportFlowManager: BeanDefinition<ExportFlowManager> = single(override = true) {
        ForegroundExportFlowManager(
            exportDataProvider = get(),
            editorSessionHelper = get(),
            exportDir = get(named("exportDir")),
            mediaFileNameHelper = get(),
            shouldClearSessionOnFinish = true
        )
    }
  ```
  New parameter `shouldClearSessionOnFinish` requires **true/false** values. This parameter defines if all temporary files (movies and restoration files) should be deleted or saved after export.
  1. Remove ~~`releaseRawSessionData()`~~ method if you want to use your custom implementation of `ExportFlowManager`.
  1. `ExportResultHandler` has a default implementation (`DefaultExportResultHandler`). This implementation ensures that the export result is delivered from `VideoCreationActivity` to outer activity by using `onActivityResult()` callback. Default implementation looks like this: 
  ```Kotlin
  class DefaultExportResultHandler: ExportResultHandler {

    override fun doAction(activity: AppCompatActivity, result: ExportResult.Success?) {
        if (result == null) {
            activity.finish()
            return
        }
        val resultCode = Activity.RESULT_OK
        val data = Intent().apply {
            putExtra(EXTRA_EXPORTED_SUCCESS, result)
        }
        activity.setResult(resultCode, data)
        activity.finish()
    }
}
  ```
  If it suits to your use case, remove your custom implementation of `ExportResultHandler` interface.
### Other
  1. `CameraTimerStateProvider` now has a default implementation (`DefaultTimerStateProvider`) with empty list of TimerEntry objects. So if you use any custom implementation you need to add an **override** parameter in the field providing it: 
  ```Kotlin
  override val cameraTimerStateProvider: BeanDefinition<CameraTimerStateProvider> =
        factory**(override = true)** {
            YourCustomTimerStateProvider()
        }
  ```
  
  1. New changes in `CameraRecordingAnimationProvider` interface (check out implementation example in the **[sample](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/java/com/banuba/example/integrationapp/videoeditor/impl/IntegrationAppRecordingAnimationProvider.kt)**):  
  - a method `setOnEndRecordingAnimationCallback(callback: (Boolean) → Unit)` changes arguments. Now callback uses Boolean parameter, which means is animation finished at the moment of invocation.
  - `setRecordingProgress(progressMs: Long)` method is added
  
## List of changes:
  - Video rotation on a trimmer screen.
  - Slideshow flow is now [merged with a gallery](https://www.figma.com/file/gjSAA1QT96ezQdEEAKyfCB/VE-flow?node-id=2404%3A7028) to make it simpler. Some UX improvements in the gallery also included.
  - Export in the background: don't need to wait until the video file is exported, you can open the next screens right away. 
  - Mask "Time Warp Scan", like in Tiktok ([Demo](https://drive.google.com/file/d/126mDmg-LtHXXGtaxt3lgoKtSm8DymRhW/view). Contact sales to have it).
  - When the commercial token expires, exported video quality is decreased to 360p, also Banuba watermark is added.
  - Devices, which are not supported by Video Editor got the pop-up message if the user tries to run it.
  - Devices, which are not supported by Face AR (AR masks module) hide Face AR features - masks, beauty, lut.
  - Improved navigation UX.
  - Bugfixes.
  - Bitrate has been reduced. [New changes](https://github.com/Banuba/ve-sdk-android-integration-sample#video-quality-params)
  
  ### [1.0.15.1]
  *Released on April 21, 2021*
  
  > ‼️ This release requires prior migration to **1.0.15 **
## **Migration guide**
  Here is an example of the PR sample for this update: [https://github.com/Banuba/ve-sdk-android-integration-sample/pull/72](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/72)
### New features
  1. Trim the video that you recorded. Previously the trimmer was available only for gallery videos, now it's also for the camera. To enable it just set the property `supportsTrimRecordedVideo` to `true` in  [video editor](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/assets/videoeditor.json)[ config file](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/assets/videoeditor.json), and `false` to disable the feature.
  ```JSON
  "supportsTrimRecordedVideo": true
  ```
  [Camera config file](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/assets/camera.json) has a new item `minChunkVideoDuration`. This property is used to set the minimum duration of the recorded chunk on camera screen. The rule to be followed within this parameter states that `minChunkVideoDuration >= minSourceVideoDuration` (from [video editor config file](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/assets/videoeditor.json)). 
  
  In this example chunk duration is set to 3 seconds:
  ```JSON
  "minChunkVideoDuration": 3000
  ```
  > ❗ **T****his value ****requires the following **`supportsTrimRecordedVideo: true`
  
  1. Change background with an image from the gallery. This feature allows a user to substitute the background with a photo. It is a paid feature, talk to the account manager to have it, they will send you the effect to install. This feature works only if *Face AR* product is engaged. 
### Design/styles
  > ❗ **Note: every new attribute is provided with the default style. If you do not need any customizations (i.e. change the font or background) you can omit adding these attributes.**
#### Change Background feature:
  Add new  `backgroundEffectContainerStyle`, `backgroundEffectHintStyle`,
  `backgroundEffectEmptyViewStyle`, `backgroundEffectPermissionsBtnStyle`, `backgroundEffectGalleryListStyle`, `backgroundEffectGalleryBtnStyle`, `backgroundEffectGalleryThumbStyle`, `backgroundEffectGalleryThumbTextStyle`,  `backgroundEffectGalleryThumbProgressStyle` and `backgroundEffectGalleryBorderedImageViewStyle` attributes for **Change Background** feature. 
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/1d4d3306-e637-48bb-9271-e498e5e5daeb/Background_1.png)
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/4898f207-7dc1-4fb5-9f05-a6a4e4c468d9/Background_2.png)
  Below is a **default implementation** of all styles used in a Background feature (if you want to customize Background feature UI we recommend using these styles as parents for your custom styles):
  ```XML
  <style name="BackgroundEffectContainerStyle">
    <item name="android:layout_width">match_parent</item>
    <item name="android:layout_height">wrap_content</item>
    <item name="android:minHeight">124dp</item>
    <item name="android:background">@drawable/bg_background_effect</item>
</style>

<style name="BackgroundEffectHintStyle" parent="Text">
    <item name="android:layout_width">match_parent</item>
    <item name="android:layout_height">wrap_content</item>
    <item name="android:padding">16dp</item>
    <item name="android:textSize">14sp</item>
    <item name="android:gravity">center</item>
    <item name="android:textColor">@color/white60</item>
</style>

<style name="BackgroundEffectEmptyViewStyle" parent="Text">
    <item name="android:layout_marginBottom">44dp</item>
    <item name="android:layout_width">match_parent</item>
    <item name="android:layout_height">wrap_content</item>
    <item name="android:textSize">14sp</item>
    <item name="android:textColor">@color/white</item>
    <item name="android:gravity">center</item>
    <item name="android:text">@string/background_effect_empty_view</item>
</style>

<style name="BackgroundEffectPermissionsBtnStyle" parent="BoldText">
    <item name="android:layout_width">wrap_content</item>
    <item name="android:layout_height">wrap_content</item>
    <item name="android:textSize">14sp</item>
    <item name="android:textColor">@color/black</item>
    <item name="android:layout_marginBottom">28dp</item>
    <item name="android:background">@drawable/bg_permission_btn</item>
    <item name="android:text">@string/background_effect_permission_btn</item>
</style>

<style name="BackgroundEffectGalleryThumbStyle">
    <item name="android:layout_width">wrap_content</item>
    <item name="android:layout_height">wrap_content</item>
    <item name="scale_checked">1.2</item>
    <item name="scale_unchecked">1.0</item>
    <item name="item_margin">6dp</item>
    <item name="android:layout_marginStart">4dp</item>
    <item name="android:layout_marginEnd">4dp</item>
</style>

<style name="BackgroundEffectGalleryBtnStyle">
    <item name="android:layout_width">wrap_content</item>
    <item name="android:layout_height">wrap_content</item>
    <item name="android:background">@drawable/ic_btn_gallery_sticky</item>
</style>

<style name="BackgroundEffectGalleryListStyle">
    <item name="android:layout_width">0dp</item>
    <item name="android:layout_height">wrap_content</item>
</style>

<style name="BackgroundEffectGalleryThumbTextStyle" parent="Text">
        <item name="android:textColor">@color/white</item>
        <item name="android:layout_width">wrap_content</item>
        <item name="android:layout_height">wrap_content</item>
        <item name="android:layout_marginBottom">4dp</item>
        <item name="android:layout_marginEnd">6dp</item>
        <item name="android:textSize">10sp</item>
        <item name="android:shadowColor">@color/black</item>
        <item name="android:shadowDx">0</item>
        <item name="android:shadowDy">1</item>
        <item name="android:shadowRadius">2</item>
   </style>

<style name="BackgroundEffectGalleryThumbProgressStyle" parent="ThrobberViewStyle">
        <item name="android:layout_height">16dp</item>
        <item name="android:layout_width">16dp</item>
        <item name="android:layout_margin">24dp</item>
        <item name="circle_width">2dp</item>
</style>

<style name="BackgroundEffectGalleryBorderedImageViewStyle">
        <item name="android:layout_width">@dimen/icon_size_48</item>
        <item name="android:layout_height">@dimen/icon_size_48</item>
        <item name="bordered_image_corner_radius">@dimen/background_effect_gallery_thumb_radius</item>
        <item name="bordered_image_border_drawable">@drawable/bg_camera_effect_item</item>
</style>
  ```
  Also these are some strings that can be overridden for localization:
  ```Kotlin
  <string name="background_effect_empty_view">No media found</string>
<string name="background_effect_permission_btn">Allow Access</string>
<string name="background_effect_list_hint">Select media to change the background:</string>
<string name="background_effect_list_permission">Allow access to Gallery to change the background</string>
<string name="background_effect_invalid_file">Damaged file</string>
  ```
#### Gallery screen:
  Attribute `android:src` was removed from the style `GalleryBackButtonStyle`
  ```XML
  <style name="GalleryBackButtonStyle">
    <item name="android:layout_height">@dimen/close_icon_size</item>
    <item name="android:layout_width">@dimen/close_icon_size</item>
    <item name="android:layout_centerVertical">true</item>
    <item name="android:layout_marginStart">16dp</item>
    ~~<item name="android:src">?attr/gallery_icon_back</item>~~
</style>
  ```
  Back icon has **two states: **if some files are** **already selected in the gallery and if nothing is selected. Both states have different drawables that are configured into `VideoCreationTheme` attributes:
  - `gallery_icon_back` -  nothing is selected → **get back to the previous screen**
  - `gallery_icon_cross` - some files are selected → **clear selection**
  ```XML
  <item name="gallery_icon_back">@drawable/ic_back</item>
<item name="gallery_icon_cross">@drawable/ic_cross</item>
  ```
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/fd058587-4a90-4778-8f08-08048a905f0e/gallery3.png)
## List of changes:
  1. Trim the video that you recorded. Previously trimmer was available only for gallery videos, now also for the camera. 
  1. Change background with an image from gallery (Contact sales to have it in your package).
  1. Bump [Koin](https://insert-koin.io/) version to 2.2.2
  1. Bugfixes.
  
  ### [1.0.16]
  *Released on May 31, 2021*
  
  > ‼️ This release requires prior migration to **1.0.15.1**
  > 👉 When you migrate to this new version, it will require a new token. Please, contact Banuba representatives to get new token.
  
### List of changes
  1. **PIP - picture in picture (same as "Duet" on Tiktok).**
With this feature, the user can shoot his reaction on some video he's excited about. As a result, there'll be two videos in one frame, like this.
  [Embed: https://s3-us-west-2.amazonaws.com/secure.notion-static.com/5365cdd4-64ca-4368-8767-ef302f2fbdd3/PiP_demo.mp4](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/5365cdd4-64ca-4368-8767-ef302f2fbdd3/PiP_demo.mp4)
  To start `BanubaVideoEditor` with an external video use the following  method:
  ```Kotlin
  VideoCreationActivity.buildPipIntent(
         context: Context,
         pictureInPictureVideo: Uri,
         additionalExportData: Parcelable?,
         audioTrackData: TrackData?
)
  ```
  > ❗ 
  The feature is not available by default. Please contact to Banuba representatives to get more details how to get this feature in your app.
  1. **Token Storage options**
  Banuba token can now be stored in Firebase. Please follow this [guide](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/mddocs/token_on_firebase.md)
  1. **Use custom gallery implementation.**
  Gallery screen is sliced to be a separate module. You can rebuild your own gallery experience and substitute it with our default one, if you want to.
  1. **Single Token for Video Editor SDK**
  NOW Video Editor SDK uses only one token.
We combined Face AR token, video effects token, AR Cloud token, and much more into one single ***banuba_token*** for simplicity and scalability.
  1. **Post processing effects changes**
  Post processing effects was moved to new token. Remove editorEffects dependency from `VideoEditorKoinModule`. Also remove `VisualEffects` and `TimeEffects` classes.
This effects will be automatically added.
  1. **Background substitution with video**
  Background substitution now also supports video. Previously it was working only with photo.
  1. **Alert styles**
  Now you can customize alert dialog styles. [See guide](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/mddocs/alert_styles.md)
  
  
### Migration guide
  
  Here is an example of the [PR sample](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/92): 
  
  1. **Gallery changes:**
  - attrubute `galleryChoiceButton` and `GalleryChoiceButtonStyle` are removed
  - New gallery module. Add to gradle dependencies:
  ```Kotlin
   implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
  ```
  - New koin module: add `GalleryKoinModule()`* *to koin modules initialization
  - `TrimmerBackButtonStyle` does not use `gallery_icon_back` icon by default now. It must be setup in the style itself. [See example](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/res/values/themes.xml#L740)
  - attributes `gallery_icon_back` and `gallery_icon_cross` are removed. 
  Now to change back button appearance just put a background on `GalleryBackButtonStyle` as selector where activated state is used for cross icon (to clear selection) and not activated state is for normal back button (to return on previous screen).
  [See example](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/res/values/themes.xml#L697)
  - We do not use recyclerview-selection library anymore. So you can safely delete this dependency from your video editor module if you have it.
  1. Default style in audio-browser was renamed: `AudioBrowserPlaybackBtnStyle` to `AudioBrowserTrackPlaybackBtnStyle` (to ease the usage)
  1. Class `com.banuba.sdk.token.storage.TokenStorageKoinModule` moved to `com.banuba.sdk.token.storage.di.TokenStorageKoinModule`
  1. `VideoCreationActivity::buildIntent()` method has changed.
You can launch banuba video editor via following methods:
  - Will start video editor in a normal way:
`VideoCreationActivity.buildIntent(
         context: Context,
         additionalExportData: Parcelable?,
         audioTrackData: TrackData?
)`
  - Will start video editor from Trimmer screen i.e. camera screen is skipped:
 `VideoCreationActivity.buildPredefinedVideosIntent(
         context: Context,
         predefinedVideos: Array<Uri>,
         additionalExportData: Parcelable?,
         audioTrackData: TrackData?
)`
  - Will start video editor in PIP mode:
` VideoCreationActivity.buildPipIntent(
         context: Context,
         pictureInPictureVideo: Uri,
         additionalExportData: Parcelable?,
         audioTrackData: TrackData?
)`
  1. `MediaSizeProvider` was renamed to `MediaResolutionProvider`. This class now returns `VideoResolution` instead of Size.
In `ExportManager.Params.Builder()` you can pass default and optimal videoResolution via `sizeProvider.provideOptimalExportVideoSize()`, or your value from `VideoResolution` enum.
  1. `ForegroundExportFlowManager` and `BackgroundExportFlowManager` requires `PublishManager`` dependency.
  Pass `publishManager = get()` to provide default simple implementation.
With help of `PublishManager` you can save your videos in native gallery
  1. ***ar_cloud_client_id*** was moved to new token.
Remove ***ar_cloud_client_id*** from string resources and  ***arEffectsCloudUuid*** from `VideoEditorKoinModule`
  1. Optimized masks and effects usage on post processing, became smoother now.
  1. Bugfixes.
  
### Performance update
  Latest performance numbers can be found here: 
  
  - 
  ### [1.0.16.1]
  *Released on June 9, 2021*
  
  > ‼️ This release requires prior migration to **1.0.16**
  
### List of changes
  1. Update ExoPlayer version to [2.14](https://github.com/google/ExoPlayer/blob/release-v2/RELEASENOTES.md#2140-2021-05-13)
  1. Bugfixes.
### Migration guide
  Here is an example of the [PR sample](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/97)
### Performance update
  Latest performance numbers can be found here: 
  
  
  ### [1.0.16.2]
  *Released on June 16 2021*
  
  > ‼️ This release requires prior migration to **1.0.16.1**
  
### List of changes
  1. Bugfixes.
### Migration guide
  Here is an example of the [PR sample](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/101)
### Performance update
  Latest performance numbers can be found here: 
  
  
  ### [1.0.16.3]
  *Released on June 18 2021*
  
  > ‼️ This release requires prior migration to **1.0.16.2**
  
### List of changes
  1. Bugfixes.
  
  
### Migration guide
  Set banubaSdkVersion to 1.0.16.3
### Performance update
  Latest performance numbers can be found here: 
  
  
  ### [1.0.17]
  *Released on July 13, 2021*
  
  > ‼️ This release requires prior migration to **1.0.16.3**
  
### List of changes
  
  1. Save undone editing progress to **Drafts**. Continue making cool videos anytime!
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/1d6c7818-adeb-4040-95ba-cd4d3ca1604b/drafts.gif)
  1. New Picture in Picture modes: React, Landscape, Portrait:
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/5c1b5607-b9f6-4384-ba0d-0b10ec898bf4/PiP_all.gif)
  1. There is an option to get **GIF image as a preview** of exported video. Checkout our [guide](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/mddocs/faq.md#12-how-to-obtain-gif-preview-image-of-exported-video) inside FAQ section.
  1. You can configure **muting microphone behavior** on camera screen for some scenarios: 
  ```Kotlin
  override val cameraMuteMicConfig: BeanDefinition<CameraMuteMicConfig> = factory(override = true) {
	CameraMuteMicConfig(
	    muteInNormalMode = false,
	    muteInPipMode = true,
	    muteWithAudioTrack = true
	)
}
  ```
  1. The SDK now collects **few more data: **start and initiation of the video editor,  exported video metadata. This includes the following data:
  1. export duration
  1. length of the exported video
  1. number of exported videos
  1. resolution
  1. used effects
  1. SDK version
  1. OS version
  1. Device
  1. Token
  > 🔒 **SDK does not collect any user data!**
  1. Bugfixes:
  - Fix crash when no selected files returned from external gallery
  - Fix bug with unsaved position on audio browser when an app returns from the background
  - Fix bug with failed Giphy response on stickers loading
  
  
  
### Migration guide
#### Checkout an [example of migration to 1.0.17](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/110) version in our sample.
  
  1. **AudioBrowser** has **Show more** button. It allows to load more tracks inside audio browser.
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/49bc464d-ece3-4243-b652-8f64b466bbab/Screenshot_20210712-120215_Banuba_VE_Dev.jpg)
  This feature is provided with new styles:
  ```Kotlin
  - audioBrowserTrackLoadMoreStyle
- audioBrowserTrackLoadMoreItemStyle
- audioBrowserThrobberViewStyle
  ```
  and string resource (for localization):
  ```Kotlin
  audio_browser_load_more
  ```
  To customize its appearance just override default styles as below (вставить существующие ссылки):
  ```Kotlin
  <style name="CustomAudioBrowserTrackLoadMoreItemStyle" parent="AudioBrowserTrackLoadMoreItemStyle" />

<style name="CustomAudioBrowserTrackLoadMoreStyle" parent="AudioBrowserTrackLoadMoreStyle" />

<style name="CustomAudioBrowserThrobberViewStyle" parent="ThrobberViewStyle"/>
  ```
  1. New **Drafts** screen is available from the gallery screen, here is the [guide](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/mddocs/gallery_styles.md) on how to customize the gallery and drafts screens. 
  1. Since the Drafts feature was implemented there are some changes in [confirmation alerts](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/mddocs/alert_styles.md#confirmation-alert). We **removed** following attributes for alert icons:
  ```Kotlin
  ~~- alert_camera_return_to_camera
- alert_camera_return_to_editor
- alert_camera_return_to_trimmer~~
  ```
  And **add** new attributes for icons:
  ```Kotlin
  - alert_draft_remove_icon_res
- alert_draft_update_icon_res
- alert_draft_restore_icon_res
  ```
  If you do not use icons for confirmation alerts you may not change anything with attributes but only check out new string resources for localization inside [Confirmation alerts](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/mddocs/alert_styles.md#confirmation-alert) section.
  1. Since **Draft** feature was implemented there are some changes in `ExportFlowManager` implementation. If you use `ForegroundExportFlowManager` or `BackgroundExportFlowManager` just add `draftManager` dependency within constructor:
  ```Kotlin
  override val exportFlowManager: BeanDefinition<ExportFlowManager> = single(override = true) {
        ForegroundExportFlowManager(
            exportDataProvider = get(),
            editorSessionHelper = get(),
            exportDir = get(named("exportDir")),
            mediaFileNameHelper = get(),
            shouldClearSessionOnFinish = true,
            publishManager = get(),
            draftManager = get()
        )
    }
  ```
  **NOTE**: If you use `ForegroundExportFlowManager` provided by default and **did not override** its implementation in koin module - no additional action is required.
  1. `ExoPlayerPictureInPictureProvider` is provided by default in Video Editor SDK which means you can remove it if you use Picture In Picture.
  ```Kotlin
  ~~override val pipProvider: BeanDefinition<IPictureInPictureProvider> = single(override = true) {
        ExoPlayerPictureInPictureProvider()
    }~~
  ```
  1. If you use `HandsFreeTimerActionProvider` just check correct import statement within koin module - this class was moved from `ve-flow-sdk` into `ve-camera-ui-sdk` module:
  ```Kotlin
  ~~import com.banuba.sdk.ve.flow.provider.~~~~HandsFreeTimerActionProvider~~
import com.banuba.sdk.cameraui.domain.HandsFreeTimerActionProvider
  ```
  1. **For any** `ContentFeatureProvider` implementation (i.e. for audio content provider) add `Fragment` as the second parameter:
  ```Kotlin
  override val musicTrackProvider: BeanDefinition<ContentFeatureProvider<TrackData, Fragment>> =
        single(named("musicTrackProvider"), override = true) {
            AudioBrowserMusicProvider()
        }
  ```
  1. **Record Button** has its own style in the main theme (check out our [detailed guide](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/mddocs/record_button_styles.md)). 
  In case you want **to remain the approach with custom view** just change `provideView()` method signature within your implementation of `CameraRecordingAnimationProvider` with  `Context` parameter:
  ```Kotlin
  override fun provideView(context: Context)
  ```
  In case you want **to apply the approach with custom style**, follow the style configuration presented inside [migration PR](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/110). Please do not forget to remove `CameraRecordingAnimationProvider` from koin module:
   
  ```Kotlin
  ~~override val cameraRecordingAnimationProvider: BeanDefinition<CameraRecordingAnimationProvider> =
        factory(override = true) {
            IntegrationAppRecordingAnimationProvider(context = get())
        }~~
  ```
  1. All major Video Editor SDK **dependencies were updated** (check recent versions [here](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/mddocs/all_dependencies.md))
  1. Parameter `supportsTextOnVideo` was added inside [videoeditor.json](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/assets/videoeditor.json) file to toggle text on video feature. By default the feature is **available.**
### Performance update
  Latest performance numbers can be found here: 
  
  
  ### [1.0.17.1]
  *Released on July 27, 2021*
  
  > ‼️ This release requires prior migration to **1.0.17**
  
### List of changes
  
  1. Draft feature can be turned off now. 
  1. Bugfixes:
  1. Crash when *minify = enabled* in native code
  1. Crash when opening video editor activity, when using some codec 
  1. Crash on camera, when opening gallery, while using exposition
  
  
  
### Migration guide
#### Checkout an [example of migration to 1.0.17.1](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/116) version in our sample.
  1. Draft configuration.
  By default drafts enabled, asks the user to save a draft before leave any VideoEditor screen. If you need to change drafts configuration you should add the code below in the `VideoEditorKoinModule`:
  ```Kotlin
  override val draftConfig: BeanDefinition<DraftConfig> = factory(override = true) {
        DraftConfig.ENABLED_ASK_TO_SAVE
}
  ```
  You can choose one of these options:
  1. `ENABLED_ASK_TO_SAVE` - drafts enabled, asks the user to save a draft
  1. `ENABLED_SAVE_BY_DEFAULT` - drafts enabled, saved by default without asking the user
  1. `DISABLED` - disabled drafts
  
  
  ### [1.0.18]
  *Released on August 19, 2021*
  
  > ‼️ This release requires prior migration to **1.0.17.1

**In the next 19th version we deprecate a method for changing text look (bold, italic, underline). Instead, we introduce new text UX, including changing fonts.
  **
**
  
  
### List of changes
  
  1. Aspect ratio. Choose the size of your video (16:9. 9:16, 4:3, 4:5, or the size of the original video).
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/e7460f17-6ee1-45e4-b4f3-b21691202780/aspects_export.gif)
  1. The editing screen is now opened instantly after trimming. Previously, there was a delay, caused by file creation. 
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/7ce0aa59-1689-4759-890b-d510c3d17f33/trim_export.gif)
  1. Music library can now be launched without Mubert. Use local songs right away.
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/5661d6a5-dcc0-439a-981e-7bb38c7083c5/music_export.gif)
  1. New shiny speed picker.
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/037d4485-a47f-4819-a07c-701017feefd4/speed_export.gif)
  1. Drafts preview are now playable.
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/7c45dc1a-f28e-4120-acc5-a98be5e43fa7/drafts_export.gif)
  1. x86/x86_64 architecture is now supported. VE SDK is now can be launched on emulators and several x86/x86_64 phones.
  1. Downloading AR masks on the editor screen.
  1. Main bug fixes:
  - Crash with long videos trimming;
  - Crash with recording button animation on Android 6;
  - Default style for stickers search view to change the transparent background;
  - Drafts button title on the camera screen;
  - Media files in the gallery on Android 7;
  - Effects serialization in drafts;
  - Resetting trim ranges when adding new video on trimmer screen.
  
### Migration guide
  
  > 👉 Here is the example of the PR sample of this update: [link](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/119)
  
  1. **x86**** support is added**. To remove x86/x86_64 native libs from apk, add to *app/build.gradle *`defaultOptions.ndk.abiFilters "armeabi-v7a", "arm64-v8a"`
  1. camera.json config file was changed. `supportDurationTimeline` and `showConfig` params were removed, `startFrontFacingFirst` was added. 
  ```Kotlin
  	"minVideoDuration": 3000,
	"maxVideoDuration": 60000,
	"minChunkVideoDuration": 1000,
	"takePhotoOnTap": true,
	"supportsMultiRecords": true,
	"supportsFlashlight": true,
	~~"supportsDurationTimeline": true,~~
	"supportsSpeedRecording": true,
	"supportsExternalMusic": true,
	"supportsMuteMic": true,
	"textOnMaskColorCountOnPage": -1,
	"switchFacingOnDoubleTap": true,
	"startFrontFacingFirst": true,
	"saveLastCameraFacing": true,
  "useFixedFPS30": true,
	"showDebugViews": false,
	~~"showConfig": false,~~
	"banubaMasksAssetsPath": "effects",
	"banubaColorEffectsAssetsPath": "luts",
	"banubaMaskBeauty": "Beauty"
  ```
  1. **To customize aspect ratio** selection appearance on trimmer screen you may use following theme attributes:
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/c61177eb-2e87-4605-ae7c-8c000e27a1ac/Aspects_1.png)
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/927fc566-bc88-421e-abb9-befd0d8f2f28/Aspects_2.png)
  **NOTE**: there are **default styles** provided by SDK for these attributes. These styles can be used as starting point for customization:
  ```Kotlin
  <style name="CustomVideoCreationTheme" parent="VideoCreationTheme">
// other attributes
<item name="trimmerAspectsButtonStyle">@style/CustomTrimmerAspectsButtonStyle</item>
<item name="trimmerAspectsDoneButtonStyle">@style/CustomTrimmerAspectsDoneButtonStyle</item>
<item name="trimmerAspectsCancelButtonStyle">@style/CustomTrimmerAspectsCancelButtonStyle</item>
<item name="trimmerAspectsRecyclerViewStyle">@style/CustomTrimmerAspectsRecyclerViewStyle</item>
<item name="trimmerAspectsItemParentStyle">@style/CustomTrimmerAspectsItemParentStyle</item>
<item name="trimmerAspectsItemImageStyle">@style/CustomTrimmerAspectsItemImageStyle</item>
<item name="trimmerAspectsItemDescriptionStyle">@style/CustomTrimmerAspectsItemDescriptionStyle</item>
// other attributes
</style>

<style name="CustomTrimmerAspectsButtonStyle" parent="TrimmerAspectsButtonStyle" />
<style name="CustomTrimmerAspectsDoneButtonStyle" parent="TrimmerAspectsDoneButtonStyle" />
<style name="CustomTrimmerAspectsCancelButtonStyle" parent="TrimmerAspectsCancelButtonStyle" />
<style name="CustomTrimmerAspectsRecyclerViewStyle" parent="TrimmerAspectsRecyclerViewStyle" />
<style name="CustomTrimmerAspectsItemParentStyle" parent="TrimmerAspectsItemParentStyle" />
<style name="CustomTrimmerAspectsItemImageStyle" parent="TrimmerAspectsItemImageStyle" />
<style name="CustomTrimmerAspectsItemDescriptionStyle" parent="TrimmerAspectsItemDescriptionStyle" />
  ```
  **NOTE**: **Aspects feature may be turned off**. To remove it you should override `AspectsProvider` implementation with just **one** `EditorAspectSettings` type. For example:
  ```Kotlin
  override val aspectsProvider: BeanDefinition<AspectsProvider> = single(override = true) {
        object : AspectsProvider {
            override fun provide(): AspectsProvider.AspectsData {
                val allAspects = listOf(
                    EditorAspectSettings.`4_5`
                 )
                return AspectsProvider.AspectsData(
                    allAspects = allAspects,
                    default = allAspects.first()
                )
            }
        }
    }
  ```
  In this example there is **no aspects icon** on trimmer screen and **all videos will be resized to 4x5 aspect** **ratio** by default besides the way they were added (from gallery or recorded on camera). 
  > ❗ If you want to display 9x16 video at Editor screen with original size override `editorVideoScaleType` property in `EditorKoinModule`. By default, the video will be scaled to fill black lines and some of the parts will be not visible at the editor.
  ```Plain Text
  override val editorVideoScaleType: BeanDefinition<VideoScaleType>=
    factory(named("editorVideoScaleType"), override = true){
VideoScaleType.FIT
}
  ```
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/aeb1d3a5-50bd-4efd-8b75-ffaa17ec68e1/IMG_9839.png)
  ```Plain Text
  override val editorVideoScaleType: BeanDefinition<VideoScaleType>=
    factory(named("editorVideoScaleType"), override = true){
VideoScaleType.CENTER
}
  ```
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/752bfb43-95a8-49ec-a382-0708d77ab159/IMG_9838.png)
  1. `CameraOverlayStyle` has new attributes related to speed picking in addition to existent attributes:
  ```Kotlin
  icon_recording_speed_x0_5_selected
icon_recording_speed_x1_selected
icon_recording_speed_x2_selected
icon_recording_speed_x3_selected
icon_recording_speed_x0_5
icon_recording_speed_x1
icon_recording_speed_x2
icon_recording_speed_x3
  ```
  Below is an example of 2x speed selection. `icon_recording_speed_x2_selected` attribute is used when speed picker is expanded and an icon looks like the right part of the whole speed picker view. `icon_recording_speed_x2` attribute is used when speed picker is hidden. Also you may notice different text color for selected and not selected speed options. It is achieved by using color selector for `textColor` attribute within `CustomCameraSpeedPickerItemStyle`.
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/1c50cf5e-3182-4692-a8ad-5f9421731ab6/Speed_picker.png)
  Please check out "[speed picker customization](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/119/commits/28e06112020b7df41eb910e9a03599fbfae37a90)" commit to get a complete picture of mentioned updates.
  1. Gallery icon may be used with title: 
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/71be97e2-6e13-4127-aca7-9dc469248789/Screenshot_20210818-165625_Banuba_VE_SDK_Integration_sample.jpg)
  To achieve this just change your style for `galleryImageViewStyle` theme attribute:
  ```Kotlin
  <style name="CustomIntegrationAppTheme" parent="VideoCreationTheme">
// other attributes
	<item name="galleryImageViewStyle">@style/CustomGalleryImageViewStyle</item>
//other attributes
</style>

<style name="CustomGalleryImageViewStyle" parent="GalleryImageViewStyle">
	<item name="alwaysPermanentIcon">true</item>
	<item name="permanentIcon">@drawable/ic_canvas</item>
	<item name="description">Gallery</item>
	<item name="descriptionPosition">bottom</item>
	<item name="descriptionSize">12sp</item>
</style>
  ```
   **NOTE**:  Remove `layout_width` and `layout_height` attributes in your custom style to avoid cutting gallery icon (by default `GalleryImageViewStyle` has `wrap_content` for both sides).
  1. Change signature for `provideExportParams()` method of `ExportParamsProvider` interface:
  ```Kotlin
  override fun provideExportParams(
        effects: Effects,
				~~videoList: VideoList,~~
        videoRangeList: VideoRangeList,
        musicEffects: List<MusicEffect>,
        videoVolume: Float
    ): List<ExportManager.Params> {
				...
		}
  ```
  For every exported video you should use `videoRangeList()` builder method instead of `videoList()`:
  ```Kotlin
  ExportManager.Params.Builder(sizeProvider.provideOptimalExportVideoSize())
                .effects(effects)
                .fileName("export_default")
								.videoRangeList(videoRangeList)
                ~~.videoList(videoList)~~
                .destDir(exportSessionDir)
                .musicEffects(musicEffects)
                .volumeVideo(videoVolume)
                .build()
  ```
  1. `ExportErrorParser` interface was added to transform any exceptions during export to user readable text messages. Provide it into `ExportFlowManager` implementation (if you have it overridden):
  ```Kotlin
  override val exportFlowManager: BeanDefinition<ExportFlowManager> = single(override = true) {
        ForegroundExportFlowManager(
            exportDataProvider = get(),
            editorSessionHelper = get(),
            exportDir = get(named("exportDir")),
            mediaFileNameHelper = get(),
            shouldClearSessionOnFinish = true,
            publishManager = get(),
            draftManager = get(),
            errorParser = get()
        )
    }
  ```
  Recently there are four **error types on export** with appropriate string resources for readable messages (in case you want to localize these messages):
  ```Kotlin
  PREVIEW_ERROR -> R.string.preview_error
EXPORT_RESULT_ERROR -> R.string.export_result_error
CODEC_ERROR -> R.string.export_codec_error
UNKNOWN -> R.string.export_unknown_error
  ```
  1. **Paste menu option was added** to search view on stickers and audio browser screens. To change or localize the menu option title use `menu_item_paste` string resource.
  1. **For audio browser users**. To turn off Mubert service from audio browser and provide only local music tracks just add the following into koin module:
  ```Kotlin
  val audioBrowserConfig: BeanDefinition<AudioBrowserConfig> = single(override = true) {
        AudioBrowserConfig.LOCAL
    }
  ```
  1. **For audio browser users:** remove `mubert_api_key` string resource. Now access to Mubert is optional and it is encrypted inside video editor token. 
  1. String changes:
  - `notification_damage_music_file` resource added to show the user message if selected music track is broken on camera screen
  - `audio_browser_title_library_files` resource were removed
### Performance update
  The latest performance numbers can be found here.
  ### [1.0.18.1]
  > ‼️ This release requires prior migration to **1.0.18**
### List of changes
  1. Bug fixes:
  - Music icon alpha
  - Display popup for draft
  1. New module `com.banuba.sdk:ve-export-sdk`
  
### Migration guide
  > 👉 Here is the example of the PR sample of this update: [link](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/126/files)
  
  1. New export module. Add to gradle dependencies:
  ```Kotlin
   implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
  ```
  1. Classes moved: 
  - `com.banuba.sdk.veui.ui.EXTRA_EXPORTED_SUCCESS` to `com.banuba.sdk.ve.data.EXTRA_EXPORTED_SUCCESS`
  - `com.banuba.sdk.veui.ui.ExportResult` to `com.banuba.sdk.ve.data.ExportResult`
  - `com.banuba.sdk.core.domain.TrackData` to `com.banuba.sdk.core.data.TrackData`
  - `com.banuba.sdk.ve.flow.ExportFlowManager` to `com.banuba.sdk.export.data.ExportFlowManager`
  - `com.banuba.sdk.ve.flow.export.ForegroundExportFlowManager` to `com.banuba.sdk.export.data.ForegroundExportFlowManager`
  - `com.banuba.sdk.veui.data.ExportParamsProvider` to `com.banuba.sdk.export.data.ExportParamsProvider`
  - `com.banuba.sdk.ve.flow.export.BackgroundExportFlowManager` to `com.banuba.sdk.export.data.BackgroundExportFlowManager`
  - `com.banuba.sdk.ve.flow.export.PublishManager` to `com.banuba.sdk.ve.data.PublishManager`
  1. New koin modules: add `VeSdkKoinModule()`* *and `VeExportKoinModule()` to Koin modules initialization.
  ```Kotlin
  + import com.banuba.sdk.export.di.VeExportKoinModule
+ import com.banuba.sdk.ve.di.VeSdkKoinModule

startKoin {
	androidContext(this@IntegrationKotlinApp)
	modules(
+		VeSdkKoinModule().module,
+		VeExportKoinModule().module,
		AudioBrowserKoinModule().module, // use this module only if you bought it
		ArCloudKoinModule().module,
		TokenStorageKoinModule().module,
		VideoEditorKoinModule().module,
		GalleryKoinModule().module,
		BanubaEffectPlayerKoinModule().module
	)
}
  ```
  1. Change arguments for constructor of classes `ForegroundExportFlowManager` and `BackgroundExportFlowManager`
  ```Plain Text
  ForegroundExportFlowManager(
		exportDataProvider = get(),
-		~~editorSessionHelper = get(),
-		draftManager = get(),~~
+		sessionParamsProvider = get(),
+		exportSessionHelper = get(),
		exportDir = get(named("exportDir")),
		shouldClearSessionOnFinish = true,
		publishManager = get(),
		errorParser = get(),
		mediaFileNameHelper = get()
)
  ```
  ```Plain Text
  BackgroundExportFlowManager(
		exportDataProvider = get(),
-		~~editorSessionHelper = get(),~~
-	  ~~draftManager = get(),~~
+		sessionParamsProvider = get(),
+   exportSessionHelper = get(),
    exportNotificationManager = get(),
    exportDir = get(named("exportDir")),
    shouldClearSessionOnFinish = true,
    publishManager = get(),
    errorParser = get()
)
  ```
  1. Remove keyword `override` before keyword `val` for some value in `VideoEditorKoinModule`
  - `ExportFlowManager`
  ```Kotlin
  ~~override~~ val exportFlowManager: BeanDefinition<ExportFlowManager> = single(override = true) {
val exportFlowManager: BeanDefinition<ExportFlowManager> = single(override = true) {
  ```
  - `ExportParamsProvider`
  ```Kotlin
  ~~override~~ val exportParamsProvider: BeanDefinition<ExportParamsProvider> = single(override = true) {
val exportParamsProvider: BeanDefinition<ExportParamsProvider> = single(override = true) {
  ```
  - `WatermarkProvider`
  ```Kotlin
  ~~override~~ val watermarkProvider: BeanDefinition<WatermarkProvider> = factory(override = true) {
val watermarkProvider: BeanDefinition<WatermarkProvider> = factory(override = true) {
  ```
  - `PublishManager`
  ```Kotlin
  ~~override~~ val publishManager: BeanDefinition<PublishManager> = single(override = true) {
val publishManager: BeanDefinition<PublishManager> = single(override = true) {

  ```
  
  
  ### [1.19]
  *Released on October 4, 2021*
  
  > ‼️ This release requires prior migration to **1.0.18.1**
  > ‼️ We changed naming convention from 1.0.19 to 1.19 due to similar iOS change.
  > ‼️ In this release, we introduce new text UX. In its default implementation, we substitute **bold**, *italic*, regular setting with the ability to change font, as it allows more editing capabilities. This setting will be supported through 19th release, but in the next 20th release it will be deprecated. 
  
### List of changes
  1. Updated UX for adding text on video. Add your own fonts! 
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/ae403d0f-9696-434e-8d5f-7e65fd3123ed/text.gif)
  1. Start video editor with Drafts screen (previously either camera screen or trimmer screen).
  1. Improved thumbnail rendering speed on trimmer, video editor, music editor, cover screens in 3 - 4 times.
  1. Color filters (LUT) are now implemented as a separate library, injected in VE SDK. 
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/97a67e12-cf35-4a29-978b-15e1691ad39e/LUT.gif)
  1. Icons in aspects previews can now be configured.
  1. Main bug fixes:
  - Fixed audio glitch for some videos
  - Fixed incorrect camera screen layout in some cases
  - Scrolling of image folders in the gallery
  - Save and restore video volume in the draft
  - Properly request required permissions for the audio browser
  - Improved export time, if gif effects has been applied
  
### Migration guide
  
  > 👉 Here is an example of the PR sample of this update: [link](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/132/files)
  1. Attribute `draftOptionsBackButtonStyle` was removed, as we simplified the drafts closing UX.
  1. `VideoCreationActivity` launch methods has changed
   **To start Video Editor from camera:**
  ```Kotlin
  VideoCreationActivity.startFromCamera(
    context: Context,
    pictureInPictureVideo: Uri = Uri.EMPTY,
    additionalExportData: Parcelable? = null,
    audioTrackData: TrackData? = null,
    themResId: Int? = null,
		cameraUIType: CameraUIType = CameraUIType.TYPE_1
)
  ```
  Pass `pictureInPictureVideo` to start Video editor in PIP mode.
  **To start Video Editor from Trimmer screen (camera screen is skipped):**
  ```Kotlin
  VideoCreationActivity.startFromTrimmer(
    context: Context,
    predefinedVideos: Array<Uri>,
    additionalExportData: Parcelable? = null,
		audioTrackData: TrackData? = null
)
  ```
  **To Start Video editor from Drafts screen:**
  ```Kotlin
  VideoCreationActivity.startFromDrafts(
		context: Context
)
  ```
  1. camera-sdk and ve-sdk use libyuv.so lib. Gradle might fail compilation process. Please use the following solution to fix the issue:
  ```Plain Text
  packagingOptions {
	pickFirst '**/libyuv.so'
}
  ```
  1. Add new text editor icons to the `EditorTextActionsStyle` style:
  - `icon_edit_font`
  - `icon_edit_color`
  
  
  ### [1.20]
  *Released on November 26, 2021*
  
  > ‼️ This release requires prior migration to **1.19**
  > ‼️ 
  Old text UX is deprecated. In the previous release, we substitute **bold**, *italic*, regular setting with the ability to change font, as it allows more editing capabilities. This setting is not supported now.
### List of changes
  1. Trimming is completely reconsidered with a modern and fresh UX. It also allows to trim videos up to 0.3 seconds minimal lengths (earlier 3 seconds minimum). 
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/a906b19b-1f25-46c1-b0ec-be13c663ac45/trimmer.gif)
  1. New video export performance! Export performance was improved by 10-70%. It depends on the parameters of the video and device. See perf doc below. 
  1. We now use FFmpeg library for export. Native android MediaCodec API is still used, but in some cases, we use FFmpeg instead. This significantly reduces the possibility of export failure to almost 0. No additional configuration required - export still works the same as before.
  1. SDK optimized for Android 12 usage.
  1. You can now re-arrange the order of AR masks and color filters (LUT), just like in iOS. 
  1. Banuba token can now be stored on any server (earlier only Firebase).
  1. React mode in Picture in Picture now also got a "Switch" function.
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/fbc1c4be-701b-4bea-8185-947729ba4c09/switch.gif)
  1. Main bug fixes:
  - Fixed the 2K-4K video export issue that occurred on some devices
  - Fixed the problem with the "next" button before the export started in the case of many applied effects
  - Fixed the camera screen icons incorrect alignment in the case of long icons names
  
### Migration guide
  
  > 👉 Here is an example of the PR sample of this update: [l](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/144)[ink](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/145/files)
  
  1. **videoeditor.json** config file was changed:
  -  `~~textOnVideoColorCountOnPage~~`, ~~`keepVideoOnExit`~~, ~~`maxSelectedImages`~~ and ~~`supportsMixMediaData`~~ were removed.
  -  `maxMediaSources` , `actionVibrationDurationMs`, `oneScreenDurationMs` and `slideShowSourceDurationMs` params were added:
  - `maxMediaSources` - max media sources used to make video in trimmer.
  - `actionVibrationDurationMs` is used in trimmer when videos are swapped.
  - `oneScreenDurationMs` is used to configure the length of trimmer timeline.
  - `slideShowSourceDurationMs` - duration in milliseconds per image to make video.
  -  `minVideoDuration` and `minSourceVideoDuration` were changed.
  ```Kotlin
  "editor": {
    "minVideoDuration": 1500,
    "maxVideoDuration": 60000,
    **"**maxMediaSources**": **50**,**
    "supportsTimeEffects": true,
    "supportsVisualEffects": true,
    "supportsMusicMixer": true,
	  "supportsTextOnVideo": true,
    "banubaColorEffectsAssetsPath": "luts",
    ~~"textOnVideoColorCountOnPage": 6,~~
    "textOnVideoMaxSymbols": -1,
    ~~"keepVideoOnExit": true,~~
    "supportsEditorLinkOnVideo": false,
},
"trimmer": {
    "minSourceVideoDuration": 300,
    "supportsMultiChoice": true,
    "appearanceThreshold": 0,
    "supportsRotation": true
    "actionVibrationDurationMs": 3,
    "oneScreenDurationMs": 10000
},
"slideshow": {
    ~~"maxSelectedImages": 20,~~
    "animate": true,
    "animateTakenPhotos": true,
    "slideShowSourceDurationMs": 3000
},
"gallery": {
    ~~"supportsMixMediaData": false,~~
    "supportsVideo": true,
    "supportsImage": true
}
  ```
  1. **object_editor.json** config file was changed. `showObjectEffectsTogether` was removed. 
  ```Kotlin
  {
  "objectMaxVisibleTimelineCount": 4,
  "objectInitialTimelineCount": 2,
  "objectEffectDefaultDurationMs": 2000,
  "objectEffectMinDurationMs": 100,
  ~~"showObjectEffectsTogether": true,~~
  "vibrateObjectEffectActionDurationMs": 2
}
  ```
  1. **To customize trimmer** screen you should use following theme attributes:
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/ca12c2ab-f2fa-46b7-a6f0-82870fea6240/new_trimmer1.png)
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/9f7f858f-63ce-44f5-ab6f-9dbaadbf91c2/new_trimmer2.png)
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/f19c5982-5797-4f9d-a490-4fb422c11d3b/new_trimmer3.png)
  **NOTE**: pay attention that trimmer theme attributes were changed. There are **new** **default styles** provided by SDK for these attributes. See the [trimmer styles documentation](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/mddocs/trimmer_styles.md) for more details. These styles can be used as starting point for customization:
  ```Kotlin
  <!--Video Trimmer-->
~~<item name="trimmerBackButtonStyle">@style/CustomTrimmerBackButtonStyle</item>
<item name="trimmerNextButtonStyle">@style/CustomTrimmerNextButtonStyle</item>
<item name="trimmerDurationSumTextStyle">@style/CustomTrimmerDurationSumTextStyle</item>
<item name="trimmerContentViewStyle">@style/CustomTrimmerContentViewStyle</item>
<item name="trimmerContentLabelStyle">@style/CustomTrimmerContentLabelStyle</item>
<item name="trimmerRecyclerStyle">@style/CustomTrimmerRecyclerStyle</item>
<item name="trimmerThumbImageStyle">@style/CustomTrimmerThumbImageStyle</item>
<item name="trimmerThumbTextStyle">@style/CustomTrimmerThumbTextStyle</item>
<item name="trimmerDeleteLabelStyle">@style/CustomTrimmerDeleteLabelStyle</item>
<item name="trimmerDeleteCrossStyle">@style/CustomTrimmerDeleteCrossStyle</item>
<item name="trimmerCancelButtonStyle">@style/CustomTrimmerCancelButtonStyle</item>
<item name="trimmerDurationTimelineStyle">@style/CustomTrimmerDurationTimelineStyle</item>
<item name="trimmerContentHintStyle">@style/CustomTrimmerContentHintStyle</item>
<item name="trimmerRotateButtonStyle">@style/CustomTrimmerRotateButton</item>
<item name="trimmerThumbHintIconStyle">@style/CustomTrimmerThumbHintIconStyle</item>~~~~

~~<item name="trimmerTimelineStyle">@style/CustomTrimmerTimelineViewStyle</item>
<item name="trimmer_action_disabled_alpha">0.5</item>
<item name="trimmerTimelineActionButtonsRecyclerStyle">@style/CustomTrimmerTimelineActionButtonsRecyclerStyle</item>
<item name="trimmerTimelineActionParentStyle">@style/CustomTrimmerTimelineActionParentStyle</item>
<item name="trimmerTimelineActionImageStyle">@style/CustomTrimmerTimelineActionImageStyle</item>
<item name="trimmerTimelineActionTextStyle">@style/CustomTrimmerTimelineActionTextStyle</item>
<item name="trimmerParentStyle">@style/CustomTrimmerParentStyle</item>
<item name="trimmerVideoContainerStyle">@style/CustomTrimmerVideoContainerStyle</item>
<item name="trimmerPlayButtonStyle">@style/CustomTrimmerPlayButtonStyle</item>
<item name="trimmerContentBackgroundStyle">@style/CustomTrimmerContentBackgroundStyle</item>
<item name="trimmerSingleTrimCurrentTimeTextStyle">@style/CustomTrimmerSingleTrimCurrentTimeTextStyle</item>
<item name="trimmerSingleTrimTotalTimeTextStyle">@style/CustomTrimmerSingleTrimTotalTimeTextStyle</item>
~~
~~~~<item name="trimmerAspectsDoneButtonStyle">@style/CustomTrimmerAspectsDoneButtonStyle</item>
<item name="trimmerAspectsCancelButtonStyle">@style/CustomTrimmerAspectsCancelButtonStyle</item>~~~~

~~<item name="trimmerActionDoneButtonStyle">@style/CustomTrimmerActionDoneButtonStyle</item>
<item name="trimmerActionCancelButtonStyle">@style/CustomTrimmerActionCancelButtonStyle</item>
<item name="trimmerThumbsRecyclerViewStyle">@style/CustomTrimmerThumbsRecyclerViewStyle</item>
<item name="trimmerThumbsHintTextStyle">@style/CustomTrimmerThumbsHintTextStyle</item>
<item name="trimmerThumbsItemParentStyle">@style/CustomTrimmerThumbsItemParentStyle</item>
<item name="trimmerThumbsItemImageStyle">@style/CustomTrimmerThumbsItemImageStyle</item>
<item name="trimmerThumbsItemTimeTextStyle">@style/CustomTrimmerThumbsItemTimeTextStyle</item>

~~<item name="trimmer_icon_add_video">@drawable/ic_trimmer_add_video</item>
<item name="trimmer_bg_color_add_video">@color/transparent</item>
<item name="musicEditorTimelineTimeTextStyle">@style/CustomMusicEditorTimelineTimeTextStyle</item>~~~~

~~<item name="timelineAddVideoButtonStyle">@style/CustomTrimmerTimelineAddVideoStyle</item>

~~<style name="CustomTrimmerRotateButton" parent="TrimmerRotateButtonStyle" />~~~~

~~<style name="CustomTrimmerTimelineViewStyle" parent="TrimmerTimelineViewStyle">
    <item name="timelineVolumeStyle">@style/CustomTrimmerTimelineVolumeStyle</item>
    <item name="timelineVideoContainerStyle">@style/CustomTrimmerTimelineVideoContainerViewStyle</item>
    <item name="timelineSingleTimelineStyle">@style/CustomTrimmerTimelineSingleViewStyle</item>
    <item name="timelineEffectsContainerStyle">@style/CustomTrimmerTimelineEffectsContainerViewStyle</item>
    <item name="timelineContentParentStyle">@style/CustomTrimmerTimelineContentParentStyle</item>
    <item name="timelineTopShadowStyle">@style/CustomTrimmerTimelineTopShadowStyle</item>
    <item name="timelineBottomShadowStyle">@style/CustomTrimmerTimelineBottomShadowStyle</item>
    <item name="timelineTopIncrementIndicatorStyle">@style/CustomTrimmerTimelineTopIncrementStyle</item>
    <item name="timelineBottomIncrementIndicatorStyle">@style/CustomTrimmerTimelineBottomIncrementStyle</item>
    <item name="timelineAddVideoButtonStyle">@style/CustomTrimmerTimelineAddVideoStyle</item>
    <item name="timelinePlayerLineStyle">@style/CustomTrimmerTimelinePlayerLineStyle</item>
    <item name="timelineTimeCurrentTextStyle">@style/CustomTrimmerTimelineCurrentTimeTextStyle</item>
    <item name="timelineTimeTotalTextStyle">@style/CustomTrimmerTimelineTotalTimeTextStyle</item>
    <item name="timelineVideoTimeLabelStyle">@style/CustomTrimmerTimelineVideoTimeLabelStyle</item>
</style>

~~<style name="CustomTrimmerThumbHintIconStyle" parent="TrimmerThumbHintIconStyle" />
<style name="CustomTrimmerContentHintStyle" parent="TrimmerContentHintStyle" />
<style name="CustomTrimmerViewStyle" parent="TrimmerViewStyle" />~~~~

~~<style name="CustomTrimmerTimelineVolumeStyle" parent="TrimmerTimelineVolumeStyle" />~~
~~<style name="CustomTrimmerTimelineVideoContainerViewStyle" parent="TrimmerTimelineVideoContainerViewStyle" />~~
~~<style name="CustomTrimmerTimelineSingleViewStyle" parent="TrimmerTimelineSingleViewStyle" />
~~
~~~~<style name="CustomTrimmerRecyclerStyle" parent="TrimmerRecyclerStyle" />
<style name="CustomTrimmerBackButtonStyle" parent="TrimmerBackButtonStyle" />
<style name="CustomTrimmerNextButtonStyle" parent="TrimmerNextButtonStyle" />
<style name="CustomTrimmerCancelButtonStyle" parent="TrimmerCancelButtonStyle" />
<style name="CustomTrimmerDurationTimelineStyle" parent="TrimmerDurationTimelineStyle" />
<style name="CustomTrimmerDurationSumTextStyle" parent="TrimmerDurationSumTextStyle" />
<style name="CustomTrimmerDeleteCrossStyle" parent="TrimmerDeleteCrossStyle" />
<style name="CustomTrimmerDeleteLabelStyle" parent="TrimmerDeleteLabelStyle" />
<style name="CustomTrimmerContentViewStyle" parent="TrimmerContentViewStyle" />
<style name="CustomTrimmerContentLabelStyle" parent="TrimmerContentLabelStyle" />
<style name="CustomTrimmerThumbImageStyle" parent="TrimmerThumbImageStyle" />
<style name="CustomTrimmerThumbTextStyle" parent="TrimmerThumbTextStyle" />
<style name="CustomTrimmerAspectsButtonStyle" parent="TrimmerAspectsButtonStyle" />
<style name="CustomTrimmerAspectsDoneButtonStyle" parent="TrimmerAspectsDoneButtonStyle" />
<style name="CustomTrimmerAspectsCancelButtonStyle" parent="TrimmerAspectsCancelButtonStyle" />
~~~~
~~<style name="CustomTrimmerTimelineEffectsContainerViewStyle" parent="TrimmerTimelineEffectsContainerViewStyle" />
<style name="CustomTrimmerTimelineContentParentStyle" parent="TrimmerTimelineContentParentStyle" />
<style name="CustomTrimmerTimelineTopShadowStyle" parent="TrimmerTimelineTopShadowStyle" />
<style name="CustomTrimmerTimelineBottomShadowStyle" parent="TrimmerTimelineBottomShadowStyle" />
<style name="CustomTrimmerTimelineTopIncrementStyle" parent="TrimmerTimelineTopIncrementStyle" />
<style name="CustomTrimmerTimelineBottomIncrementStyle" parent="TrimmerTimelineBottomIncrementStyle" />
<style name="CustomTrimmerTimelinePlayerLineStyle" parent="TrimmerTimelinePlayerLineStyle" />
<style name="CustomTrimmerTimelineCurrentTimeTextStyle" parent="TrimmerTimelineCurrentTimeTextStyle" />
<style name="CustomTrimmerTimelineTotalTimeTextStyle" parent="TrimmerTimelineTotalTimeTextStyle">
    <item name="android:textColor">@color/white</item>
</style>
<style name="CustomTrimmerTimelineVideoTimeLabelStyle" parent="TrimmerTimelineVideoTimeLabelStyle">
   <item name="android:textColor">@color/white</item>
</style>
<style name="CustomTrimmerTimelineActionButtonsRecyclerStyle" parent="TrimmerTimelineActionButtonsRecyclerStyle" />
<style name="CustomTrimmerTimelineActionParentStyle" parent="TrimmerTimelineActionParentStyle" />
<style name="CustomTrimmerTimelineActionImageStyle" parent="TrimmerTimelineActionImageStyle" />
<style name="CustomTrimmerTimelineActionTextStyle" parent="TrimmerTimelineActionTextStyle">
    <item name="android:textColor">@color/egg_blue</item>
</style>
<style name="CustomTrimmerParentStyle" parent="TrimmerParentStyle" />
<style name="CustomTrimmerVideoContainerStyle" parent="TrimmerVideoContainerStyle" />
<style name="CustomTrimmerPlayButtonStyle"  parent="TrimmerPlayButtonStyle" />
<style name="CustomTrimmerContentBackgroundStyle"  parent="TrimmerContentBackgroundStyle" />
<style name="CustomTrimmerSingleTrimCurrentTimeTextStyle" parent="TrimmerSingleTrimCurrentTimeTextStyle">
    <item name="android:textColor">@color/white</item>
</style>
<style name="CustomTrimmerSingleTrimTotalTimeTextStyle" parent="TrimmerSingleTrimTotalTimeTextStyle">
   <item name="android:textColor">@color/white</item>
</style>
<style name="CustomTrimmerActionDoneButtonStyle" parent="TrimmerActionDoneButtonStyle">
    <item name="android:src">@drawable/ic_check</item>
</style>
<style name="CustomTrimmerActionCancelButtonStyle" parent="TrimmerActionCancelButtonStyle">
    <item name="android:src">@drawable/ic_navigation_exit</item>
</style>
<style name="CustomTrimmerViewStyle" parent="TrimmerViewStyle">
    <item name="trimmer_default_color">@color/violet_red</item>
    <item name="trimmer_wrong_color">@color/violet_red</item>
    <item name="trimmer_left_pointer">@drawable/ic_timeline_left_pointer</item>
    <item name="trimmer_right_pointer">@drawable/ic_timeline_right_pointer</item>
    <item name="trimmer_border_line">@drawable/bg_trimmer_border_line</item>
</style>
<style name="CustomTrimmerAspectsButtonStyle" parent="TrimmerAspectsButtonStyle" />
<style name="CustomTrimmerThumbsRecyclerViewStyle" parent="TrimmerThumbsRecyclerViewStyle" />
<style name="CustomTrimmerThumbsHintTextStyle" parent="TrimmerThumbsHintTextStyle">
    <item name="android:textColor">@color/white</item>
</style>
<style name="CustomTrimmerThumbsItemParentStyle" parent="TrimmerThumbsItemParentStyle" />
<style name="CustomTrimmerThumbsItemImageStyle" parent="TrimmerThumbsItemImageStyle" />
<style name="CustomTrimmerThumbsItemTimeTextStyle" parent="TrimmerThumbsItemTimeTextStyle">
    <item name="android:textColor">@color/white</item>
</style>
<style name="CustomTrimmerTimelineAddVideoStyle" parent="TrimmerTimelineAddVideoStyle">
    <item name="android:src">@drawable/ic_trimmer_add</item>
</style>

<style name="CustomMusicEditorTimelineStyle" parent="MusicEditorTimelineStyle">
		~~<item name="applying_effect_color">@color/violet_red_20</item>
~~    ~~<item name="video_timeline_volume_icon">@drawable/ic_volume_up</item>~~~~
~~		<item name="timelineVolumeStyle">@style/CustomMusicTimelineVolumeStyle</item>
    <item name="timelinePlayerLineStyle">@style/CustomMusicTimelinePlayerLineStyle</item>
    <item name="timelineTimeCurrentTextStyle">@style/CustomMusicTimelineCurrentTimeTextStyle</item>
    <item name="timelineTimeTotalTextStyle">@style/CustomMusicTimelineTotalTimeTextStyle</item>
    <item name="timelineAddVideoButtonStyle">@style/CustomMusicTimelineAddVideoStyle</item>
    <item name="timelineTopShadowStyle">@style/CustomMusicTimelineTopShadowStyle</item>
    <item name="timelineBottomShadowStyle">@style/CustomMusicTimelineBottomShadowStyle</item>
    <item name="timelineTopIncrementIndicatorStyle">@style/CustomMusicTimelineTopIncrementStyle</item>
    <item name="timelineBottomIncrementIndicatorStyle">@style/CustomMusicTimelineBottomIncrementStyle</item>
    <item name="timelineContentParentStyle">@style/CustomMusicTimelineContentParentStyle</item>
    <item name="timelineEffectsContainerStyle">@style/CustomMusicTimelineEffectsContainerViewStyle</item>
    <item name="timelineVideoContainerStyle">@style/CustomMusicTimelineVideoContainerViewStyle</item>
    <item name="timelineSingleTimelineStyle">@style/CustomMusicTimelineSingleViewStyle</item>
</style>

~~<style name="CustomMusicEditorTimelineTimeTextStyle" parent="MusicEditorTimelineTimeTextStyle" />~~~~
~~
<style name="CustomMusicTimelineVolumeStyle" parent="MusicTimelineVolumeStyle" />
<style name="CustomMusicTimelinePlayerLineStyle" parent="MusicTimelinePlayerLineStyle" />
<style name="CustomMusicTimelineCurrentTimeTextStyle" parent="MusicTimelineCurrentTimeTextStyle" />
<style name="CustomMusicTimelineTotalTimeTextStyle" parent="MusicTimelineTotalTimeTextStyle" />
<style name="CustomMusicTimelineAddVideoStyle" parent="MusicTimelineAddVideoStyle" />
<style name="CustomMusicTimelineTopShadowStyle" parent="MusicTimelineTopShadowStyle" />
<style name="CustomMusicTimelineBottomShadowStyle" parent="MusicTimelineBottomShadowStyle" />
<style name="CustomMusicTimelineTopIncrementStyle" parent="MusicTimelineTopIncrementStyle" />
<style name="CustomMusicTimelineBottomIncrementStyle" parent="MusicTimelineBottomIncrementStyle" />
<style name="CustomMusicTimelineContentParentStyle" parent="MusicTimelineContentParentStyle" />
<style name="CustomMusicTimelineEffectsContainerViewStyle" parent="MusicTimelineEffectsContainerViewStyle" />
<style name="CustomMusicTimelineVideoContainerViewStyle" parent="MusicTimelineVideoContainerViewStyle" />
<style name="CustomMusicTimelineSingleViewStyle" parent="MusicTimelineSingleViewStyle" />
  ```
  1. The order of AR masks and color filters (LUT) can be re-arranged by overriding the `OrderProvider` interface. Please, take a look at the [documentation](https://github.com/Banuba/ve-sdk-android-integration-sample#Configure-masks-and-filters-order) of how it is configured.
  ```Kotlin
  override val colorFilterOrderProvider: BeanDefinition<OrderProvider> =
    single(named("colorFilterOrderProvider"), override = true) {
        IntegrationAppColorFilterOrderProvider()
      }

override val maskOrderProvider: BeanDefinition<OrderProvider> =
    single(named("maskOrderProvider"), override = true) {
        IntegrationAppMaskOrderProvider()
    }
  ```
  NOTE: pay attention that the `ColorFilterOrderProvider` interface was removed. Use the `OrderProvider` interface instead.
  1. String changes:
  - `export_notification_started`, `export_notification_success` and `export_notification_fail` resources were added to show the user the export notification messages
  - ~~`font_regular_title`~~, ~~`font_bold_title`~~ and ~~`font_italic_title`~~ resources were removed
  - ~~`trimmer_content_label_single`~~, ~~`trimmer_content_label_multi`~~ and ~~`trimmer_content_hint`~~ resources were removed
  - `err_trimmer_max_videos` resource was added to show the user max available files for trimmer
  - `trimmer_action_rotate`, `trimmer_action_delete`, `trimmer_action_trim` resources were added
  1. ❗❗Dependencies versions update. ExoPlayer version was updated to 2.16.0.
  **NOTE**: if you are using ExoPlayer in your project, it must be updated to version 2.16.0 or higher
  ```Markdown
  | com.google.android.exoplayer:exoplayer | 2.16.0 |
  ```
  
</details>

<details>
<summary><strong>2022</strong></summary>

  ### [1.21]
  *Released on January 19, 2022*
  
  > ‼️ This release requires prior migration to [1.20](/0e78026eed384b1f98cf556f037ef777)
  > ‼️ 
  In the next release, we will remove the configuration of toast messages, as [Google is deprecating](https://developer.android.com/reference/android/widget/Toast#setView(android.view.View)) them from API 30.
  > ‼️ Old cover screen will be deprecated in the next release.
  
### List of changes
  1. Split video into multiple pieces. Use that to trim faster or just break one video into two pieces.

  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/f9ced852-423e-4a0f-96a7-7b12798e5765/split-gif_1.gif)
  1. Launch SDK from video editor screen. Previously, could be launched from camera, trimmer or drafts screen:
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/aeb2d879-ce85-4918-8710-37329b418b24/launch-gif_1.gif)
  1. Record lip sync in slow motion and the accelerate it (config). 
  1. New export params: apply resolution of initial video, stretch video size to get rid of black bars (see below).
  In some cases, you may want to fit video to fit the entire screen
  ![fit video screen configuration enabled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/198bebe4-789e-4617-8578-4a673abbb764/IMG_9974.png)
  ![fit video screen configuration disabled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/6203def6-543a-46e4-a7eb-3ae12e3a95ed/IMG_9975.png)
  1. Export performance was improved for videos, which use AR masks by 10-60%. See perf doc below for details. 
  1. Mubert tracks are now generated faster.
  1. New lightweight LUT’s. Size of 25 LUT’s decreases by 4,8 MB!
  1. Main bug fixes:
  - Fixed the 2K-4K video export issue that occurred on some devices
  - Fixed the problem with the "next" button before the export started in the case of many applied effects
  - Fixed the camera screen icons incorrect alignment in the case of long icons names
  1. Old cover screen will be deprecated in the next release. `CoverProvider.SIMPLE` will be removed. Use `CoverProvider.EXTENDED` intead.
  
### Migration guide
  
  > 👉 Here is an example of the PR sample of this update: [link](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/158/files)
  1. New dependency: **com.banuba.sdk:ve-playback-sdk. 
**Add following code to app/build.gradle:
`implementation "com.banuba.sdk:ve-playback-sdk:1.21.0”`
  1. New Koin module: `VePlaybackSdkKoinModule`. Add `VePlaybackSdkKoinModule().module` along with other modules.
  1. `MediaResolutionProvider` had changed to `ExportVideoResolutionProvider`. Replace old resolution provider with new `ExportVideoResolutionProvider` in `ExportParamsProvider` implementation. To get optimal resolution, call `videoResolution` property of `ExportVideoResolutionProvider`
  1. `VideoResolution` enum has changed. Now you can pass Original video resolution to export params e.g. `VideoResolution.Original`, or exact values - `VideoResolution.Exact.HD`
  1. ExportFlowManager dependency now requires `ExportBundleProvider`. In the videoeditor koin module pass `ExportBundleProvider` to the `ExportFlowManager` definition through `exportBundleProvider = get()`
  1. New `VideoCreationActivity` method to start editor from the editor screen:
  ```Kotlin
  fun startFromEditor(
		context: Context,
    predefinedVideos: Array<Uri>,
    additionalExportData: Parcelable? = null,
    audioTrackData: TrackData? = null
)
  ```
  Example usage: 
  ```Kotlin
  val intent = VideoCreationActivity.startFromEditor(
    context = applicationContext,
    predefinedVideos = predefinedVideos,
    audioTrackData = initialTrackData
)
startActivity(intent)
  ```
  1. New icon for split action on the trimmer screen. Use default or replace `ic_trimmer_split` drawable resource with your own icon.
  1. Attribute `trimmer_action_disabled_alpha` was removed.
  1. New updated lightweight LUT’s. To reduce the size you need to update LUT’s from `app/src/main/assets/bnb-resources/luts`
  1. If you want to display video without black lines override `videoDrawParams` property in EditorKoinModule.
  ```Kotlin
  val videoDrawParams: BeanDefinition<VideoDrawParams> = 
	factory(override = true) {
    VideoDrawParams(
        scaleType = VideoScaleType.Center,
        normalizedCropRect = RectF(0F, 0F, 1F, 1F)
    )
}
  ```
  Default value is:
  ```Kotlin
  val videoDrawParams: BeanDefinition<VideoDrawParams> = 
	factory(override = true) {
    VideoDrawParams(
        scaleType = VideoScaleType.Fit(VideoBackgroundType.Black),
        normalizedCropRect = RectF(0F, 0F, 1F, 1F)
    )
}
  ```
  1. To use lip sync audio on camera, add the following property to camera config `camera.json`:
  
  ```JSON
  "supportsAudioRateEqualsVideoSpeed": true
  ```
  1. To get track data of the audio used in the video after export, see the [link](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/mddocs/faq.md#17-how-can-i-get-a-track-data-of-the-audio-used-in-my-video-after-export) 

  
  
  ### [1.22]
  *Released on March 15, 2022*
  
  > ‼️ This release requires prior migration to **1.21**
  
### List of changes
  1. Pinch to change trimmer scale.
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/0b20b0eb-525f-422b-b735-6e092514d10b/scale_timeline.gif)
  1. VE analytics is now available to every customer! You can see the following data in the export:
  1. exported video duration
  1. effects used
  1. resolution
  1. number of clips used on the result video
  1. camera / gallery video
  1. QHD support. You can now record and export videos in 2560x1440
  1. Main bug fixes:
  - Fix blinking icons on editor screen
  - Fix blurred background image shown during importing and exporting videos
  - Fix not shown video thumbnail on start to edit text effects
  - Fix black screen on blocking/unblocking device
  
### Migration guide
  
  > 👉 Here is an example of the PR sample of this update: [link](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/171)
  1. Upgrade `compileSdkVersion` to 31.
  1. New koin module: `VeFlowKoinModule`. Add `VeFlowKoinModule().module` along with other modules.
  1. Since there is new separate `VeFlowKoinModule`, **remove** `FlowEditorModule` extension from your custom module, and move all provided implementations under `module` field:
  ```Shell
  class IntegrationKoinModule: ~~FlowEditorModule()~~ {
	val module = module {
		//move all configured implementations here
	}
}
  ```
  **Note**. Your custom module should be passed after `VeFlowKoinModule` inside `startKoin` to ensure your custom implementations will override the defaults.
  ```Shell
  class IntegrationKotlinApp : Application() {

    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidContext(this@IntegrationKotlinApp)
            modules(
								// other modules
                VeFlowKoinModule().module,
                IntegrationKoinModule().module
            )
        }
    }
}
  ```
  1. New `AspectRatioProvider` interface to configure default aspect ratio for videos:
  ```Kotlin
  single<AspectRatioProvider>(override = true) {
    object : AspectRatioProvider {
        override fun provide(): AspectRatio = AspectRatio(4.0 / 5)
    }
}
  ```
  Aspect ratio** 9:16 is used by default**. 
  Updated information about aspects settings is [here](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/mddocs/aspects_styles.md).
  1. New `OrderProvider` for fx effects:
  ```Shell
  single<OrderProvider>(named("fxEffectsOrderProvider"), override = true) {
            // implementation
        }
  ```
  1. Config json files (`videoeditor.json`, `camera.json`, etc.) placed in assets directory now **are removed**. To configure VE SDK behavior you should provide config classes through DI (below are just examples, you do not need to provide these classes if they do not have any customized property):
  ```Shell
  single<MusicEditorConfig>(override = true) {
        MusicEditorConfig()
    }

single<ObjectEditorConfig>(override = true) {
        ObjectEditorConfig()
    }

single<CameraConfig>(override = true) {
        CameraConfig()
    }

single<EditorConfig>(override = true) {
         EditorConfig(
            stickersApiKey = "<!-- Your Giphy key -->",
            showEditorConfig = true,
            slideShowFromGalleryAnimationEnabled = false,
            slideShowFromPhotoAnimationEnabled = false)
    }
  ```
  The same is for the audio browser with Mubert (if you use Banuba Audio Browser feature):
  ```Shell
  single<MubertApiConfig>(override = true) {
            MubertApiConfig()
        }
  ```
  ❗Please check updated [documentation ](https://github.com/Banuba/ve-sdk-android-integration-sample#Step-5-Override-config-classes-Optional)about config classes.
  1. `MusicEffect` interface which is used in `ExportParamsProvider` was moved into `ve.effects.music` package, so change import statement for this class:
  ```Shell
  ~~import com.banuba.sdk.ve.player.MusicEffect~~
import com.banuba.sdk.ve.effects.music.MusicEffect
  ```
  1. You can get VE analytics to see how your users utilize the editing tools. Analytics data is provided as a JSON string and can be extracted from `ExportResult.Success` object (which is a normal result of successfully exported video) in the following way:
  ```Kotlin
  //"exportResult" is an instance of ExportResult.Success object
val outputBundle = exportResult.additionalExportData.getBundle(ExportBundleProvider.Keys.EXTRA_EXPORT_OUTPUT_INFO)
val analytics = outputBundle?.getString(ExportBundleProvider.Keys.EXTRA_EXPORT_ANALYTICS_DATA)
  ```
  Use `ExportBundleProvider.Keys` constants to parse analytics data string.
  
  
  ### [1.22.2]
  > ‼️ This release requires prior migration to [1.22.0](/1a07b21041e74d32a3582ca311ecbd48)
### List of changes
  1. Bug fixes:
  Crash NoSuchMethodError: No static method `exactBySize` in class `VideoResolution`
  
  ### [1.23 ]
  *Released on May 30, 2022*
  > ‼️ This release requires prior migration to [1.2](/1a07b21041e74d32a3582ca311ecbd48)[2](/1a07b21041e74d32a3582ca311ecbd48)** 
**[PR link](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/171)** **
  
  [TOC]
## List of changes
  1. **Transition effects**
Transition effect - is an effect added between pieces of media to create an animated link between them, they help move a scene from one shot to the next. Now you have access to 10 different transition effects.
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/e8a70801-714d-45c9-84ed-c72de5b9758d/transitions.gif)
  1. **Add photo + video**
Since now you don’t have to choose the single type of content to add, you can mix photos with videos in one project, when uploading them from the gallery!
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/814e145b-9c55-452a-b91a-06efa0c4c6dd/photo_and_videos.gif)
  1. **Countdown sound**
We wanted to make the process of using timer and hands free mode easier for you. So here is a nice improvement, now the countdown will not only be visible on the screen, but will also be accompanied with the sound notification!
  1. **Change the video effects order
**Need to choose what video effects to provide your users with? Or set your own preferable order for them - now you can do both with the new release!
  1. **Updated configs**
  1. **Hide Gallery** - can be useful if you don’t want your users to upload anything from the Gallery;
  1. **Turn off multiple clips recording **- this config lets you decide whether your users will be able to record only one single clip at once, or multiple clips merged in one project at the trimming step.
  1. **Fixed major bugs****:**
  - Issues with scaled text at export
  - Endless export if an issue occurs in the foreground
  - Crash on the editing screen after relaunching the app due to the player issues
  - Fix black screen on blocking/unblocking device
  - Crash and audio issues working with PIP mode
  - Crash exporting video with time effect on some Huawei devices
  - Incorrect display of the video with the clips of different aspects
  - Crash when choosing files from the Gallery after updated Gallery permission
  - On some devices video wouldn’t rotate on trim screen
  - Issue with getting exported music effects data
  
### **Video Editor API**
  We are also happy to announce the official release of our API! Now you can adjust UI and the features for your specific needs. Here are the samples to get started: 
  [Introduction](https://banuba.gitbook.io/video-editor-sdk-api/)
  
  ---
  
## Migration guide
  > 👉 Here is an example of the PR sample of this update: [link](https://github.com/Banuba/ve-sdk-android-integration-sample/commit/0eb3e157f3c01788896267b638ce7a31b7cb7617)
  1. **Transition effects**
  New `supportsTransitions` parameter was added into `EditorConfig` class:
  ```Kotlin
  single<EditorConfig>(override = true) {
    EditorConfig(
        /**
         * Trimmer supports transition effects
         */
        supportsTransitions = true
    )
}
  ```
  Please, follow the [documentation](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/mddocs/transitions_styles.md) to see more details about **Transition effects** screen and learn how this feature can be customized.
  1. **Add photo + video**
  Use `gallerySupportsVideo` and `gallerySupportsImage` parameters in`EditorConfig` to configure gallery video and image support:
  ```Kotlin
  single<EditorConfig>(override = true) {
    EditorConfig(
        /**
         * If the gallery displays video page.
         */
        gallerySupportsVideo = true,
        /**
         * If the gallery displays image page.
         */
        gallerySupportsImage = false
    )
}
  ```
  ❗**Note that** **one of those two parameters should be set to ****`true`**,otherwise you will get an error as soon as the app is launched.
  1. **Countdown sound**
  New `CameraTimerUpdateProvider` was added to customize camera timer tick updates. It can be used for custom timer sound (or any other reaction, like vibration) implementation. For example, it can be implemented like this:
  ```Kotlin
  class IntegrationCameraTimerUpdateProvider(
    private val audioPlayer: AudioPlayer,
    context: Context
) : CameraTimerUpdateProvider {

    companion object {
        private const val SOUND_FILE_NAME = "countdown1.wav"
    }

    private val soundFile = File(context.filesDir, SOUND_FILE_NAME)

    init {
        context.assets.copyFile(SOUND_FILE_NAME, soundFile)
    }

    override fun start() {
        audioPlayer.prepareTrack(soundFile.toUri())
        audioPlayer.play(false, 0L)
    }

    override fun update() {
        audioPlayer.play(false, 0L)
    }

    override fun finish() {
        audioPlayer.release()
    }
}
  ```
  ```Kotlin
  single<CameraTimerUpdateProvider>(override = true) {
    IntegrationCameraTimerUpdateProvider(
        audioPlayer = get(),
        context = get()
    )
}
  ```
  Where `countdown1.wav` - audio file from project ***assets*** directory.
  1. **Change the video effects order**
  Here is the new `EnabledEffectsProvider` for FX effects. It can be configured the following way:
  ```Kotlin
  single(named("fxEffectsProvider"), override = true) {
    EnabledEffectsProvider {
        listOf("acid_whip", "soul", "zoom")
    }
}
  ```
  See the [documentation](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/mddocs/faq.md#how-do-i-disable-the-video-fx-effects) for more details.
  The `OrderProvider` for FX effects is used to change the order of effects:
  ```Kotlin
  single<OrderProvider>(named("fxEffectsOrderProvider"), override = true) {
    // implementation
}
  ```
  1. **Updated configs**
  a. New `supportsGallery` parameter was added into `CameraConfig` class:
  ```Kotlin
  single<CameraConfig>(override = true) {
    CameraConfig(
				/**
		     * If there is a gallery icon on the camera screen
		     */
        supportsGallery = false
    )
}
  ```
  b. Additional pop-up dialog was added when trying to get back from Trimmer to Camera screen. This pop-up is launched when `supportsMultiRecords` parameter is set to `false`:
  ```Kotlin
  single<CameraConfig>(override = true) {
    CameraConfig(
				/**
		     * If recorded video can consist of more than one chunk.
		     */
        supportsMultiRecords = false
    )
}
  ```
  1. **Enable** [View Binding](https://developer.android.com/topic/libraries/view-binding) feature in **build.gradle(:app)** if it was not enabled before:
  ```Kotlin
  buildFeatures {
    viewBinding true
}
  ```
  1. Since there is new **PiP configuration** to start with **Picture-in-Picture** mode, update `VideoCreationActivity.startFromCamera`method call:
  ```Kotlin
  val videoCreationIntent = VideoCreationActivity.startFromCamera(
    context = this,
		~~// set PiP video uri
    pictureInPictureVideo = pipVideo,~~
    // set PiP video configuration
    pictureInPictureConfig = PipConfig(
        video = pipVideo,
        openPipSettings = false
    ),
    // setup what kind of action you want to do with VideoCreationActivity
    // setup data that will be acceptable during export flow
    additionalExportData = null,
    // set TrackData object if you open VideoCreationActivity with preselected music track
    audioTrackData = null
)
  ```
  Parameter `openPipSettings` in `PipConfig` here - this is opportunity to open **PiP** settings layout at the start of **PiP** mode.
  ❗**Note** that **PiP** modes can be configured. See the [documentation](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/mddocs/pip_configuration.md#pip-configuration) for more details. **PiP** configuration allows to disable **PiP** modes, to change their order and to set the default mode. Also it allows to set default camera location on the screen.
  1. `ExportResult` class and `EXTRA_EXPORTED_SUCCESS` constant were moved to `export.data` and `export.utils` packages accordingly, so change import statement for those:
  ```Kotlin
  ~~import com.banuba.sdk.ve.data.EXTRA_EXPORTED_SUCCESS~~
~~import com.banuba.sdk.ve.data.ExportResult~~
import com.banuba.sdk.export.data.ExportResult
import com.banuba.sdk.export.utils.EXTRA_EXPORTED_SUCCESS
  ```
  1. **Watermark** related classes were moved to `ve.effects.watermark` package, so change import statement for those:
  ```Kotlin
  ~~import com.banuba.sdk.ve.effects.WatermarkProvider~~
import com.banuba.sdk.ve.effects.watermark.WatermarkProvider
~~import com.banuba.sdk.ve.effects.WatermarkAlignment
~~import com.banuba.sdk.ve.effects.watermark.WatermarkAlignment
~~import com.banuba.sdk.ve.effects.WatermarkBuilder~~
import com.banuba.sdk.ve.effects.watermark.WatermarkBuilder
  ```
  1. `ExportVideoResolutionProvider` was removed from `export.data` package, so currently functionality for getting export `VideoResolution` should be implemented on **application side** in any way. This is more flexible. For example, to have the same functionality as before, `ExportVideoResolutionProvider` can be implemented on application side like this:
  ```Kotlin
  import com.banuba.sdk.core.VideoResolution

/**
 * Interface configures exported video resolution
 */
interface ExportVideoResolutionProvider {
    var videoResolution: VideoResolution
}
  ```
  ```Kotlin
  single<ExportVideoResolutionProvider> {
    val hardwareClass = get<HardwareClassProvider>().provideHardwareClass()
    object : ExportVideoResolutionProvider {
        override var videoResolution: VideoResolution = hardwareClass.optimalResolution
    }
}
  ```
  1. `ExportManager.Params` class **w****as**** moved** to** ****`ExportParams`**** **class in the `export.data` package. This class is used for export parameters configuration like video resolution, aspect ratio, applied effects, video size and so on. So change import statement for this:
  ```Kotlin
  ~~import com.banuba.sdk.ve.processing.ExportManager~~
import com.banuba.sdk.export.data.ExportParams
  ```
  1. New `audioBrowserConnection` styles:
  ```XML
  <style name="CustomIntegrationAppTheme" parent="VideoCreationTheme">
...
	<item name="audioBrowserConnectionErrorTitle">
    @style/CustomAudioBrowserConnectionErrorTitleStyle
  </item>
	<item name="audioBrowserConnectionErrorMessage">
    @style/CustomAudioBrowserConnectionErrorMessageStyle
  </item>
  <item name="audioBrowserConnectionErrorBtn">
    @style/CustomAudioBrowserConnectionErrorBtnStyle
  </item>
	<item name="audioBrowserConnectionErrorSpinner">
    @style/CustomAudioBrowserConnectionErrorSpinner
  </item>
</style>
...
<style name="CustomAudioBrowserConnectionErrorTitleStyle" parent="AudioBrowserConnectionErrorTitleStyle" />
<style name="CustomAudioBrowserConnectionErrorMessageStyle" parent="AudioBrowserConnectionErrorMessageStyle" />
<style name="CustomAudioBrowserConnectionErrorBtnStyle" parent="AudioBrowserConnectionErrorBtnStyle" />
<style name="CustomAudioBrowserConnectionErrorSpinner" parent="AudioBrowserConnectionErrorSpinner" />
  ```
  1. ❗❗**Dependencies versions update.**
  ```Markdown
  | androidx.appcompat:appcompat |** 1.4.1 **|
| androidx.core:core-ktx | **1.7.0** |
| androidx.lifecycle:lifecycle-livedata-ktx | **2.4.1** |
| androidx.lifecycle:lifecycle-runtime-ktx | **2.4.1** |
| androidx.lifecycle:lifecycle-service | **2.4.1 **|
| androidx.lifecycle:lifecycle-viewmodel-ktx | **2.4.1** |
| androidx.room:room-compiler | **2.4.2 **|
| androidx.room:room-ktx | **2.4.2** |
| androidx.room:room-runtime | **2.4.2** |
| com.google.android.material:material | **1.5.0** |
| com.squareup.moshi:moshi-kotlin | **1.13.0** |
| com.squareup.moshi:moshi-kotlin-codegen | **1.13.0** |
| org.jetbrains.kotlin:kotlin-stdlib-jdk7 | **1.6.20** |
| org.jetbrains.kotlinx:kotlinx-coroutines-android |** 1.6.0** |
| org.jetbrains.kotlinx:kotlinx-coroutines-core | **1.6.0** |
  ```
  ❗❗❗ **There is a build issue** related with updated **Moshi 1.13.0** version. For solving this issue Moshi should be added in the `android.jetifier.blacklist` or `android.jetifier.ignorelist `in the [gradle.properties](http://gradle.properties):
  ```Kotlin
  **# moshi-1.13.0 in black because compilation fail issue
# For Android Gradle plugin version 7.0+ the android.jetifier.blacklist is deprecated,
# so android.jetifier.ignorelist should be used instead
****android.jetifier.blacklist=moshi-1.13.0**
  ```
### Video Editor API Documentation
  VE API functionality supposes the support of multiple video clips and their processing. It includes the following API References: 
  [Introduction](https://banuba.gitbook.io/video-editor-sdk-api/)
  For more details, you can talk to your account manager.
## Performance update
  ### [1.23.1]
  *Released on Jun 10, 2022*
  > ‼️ This release requires prior migration to [1.23](/e81b53452ac840e5a25b4e5b3c96839f)**
**[PR link](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/186)** **
  
  [TOC]
## List of changes
  1. Now you can use your own build of [FFmpeg](https://ffmpeg.org/) libraries. Check out the following [guide](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/mddocs/ffmpeg_dependency.md)
  
  ---
  
## Migration guide
  > 👉 Here is an example of the PR sample of this update: [link](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/186)
  1. ❗New dependency **com.banuba.sdk:ffmpeg **is required in app/build.gradle**. **
`implementation "com.banuba.sdk:ffmpeg:4.4``"`
  
  ### [1.24]
  *Released on Jul 25, 2022*
  > ‼️ This release requires prior migration to [1.23.1](/5c2b5918389c40d1b7d868011443cfe5)**
**[PR link](https://github.com/Banuba/ve-sdk-android-integration-sample/commit/edcc931de0615eb9c9870de3ef7f53ef28ba8b28)** **
  
  [TOC]
## List of Changes
#### 1. **KOIN version updated**
#### 2. **Switcher Photo / Video**
  Aiming to ease the use of the recording functionality, we are adding a nice switcher of photo and video mode below the recording button. This also means, that the user can now start recording a video by just one tap on the record button (in the video mode) and finish - by the second tap. Recording with a long tap is still available, as well.
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/55062f87-1949-4565-87b6-6565c8e19aa6/camera_export_1.gif)
#### 3. **Changes in timer and hands free mode**
  It’s simplified and made more UX friendly: User sets timer -> Sets the length of the recorded clip (if it’s a video mode) -> Clicks countdown -> The countdown starts -> After 3-2-1 recording starts automatically (no additional actions from the user are required)
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/5501f129-3355-44e7-8b10-692051cda8b0/timer_export_7.gif)
#### 4. **Drafts can launch SDK from any point in your app**
  Drafts can be opened from any place in your application and launch SDK, so they are no longer hidden in the Gallery and can be used as a mature independent feature.
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/cbaaad8c-c303-4cf4-bdb6-726166afc49d/draft_export_2.gif)
#### 5. **Content preview in the gallery**
  Allow your users to easily preview photos and videos from the gallery before selecting them to upload in the video editor.
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/feb6ff1b-5851-4f69-95d0-7622d6ab94f8/gallery_export.gif)
#### 6. **Feature improvements:**
  1. Displaying soundtrack name in two lines with a non-transparent background
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/fde13adf-c246-480f-87c5-2f6e2f91a3b5/music_export_2.gif)
  1. Set some space around the watermark 
  1. Configure PiP default volume
  1. Remote token caching
#### 7. **Zoom in when recording**
  Now user can zoom in the image while recording. They can do it with a pinch gesture or by holding the button and swiping it up. 
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/19c49a5f-43ad-486e-8cf1-6668b7fbc9d7/zoom_in_export_1.gif)
#### 8. **Fixed major bugs:**
  1. Audio volume in one of the PIP videos couldn’t be heard
  1. The track volume chart for flac/wav formats wouldn’t be displayed
  1. Recorded voice over’s timeline wouldn’t display on the Sound page after reopening it
  1. Playback of the video with slowmo effects was distorted
  1. It wasn’t always evident that the list of effects is scrollable - now all scrollable lists display half of the “upcoming” icon to the right
  1. FX effect couldn’t be applied after adding GIF/Text; Mask, FX & Time effects would disappear after adding GIF/Text
  1. On several devices the picture on the camera was badly displayed with some unexpected “noise”
  
## Migration guide
  > 👉 Here is an example of the PR sample of this update: [link](https://github.com/Banuba/ve-sdk-android-integration-sample/commit/edcc931de0615eb9c9870de3ef7f53ef28ba8b28)
#### 1. **KOIN version updated** 
  **Koin** version was updated from **2.2.3** to **3.2.0**. Currently the call of `allowOverride(true)`  method is required in `startKoin`. Also new `VeUiSdkKoinModule` Koin module was added, so please add this module in `startKoin`:
  ```Markdown
  | io.insert-koin:koin-android | **3.2.0** |
  ```
  ```Kotlin
  startKoin {
	androidContext(this@IntegrationKotlinApp)	
**	allowOverride(true)**
	
	// pass the customized Koin module that implements required dependencies. Keep order of modules
  modules(
      VeSdkKoinModule().module,
      VeExportKoinModule().module,
      VePlaybackSdkKoinModule().module,
      AudioBrowserKoinModule().module, // use this module only if you bought it
      ArCloudKoinModule().module,
      TokenStorageKoinModule().module,
**      VeUiSdkKoinModule().module,**
      VeFlowKoinModule().module,
      IntegrationKoinModule().module,
      GalleryKoinModule().module,
      BanubaEffectPlayerKoinModule().module
  )
}
  ```
  ‼️ **Pay attention**, new Koin does not require **(override = true)** due to new `allowOverride(true)` method. For example
  ```Kotlin
  ~~single<ExportFlowManager>(override = true) {~~
single<ExportFlowManager> {
...
}
  ```
  ‼️ **Pay attention**, that if you use Java then `DefaultContextExtKt.startKoin` should be used instead of the `GlobalContextExtKt.startKoin`:
  ```Java
  ~~import static org.koin.core.context.GlobalContextExtKt.startKoin;
import org.koin.core.context.GlobalContext;
~~import static org.koin.core.context.DefaultContextExtKt.startKoin;
import com.banuba.sdk.veui.di.VeUiSdkKoinModule;
...
~~startKoin(GlobalContext.INSTANCE, koinApplication -> {~~
**startKoin(koinApplication -> {**
    androidContext(koinApplication, this);
    // pass the customized Koin module that implements required dependencies. Keep order of modules
    koinApplication.modules(
		    new VeSdkKoinModule().getModule(),
		    new VeExportKoinModule().getModule(),
		    new VePlaybackSdkKoinModule().getModule(),
		    new AudioBrowserKoinModule().getModule(), // use this module only if you bought it
		    new ArCloudKoinModule().getModule(),
		    new TokenStorageKoinModule().getModule(),
		    **new VeUiSdkKoinModule().getModule(),**
		    new VeFlowKoinModule().getModule(),
		    new IntegrationKoinModule().getModule(),
		    new GalleryKoinModule().getModule(),
        new BanubaEffectPlayerKoinModule().getModule()
~~    );~~
**    ).allowOverride(true);**
    return null;
});
  ```
  
#### 2. **Switcher Photo / Video**
  Regarding Photo / Video functionality camera could be setup with set of options  
  - Only Photo
  - Only Video
  - Photo and Video
  It depends on `availableModes` of overridden `CameraRecordingModesProvider` object:
  ```Kotlin
  single<CameraRecordingModesProvider> {
    object : CameraRecordingModesProvider {
        override var availableModes = setOf(RecordMode.Video, RecordMode.Photo)
    }
}
...
sealed class RecordMode {
    object Video : RecordMode()
    object Photo : RecordMode()
}
  ```
  Based on the new record button behavior new `CameraRecordModeTabLayoutStyle` was added, the `RecordButtonStyle` was updated and `camera_margin_to_record_button` parameter was removed:
  ```Kotlin
  <item name="cameraRecordModeTabLayoutStyle">@style/CustomCameraRecordModeTabLayoutStyle</item>
<style name="CustomCameraRecordModeTabLayoutStyle" parent="CameraRecordModeTabLayoutStyle" />
...
~~<style name="CustomRecordButtonStyle" parent="RecordButtonStyle">
    <item name="recordButtonInnerIdleDrawable">@drawable/ic_record_button_inner_oval</item>
    <item name="recordButtonInnerRecordingDrawable">@drawable/ic_record_button_inner_square
    </item>
    <item name="recordButtonCircleGradientColors">@array/progress_gradient_colors</item>
</style>
~~<style name="CustomRecordButtonStyle" parent="RecordButtonStyle" />
...
~~<item name="camera_margin_to_record_button">64dp</item>~~
  ```
  To configure `RecordMode`'s titles `camera_record_mode_video` and `camera_record_mode_photo` string resources were added:
  ```Kotlin
  <string name="camera_record_mode_video">Video</string>
<string name="camera_record_mode_photo">Photo</string>
  ```
  
#### 3. **Changes in**** timer and hands free mode**
  `TimerEntry` class was changed. The `iconResId` property was removed from this class. Update the implementation of `CameraTimerStateProvider` interface:
  ```Kotlin
  internal class IntegrationTimerStateProvider : CameraTimerStateProvider {
    override val timerStates = listOf(
            TimerEntry(
~~                    durationMs = 0,
                    iconResId = R.drawable.ic_stopwatch_off
~~                    durationMs = 0
            ),
            TimerEntry(
~~                    durationMs = 3000,
                    iconResId = R.drawable.ic_stopwatch_on
~~                    durationMs = 3000
            )
    )
}
  ```
  Below are changes in Hands Free feature styles. Many were removed and new `icon_timer` was added:
  ```Kotlin
  ~~<item name="handsFreeTimerLabelStyle">@style/CustomHandsFreeTimerLabelStyle</item>
<item name="handsFreeTimerDividerStyle">@style/CustomHandsFreeTimerDividerStyle</item>
<item name="handsFreeTimelineLabelStyle">@style/CustomHandsFreeTimelineLabelStyle</item>
<item name="handsFreeTimelineSwitchStyle">@style/CustomHandsFreeTimelineSwitchStyle</item>
<style name="CustomHandsFreeTimerLabelStyle" parent="HandsFreeTimerLabelStyle" />
<style name="CustomHandsFreeTimerDividerStyle" parent="HandsFreeTimerDividerStyle" />
<style name="CustomHandsFreeTimelineLabelStyle" parent="HandsFreeTimelineLabelStyle" />
<style name="CustomHandsFreeTimelineSwitchStyle" parent="HandsFreeTimelineSwitchStyle">
    <item name="thumbTint">@color/color_selector_switch_thumb</item>
    <item name="trackTint">@color/color_selector_switch_track</item>
</style>
~~...
<item name="icon_timer">@drawable/ic_stopwatch_off</item>
  ```
  
#### 4. **Improved Drafts logic**
  **DRAFTS API:**
  First of all, now drafts could be managed outside of internal SDK usage. There is `DraftsHelper` class which can help to implement your own Drafts screen by getting the list of all drafts:
  ```Kotlin
  interface DraftsHelper {

    val allDrafts: StateFlow<List<Draft>>

    fun delete(draft: Draft)

    fun deleteAll()

    fun openDraft(draft: Draft): Intent

    fun openLastDraft(): Intent
}
...
// To get the DraftsHelper object use inject() method
val draftsHelper: DraftsHelper by inject()
  ```
  If you want to use standard Drafts screen, you can do it as [before](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/mddocs/launch_modes.md#to-start-video-editor-from-drafts-screen) using `VideoCreationActivity.startFromDrafts` method. 
  There are new styles changes Drafts feature:
  ```Kotlin
  <item name="editorTrimButtonStyle">@style/CustomEditorTrimButtonStyle</item>
<item name="editorBackPopupStyle">@style/CustomEditorBackPopupStyle</item>
<item name="editorDiscardChangesButtonStyle">@style/CustomEditorDiscardChangesButtonStyle</item>
<item name="editorUpdateDraftButtonStyle">@style/CustomEditorUpdateDraftButtonStyle</item>
...
~~<item name="galleryDraftsButtonStyle">@style/CustomGalleryDraftsButtonStyle</item>
<item name="draftOptionsParentStyle">@style/CustomDraftOptionsParentStyle</item>
<item name="draftOptionsPreviewStyle">@style/CustomDraftOptionsPreviewStyle</item>
<item name="draftOptionsNameStyle">@style/CustomDraftOptionsNameStyle</item>
<item name="draftOptionsSubtitleStyle">@style/CustomDraftOptionsSubtitleStyle</item>
<item name="draftOptionsDividerStyle">@style/CustomDraftOptionsDividerStyle</item>
<item name="draftOptionsRemoveButtonStyle">@style/CustomDraftOptionsRemoveButtonStyle</item>
<item name="popupTextStyle">@style/CustomDraftPopupTextStyle</item>
<item name="popupArrowStyle">@style/CustomDraftPopupArrowStyle</item>
~~...~~
~~<item name="draftItemDurationStyle">@style/CustomDraftItemDurationStyle</item>
<item name="draftColumnsNumber">2</item>
<item name="draftOptionsPopupStyle">@style/CustomDraftOptionsPopupStyle</item>
<item name="draftOptionsEditButtonStyle">@style/CustomDraftOptionsEditButtonStyle</item>
<item name="draftOptionsDeleteButtonStyle">@style/CustomDraftOptionsDeleteButtonStyle</item>
...
~~<item name="icon_close">@drawable/ic_nav_close</item>
~~...~~
~~<item name="editor_icon_close">@drawable/ic_editor_close</item>
<item name="editor_icon_trim">@drawable/ic_trim</item>
...
~~<style name="CustomGalleryDraftsButtonStyle" parent="GalleryDraftsButtonStyle" />
<style name="CustomDraftOptionsParentStyle" parent="DraftOptionsParentStyle" />
<style name="CustomDraftOptionsPreviewStyle" parent="DraftOptionsPreviewStyle" />
<style name="CustomDraftOptionsNameStyle" parent="DraftOptionsNameStyle" />
<style name="CustomDraftOptionsSubtitleStyle" parent="DraftOptionsSubtitleStyle" />
<style name="CustomDraftOptionsDividerStyle" parent="DraftOptionsDividerStyle" />
<style name="CustomDraftOptionsRemoveButtonStyle" parent="DraftOptionsRemoveButtonStyle" />
<style name="CustomDraftPopupTextStyle" parent="PopupTextStyle" />
<style name="CustomDraftPopupArrowStyle" parent="PopupArrowStyle" />
~~...
<style name="CustomEditorTrimButtonStyle" parent="EditorTrimButtonStyle">
    <item name="descriptionPosition">left</item>
    <item name="descriptionSize">16sp</item>
    <item name="descriptionColor">@color/white</item>
    <item name="descriptionMarginEnd">12dp</item>
    <item name="descriptionAlignment">textEnd</item>
</style>
<style name="CustomEditorBackPopupStyle" parent="EditorBackPopupStyle" />
<style name="CustomEditorDiscardChangesButtonStyle" parent="EditorDiscardChangesButtonStyle" />
<style name="CustomEditorUpdateDraftButtonStyle" parent="EditorUpdateDraftButtonStyle" />
<style name="CustomDraftItemDurationStyle" parent="DraftItemDurationStyle" />
<style name="CustomDraftOptionsPopupStyle" parent="DraftOptionsPopupStyle"/>
<style name="CustomDraftOptionsEditButtonStyle" parent="DraftOptionsEditButtonStyle" />
<style name="CustomDraftOptionsDeleteButtonStyle" parent="DraftOptionsDeleteButtonStyle" />
  ```
  Please, follow the [documentation](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/mddocs/drafts_styles.md) to see more details about Drafts screen and learn how this can be used and customized. 
  
#### 5. **Content preview in the gallery**
  New styles were added for preview Gallery feature:
  ```Kotlin
  <item name="previewActionButtonStyle">@style/CustomPreviewActionButtonStyle</item>
<item name="previewContainerStyle">@style/CustomPreviewContainerStyle</item>
...
<style name="CustomPreviewActionButtonStyle" parent="PreviewActionButtonStyle" />
<style name="CustomPreviewContainerStyle" parent="PreviewContainerStyle" />
  ```
  
#### 6. **Feature improvements**
  1. **Displaying soundtrack name in two lines with a non-transparent background**
  New `subtitleAvailable` attribute was added for `CameraMusicTopIconStyle`. There are two possible values for this attribute:
  - `true `: soundtrack name and artist display in **two** lines;
  - `false`: soundtrack name and artist display in **one** lines.
  ```Kotlin
  <style name="CustomCameraMusicTopIconStyle" parent="CameraMusicTopIconStyle">
	  **<item name="subtitleAvailable">true</item>**
</style>
  ```
  1. **Set some space around the watermark**
  Currently you can add margins for watermark drawing. Previous watermark drawing options was removed:
  ```Kotlin
  effects.withWatermark(
	watermarkBuilder,
	WatermarkAlignment.BottomRight(marginRightPx = 16.toPx)
)
  ```
  Specific margins were added for every type of alignment:
  ```Kotlin
  class TopLeft(
	val marginTopPx: Float = 0f,
	val marginLeftPx: Float = 0f
)

class TopRight(
	val marginTopPx: Float = 0f,
	val marginRightPx: Float = 0f
)

class BottomLeft(
	val marginBottomPx: Float = 0f,
	val marginLeftPx: Float = 0f
)

class BottomRight(
	val marginBottomPx: Float = 0f,
	val marginRightPx: Float = 0f
)
  ```
  ‼️ **Pay attention**, that now you need to update watermark drawing parameters:
  ```Kotlin
  import com.banuba.sdk.core.ext.toPx
...
ExportParams.Builder(sizeProvider.videoResolution)
~~    .effects(effects.withWatermark(watermarkBuilder, WatermarkAlignment.BOTTOM_RIGHT))~~
    .effects(effects.withWatermark(watermarkBuilder, WatermarkAlignment.BottomRight(marginRightPx = 16.toPx)))
  ```
  1. **Configure PiP default volume**
  1. **Remote token caching**
## **Dependencies versions updates**
  ```Markdown
  | io.insert-koin:koin-android | **3.2.0** |
~~| io.insert-koin:koin-androidx-viewmodel | 2.2.3 |
~~...
| org.jetbrains.kotlin:kotlin-reflect | 1.6.20 |
...
| pl.droidsonroids.gif:android-gif-drawable | **1.2.24** |
  ```
  ‼️**Pay attention**, that new Kotlin dependency was added. If you haven’t used it before, please, add it in your project `build.gradle`:
  ```Kotlin
  implementation "org.jetbrains.kotlin:kotlin-reflect:**1.6.20**"
  ```
## Performance update
  Performance figures can be found in the table below:
  [VE Performance Analysis (for sharing)](https://docs.google.com/spreadsheets/d/1XVsF2UN-CsB2gpRadxOjVq221-3xZfHuFWTaGNUfNFY/edit#gid=2006170746)
  ### [1.24.1]
  *Released on Jul 26, 2022*
  > ‼️ This release requires prior migration to [1.24.0](/5b97696e0eae4fbca36b71ac6d8a05be)**
**[PR link](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/202)** **
  
  [TOC]
## List of Changes
  1. **Fixed endless preview video generation when exporting in some cases**
  
## Migration guide
  > 👉 Here is an example of the PR sample of this update: [link](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/202)
#### 1. ‼️**Fixed endless preview video generation when exporting in some cases** 
  
  
  ### [1.24.2]
  *Released on Jul 26, 2022*
  > ‼️ This release requires prior migration to [1.24.1](/c6a58469dc5140bc95ad4cc78061a332)**
**[PR link](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/213)[ ](https://github.com/Banuba/ve-sdk-android-integration-sample/commit/cba8056b46104c374c373d975c6537bc8eabcb80)
  
  [TOC]
## List of Changes
#### 1. Sharing screen 
  Now it is available to share video just after export (via facebook reels, facebook stories, instagram, etc.)
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/e7b0e844-21d0-446b-a156-3b7e4ac581dc/sharing.gif)
#### 2. Changed the logic for selected video range on trimmer screen
  To make the work with videos on trimmer screen more user friendly we have updated the logic of the next control buttons:
  - Split:
  If no video is selected, then the split button is not available. If a video is selected, but it is outside the cursor, then the split button is also unavailable.
  Split is available only if there is a selected video, and the cursor is on this video. And if in this case the user manually shifts the timeline, and the video is outside the cursor, then the split icon will become inactive. If then the user returns to the initial position, the split icon will become active again.
  - Crop and Rotate:
  The icons are active only when a video is selected in the timeline, and are applied to that selected video. If no video is selected, then the buttons are disabled.
  - Delete:
  The icon is active only if a video is selected in the timeline, and is applied to that selected video. If no video is selected, then the delete button is not active, we cannot delete anything. The position of the cursor does not affect the deletion in any way. If there is only one video, then the divide button is not active, even if the segment is selected (you cannot delete the video).
  Selection removes if:
  - the user manually scrolls the timeline and the selected video goes out of bounds of the screen
  - the user turns on the play, and the selected video goes out of bounds of the screen
  - on the second tap on the video
  - by tap on a free area
#### 3. Play button was moved to the bottom of the video on trimmer screen
#### 4. Fixed major bugs:
  1. Bug with `RemoteTokenProvider`
  1. Bug with effects positioning in RTL mode
  1. Bug with applying text fonts on text effect editor screen
  
  ### [Known issues]
## Migration guide
  > 👉 Here is an example of the PR sample of this update: [link](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/213)
  
#### 1. Sharing screen
  The new screen is available together with Banuba Video Editor - sharing screen. This is intended to share exported video through Facebook Reels, Facebook Stories, Instagram Stories and any other applications. 
  Besides the sharing screen is an optional feature we have added its integration in the recent [migration PR](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/213).
  The full description of the screen implementation and customization is available by the [link](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/mddocs/sharing_screen_styles.md).
#### 2. Token config changes
  New `TokenType` was added:
  ```Kotlin
  enum class TokenType {
    LOCAL, FIREBASE, REMOTE
}
  ```
  Currently for using one of the mentioned types just to override `TokenType` variable:
  ```Kotlin
  // case #1: Local token which is set by banuba_token string resource
single {
    TokenType.LOCAL
}

// case #2: Firebase token
single {
    TokenType.FIREBASE
}

// case #3: Remote token
single {
    TokenType.REMOTE
}
  ```
  As before, in the cases of Firebase and Remote token, the Local token (if it is set) is used as the default value if there is a problem getting the token from server. Also Firebase and Remote tokens are cached in the `SharedPreferences` to prevent token applying issues based on the internet troubles.
  **Pay attention**, that the `TokenType.LOCAL` is used as default one, so you need to override `TokenType.FIREBASE` or `TokenType.REMOTE` explicitly in your application Koin module if you use such token types.
  Also currently explicit overriding of `banubaTokenProvider` and `banubaToken` are not needed, so you need to remove such overrides if you’ve used those:
  ```Kotlin
  ~~single<TokenProvider>(named("banubaTokenProvider"), createdAtStart = true) {
    get(named("remoteTokenProvider"))
}

factory<String>(named("banubaToken")) {
    get(named("banubaLocalToken"))
}~~
  ```
#### 3. Feature improvements:
  - `TrimmerActionsProvider` is added to customize available trimmer action buttons and theirs order.
  - Since the logic of video selection on trimmer was changed there is a best practice to **use selectors** for trimmer action buttons (specified by `TrimmerAction` enum class) which change icon state depending on `state_activated` parameter. For example, if you use just a simple icon for the “rotate” button named `ic_trimmer_rotate.xml`, now we suggest to provide two different icons under this drawable resource:
  ```Kotlin
  <selector xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@drawable/ic_trimmer_rotate_active" android:state_activated="true" />
    <item android:drawable="@drawable/ic_trimmer_rotate_inactive" android:state_activated="false" />
</selector>
  ```
  This also applies to the `textColor` attribute for trimmer action button text style under `trimmerTimelineActionTextStyle`. Instead of single color we suggest you to use selector:
  ```Kotlin
  <selector xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:color="@color/egg_blue" android:state_activated="true" />
    <item android:color="@color/egg_blue_transparent" android:state_activated="false" />
</selector>
  ```
  ```Kotlin
  <style name="CustomTrimmerTimelineActionTextStyle" parent="TrimmerTimelineActionTextStyle">
        ~~<item name="android:textColor">@color/egg_blue</item>~~
				<item name="android:textColor">@color/color_selector_trimmer_action</item>
 </style>
  ```
  - `descriptionPosition` attribute values have been changed in order to be RTL layout friendly. Now instead of “left” you should use “start” and instead of “right” should use “end”. For example, for the custom style of the trim button:
  ```Kotlin
  <style name="CustomEditorTrimButtonStyle" parent="EditorTrimButtonStyle">
        ~~<item name="descriptionPosition">left</item>
				~~<item name="descriptionPosition">start</item>
        <item name="descriptionSize">16sp</item>
        <item name="descriptionColor">@color/white</item>
        <item name="descriptionMarginEnd">12dp</item>
        <item name="descriptionAlignment">textEnd</item>
</style>
  ```
  
  ### [1.25.0]
  *Released on Oct 3, 2022*
  > ‼️ Release requires prior migration to [1.24.2](/fffb57ad78b246af9a0903be8626967a)
  
  [TOC]
## List of Changes
#### 1. **New Face AR rendering engine**
  This release includes support of new Face AR rendering engine.
  ‼️ **Only if you use Face AR product. Previous hardcoded effects or effects from AR Cloud will not work after migration to this release. New AR engine requires new AR effects.**
  <u>**Please ask Banuba business representatives to provide new AR effects and AR Cloud bucket.**</u>
  
#### 2.  Support p**rogress indication for media import**
  To bring more clarity on how media is importing we added a new screen to indicate progress.
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/c1cf431b-5f06-4098-b8e4-bebbc42023c5/inport.png)
#### 3. Resolved issues
  1. Infinite second export after cover is changed.
  1. Crash after reopening the last draft
  
## Migration guide
  > 👉 [PR](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/219/files) addresses changes required for migrating to this release
  
#### 1. Support Android 13
  
  Video Editor SDK is compiled with [Android 13](https://developer.android.com/about/versions/13)
  Please use it in your project.
  ```Groovy
  android {
    compileSdkVersion "33"

   ...
}
  ```
#### 2. Upgrade version 
  ```Groovy
  def banubaSdkVersion = '1.25.0'
implementation "com.banuba.sdk:ffmpeg:4.4"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-timeline-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:banuba-token-storage-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
  
#### 3. SlideShow refactoring
  We made a lot of changes in this release around slide show video creation.
  1. SlideShow specific classes were moved from `com.banuba.sdk.ve.processing.*`  to `com.banuba.sdk.ve.slideshow.*`
  1. New `SlideShowTask` class fully replaces `SlideShowManager` (deleted)
  
  Please check out new changes
  ```Kotlin
  ~~import com.banuba.sdk.ve.processing.SlideShowManager
import com.banuba.sdk.ve.processing.SlideShowTask~~
import com.banuba.sdk.ve.slideshow.SlideShowScaleMode
import com.banuba.sdk.ve.slideshow.SlideShowSource
import com.banuba.sdk.ve.slideshow.SlideShowTask
...
~~val params = SlideShowManager.Params.Builder(
    size = Size(1280, 768),
    slides = listOf(Pair(it, 3000))
)
    .destFile(slideshowFromFile)
    .animationEnabled(true)
    .debugEnabled(true)
    .scaleMode(SlideShowManager.SlideShowScaleMode.SCALE_BALANCED)
    .build()~~
val params = SlideShowTask.Params.create(
    context = this,
    size = Size(1280, 768),
    destFile = slideshowFromFile,
    sources = listOf(
        SlideShowSource.File(
            source = source,
            durationMs = 3000
        )
    ),
    animationEnabled = true,
    debugEnabled = true,
    scaleMode = SlideShowScaleMode.SCALE_BALANCED
)
...
~~val params = SlideShowManager.Params.Builder(
    size = Size(1280, 768),
    picture = Pair(bitmap, 3000)
)
    .destFile(slideshowFromBitmap)
    .animationEnabled(true)
    .debugEnabled(false)
    .build()~~
val params = SlideShowTask.Params.create(
    context = this,
    size = Size(1280, 768),
    destFile = slideshowFromBitmap,
    sources = listOf(
        SlideShowSource.Picture(
            source = bitmap,
            durationMs = 3000
        )
    ),
    animationEnabled = true,
    debugEnabled = false,
    scaleMode = SlideShowScaleMode.SCALE_BALANCED
)
  ```
  
#### 4. Customize new import media progress screen
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/c1cf431b-5f06-4098-b8e4-bebbc42023c5/inport.png)
  Use  below styles to customize progress screen used while importing media.
  ```Kotlin
  <item name="loadingScreenParentViewStyle">@style/CustomLoadingScreenParentViewStyle</item>
<item name="loadingScreenTitleStyle">@style/CustomLoadingScreenTitleViewStyle</item>
<item name="loadingScreenDescStyle">@style/CustomLoadingScreenDescriptionViewStyle</item>
<item name="loadingScreenProgressStyle">@style/CustomLoadingScreenProgressStyle</item>
<item name="loadingScreenCancelBtnStyle">@style/CustomLoadingScreenCancelButtonStyle</item>
...
<style name="CustomLoadingScreenParentViewStyle" parent="LoadingScreenParentViewStyle" />
<style name="CustomLoadingScreenTitleViewStyle" parent="LoadingScreenTitleViewStyle" />
<style name="CustomLoadingScreenDescriptionViewStyle" parent="LoadingScreenDescriptionViewStyle" />
<style name="CustomLoadingScreenProgressStyle" parent="LoadingScreenProgressStyle" />
<style name="CustomLoadingScreenCancelButtonStyle" parent="LoadingScreenCancelButtonStyle" />
  ```
  Please, follow our [guide](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/mddocs/media_progress_styles.md) to customize this screen. 
#### 5. Support custom provider for ordering transition effects
  You can provide custom order of transition effects by implementing `OrderProvider`  and overriding `transitionEffectsOrderProvider` property in Koin module .
  See example
  ```Kotlin
  single<OrderProvider>(named("transitionEffectsOrderProvider")) {
    SampleOrderProvider()**
**}
  ```
  ```Kotlin
  class SampleOrderProvider :OrderProvider{

		override funprovide():List<String> =
				listOf(
            "whip_up",
            "whip_down",
            "whip_left",
            "whip_right",
            "scroll_up",
            "scroll_down",
            "scroll_left",
            "scroll_right",
            "spin",
            "fade",
        )
}
  ```
  
#### 6. String resources updates
  ```XML
  ~~<string name="editor_exporting">Exporting</string>
~~<string name="editor_alert_import_failed">Content uploading failed</string>
<string name="editor_alert_import_failed_desc" />
<string name="editor_alert_import_failed_positive">Retry</string>
<string name="editor_alert_import_failed_negative">Cancel</string>
<string name="editor_alert_export_stopped">Do you want to interrupt the video export?</string>
<string name="editor_alert_export_stopped_desc" />
<string name="editor_alert_export_stopped_positive">Interrupt</string>
<string name="editor_alert_export_stopped_negative">Cancel</string>
<string name="editor_alert_export_interrupted">Export interrupted</string>
<string name="editor_alert_export_interrupted_desc" />
<string name="editor_alert_export_interrupted_positive">Retry</string>
<string name="editor_alert_export_interrupted_negative">Cancel</string>
<string name="loading_export_title">Exporting video</string>
<string name="loading_export_description">Please, don\'t lock your screen or switch to other apps</string>
<string name="loading_import_title">Importing video</string>
<string name="loading_import_description">Please, don\'t lock your screen or switch to other apps</string>
  ```
#### 7. Gradle dependencies updates
  ```Markdown
  ~~| pl.droidsonroids.gif:android-gif-drawable | 1.2.24 |~~
| com.google.oboe:oboe | 1.6.1 |
  ```
  ### [1.25.1]
  *Released on Oct 14, 2022*
  > ‼️ 
  Release requires prior migration to [1.25.0](/9240af0c9b694bc596d8326dd38b7c17)
  [TOC]
## List of changes
#### Support p**rogress indication for export video**
  In release [1.25.0](/9240af0c9b694bc596d8326dd38b7c17) we added progress screen for importing media content.
  Now the same screen is available for exporting video to show indication of execution.
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/2a1dd7b5-a2a5-48b3-aba3-f0db8d91417a/Untitled.jpeg)
#### Resolved minor issues
  We fixed a few minor bugs related to Video Editor integration process.
## Migration guide
#### Upgrade version 
  ```Groovy
  def banubaSdkVersion = '1.25.1'
implementation "com.banuba.sdk:ffmpeg:4.4"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-timeline-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:banuba-token-storage-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
  
  ### [1.26.0]
  *Released on Nov 25, 2022*
  > ‼️ Release requires prior migration to 1.25.1 
  
  [TOC]
## List of Changes
#### 1.  Custom media callback
  We introduce new callback for choosing different pipelines of recorded or selected content on camera and gallery screens. When the user clicks on “Next” button on these screens the content is passed to the callback. Then you can process this content and decide what flow to use - **default** or **custom**. Default means the user will be taken to next Video Editor screen i.e. trimmer. Custom means the user will be taken to your specific screen.
  The **default **flow is enabled by default**.**
  
#### 2. Support Twitch effect
  New visual effect “Twitch” is available!
  > ‼️ Please contact Banuba Customer Success Manager to have this effect in your app.
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/7b40530f-46cd-44bb-becb-feaa61830735/preview_twich.gif)
#### 3. Changes in using AR effect in picture-in-picture video
  We disabled using Face AR effects on post processing screen for video created in picture-in-picture mode. AR button will not be shown on editor screen when video is recorded in picture-in-picture mode.
  **Using Face AR effects for recording video on camera screen in picture-in-picture mode is available.**
  
#### 4. Resolved major issues
  1. Original pip video do not play in headphones while capturing video.
  1. PiP audio is not synced when recorded multiple video parts. 
  1. Text effect is not wrapped properly on the screen.
  1. Other critical client bugs and crashes
## Migration guide
  
  > ‼️ Please [check out](https://github.com/Banuba/ve-sdk-android-integration-sample/commit/dca2dce38a55339ce301e7f2b3b7ac9aca96f76e) migration changes
#### 1. Upgrade version
  ```JavaScript
  def banubaSdkVersion = '1.26.0'
implementation "com.banuba.sdk:ffmpeg:4.4"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-timeline-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:banuba-token-storage-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
  
#### 2. Configure custom media callback
  To add custom media callback feature in your app you need to implement  `MediaNavigationProcessor` interface. Specify your implementation in Video Editor Koin module.
  ```Kotlin
  interface MediaNavigationProcessor {
			/**
			 * Callback for handling content received from camera or gallery screens.
			 *
			 *@param mediaList the list of uris for images and videos
			 *@return true - open next video editor screen,
								false - open your custom screen 
			 */
	fun process(mediaList: List<Uri>): Boolean
}
  ```
  ```Kotlin
  
class IntegrationKoinModule {
			...
			single<MediaNavigationProcessor> {
				object : MediaNavigationProcessor {
					override fun process(mediaList: List<Uri>): Boolean {
						val context = androidContext()
						// Process media content and start your flow
						...
						
						return false // means you want to leave video editor
					}
				}
			}
			...
}

  ```
  ### [1.26.0.1]
  Released on Nov 30 , 2022
  > ‼️ Release requires prior migration to [1.26.0](/a13cea95a22940b7bf7ec14ab80cfbcb) 
  [TOC]
## List of changes
#### 1. Rename native yuv library
  Native library `[libyuv.so](http://libyuv.so)` was renamed to `libbanuba-ve-yuv.so`
  Please add in your `builde.gradle`
  ```Groovy
  packagingOptions{
	pickFirst '**/libbanuba-ve-yuv.so'
}
  ```
#### 2. Support custom headers and queries in network request for getting token
  Interface `RemoteTokenApi` is used for providing a way to load a token from remote server. New implementation supports custom headers and queries.
  ```Kotlin
  /**
 * Custom sample
 *
 * interface CustomRemoteTokenApi : RemoteTokenApi {
 *      @GET("token.txt")
 *      override suspend fun getToken(
 *          @HeaderMap headerMap: Map<String,String>,
 *          @QueryMap queryMap: Map<String,String>
 *      ): ResponseBody
 *  }
 *
 * val headersMap = mapOf("headerAuthorization" to "your token")
 *  val queriesMap = mapOf("page" to "1")
 * ...
 * getToken(headersMap, queriesMap)
 *
 */

interface RemoteTokenApi {

		suspend fun getToken(
		        headerMap:Map<String, String> = emptyMap(),
		        queryMap:Map<String, String> = emptyMap()
		    ): Any
}
  ```
## Migration guide
  > 👉 Please [check out](https://github.com/Banuba/ve-sdk-android-integration-sample/commit/4d76006407c97d688781ee1f08ce9c00bf7bb3b0) migration changes
#### 1. Upgrade version
  ```JavaScript
  def banubaSdkVersion = '1.26.0.1'
implementation "com.banuba.sdk:ffmpeg:4.4"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-timeline-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:banuba-token-storage-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
  ### [1.26.1]
  Released on Dec 7, 2022
  > ‼️ Release requires prior migration to [1.26.0.1](/97c4631d568e4111b2ca3982f141bbcf) 
  [TOC]
## List of changes
#### 1. NEW feature - video recording time interval
  Before this release the user could use just one time interval for video recording. This interval was defined in config i.e. 1 min.
  New feature improves previous approach and allows to choose specific time interval for video recording. As a result the user will be able to switch between time intervals to find the best option.
  Default list of time intervals includes **2 min, 1 min, 30 sec, 15 sec. **The list of time intervals can be customized.
  **❗As a result default max video duration is increased from 1 minute to 2 minutes.**
  
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/3fa943a4-7b41-4d82-8d11-2bb252ebbaa0/interval.gif)
  
#### 2. NEW feature - support content rating for Giphy.com
  [Giphy.com](https://giphy.com/) allows loading gif files with specific [content rating](https://support.giphy.com/hc/en-us/articles/360058840971-Content-Rating).
  New config is added in the SDK to support this feature out of the box. 
## Migration guide
  > 👉 Please check out [migration changes](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/221/files)
#### 1. Upgrade version
  Add to your `app/build.gradle` file
  ```Groovy
  def banubaSdkVersion = '1.26.1'
implementation "com.banuba.sdk:ffmpeg:4.4"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-timeline-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:banuba-token-storage-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
  and
  ```Groovy
  packagingOptions {
   pickFirst '**/libbanuba-ve-yuv.so'
}
  ```
#### 2. Video recording time interval
  ❗**Default max video duration is increased from 1 minute to 2 minutes.**
  This change lead to
  1. Max video recording duration increased to 2 min
  1. Max video editing duration increased to 2 min
  1. Max video export duration increased to 2 min
  
  **Rules when default max video duration was not changed(1 min)**
  1. new default max video duration will be 2 min
  1. video recording time intervals will be [2 min, 1 min, 30 sec, 15 sec]
  1. video recording, editing, export will be limited to 2 min
  
  **Rules when max video duration was changed(custom)**
  1. your custom max video duration will be used
  1. video recording time intervals will be [custom max, 1 min, 30 sec, 15 sec]
  1. video recording, editing, export will be limited to custom duration
  
  **Customize feature**
  New property `videoDurations` is added in CameraConfig file to store list of video time interval values. Default implementation is 
  ```Kotlin
  val videoDurations:List<Long> =
        listOf(maxRecordedTotalVideoDurationMs, 60_000L, 30_000L, 15_000L)
  ```
  You can customize and provide your values. For example, **maxValue **is you new max video recording duration
  ```Kotlin
  class VideoEditorKoinModule {
	...
	single {
			CameraConfig(
		      maxTotalVideoDurationMs = maxValue,
          videoDurations = listOf(maxValue, 60_000L, 30_000L, 15_000L)
			)
		}
	...
}
  ```
  ❗**Important**
  Please keep in mind that on Android `CameraConfig.maxTotalVideoDurationMs` and `EditorConfig.maxTotalVideoDurationMs` are responsible for different features.
  If you customize `videoDurations` with new max video duration value different than default(2 min) and you want to support consistency between video recording, editing and export you have to set the same value of max video duration to `EditorConfig.maxTotalVideoDurationMs`. 
  For example, set max video duration 3 min and time intervals [3 min, 1 min, 30 sec, 15 sec]. In this case the user will be able to prepare content for 3 min but video editing and export will be limited with 2 min.
  Customize `maxTotalVideoDurationMs` to have consistency between features. 
  ```Kotlin
  class VideoEditorKoinModule {
	...
	single {
			EditorConfig(
		      maxTotalVideoDurationMs = maxValue,
			)
		}
	...
}
  ```
  New property `cameraTimeIntervalButtonStyle` style is added to customize video time interval button appearance.
  ```XML
  <item name="cameraTimeIntervalButtonStyle">@style/CustomCameraTimeIntervalButtonStyle</item>

<stylename="CustomCameraTimeIntervalButtonStyle">
    <itemname="android:layout_height">wrap_content</item>
    <itemname="android:layout_width">wrap_content</item>
    <itemname="android:textSize">16sp</item>
    <itemname="android:textColor">@color/white</item>
    <itemname="android:padding">6dp</item>
    <itemname="android:paddingStart">10dp</item>
    <itemname="android:paddingEnd">10dp</item>
    <itemname="android:background">@drawable/bg_camera_time_interval</item>
    <itemname="android:layout_marginBottom">20dp</item>
</style>
  ```
#### 3. Support content rating for Giphy.com
  New property `giphyRating` is added in EditorConfig file.
  Default implementation is 
  ```Kotlin
  var giphyRating: String = ""
  ```
  List of supported rating is available [here](https://support.giphy.com/hc/en-us/articles/360058840971-Content-Rating). 
  Example of setting custom content rating for [Giphy.com](https://giphy.com/)
  ```Kotlin
  
class VideoEditorKoinModule {
    ...
		single(named("giphyRating")){
			"G"
		}
    ...
}

  ```
  ### [1.26.2]
  Released on Dec 14, 2022
  > ‼️ Release requires prior migration to [1.26.1](/10615b7836ff422bae7ba629894fd300)
  [TOC]
## List of Changes
#### 1. ❗NEW license policy in release 1.26.3
  In the upcoming 1.26.3 release (planned for the end of 2022) we are going to address a crucial feature, license management improvements for your convenience. We understand that the previous approach causes complexity and uncertainty. 
  New changes will include
  1. Revoke license process instead of expiration date.Previously a license token that was** **used to initialize Video Editor SDK included** **a date when a commercial license expired.
New policy changes it and is based on revoking license when the paid license period expires. Our business representatives will contact you and provide more details.
  1. New API request for checking the license state. With this request you will be able to check if the license is valid and if it is possible to open Video Editor SDK. New specific screen will be shown when license state does not allow to open Video Editor SDK.
  1. New SDK initialization process. Token storage and management will be removed from the Video Editor functionality scope. As a result we will remove features for loading token from Firebase and Remote server. After this change you will be able to arrange your own implementation of storing a token on Firebase or Remote server.
  
  **❗Important**
  In general it means that token management will be significantly simplified for your convenience. We recommend storing a license token locally and change token only when  a set of the SDK features changes.
  The new solution helps to streamline the token management process and allows you to use one token without the need to replace provided the same functionality is extended for the new license period.
#### 2.  NEW experimental feature - external drafts
  ❗<u>The feature is in progress and in </u>**<u>BETA</u>**<u> stage.</u>
  
  With this feature we are going to bring a new experience for editing video content by multiple users on both platforms Android and iOS.
  Let’s say you have a team for creating video content. The first member of the team can record a number of video files on iOS and exports this content. The second member imports this content on Android and continues editing. This user applies text effects and exports new results again. All members of the team can work on creating the same video content sequentially. This feature does not support editing video content in simultaneously like Google docs. 
  
  Technically video content is bundled into an external draft and then to a .zip file. The same zip file can be used to import the external draft.
  
  ❗**Important**
  Video Editor SDK does not provide any solutions for uploading, downloading or managing video content on the backend or storing video in the cloud. The features requires your support in managing external drafts.
  
  Since this is a **BETA** release we expect that some bugs may appear while using this feature with various effects and a number of video and audio files.
  Main focus in this release
  - applying text effects
  - applying gif effects
  - applying audio (.wav, .mp3)
  
  Other effects and features are not fully supported yet.
  > 👉 Any feedback is appreciated. Please contact us!
## Migration guide
  > 👉  [PR](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/222/files) addresses changes required for migrating to this release.
#### 1. Upgrade version
  ```Kotlin
  def banubaSdkVersion = '1.26.2'
implementation "com.banuba.sdk:ffmpeg:4.4"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-timeline-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:banuba-token-storage-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
#### 2. External drafts
  With external drafts  you will allow multiple users to collaborate and create video content sequentially. A platform specific external draft is converted to .zip. Then you can manage this .zip file and deliver external draft to other users. 
  
  **Export external draft**
  `ExternalDraftInterceptor` is added to intercept when draft is saved.
  Specify your custom implementation in Video Editor Koin module to process a draft i.e. create zip and upload to your backend.
  ```Kotlin
  class VideoEditorKoinModule {
			...
			single<ExternalDraftInterceptor> {
            CustomExternalDraftInterceptor(
                context = get(),
                sessionExporter = get()
            )
      }
			...
}

class CustomExternalDraftInterceptor(
		private val context: Context,
    private val sessionExporter: SessionExportManager
) : ExternalDraftInterceptor {

    override suspend fun onDraftSaved(
        activity: Activity,
        draft: Draft
    ) = withContext(CoroutineDispatcherProvider.IO) {
				// Specify destFile where external draft is saved as a zip file
        val destFile = File( ... )
        val result = sessionExporter.export(draft, destFile)
        withContext(CoroutineDispatcherProvider.Main) {
            result
                .onSuccess { ... }
                .onFailure { ... }
                .map {}
        }
    }
}
  ```
  **Import external draft**
  Inject `SessionExportManager` into your Fragment, Activity or ViewModel
  ```Kotlin
  *private val *sessionExporter: *SessionExportManager by inject*()
  ```
  Import external draft by passing `File` where your zip is stored.
  ```Kotlin
  val draftFile = ... // your external draft as a zip
sessionExporter.import(draftFile)
            .onSuccess { draft ->
                // Handle successfully converted draft
            }
            .onFailure {
                // Handle failure
            }
  ```
  **Open draft**
  Open external draft in Video Editor SDK
  ```Kotlin
   
val intent = VideoCreationActivity.startFromDrafts(
            context = applicationContext,
            predefinedDraft = draft // your draft received after import
 )
 startActivity(intent)
  ```
  
  Full sample
  ```Kotlin
  val draftFile = ... // your external draft as a zip
sessionExporter.import(draftFile)
            .onSuccess { draft ->
                val intent = VideoCreationActivity.startFromDrafts(
                    context = applicationContext,
                    predefinedDraft = draft
                )
                startActivity(intent)
            }
            .onFailure {
                // Handle failure
            }
  ```
  
  
  
  
  
  
</details>

<details>
<summary><strong>2023</strong></summary>

  ### [1.33.0]
  Released on Dec 26, 2023
  > 💡 All migrations to 1.32.x releases you can find in the main sample on [GitHub](https://github.com/Banuba/ve-sdk-android-integration-sample/commits/main)
  
  [TOC]
## List of changes
### ❗Text styles (BETA release) 
  In addition to existing text customization options like color, font and background fill, it is now also possible to change the text visual appearance by choosing one of predefined styles.
  The feature is enabled by default and has the following limitations:
  - Supports only Latin and Cyrillic symbols
  - No emoji support
  - Partial support of blur and shadows
  - Partial typefaces support
  
  ![](https://prod-files-secure.s3.us-west-2.amazonaws.com/3e459574-fd13-4256-9979-b2d0064ec916/c332e255-5c87-4856-a1d3-a76722649986/text_fx_2_.gif)
### Support Face AR 1.9.3
  This release fully supports [Face AR 1.9.0](https://www.banuba.com/blog/face-ar-sdk-v1.9.0-improved-rendering-and-new-effects-player-api) and its minor release 1.9.3
### Updated core tech stack
  New version fully supports
  - [Java 17](https://www.oracle.com/java/technologies/javase/17-relnotes.html)
  - [Kotlin 1.8.22](https://kotlinlang.org/docs/whatsnew1820.html)
  - [AGP 8.1.2](https://mvnrepository.com/artifact/com.android.tools.build/gradle/8.1.2)
  - [Gradle 8.2](https://docs.gradle.org/8.2/release-notes.html)
  - [Kapt migrated to Ksp](https://developer.android.com/build/migrate-to-ksp)
  
### ❗Support Media3 ExoPlayer 
  In **Q1 2024** we are planning to migrate to [Media 3 ExoPlayer](https://developer.android.com/guide/topics/media/exoplayer).
### Updated the list of default features
  The following features are now default in the SDK and do not require integration code in your project.
  - Extended cover screen
  - Hands Free
  - Foreground export
## Migration guide
  
  
  > ‼️ [PR](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/262)  addresses changes required for migrating to this release.
#### **Upgrade version**
  ```Groovy
  def banubaSdkVersion = '1.33.0'
implementation "com.banuba.sdk:ffmpeg:5.1.3"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-timeline-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
  > ❗ **Below changes are required to support JDK 17 and Gradle 8+ versions**
  **Use JDK 17 in AndroidStudio**
  ![](https://prod-files-secure.s3.us-west-2.amazonaws.com/3e459574-fd13-4256-9979-b2d0064ec916/50bff130-c2e5-4a43-8880-12e7febab051/Screenshot_2023-12-23_at_7.29.00_PM.png)
  and update your `app build.gradle` file
  ```Groovy
  **compileOptions {
	sourceCompatibility JavaVersion.VERSION_17
  targetCompatibility JavaVersion.VERSION_17
}**

...

**kotlinOptions {
	jvmTarget = '17'
}**
  ```
  **Set your namespace in ****`build.gradle`**** file**
  ```Kotlin
  android {
	compileSdkVersion 33
  buildToolsVersion "30.0.3"

  **namespace "" PUT YOUR PACKAGE NAME**
	...
}
  ```
  **Update Kotlin version**
  ```Groovy
  buildscript {
	**ext.kotlin_version = "1.8.22"**
	...
}
  ```
  **Update Gradle version**
  Set Gradle 8.2 in your `[gradle-wrapper.properties](http://gradle-wrapper.properties)` file
  ```Groovy
  ...
**distributionUrl=https\://services.gradle.org/distributions/gradle-8.2-bin.zip**
  ```
  **Update AGP in your ****`build.gradle`**** file**
  ```Groovy
  dependencies {
	**classpath "com.android.tools.build:gradle:8.1.2"**
  classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
  ...
}
  ```
  **[Learn more](https://medium.com/@bhavnathacker14/migrate-your-multi-module-app-to-agp-and-gradle-8-0-with-android-studio-flamingo-d558e4621aaf)**
  **Use legacy jni packaging**
  ```Groovy
  packagingOptions {
	   ...
	   **jniLibs {
	     // ! USE INSTEAD OF REMOVED android.bundle.enableUncompressedNativeLibs=false
       useLegacyPackaging = true
	   }**
 }
  ```
  ****Migrate from Kotlin synthetics to Jetpack view binding****
  Remove ~~**'kotlin-android-extensions'**~~ and add  **'kotlin-parcelize' **plugin
  ```Groovy
  plugins {
    id 'com.android.application'
    id 'kotlin-android'
    ~~**id 'kotlin-android-extensions'
		**~~**id 'kotlin-parcelize'**
}
  ```
  **[Learn more](https://developer.android.com/topic/libraries/view-binding/migration)**
  
  **Update your ****[proguard-rules.pro](http://proguard-rules.pro)**** file**
  Add the following rules If `minifyEnabled true` is set your build script
  ```Groovy
  # The following rules are taken from generated "missing_rules.txt" file provided by R8
# Please add these rules to your existing keep rules in order to suppress warnings.
# This is generated automatically by the Android Gradle plugin.

-dontwarn kotlinx.android.extensions.LayoutContainer
-dontwarn kotlinx.parcelize.Parcelize
-dontwarn org.bouncycastle.jsse.BCSSLParameters
-dontwarn org.bouncycastle.jsse.BCSSLSocket
-dontwarn org.bouncycastle.jsse.provider.BouncyCastleJsseProvider
-dontwarn org.conscrypt.Conscrypt$Version
-dontwarn org.conscrypt.Conscrypt
-dontwarn org.conscrypt.ConscryptHostnameVerifier
-dontwarn org.openjsse.javax.net.ssl.SSLParameters
-dontwarn org.openjsse.javax.net.ssl.SSLSocket
-dontwarn org.openjsse.net.ssl.OpenJSSE
  ```
  Or run your build in release mode and check what rules are missing in `build/outputs/mapping/missing_rules.txt` files
### Updated the list of default features
  The following features are declared in the SDK as default.
  You can remove declarations in your VideoEditorModule classes or leave as is. 
  ```Kotlin
  class VideoEditorModule {
	...
	val module = module {
		...
		~~single<CoverProvider> {
		  CoverProvider.EXTENDED
		}

		single<CameraTimerActionProvider> {
		  HandsFreeTimerActionProvider()
		}

		single<ExportFlowManager> {
		  ForegroundExportFlowManager(
		    exportDataProvider = get(),
	      exportSessionHelper = get(),
	      exportDir = get(named("exportDir")),
	      shouldClearSessionOnFinish = true,
	      publishManager = get(),
	      errorParser = get(),
	      exportBundleProvider = get(),
	      eventConverter = get()
	    )
	  }~~
		...
	}
}
  ```
  ### [1.32.0]
  Released on Nov 10, 2023
  > 💡 All migrations to 1.31.x releases you can find in the main sample on [GitHub](https://github.com/Banuba/ve-sdk-android-integration-sample/commits/main)
  [TOC]
## List of changes
### Soundstripe integration
  [Soundstripe](https://www.soundstripe.com/) is a service for providing the best audio tracks for creating video content. Your users will be able to add audio tracks while recording or editing video content.
  Please contact to your Customer Success Manager to know more about using this feature. 
  ![](https://prod-files-secure.s3.us-west-2.amazonaws.com/3e459574-fd13-4256-9979-b2d0064ec916/bfa66ccc-090c-4cfd-9fbc-ffe87ce3c5e8/soundstripe_.gif)
### Adjust Beautification intensity
  We significantly improved use of Beautification feature in the SDK. 
  New AR effect and view control will allow to better adjust beautification while creating video content.
  ![](https://prod-files-secure.s3.us-west-2.amazonaws.com/3e459574-fd13-4256-9979-b2d0064ec916/db017686-3960-475e-a8e9-ef056277ddbc/beautyfication_2_.gif)
### Support Face AR 1.9.1
  This release fully supports  [Face AR 1.9.0](https://www.banuba.com/blog/face-ar-sdk-v1.9.0-improved-rendering-and-new-effects-player-api)  and its minor release 1.9.1
### Display text effect as a link
  Text effect on video has support of displaying effect as a link. To do so the user needs to type or paste pure internet link i.e. [https://www.banuba.com/](https://www.banuba.com/). 
  The feature supports only for `http` and `https` schemes.
  ![](https://prod-files-secure.s3.us-west-2.amazonaws.com/3e459574-fd13-4256-9979-b2d0064ec916/6decc8f9-ffe3-4361-8c28-f49a6dedc5cf/links_.gif)
### Core updates
  - All SDK modules migrated to [View Binding](https://developer.android.com/topic/libraries/view-binding)
  - Removed module banuba-token-storage-sdk
  > ‼️ In **1.33.0** release we will migrate to  [Kotlin 1.8.22](https://github.com/JetBrains/kotlin/releases/tag/v1.8.22) , [Gradle 8.2](https://docs.gradle.org/8.2/release-notes.html) and JDK17
## Migration guide
  > ‼️ [PR](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/258)  addresses changes required for migrating to this release.
  1. Upgrade version
  ```Groovy
  def banubaSdkVersion = '1.32.0.1'
implementation "com.banuba.sdk:ffmpeg:5.1.3"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-timeline-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
~~implementation "com.banuba.sdk:banuba-token-storage-sdk:${banubaSdkVersion}"~~
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
  Change imports
  ```Kotlin
  ~~import com.banuba.sdk.token.storage.license.BanubaVideoEditor
import com.banuba.sdk.token.storage.license.LicenseStateCallback~~
  ```
  To
  ```Kotlin
  import com.banuba.sdk.core.license.BanubaVideoEditor
import com.banuba.sdk.core.license.LicenseStateCallback
  ```
#### Soundstripe integration
  1. Contact **Banuba Support or Customer Success representatives** to obtain more details
  1. Specify the token that supports Soundstripe feature
  1. Make sure that the following dependencies are included
  `implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"` in your build.gradle file and
   `AudioBrowserKoinModule` in Koin modules in VideoEditorModule.
  ```Kotlin
  startKoin {
    ...
    modules(
       AudioBrowserKoinModule().module,
       VideoEditorKoinModule().module
    )
}
  ```
  1. Specify SoundstripeProvider in VideoEditorModule
  ```Kotlin
  class VideoEditorModule {
...
	single<ContentFeatureProvider<TrackData, Fragment>>(named("musicTrackProvider")){
    SoundstripeProvider()
	}
...
}

  ```
#### Adjust Beautification intensity
  Update `Beauty` effect in your project. You can download updated version in [GitHub sample](https://github.com/Banuba/ve-sdk-android-integration-sample/tree/main/app/src/main/assets/bnb-resources/effects/Beauty).
  Property `~~CameraConfig.banubaMaskBeauty~~` is removed.
  
  ### [1.30.2]
  Released on Sep 13, 2023
  > 💡 Release requires prior migration to [1.30.1](/5a08b6f2e9dc43be8bff62667daa4b1d?pvs=25)
## List of changes
  1. Support different colors for record button on camera screen. The button has red circle for video mode and white for photo mode.
  1. Hotfixes for release 1.30.0, 1.30.1
## Migration Guide
#### Upgrade version
  > 💡 [PR](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/252)  addresses changes required for migrating to this release.
  ```Groovy
  def banubaSdkVersion = '1.30.2'
implementation "com.banuba.sdk:ffmpeg:5.1.3"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-timeline-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:banuba-token-storage-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
  
  ### [1.30.1]
  Released on Sep 7, 2023
  > 💡 Release requires prior migration to [1.30.0](/e8a3f0f7235946d6b0a42039da8ed148?pvs=25)
  [TOC]
## List of changes
  1. Hotfixes for release 1.30.0
  1. Support opening video editor from Gallery screen.
## Migration Guide
#### Upgrade version
  > 💡 [PR](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/251)  addresses changes required for migrating to this release.
  ```Groovy
  def banubaSdkVersion = '1.30.1'
implementation "com.banuba.sdk:ffmpeg:5.1.3"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-timeline-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:banuba-token-storage-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
#### Support opening from Gallery screen
  We added new entry point for opening video editor from Gallery screen.
  ```Kotlin
  VideoCreationActivity.startFromGallery(
    context = applicationContext,
    extras = launchExtra
)
  ```
  ### [1.30.0]
  Released on Sep 4, 2023
  > 💡 Release requires prior migration to [1.29.3](/3902233840384206ae54b5255ea048b4?pvs=25)
  [TOC]
## List of changes
  We did deep analysis of the way how Video Editor SDK is integrated, what issues appear while integrating, the process of resolving issues through support and it was decided to improve all of these by
  - Updating UI/UX
  - Simplifying integration
### UI/UX changes
  New UI is fully based on previous version. UX has not been changed significantly.
  The main goal of these major changes is to show to your users UI that is more
  - Beautiful
  - Cleaner
  - Smoother
  
  [Embed: https://prod-files-secure.s3.us-west-2.amazonaws.com/3e459574-fd13-4256-9979-b2d0064ec916/7c4c9e6c-f8b0-47ec-b56b-2c40b6a62e2d/Tint_newUI_mu_170s_1080.mp4](https://prod-files-secure.s3.us-west-2.amazonaws.com/3e459574-fd13-4256-9979-b2d0064ec916/7c4c9e6c-f8b0-47ec-b56b-2c40b6a62e2d/Tint_newUI_mu_170s_1080.mp4)
  
  New version is based on the following color scheme by default. 
  
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/175791b5-5b3e-4098-a412-ae1575730460/Screenshot_2023-08-25_at_8.42.33_PM.png)
  > 💡 You can customize colors by using styles as you could do earlier.
### Integration changes
  Video Editor SDK contains hundreds of styles, resources, configurations and we understand how complicated and painful it might be to set up everything to complete basic integration and bring your own experience.
  Here are major changes
  1. **Visual assets are a part of the SDK**
  Previously all icons were stored in the samples on GitHub and it was expected that the icons could be used optionally in your project.
  New version includes all required set of icons for the basic integration.
  As a result you can use our new icons and remove your custom to make integration easier.
  1. **Backward compatibility exists**
  It is still possible to use your custom icons. Icons that you added before into the project and set them in styles will appear.
  
  The main goal of these changes is to have much easier integration and better backward compatibility with default UI theme.
### Support
  Banuba Support team will be happy to help and resolve all migration issues.
  We fully understand that this release contains many UI and integration changes and you might experience some issues. 
  Please follow Migration Guide to successfully complete migration.
## Migration Guide
  > 💡 [PR](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/250)  addresses changes required for migrating to this release.
  1. Upgrade version
  ```Groovy
  def banubaSdkVersion = '1.30.0'
implementation "com.banuba.sdk:ffmpeg:5.1.3"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-timeline-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:banuba-token-storage-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
  1. Next step depends on your decision - “Do I accept default UI theme?”
  1. **Yes** 
  1. Complete steps **3** and **4**
  1. Update your implementation of `VideoCreationTheme` in `styles.xml`` ` in your project. You can use the same implementation as in [GitHub sample](https://github.com/Banuba/ve-sdk-android-integration-sample). Please remember, that `ve-gallery-sdk` and `ve-audio-browser-sdk` are optional modules. You can remove styles for these modules if you do not use these modules.
  1. Remove visual assets - icons, colors from your previous integration. Follow [PR](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/250) to see required changes. 
  1. **No** 
  1. Complete steps **3** and **4**
  1. Check your video editor styles after migration. Custom icons should appear
  > 💡 Post a ticket to Banuba Support if you have any issues
  1. Remove unused styles from `styles.xml` file
  1. ~~`musicEditorVoiceRecordingControllerCancelStyle`~~
  1. ~~`musicEditorVoiceRecordingControllerDoneStyle`~~
  1. ~~`musicEditorEqualizerThrobberStyle`~~
  1. ~~`permissionsDialogContainerStyle`~~
  1. ~~`permissionsDialogDescriptionStyle`~~
  1. ~~`permissionsDialogActionButtonStyle`~~
  1. ~~`permissionsDialogActionButtonStyle`~~
  1. ~~`resetDialogStartOverBtnStyle`~~
  1. ~~`resetDialogResetBtnStyle`~~
  1. ~~`resetDialogCancelBtnStyle`~~
  1. ~~`throbberViewStyle`~~
  1. Rename style in the SDK
  1. `AlertPositiveButtonStyle` → `AlertPositiveHorizontalButtonStyle`
  
  > 💡 Consider removing color filter previews stored in the **drawable-ldpi**, **drawable-mdpi **folders to decrease APK file size up to 300KB.
  
  The following list of styles was removed from the [Github Sample](https://github.com/Banuba/ve-sdk-android-integration-sample) to simplify the integration.
  1. `loadingScreenCancelBtnStyle`
  1. `loadingScreenDescStyle`
  1. `loadingScreenTitleStyle`
  1. `loadingScreenParentViewStyle`
  1. `recordButtonStyle`
  1. `draftOptionsDeleteButtonStyle`
  1. `draftOptionsEditButtonStyle`
  1. `draftOptionsPopupStyle`
  1. `draftItemDurationStyle`
  1. `draftItemNameStyle`
  1. `draftItemOptionsButtonStyle`
  1. `draftItemThumbnailStyle`
  1. `draftItemParentStyle`
  1. `draftsEmptyTextStyle`
  1. `draftsRecyclerViewStyle`
  1. `draftsTitleStyle`
  1. `draftsBackButtonStyle`
  1. `CustomDraftsParentStyle`
  1. `advancedAudioVolumeBackgroundStyle`
  1. `backgroundEffectGalleryBorderedImageViewStyle`
  1. `backgroundEffectGalleryThumbProgressStyle`
  1. `backgroundEffectGalleryThumbTextStyle`
  1. `backgroundEffectGalleryThumbStyle`
  1. `backgroundEffectGalleryBtnStyle`
  1. `backgroundEffectGalleryListStyle`
  1. `backgroundEffectPermissionsBtnStyle`
  1. `backgroundEffectEmptyViewStyle`
  1. `backgroundEffectHintStyle`
  1. `backgroundEffectContainerStyle`
  1. `handsFreeTimelineCurrentDurationStyle`
  1. `handsFreeTimelineRangeDurationStyle`
  1. `handsFreeTimelineHintStyle`
  1. `audioBrowserConnectionErrorSpinner`
  1. `audioBrowserConnectionErrorBtn`
  1. `audioBrowserConnectionErrorMessage`
  ### [1.29.1]
  Released on August 11, 2023
  > 💡 Release requires prior migration to [1.29.0](/99aed44d533b4670ab053055e0e02d01?pvs=25)
  
  This release includes bug fixes in core functionality.
## Migration Guide
  > 💡 [PR](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/245)  addresses changes required for migrating to this release.
  ```Groovy
  def banubaSdkVersion = '1.29.1'
implementation "com.banuba.sdk:ffmpeg:5.1.3"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-timeline-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:banuba-token-storage-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
  ### [1.29.0]
  Released on July 28 , 2023
  > 💡 Release requires prior migration to [1.28.0](/0a848e6d2f5a41cbbf4263d8347e94cc?pvs=25)
  [TOC]
## List of changes
  
#### 1. External analytics events provider
  In this release we added new implementation for providing events that can be used in your analytics tools i.e. how the user interacts with AR effects.
#### 2. NEW UI configuration changes
  We added a number of requested configurations for customizing UI of VE UI SDK.
## Migration Guide
  > 💡 [PR](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/243) and [Hotfix](https://github.com/Banuba/ve-sdk-android-integration-sample/commit/54a52dad2eb203ce5cdb2dc4917ccb62a38214bb) addresses changes required for migrating to this release.
### 1. Upgrade version
  ```Groovy
  def banubaSdkVersion = '1.29.0'
implementation "com.banuba.sdk:ffmpeg:5.1.3"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-timeline-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:banuba-token-storage-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
  Add new styles to `styles.xml` file in your project
  ```XML
  <style name="CustomVideoCreationTheme" parent="VideoCreationTheme">
...
		<item name="galleryAutoCutNextButtonStyle">@style/CustomGalleryAutoCutNextButtonStyle</item>
		<item name="galleryAutoCutButtonStyle">@style/CustomGalleryAutoCutButtonStyle</item>
...
</style>

<style name="CustomGalleryAutoCutNextButtonStyle" parent="GalleryAutoCutNextButtonStyle"/>

<style name="CustomGalleryAutoCutButtonStyle" parent="GalleryAutoCutButtonStyle"/>
  ```
### 2. External analytics events provider
  New interface `ExternalSdkAnalyticsReceiver` is added for receiving external events from Video Editor SDK.
  Create new class that implements `ExternalSdkAnalyticsReceiver` and override `onSdkEventReceived` function.
  Implement parsing and sending the events to specific Analytics tools.
  > 💡 Every event has JSON representation
  ```Kotlin
  
object CustomExternalSdkAnalyticsReceiver : ExternalSdkAnalyticsReceiver {
  // Method which will be called when an event happens.
  // Event - is JSON representation of Event object
    override fun onSdkEventReceived(data: String) {
        // Put your custom logic for parsing and sending events here
    }
}
  ```
  Next, set the receiver in VideoEditor Koin module.
  ```Kotlin
  
class SampleIntegrationKoinModule {
...
	single<ExternalSdkAnalyticsReceiver> {
	  CustomExternalSdkAnalyticsReceiver()
	}
...
}

  ```
  
  Supported events
### 2. NEW config on cover screen
  We added new config to customize background and size of container on cover screen.
  
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/8b78fb20-1f94-4882-b97d-990ad5320dfe/Screenshot_2023-07-26-20-01-25-674_com.banuba.sdk.ve.demo.dev.png)
  ```XML
  ...
<item name="extendedCoverBottomViewStyle">@style/ExtendedCoverBottomViewStyle</item>
...

<style name="ExtendedCoverBottomViewStyle">
    <item name="android:layout_width">match_parent</item>
    <item name="android:layout_height">0dp</item>
    <item name="android:background">#FF00FF</item>
</style>
  ```
  
  ### [1.28.4]
  Released on July 14 , 2023
  > 💡 Release requires prior migration to [1.28.0](/0a848e6d2f5a41cbbf4263d8347e94cc?pvs=25)
## List of changes
#### NEW feature - adjust volume in Picture in Picture video
  In this release we roll out new feature for better adjusting audio volumes while making the video content. 
  The user can adjust volumes for video recorded in normal or picture in picture modes. New controls for adjusting volumes are on trimmer and music editor screens.
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/f040e898-5f5e-450c-8fd2-07a9eff2dbe2/warning.png)
  
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/73914e19-8376-4f1e-a2d9-cb925697af59/Added_video_without_sound.png)
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/e148c239-5247-4799-b071-db8fe649d041/apply_changes_on_both_screens.png)
  
## Migration guide
  > 👉  [PR](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/242) addresses changes required for migrating to this release.
#### Upgrade version
  ```Swift
  def banubaSdkVersion = '1.28.4'
implementation "com.banuba.sdk:ffmpeg:5.1.3"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-timeline-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:banuba-token-storage-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
  ❗ Properties ~~`pipSourceVideoPlaybackVolume`~~ and `~~pipCaptureAudioVolume~~`  were removed from `CameraConfig` class. 
  New styles `advancedAudioVolumeBackgroundStyle`, `trimmerEditVolumeApplyStyle`, `trimmerEditVolumeDismissStyle`, `musicEditorAdvancedVolumeProgressBarStyle` are added to customize volumes screen.
  
  ### [1.26.8]
  Released on May 19, 2023
  > 💡 Release requires prior migration to [1.26.7](/e4badafaf5144200a3a19ae6dfd98a7f)
  [TOC]
## List of changes
#### 1.  [Mubert](https://mubert.com/) integration is improved
  New optimization approach requests multiple audio tracks that allows to cut another 1 sec.
  The average loading time is about `2.5-3.5` seconds for the following parameters
  - 5 - number of tracks
  - 128 Kbs - quality
  - high - intensity
  - mp3 - audio format
  with an excellent internet connection.
#### 2. Gallery optimizations
  In this release we implemented new optimizations for loading media resources for gallery screen and other features import media from the device.
  New optimization improved performance and decreased gallery loading time up to 20%-30%.
  > 💡 Gallery loading time depends on: 
  - number of media resources on your device
  - number of directories(albums) on your device
  - number of heavy video resources - high video resolution and long duration. 
  
#### 3. ❗Color effect updates
  Color effects(luts) processing pipeline is updated to better support cold and warm colors.
  It is required to complete full migration. Please follow instructions in Migration Guide.
## Migration Guide
  > 💡 [PR](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/237) addresses changes required for migrating to this release.
#### 1. Upgrade version
  ```Swift
  def banubaSdkVersion = '1.26.8'
implementation "com.banuba.sdk:ffmpeg:5.1.3"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-timeline-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:banuba-token-storage-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
#### 2. Color effect updates
  We update all color effect previews. They are available in res drawable folders.
  1. [drawable-hdpi](https://github.com/Banuba/ve-sdk-android-integration-sample/tree/main/app/src/main/res/drawable-hdpi)
  1. [drawable-ldpi](https://github.com/Banuba/ve-sdk-android-integration-sample/tree/main/app/src/main/res/drawable-ldpi)
  1. [drawable-mdpi](https://github.com/Banuba/ve-sdk-android-integration-sample/tree/main/app/src/main/res/drawable-mdpi)
  1. [drawable-xhdpi](https://github.com/Banuba/ve-sdk-android-integration-sample/tree/main/app/src/main/res/drawable-xhdpi)
  1. [drawable-xxhdpi](https://github.com/Banuba/ve-sdk-android-integration-sample/tree/main/app/src/main/res/drawable-xxhdpi)
  1. [drawable-xxxhdpi](https://github.com/Banuba/ve-sdk-android-integration-sample/tree/main/app/src/main/res/drawable-xxxhdpi)
  
  Color effects shaders have not been changed and available in [asset/bnb-resources/luts](https://github.com/Banuba/ve-sdk-android-integration-sample/tree/main/app/src/main/assets/bnb-resources/luts)
  
  ### [1.26.3]
  Released on Jan 9, 2023
  > ‼️ Release requires prior migration to [1.26.2](/2aa271695c974ac7b90799a0b2a108d9)
  [TOC]
## List of Changes
#### 1.❗NEW updates in license policy
  In this release we are addressing a crucial feature, license management improvements for your convenience. We understand that the previous approach causes complexity and uncertainty. 
  New changes will include
  1. Revoke license process instead of expiration date. Previously a license token that was** **used to initialize Video Editor SDK included** **a date when a commercial license expired.
New policy changes it and is based on revoking license when the paid license period expires.<u> In some cases license expiration is used together with license revoking</u>.  Our business representatives will contact you and provide more details.
  1. New API request for checking the license state. With this request you will be able to check if the license is valid and if it is possible to open Video Editor SDK. New specific screen will be shown when license state does not allow to open Video Editor SDK.
  1. New SDK initialization process. Token storage and management will be removed from the Video Editor functionality scope. As a result we will remove features for loading token from Firebase and Remote server. After this change you will be able to arrange your own implementation of storing a token on Firebase or Remote server.
  1. Use of Video Editor API will be limited when license is expired or revoked. 
  
  **❗Important**
  In general it means that token management will be significantly simplified for your convenience. We recommend storing a license token within your app and change token only when  a set of the SDK features changes.
  The new solution helps to streamline the token management process and allows you to use one token without the need to replace provided the same functionality is extended for the new license period.
  
  ❗**Restrictions of use**
        **in Video Editor UI SDK**
  Media content unavailable screen will appear when Video Editor opens with revoked or expired license.
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/ee23c95f-62d8-4679-ad27-73d172cb6941/Untitled.png)
       Follow our guide and  new API method for checking license state to prevent showing this screen to your users.
  
         **in Video Editor API**
        **Playback API**
  Playing video and applying effects is restricted in case when license is revoked or expired. Specific warning log is posted in console.
        **Export API**
  Exporting video is restricted in case when license is revoked or expired. Specific warning log is posted in console
  
  ❗** Please contact Banuba Business representatives media content unavailable screen is shown.**
## Migration guide
  > 👉  [PR](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/223/files) addresses changes required for migrating to this release.
#### 1. Upgrade version
  ```Kotlin
  def banubaSdkVersion = '1.26.3'
implementation "com.banuba.sdk:ffmpeg:4.4"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-timeline-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:banuba-token-storage-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
#### 2. License policy changes
  We no longer support features for loading token from Firebase and Remote server - ~~`FirebaseTokenProvider`~~ , ~~`RemoteTokenProvider`~~ , ~~`RemoteTokenProvider`~~ are removed.
  **We recommend storing the token within your app.**
  
  **Changes in Video Editor UI SDK**
  In this update we are no longer crashing an application if an invalid token is provided.
  First, create instance of `BanubaVideoEditor` by passing a license token in `initialize` method. The method will return new instance or `null` - in case if  token is undefined or invalid.
  
  ```Kotlin
  val videoEditorSDK = BanubaVideoEditor.initialize(token)

if (videoEditorSDK == null) {
	// ❌ Banuba Video Editor SDK is not initialized: license token is unknown or incorrect 
	// Please check your license token or contact Banuba.
} else {
  // ✅ Token is ok
}
  ```
  Once instance of  `BanubaVideoEditor` is initialized you can use method `getLicenseState` for checking license state.
  ```Kotlin
  videoEditorSDK.getLicenseState{ isValid ->
	if(isValid) {
    // ✅ License is active, all good
    // You can show button that opens Video Editor or 
    // Start Video Editor right away
  } else {
    // ❌ License is revoked or expired
	}
}
  ```
  
  ❗Please keep in mind that method `getLicenseState` is asynchronous. It might take around 1 second for the first usage in the worst case.
  Consider hiding your UI controls that open Video Editor SDK when license is in invalid state(expired or revoked). Otherwise the user will see media content unavailable screen.
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/ee23c95f-62d8-4679-ad27-73d172cb6941/Untitled.png)
  
  **Changes in Video Editor API**
  Specific logs are posted into console when the license is revoked and Video Editor API method is requested.
  Export API will return `ExportResult.Error` with `ExportError.``*INVALID_LICENSE*`* *to the completion closure.
  
#### 2. Custom Callback changes
  We introduced feature [custom callback](/a13cea95a22940b7bf7ec14ab80cfbcb#aa97d59033d04dfdb82965f21397614b) in release 1.26.0.
  In this release we added `Activity` argument in `process` method for better navigation handling.
  ```Kotlin
  class VideoEditorKoinModule {
	...
	single {
		object : MediaNavigationProcessor {
                    override fun process(
												activity: Activity,
												mediaList: List<Uri>
										): Boolean {
                        // Add your media list processing
												val proceedWithVE: Boolean = ...
                        return proceedWithVE
                    }
                }
		}
	...
}

  ```
  
  ### [1.26.4]
  Released on Jan 31, 2023
  > ‼️ Release requires prior migration to [1.26.3](/113feef808d14d39abf8ccdd3181b36a)
  [TOC]
## List of changes
#### 1. NEW feature - Blur effect
  We are happy to announce new feature **Blur effect** is available for all in this release. 
  The feature allows to blur any area on a video for a certain amount of time. The user applies **Blur effect** on post processing screen like other effects i.e. Text, Stickers, etc.
  **2 options are available**
  1. Circle
  1. Square
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/40d1d85f-3855-4580-bddd-58ed9c3a867e/blur2.gif)
## Migration guide
  > 👉  [PR](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/226) addresses changes required for migrating to this release.
#### 1. Upgrade version
  ```Groovy
  def banubaSdkVersion = '1.26.4'
implementation "com.banuba.sdk:ffmpeg:4.4"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-timeline-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:banuba-token-storage-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
#### 2. NEW feature - Blur effect
  ❗The feature is enabled by default.
  To disable Blur effect set `supportsBlurEffect` to `false` in `EditorConfig` in Video Editor Koin module.
  ```Kotlin
  single<EditorConfig>{
	EditorConfig(
		  ...
	    supportsBlurEffect = false,
			...
	)
}
  ```
  
  **Important ❗**
  Blur effect comes with a number of resources i.e. icons, styles. You can use our resources as a default implementation. All required resources are in the [PR](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/226).
  To customize blur appearance you can implement the following Android styles.
  ```XML
  <style name="CustomIntegrationAppTheme"parent="VideoCreationTheme">
		...

    <!--Blur-->
		<item name="blur_editor_icon_circle">@drawable/ic_blur_editor_add_circle</item>
    <item name="blur_editor_icon_square">@drawable/ic_blur_editor_add_square</item>
    <item name="blur_editor_icon_delete">@drawable/ic_blur_editor_delete</item>
    <item name="blurEffectViewStyle">@style/CustomBlurEffectViewStyle</item>
</style>
  ```
  ```XML
  <style name="CustomEditorActionsStyle"parent="EditorActionsStyle">
		...

    <item name="editor_act_icon_blur_off">@drawable/ic_blur_off</item>
    <item name="editor_act_icon_blur_on">@drawable/ic_blur_on</item>
</style>
  ```
  ### [1.26.5]
  Released on Feb 15, 2023
  > ‼️ Release requires prior migration to [1.26.4](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/226)
  [TOC]
## List of changes
#### 1. Added compatibility with other FFmpeg versions
  Video Editor SDK includes custom FFmpeg version to process video and audio. Previously the issue with compatibility of different versions happened when multiple FFmpeg dependencies were included in one project.
  In this release Video Editor SDK is compatible with other FFmpeg versions. That means you can use your custom FFmpeg version along with FFmpeg version in Video Editor SDK. 
#### 2. NEW feature - audio volume adjustment
  New icon is added to “Music” effects section for your convince to easily adjust audio volume in video.  
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/545d52f9-03b4-4b98-bb05-923fd9f98e6c/volume_short.gif)
## Migration guide
  > 👉  [PR](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/229/files) addresses changes required for migrating to this release.
#### 1. Upgrade version
  ```Groovy
  def banubaSdkVersion = '1.26.5'
implementation "com.banuba.sdk:ffmpeg:5.1.3"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-timeline-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:banuba-token-storage-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
#### 2. Upgrade FFmpeg version
  New version of FFmpeg `5.1.3` is available in Video Editor SDK. This new version allows to use multiple FFmpeg versions in one project.
  ```Groovy
  implementation "com.banuba.sdk:ffmpeg:5.1.3"
  ```
#### 3. Set Mubert API key changes
  Use new approach to set up Mubert API key in VideoEditor module. 
  ❗**Important**
  This dependency is required in Video Editor module for the release 1.26.5.
  **Please use 1.26.5.1 patch**
  ```Kotlin
  single {
    MubertApiConfig("API KEY")
}
  ```
#### 4. NEW feature - audio volume adjustment
  The feature is enabled by default. You can use default icon available in the sample and added in [PR](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/231/files) or provide your custom icon.
## Patches
#### 1.26.5.1 (RECOMMENDED)
  Fixes crash that happens with missing `MubertApiConfig` dependency in VideoEditor module when Audio Editor or Audio Browser screen opens.
  
  ### [1.26.6]
  Released on March 24, 2023
  > ‼️ Release requires prior migration to [1.26.5](/c621ce3ef6c84d67a721ec1e9b829dde)
  [TOC]
## List of changes
#### 1. Feature UPDATE - Hide video recording time interval
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/33e3eed0-114d-4c70-a2fd-ad16c756ba60/photo_2023-03-03_14.23.20.jpeg)
  In release [1.26.1](/0edacf053a88499cbb51e6f065274dd3) the feature **video recording time interval **was introduced.
  In this release we added a possibility to hide the button that is used to switch among provided durations.
#### 2. Transition effects are enabled by default
  Transition effect  is an effect added between pieces of media to create an animated link between them, they help move a scene from one shot to the next. Transition effects were introduced in the release 1.23.0. 
  In this release we enabled this feature by default.
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/e8a70801-714d-45c9-84ed-c72de5b9758d/transitions.gif)
  
  
#### 3. Memory leak improvements
  We did research and fixed some memory leaks that could happen when open and close video editor multiple times. The results might depend on device and installed OS.
  
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/26b97437-5b8f-4ec8-8322-ce1d529ce2f2/mc1.png)
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/af59ecd7-72a7-4a3e-a324-711e4629dfd4/mc2.png)
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/a1c20932-7b93-46ba-801e-5d3f45730207/mc3.png)
  ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/d3f378d5-edd5-463c-9d5f-7b0225a9ec55/mc4.png)
  
## Migration guide
#### 1. Upgrade version
  ```Groovy
  def banubaSdkVersion = '1.26.6'
implementation "com.banuba.sdk:ffmpeg:5.1.3"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-timeline-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:banuba-token-storage-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
#### 2. Feature UPDATE - Hide video recording time interval
  New property  CameraConfig.supportsVideoDurationSwitcher is added to control video recording time interval switcher. Default `true`
  In this sample, video recording time interval switcher will be hidden.
  ```Kotlin
  single(override = true) {
  CameraConfig(supportsVideoDurationSwitcher = false)
}
  ```
#### 3. Transition effects are enabled by default
  Previously you could use `EditorConfig.supportsTransitions` to enable transition effects in your project. You can remove ~~`supportsTransitions = true`~~ in your project because it is default implementation
  ```Kotlin
  single(override = true) {
  EditorConfig(
    ...
    ~~supportsTransitions = true~~
  )
}
  ```
#### 4. ❗Export metadata changed
  Export feature generates `export-metadata.json` file which you can analyze how your users use video editor. Learn more about metadata and access in our [main documentation](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/mddocs/guide_export.md#Export-metadata-analytics).
  In this release we fully changed the structure of json file. 
  Migration to new structure requires changes in `ExportFlowManager` implementations. 
  We added required changes in  `ExportFlowManager` implementations for your convince.
  
  ```Kotlin
  // Foreground export flow manager
single<ExportFlowManager> {
    ForegroundExportFlowManager(
      exportDataProvider = get(),
      ~~sessionParamsProvider = get(),~~
      exportSessionHelper = get(),
      exportDir = get(named("exportDir")),
      shouldClearSessionOnFinish = false,
      publishManager = get(),
      errorParser = get(),
      ~~mediaFileNameHelper = get(),~~
      exportBundleProvider = get()
      eventConverter = get()
    )
}

// Or export flow manager
single<ExportFlowManager> {
		BackgroundExportFlowManager(
	    exportDataProvider = get(),
      ~~sessionParamsProvider = get(),~~
      exportSessionHelper = get(),
      exportNotificationManager = get(),
      exportDir = get(named("exportDir")),
      publishManager = get(),
      errorParser = get(),
      shouldClearSessionOnFinish = true,
      exportBundleProvider = get(),
      eventConverter = get()
    )
}
  ```
  New structure
  ```JSON
  {
	"export_success": true, // defines if the export finished succesffully
	"aspect_ratio": "original", // aspect ration used in exported video
	"video_resolutions": ["1080x1920"], // list of video resolutions used in export
	"camera_effects": [], // list of effects of features used on camera screen while recording video
	"ppt_effects": {
		"visual": 2, // num of visual effects i.e. Glitch, VHS used in exported video
		"speed": 1, //  num of speed effects used in exported video
		"mask": 6, // num of AR masks used in exported video
		"color": 3, // num of color effects used in exported video
		"text": 1, // num of text effects used in exported video
		"sticker": 1, // num of sticker effects used in exported video
		"blur": 1 // num of blur effects used in exported video
	},
	"sources": {
		"camera": 0, // num of video sources recorded on camera screen(not PIP)
		"gallery": 1, // num of video sources selected in the gallery
		"pip": 0, // num of video recorded with PIP
		"slideshow": 0, // num of video exported as slideshow
		"audio": 0 // num of audi tracks
	},
	"export_duration": 12.645, // export processing duration
	"video_duration": 20.11, // exported video duration
	"video_count": 1, // num of exported video files
	"os_version": "11", // OS version
	"sdk_version": "1.26.6" // VE SDK version
}
  ```
  
## Patches
#### 1.26.6.1 ❗Required for clients with VE API
  Changed import 
  `~~import com.banuba.sdk.veui.data.EditorAspectSettings~~`
  `import com.banuba.sdk.ve.data.EditorAspectSettings`
#### 1.26.6.2 ❗Required for clients with VE API
  Implementation `~~AppAnalytics.AppAnalyticsEventConverter~~` is removed
  ```JavaScript
  private class SampleKoinModule {

    val module = module {
			...

			~~single<AppAnalytics.AppAnalyticsEventConverter> {
            BanubaAnalyticConverter(
                sessionSerializer = get(),
                aspectsProvider = get()
            )
       }~~
		}
}
  ```
  
  
  ### [1.26.7]
  Released on April 19, 2023
  > ‼️ Release requires prior migration to [1.26.6](/2093b77cabc54ec0b28100c723ca90fe)
  [TOC]
## List of changes
#### 1. Improve Mubert integration
  Video Editor SDK supports [Mubert](https://mubert.com/) integration that allows users to easily choose and apply audio tracks while making video.
  In this release we addressed the request to optimize track loading time.
  > ❗ New Mubert integration requires setting `license` and `token` keys. Please contact Mubert representatives to get your keys.
  Moreover, we deeply analyzed Mubert implementation in Video Editor and did some improvements. All these improvements should decrease track loading time.
  Please follow our recommendations and use Mubert params wisely:
  1. Limit the number of tracks per page. Mubert generates tracks on demand. Track generation is intensive task and usually takes time. The more tracks the longer processing time. Use `MubertApiConfig.generatedTracksAmount` to set number of audio tracks per page. Users can load more track by clicking on specific button. Default value is `5`.
  1. Optimize audio duration time. Use `MubertApiConfig.generatedTrackDurationSec` to set duration of each generated audio track. Default value is `30` seconds.
  1. Optimize bitrate value. Use MubertApiConfig.generateTrackBitrate to set bitrate of each generated audio track. Default value is `128`.
  All default values are set after many experiments to address fast response and good audio quality.
  > ❗ More Mubert optimizations for decreasing loading time will be addressed in next releases
#### 2. Improve export video
  Video Editor supports 2 codecs - `AVC(H264)` and `HEVC(H265)`. [HEVC](https://developer.android.com/guide/topics/media/media-formats#video-codecs) is available starting from Android 5.0
  We did deep investigation and analysis regarding export implementation on Android and found that HEVC codec was not applied on some devices even though it was available.
  Improvements were done and HEVC should be available on more Android devices. HEVC is the preferred codec for video export but you can fallback to AVC using new property `useHevcIfPossible`
  Unfortunately, not all Android devices are able to encode HD, FHD video using HEVC due to different hardware used by Android manufacturers. In this case video will be encoded with the best settings of AVC codec.
  > ❗ Bitrate values for HD(720*1280), FHD(1080*1920) video were reduced to -10% to optimize file size and keep good video quality.
  
  Our observations when HEVC is used for video encoding
  - file size (.mp4) should be smaller from 10% to 30%
  - export should be a bit faster from 5% to 20%
  
  > 💡 Video Editor export is adjusted to keep balance between file size and video quality.
  
#### 3. Support fast access to exported audio file
  Video Editor allows to export audio from a video as `.m4a` file. Previously you could access to this audio file only when export finishes successfully.
  In this release we allow to access to audio file once audio encoding process finishes.
  
#### 4. Gallery updates
  In this release we updated validation of all media resources on gallery screen. New validation process might take longer time than before. It depends on 
  - number of media resources
  - content i.e. duration and video resolution
  - device hardware
  
  The main reason is to eliminate media resources that Android device cannot open: for example 8k video in HEVC codec.
  > ❗ New performance updates will be addressed in next releases to reduce gallery loading time
## Migration guide
#### 1. Upgrade version
  ```Groovy
  def banubaSdkVersion = '1.26.7'
implementation "com.banuba.sdk:ffmpeg:5.1.3"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-timeline-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:banuba-token-storage-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
#### 2. Update Mubert integration
  Set `license` and `token` keys to `MubertApiConfig` in Video Editor Koin module.
  Previous implementation
  ```Kotlin
  single {
    MubertApiConfig(
			~~mubertApiKey = "..."~~,
		...)
 }
  ```
  New implementation
  ```Kotlin
  single {
    MubertApiConfig(
			mubertLicence = "...",
      mubertToken = "...",
		...)
 }
  ```
#### 3. Update Export video integration
  New release includes changes for choosing `HEVC` or `AVC` codecs for video export. 
  We removed previous approach of setting preferred codec configuration in Video Editor Koin module.
  ```Kotlin
  ~~single {
   CodecConfiguration.HEVC
}~~
  ```
  
  New property `ExportParams.useHevcIfPossible` is added. Default value is `true`. 
  Use the following approach to disable HEVC codec while exporting video.
  In this example, AVC(H264) codec will be used.
  ```Kotlin
  val params = ExportParams(
...,
useHevcIfPossible = false
)
  ```
#### 4. Support fast access to exported audio file
  `ExportResult.Progress` class is changed to support fast access to exported audio file. 
  `audioUri` is a Uri path to .m4a file and it will be available once audio encoding process completes.
  ```Kotlin
  data class Progress(
         val preview: Uri,
         val audioUri: Uri? = null, // NEW
         @IntRange(from = 0, to = 100) val percentage: Int = 0
     ) : ExportResult()
  ```
## Patches
#### 1.26.7.1
  - Fix showing “Search GIPHY” text in search bar by default
  - Add `EditorConfig.supportsGalleryOnTrimmer` and `EditorConfig.supportsGalleryOnCover` configurations to control use of gallery feature on trimmer and cover screens. Default value `true`
  
  ### [1.27.0]
  Released on June 9 , 2023
  > 💡 Release requires prior migration to [1.26.9](/31040cb35a454b8c8874d2df9984e659)
  
  [TOC]
## List of changes
#### ❗Upgrade Face AR to 1.7.0 
  This release has support of new Face AR version 1.7.0.
  [Learn more](https://www.banuba.com/blog/face-ar-sdk-v1.7-facial-feature-editing-and-up-to-10x-faster-backgrounds) about new features.
## Migration Guide
  > 💡 [PR](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/239) addresses changes required for migrating to this release.
#### Upgrade version
  ```Kotlin
  def banubaSdkVersion = '1.27.0'
implementation "com.banuba.sdk:ffmpeg:5.1.3"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-timeline-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:banuba-token-storage-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
  ### [1.26.9]
  Released on May 30 , 2023
  > 💡 Release requires prior migration to [1.26.8](/6d339f3b737c4faab0e1bc86a001616e)
## List of changes
  The release includes a number of bug fixes
## Migration Guide
  > 💡 [PR](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/238/files) addresses changes required for migrating to this release.
#### Upgrade version
  ```Swift
  def banubaSdkVersion = '1.26.9'
implementation "com.banuba.sdk:ffmpeg:5.1.3"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-timeline-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:banuba-token-storage-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
  
  ### [1.28.0]
  Released on June 23 , 2023
  > 💡 Release requires prior migration to [1.27.0](/03033a59052248e098fd60921376754b?pvs=25)
## List of changes
  The release includes a number of bug fixes
## Migration Guide
  > 💡 [PR](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/241) addresses changes required for migrating to this release.
#### Upgrade version
  ```Groovy
  def banubaSdkVersion = '1.28.0'
implementation "com.banuba.sdk:ffmpeg:5.1.3"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-timeline-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:banuba-token-storage-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
  
  ### [1.29.2]
  Released on August 22, 2023
  > 💡 Release requires prior migration to [1.29.1](/78170ead1c7a4853b39d0d7a4c068b0e?pvs=25)
  This release includes hot fixes for 1.29.0 and 1.29.1 releases.
## Migration Guide
  > 💡 [PR](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/246/files)  addresses changes required for migrating to this release.
  ```Groovy
  def banubaSdkVersion = '1.29.2'
implementation "com.banuba.sdk:ffmpeg:5.1.3"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-timeline-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:banuba-token-storage-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
  ### [1.29.3]
  Released on August 30, 2023
  > 💡 Release requires prior migration to [1.29.1](/78170ead1c7a4853b39d0d7a4c068b0e?pvs=25)
  This release includes hot fixes for 1.29.0, 1.29.1, 1.29.2 releases.
## Migration Guide
  > 💡 [PR](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/248)  addresses changes required for migrating to this release.
  ```Groovy
  def banubaSdkVersion = '1.29.3'
implementation "com.banuba.sdk:ffmpeg:5.1.3"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-timeline-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:banuba-token-storage-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
  
</details>

<details>
<summary><strong>2024</strong></summary>

  ### [1.34.0]
  Released on Feb 15, 2024
  > 💡 All migrations to 1.34.x releases you can find in the main sample on [GitHub](https://github.com/Banuba/ve-sdk-android-integration-sample/commits/main)
  [TOC]
## List of changes
### Support Soundstripe playlist and categories 
  In this release we added more content from [Soundstripe](https://www.soundstripe.com/).
  New content includes artist playlists, categories i.e. moods, genres, styles, instruments.
  The main screen defaults to showcasing 8 playlists, each containing a minimum of 50 songs. Users can also access up to 100 playlists. Additionally, there are 4 categories, each displaying all available subcategories, and a section featuring the top 8 trending songs. For the trending and category songs, a pagination feature allows users to load an additional 20 songs. However, the playlists do not offer a similar pagination functionality for their songs.
  All this audio content can be used for making videos in the Video Editor SDK.
  This feature will be available out of the box for clients who have signed a contract with [Soundstripe](https://www.soundstripe.com/).
  > ❗ Message Banuba representatives if you are interested in using Soundstripe in your app.
  ![](https://prod-files-secure.s3.us-west-2.amazonaws.com/3e459574-fd13-4256-9979-b2d0064ec916/51231e0f-e179-493c-8bf5-9be2c76c786f/GIF1_.gif)
  ![](https://prod-files-secure.s3.us-west-2.amazonaws.com/3e459574-fd13-4256-9979-b2d0064ec916/7c5059fe-8c45-4162-8804-e38bc8ef0068/GIF2_.gif)
  ![](https://prod-files-secure.s3.us-west-2.amazonaws.com/3e459574-fd13-4256-9979-b2d0064ec916/f36a15c7-fc57-4771-b441-d39a0b42d4b7/GIF3-4-5_.gif)
  ![](https://prod-files-secure.s3.us-west-2.amazonaws.com/3e459574-fd13-4256-9979-b2d0064ec916/51231e0f-e179-493c-8bf5-9be2c76c786f/GIF1_.gif)
  ![](https://prod-files-secure.s3.us-west-2.amazonaws.com/3e459574-fd13-4256-9979-b2d0064ec916/7c5059fe-8c45-4162-8804-e38bc8ef0068/GIF2_.gif)
  ![](https://prod-files-secure.s3.us-west-2.amazonaws.com/3e459574-fd13-4256-9979-b2d0064ec916/f36a15c7-fc57-4771-b441-d39a0b42d4b7/GIF3-4-5_.gif)
### Changes in Face AR SDK integration
  [Face AR SDK](https://www.googleadservices.com/pagead/aclk?sa=L&ai=DChcSEwjJotqF8aWEAxWHkIMHHQWNDxkYABACGgJlZg&ase=2&gclid=Cj0KCQiAoKeuBhCoARIsAB4Wxtfv-MWHZVi7P0p-F5cxcC0-RZE5zBAxreGh-_TUwI5NO7n9JaDWLbsaAtEYEALw_wcB&ohost=www.google.com&cid=CAESVOD2RrK85PoWUo_pxM6JmJ39p07WWPYMzuTvukwOsgu9SIMWAxCic7E9cSAr2Jatpixw6t0bzRuuny69FzwYsZsub3INV24ytgb_Io7KGyPrwb5giA&sig=AOD64_0EXTjspcL5MW2PM2kKrid9tGivKA&q&nis=4&adurl&ved=2ahUKEwiF1NOF8aWEAxVy_bsIHfjGCA4Q0Qx6BAgGEAE) is an optional Banuba product used for applying AR filters while video recording and post processing.
  > ‼️ <u>Please skip this section if your contract does not include Face AR SDK</u>
  
  New approach of integrating Face AR SDK is aimed at:
  1. Simplifying an internal process of integrating new Face AR SDK versions. This will allow us to reduce the dev cycle.
  1. Simplifying the process of getting readable logs when the Face AR SDK crashes.
  Technically, almost the whole Face AR SDK is delivered to the Video Editor SDK which means 
  the app size will be increased after migrating to this version. 
  > ❗ Please follow the steps in Migration guide to decrease the SDK size in your app.
## Migration guide
  > ❗ Please check out [Pull Request ](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/271) with migration changes.
#### **Upgrade version**
  ```Groovy
  def banubaSdkVersion = '1.34.0'
implementation "com.banuba.sdk:ffmpeg:5.1.3"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-timeline-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
### Changes in Face AR SDK integration
  > ‼️ You can skip this description if your contract does not include Face AR SDK
  Specify `org.gradle.jvmargs=-Xmx4096m` in your `[gradle.properties](http://gradle.properties)` file to avoid  
  `> Java heap space`  Gradle error message while building the app with the new version of VE and Face AR SDK.
  Add new maven repository to `allprojects` section in gradle file.
  ```Groovy
  allprojects {
    repositories {
			...
			maven {
            name "GitHubPackagesEffectPlayer"
            url "https://maven.pkg.github.com/sdk-banuba/banuba-sdk-android"
            credentials {
                username = "sdk-banuba"
                password = "\u0067\u0068\u0070\u005f\u0033\u0057\u006a\u0059\u004a\u0067\u0071\u0054\u0058\u0058\u0068\u0074\u0051\u0033\u0075\u0038\u0051\u0046\u0036\u005a\u0067\u004f\u0041\u0053\u0064\u0046\u0032\u0045\u0046\u006a\u0030\u0036\u006d\u006e\u004a\u004a"
            }
       }
		}
}
  ```
  
  <u>**Face AR SDK supports **</u>[Android abi’s](https://developer.android.com/ndk/guides/abis)<u>** **</u>`<u>**arm64-v8a**</u>`<u>**, **</u>`<u>**armeabi-v7a**</u>`<u>**, **</u>`<u>**x86-64**</u>`<u>**. **</u>
  <u>**[libanuba.so](http://libanuba.so)**</u><u>** file is the main native library in Face AR SDK and it is available in each of those abi. Each not stripped **</u><u>**[libanuba.so](http://libanuba.so)**</u><u>** file may take around **</u>`<u>**60 MB**</u>`<u>**. But stripped size is about **</u>`<u>**6 MB**</u>`<u>**, 10 times smaller.**</u>
  
#### How to strip the SDK?
  Install [Android NDK](https://developer.android.com/ndk) versions (`21.4.7075529`, `25.1.8937393`).
  Every time when you’re building your app i.e. running Gradle  `assembleDebug` or `build`  commands, the SDK will be stripped and the app size will be optimized.
  If you see  `:app:stripReleaseDebugSymbols` in build console logs, it indicates that NDK versions are not set.
  ```Groovy
  Task :app:stripReleaseDebugSymbols
Unable to strip the following libraries, packaging them as they are:
 [libbanuba.so](http://librssupport.so/), ...

  ```
  You can disable strip debug symbols by updating `build.gradle` file to get readable logs when Face AR or VE SDK crashes. In this case the app size will be bigger in size.
  ```Groovy
  packagingOptions **{    **
    doNotStrip '**/*.so'
    ...**
}**
  ```
  > 💡 Please feel free to message our support if you experience any issues with these changes
#### How can I optimize the app size more?
  We highly recommend using  `abiFilters` property for your app to decrease the app size.
  For instance, use only `arm64-v8a, armeabi-v7a` when you publish the app to Google Play and use more abi’s in your dev cycle.
  ```Groovy
  buildTypes {
        release {
            ...
            ndk {
                abiFilters 'arm64-v8a', 'armeabi-v7a'
            }
        }
        debug {
						...
            ndk {
                abiFilters 'arm64-v8a', 'armeabi-v7a', 'x86_64'
            }
        }
    }
  ```
  
  ### [1.35.0]
  Released on March 22, 2024
  > 💡 All migrations to 1.35.x releases you can find in the main sample on [GitHub](https://github.com/Banuba/ve-sdk-android-integration-sample/commits/main)
  [TOC]
## List of changes
### Closed Captions
  What Is Closed Captioning? Closed captions(CC) are **a textual representation of the audio within a media file.**
  > ❗ Starting from release 1.35.0 this feature is available for a trial.
  Over 80% of videos played on mobile devices don’t have sound turned on. This means many forms of content (e.g. skits, monologues, educational clips, etc.) will be skipped if there are no subtitles. But making captions by hand is tedious. AI-generated subtitles solve this issue, as they are created and placed automatically. The users can then edit the text as well as change its style and color. 

If you want to test this feature in your app, let Banuba representatives know.
  To generate captions, we use [AWS Transcribe service](https://docs.aws.amazon.com/transcribe/).
  Supported languages
  - English
  - Mandarin
  - Spanish
  - Portuguese
  
  ![](https://prod-files-secure.s3.us-west-2.amazonaws.com/3e459574-fd13-4256-9979-b2d0064ec916/5ca21979-50e3-4b24-8b1f-95ae2f2b9d14/Phone_CC_edit_2.gif)
  ![](https://prod-files-secure.s3.us-west-2.amazonaws.com/3e459574-fd13-4256-9979-b2d0064ec916/0960afd3-4eff-4d3d-9454-725e47b7b2d6/Phone_CC_.gif)
  ![](https://prod-files-secure.s3.us-west-2.amazonaws.com/3e459574-fd13-4256-9979-b2d0064ec916/415f8dae-29da-48f2-bf27-b88d2d83bd37/Phone_CC_edit_.gif)
  
### Migrate to Media 3 ExoPlayer
  [Google announced](https://github.com/google/ExoPlayer?tab=readme-ov-file#deprecation) ExoPlayer deprecation  and recommended to migrate to [Media3 ExoPlayer](https://developer.android.com/media/media3/exoplayer) last year.
  This release fully supports  [Media 3 ExoPlayer 1.3.0](https://developer.android.com/jetpack/androidx/releases/media3#1.3.0).
  We believe this migration will help to better resolve issues with having different versions of ExoPlayer in the SDK and client projects.
  
### Adjust video preview resizing mode on Recording Screen
  Previously the preview of a video streamed from the camera was resized in such a way that there would be no empty areas on the phone’s display, which could lead to clipping of some parts of the video during preview.
  New config is added in this release to control whether to fit video preview size on the screen.
### Support FaceAR 1.11.1
  This release fully supports [Face AR 1.11.1](https://docs.banuba.com/face-ar-sdk-v1).
## Migration guide
  > ❗ Please check out [Pull Request ](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/275) with migration changes.
#### **Upgrade version**
  Upgrade `compileSdk` and `buildToolsVersion` versions in your gradle script.
  > ❗ Media 3 ExoPlayer 1.3.0 version requires `compileSdk 34`. 
  ```Kotlin
  defaultConfig {
   compileSdk 34
   buildToolsVersion "34.0.0"
	  ...
}
  ```
  Upgrade SDK version
  ```Groovy
  def banubaSdkVersion = '1.35.0'
implementation "com.banuba.sdk:ffmpeg:5.1.3"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-timeline-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
  
### ❗New  Giphy API key config
  In this release we added new class `GifPickerConfigurations`  for setting Giphy API key. 
  Create new instance in Koin integration class.
  ```Kotlin
  class class SampleIntegrationKoinModule {
		...
		factory<GifPickerConfigurations> {
		    GifPickerConfigurations(
			     giphyApiKey = ....
		    )
		}
}
  ```
### Adjust video preview resizing mode on Recording Screen
  Use new property `supportsPreviewAspectFit` is added to `CameraConfig` to control whether to fit preview size on the screen. Default value is `false`.
  ```Kotlin
  single **{    
	**CameraConfig(        
		supportsPreviewAspectFit = true
		... 
	)
**}**
  ```
  
  ### [1.36.0]
  Released on June 17, 2024
  > 💡 All migrations to 1.36.x releases you can find in the main sample on [GitHub](https://github.com/Banuba/ve-sdk-android-integration-sample/commits/main)
  [TOC]
## List of changes
### New feature - AutoCut
  The [AutoCut](https://www.banuba.com/autocut) feature automates the video creation process by leveraging the power of artificial intelligence. The neural network transforms raw input into ready-to-post videos with various transitions, effects, and a precise music match.
  Here is how users can interact with it:
  1. User selects clips and music. People can choose their desired clips and accompanying music within the app.
  1. AI trims the videos. The AI algorithm intelligently trims the selected clips to match the tempo and rhythm of the chosen track.
  1. AI adds various effects. Autocut enhances the content by adding a variety of effects to create visually stunning content.
  1. User exports, edits, or regenerates the clip. Upon completion, users have the flexibility to export the video as is, make further edits, or regenerate the clip for a fresh perspective.
  Regardless of the user’s editing skills, with the help of Auto Cut, everyone can get a stunning video within seconds.
  ![](https://prod-files-secure.s3.us-west-2.amazonaws.com/3e459574-fd13-4256-9979-b2d0064ec916/482c5c92-5083-466c-b6f0-8eb0061475ec/VE_Autocut_GIF_.gif)
  
  **Why Is AutoCut A Good Feature To Have?**
  AI has been around for a while already, and only keeps gaining momentum in every industry. In the case of video editing apps, AI enables a higher volume of user-generated content, leading to increased user engagement and longer session times within apps. Tools like AutoCut empower users to effortlessly transform their raw footage into polished videos that captivate audiences.
  AutoCut can be applied in various use cases, including social media apps, apps for live streaming and video editing, as well as educational apps, lifestyle apps, and many more.
  Banuba Video Editor SDK with the new AutoCut feature is compatible with native Android and iOS, as well as React Native and Flutter.
### Support FaceAR 1.14.0
  This release fully supports [Face AR 1.14.0](https://docs.banuba.com/face-ar-sdk-v1).
  > ❗ 1.14.0 version includes optimizations that allowed to reduce the SDK size up to 11 MB
## Migration guide
### New feature - AutoCut
  
  > ❗ The AutoCut feature is disabled by default. Please contact Banuba representatives to know more about integration. 
### Upgrade SDK version
  > ❗ Please check out [Pull Request ](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/278) with migration changes.
  ```Groovy
  def banubaSdkVersion = '1.36.0'
implementation "com.banuba.sdk:ffmpeg:5.1.3"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-timeline-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
  ### [1.38.0]
  Released on October 18, 2024
  > 💡 All migrations to 1.38.x releases you can find in the main sample on [GitHub](https://github.com/Banuba/ve-sdk-android-integration-sample/commits/main/)
  [TOC]
## List of changes
### New feature - RTL support
  RTL (right-to-left) is a layout designed around languages with the right-to-left writing. This will feel more natural for your middle-eastern users and ensure seamless transition to video editor from other screens in your app.
  
  
  ![](https://prod-files-secure.s3.us-west-2.amazonaws.com/3e459574-fd13-4256-9979-b2d0064ec916/44f87a74-7f24-46fa-8ce3-cff56eddd243/RTL_GIF_3_.gif)
  ![](https://prod-files-secure.s3.us-west-2.amazonaws.com/3e459574-fd13-4256-9979-b2d0064ec916/52b952fb-2dfe-473e-8a06-97dd01c325f3/RTL_GIF_1_.gif)
  ![](https://prod-files-secure.s3.us-west-2.amazonaws.com/3e459574-fd13-4256-9979-b2d0064ec916/4e512b59-a2a2-4bc3-938f-cda1161d63a2/RTL_GIF_2_.gif)
  ![](https://prod-files-secure.s3.us-west-2.amazonaws.com/3e459574-fd13-4256-9979-b2d0064ec916/29f951cb-a63b-44b6-a19f-14abd57be7c8/RTL_GIF_4_.gif)
  
### **Music Browser and Banuba Music Updates** 
  1. Added cover images to all music albums.
  1. Introduced a new compilation album, **"Others,"** featuring various artists.
  1. Other minor UI changes.
  
  > ❗ 
  BanubaMusic feature is disabled by default.
  Contact Banuba representatives to know more.
## Migration guide
### Upgrade SDK version
  > ❗ Please check out [Pull Request ](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/285) with migration changes.
  ```Groovy
  def banubaSdkVersion = '1.38.0'
implementation "com.banuba.sdk:ffmpeg:5.1.3"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
  
### RTL support
  Right-To-Left(RTL) feature is enabled by default and does not require any extra integration efforts.
  
  With RTL feature now is possible to change localizations for some features.
#### Color Filter names
  Provide your names for color filters.
  ```XML
     	<string name="color_filter_bright"></string>
	  <string name="color_filter_byers"></string>
    <string name="color_filter_canada"></string>
    <string name="color_filter_chile"></string>
    <string name="color_filter_chroma"></string>
    <string name="color_filter_egypt"></string>
    <string name="color_filter_england"></string>
    <string name="color_filter_glitch"></string>
    <string name="color_filter_grunge"></string>
    <string name="color_filter_hyla"></string>
    <string name="color_filter_instant"></string>
    <string name="color_filter_japan"></string>
    <string name="color_filter_korben"></string>
    <string name="color_filter_lilac"></string>
    <string name="color_filter_lux"></string>
    <string name="color_filter_neon"></string>
    <string name="color_filter_norway"></string>
    <string name="color_filter_pinkvine"></string>
    <string name="color_filter_remy"></string>
    <string name="color_filter_retro"></string>
    <string name="color_filter_spark"></string>
    <string name="color_filter_sunny"></string>
    <string name="color_filter_sunset"></string>
    <string name="color_filter_vinyl"></string>
    <string name="color_filter_vivid"></string>
  ```
#### Aspect Ratio
  Provide your names for aspect ratio.
  ```XML
      <string name="aspect_original"></string>
    <string name="aspect_16_9"></string>
    <string name="aspect_9_16"></string>
    <string name="aspect_4_3"></string>
    <string name="aspect_4_5"></string>
  ```
### Banuba Music Update
  Specify the following dependency in Koin module to enable Banuba Music feature.
  ```Kotlin
   single<ContentFeatureProvider<TrackData, Fragment>>(named("musicTrackProvider")) {
            BanubaMusicProvider()
 }
  ```
  
  
  ### [1.39.0]
  Released on November 6, 2024
  > 💡 All migrations to 1.39.x releases you can find in the main sample on [GitHub](https://github.com/Banuba/ve-sdk-android-integration-sample/commits/main/)
  [TOC]
## List of changes
### Support Face AR 1.16.0
  This version fully supports Face AR version [1.16.0](https://docs.banuba.com/far-sdk/tutorials/changelog#1160---2024-10-17)
### AiClipping supports Banuba Music
  Expanded music for AI clipping
Banuba's AI clipping is similar to TikTok's autocut: it automatically combines three or more videos into one and matches them to the beat of the chosen music track. Now those tracks can come from Banuba's library (over 35 Gb of music) or from an external provider via an API.
### Reduced Photo Editor SDK size 
  New Photo Editor SDK version includes new effect that saves up to 50% of the Photo Editor SDK size. 
  Additionally in this release it is allowed to load the effect from the disk and reduce the SDK dramatically.
  > ❗ 
  The optimization compatible from Video Editor 1.39.0 
## Migration guide
### Upgrade SDK version
  > ❗ Please check out [Pull Request ](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/286/files) with migration changes.
  ```Groovy
  def banubaSdkVersion = '1.39.0'
implementation "com.banuba.sdk:ffmpeg:5.1.3"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
### Reduced Photo Editor SDK size
  Specify dependency
  ```Kotlin
  implementation("com.banuba.sdk:pe-sdk:1.2.9")
  ```
  Disable bundling the effect from the Photo Editor SDK in your Gradle file.
  ```Kotlin
   aaptOptions {
        ignoreAssetsPattern "!photo_editor"
    }
  ```
  Unpack photo_editor.zip and put the folder `photo_editor`* * to the disk on the device*`data/data/$package/files/effects`*
  photo_editor.zip
  ### [1.37.0]
  
  Released on Sep 11, 2024
  > 💡 All migrations to 1.37.x releases you can find in the main sample on [GitHub](https://github.com/Banuba/ve-sdk-android-integration-sample/commits/main)
  [TOC]
## List of changes
### New feature - Green Screen
  The updated version of Banuba’s cutting edge background replacement is now more precise and easier to access. It requires no physical green screens, with the neural networks doing all the work.
  > ❗ 
  The feature requires Face AR product with [Background Subtraction](https://www.banuba.com/technology/background-subtraction) feature.
  ![](https://prod-files-secure.s3.us-west-2.amazonaws.com/3e459574-fd13-4256-9979-b2d0064ec916/b0444afe-0769-4298-9eab-582054a2ea8c/VE_Green_Screen_.gif)
### New feature - Banuba Music
  Over 35 GB of royalty-free tracks available from within the Video Editor SDK. Your users could check them out through an inbuilt music browser and legally include them in their content.
  ![](https://prod-files-secure.s3.us-west-2.amazonaws.com/3e459574-fd13-4256-9979-b2d0064ec916/8a614c04-aae0-4921-bb74-357f27d349b0/VE_Music_.gif)
  
  > ❗ 
  The feature is disabled by default.
  Contact Banuba representatives to know more.
### AI Captions update
  AI Captions supports `+2 languages`
  1. Arabic (ar-SA)
  1. Gulf Arabic (ar-AE)
## Migration guide
### Upgrade SDK version
  > ❗ Please check out [Pull Request ](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/281) with migration changes.
  Module  `ve-timeline-sdk` is removed.
  ```Groovy
  def banubaSdkVersion = '1.37.0'
implementation "com.banuba.sdk:ffmpeg:5.1.3"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
~~implementation "com.banuba.sdk:ve-timeline-sdk:${banubaSdkVersion}"~~
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
### Changes in default Face AR effects
  Starting from this release AR effects `Background` and `Beauty` are in the SDK. You can remove these effects from your app in `assets/bng-resources/effects`
### New feature - Banuba Music
  Specify the following dependency in Koin module to enable Banuba Music feature.
  ```Kotlin
   single<ContentFeatureProvider<TrackData, Fragment>>(named("musicTrackProvider")) {
            BanubaMusicProvider()
 }
  ```
  
  
</details>

<details>
<summary><strong>2025</strong></summary>

  ### [1.42.0]
  Released on April 10,  2025
  > 💡 
  All migrations to 1.42.x releases you can find in the main sample on [GitHub](https://github.com/Banuba/ve-sdk-android-integration-sample/commits/main/)
  [TOC]
## List of changes
### Support drafts in NEW UI and AI Clipping
  Added support for using drafts in NEW UI and AI Clipping. Drafts allow to save session on the disk and open it from Drafts screen. 
### Face AR 1.17.0
  New release fully supports [Face AR version 1.17.0](https://docs.banuba.com/far-sdk/tutorials/changelog#1170---2025-03-20)
### Updated dependencies
  > ❗ 
  Min Android API level changed from 23 to **26**
## Migration guide
### Upgrade SDK version
  > ❗ Please check out [Pull Request ](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/300) with migration changes.
  Upgrade `minSdk` version in your gradle file
  ```Kotlin
  defaultConfig {
		...
    compileSdk 35
    minSdkVersion 26
    targetSdk 35
    ...
 }
  ```
  ```Groovy
  def banubaSdkVersion = '1.42.0.2'

// UPDATE!
**implementation "com.banuba.sdk:ffmpeg:5.3.0"
**
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
  > ❗ 
  Migrate Photo Editor SDK.
  Skip this step if your license does not support Photo Editor SDK
  ```Kotlin
  def banubaPESdkVersion = '1.2.10'
implementation("com.banuba.sdk:pe-sdk:${banubaPESdkVersion}")
  ```
### NEW UI configs
#### Custom Aspect Settings
  ```Kotlin
  single {
		EditorConfig(
		    aspectSettings = EditorAspectSettings.`16_9`, // Set custom instance
        ...
    )
}
  ```
  
#### Hide visual effects
  ```Kotlin
  single {
		EditorConfig(
		    editorSupportsVisualEffects = false,
		    ...
    )
}
  ```
  
#### Hide color(lut) effects
  ```Kotlin
  single {
		EditorConfig(
		    editorBanubaColorEffectsAssetsPath = null,
		    ...    
    )
}
  ```
  
  ### [1.41.0]
  Released on March 21,  2025
  > 💡 
  All migrations to 1.41.x releases you can find in the main sample on [GitHub](https://github.com/Banuba/ve-sdk-android-integration-sample/commits/main/)
  [TOC]
## List of changes
### AI Clipping
  One of the most unique features of Banuba Video Editor SDK is its AI clipping. It lets users automatically combine three or more videos into one with AI choosing the key moments and matching the resulting clip to the beat of the music. In the new version of the SDK, accessing it has become easier, and the accuracy of the AI improved.
  ![](attachment:9c82dd6c-a671-463f-a73d-edaf03afbc4f:AI_Clipping2_15s_296x640_.gif)
  
  > ❗ 
  The feature is not enabled by default.
  Contact Banuba representatives to know more.
### Support Android 15
  This release is compiled and compatible with [Android 15](https://developer.android.com/about/versions/15)
## Migration guide
### Upgrade SDK version
  > ❗ Please check out [Pull Request ](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/295) with migration changes.
  ```Groovy
  def banubaSdkVersion = '1.41.0'

// UPDATE!
**implementation "com.banuba.sdk:ffmpeg:5.2.0"
**
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
### Launch AI Clipping
  > 💡 
  Video creation with AI Clipping is available on Gallery screen by default.
  For better experience we added new entry point to `VideoCreationActivity` for opening AI Clipping as a separate mode. In this scenario the user starts from the gallery screen and is taken to AI Clipping screen after selecting media.  Use the `Intent` to start new mode.
  ```Kotlin
  val intent = VideoCreationActivity.startFromAiClipping(Context)
  ```
  
  > 💡 
  AI Clipping supports 2 music providers - `Banuba Music` and Soundstripe.
#### Setup config with Banuba Music provider
  ```Kotlin
  class VideoEditorModule { 
		...
		val module = module {
				...
				factory {
						AiClippingConfig(
				        audioDataUrl = ...,
                audioTracksUrl = 
             )
				}
				
				factory <AutoCutTrackLoader> {
						 AiClippingBanubaMusicTrackLoader(contentProvider = get())
        }
        
        factory<ContentFeatureProvider<TrackData, Fragment>>(named("recommendedSoundsMusicTrackProvider")) {
            AiClippingRecommendedSoundProvider()
        }
        
        factory<ContentFeatureProvider<TrackData, Fragment>>(named("musicTrackProvider")) {
	         BanubaMusicProvider()
        }
		}
}
  ```
#### Setup config with Soundstripe provider
  ```Kotlin
  class VideoEditorModule { 
		...
		val module = module {
				...
				factory {
						AiClippingConfig(
				        audioDataUrl = ...,
                audioTracksUrl = 
             )
				}
				
				 factory <AutoCutTrackLoader> {
						 AiClippingSoundstripeTrackLoader(soundstripeApi = get())
        }
        
        factory<ContentFeatureProvider<TrackData, Fragment>>(named("recommendedSoundsMusicTrackProvider")) {
	           AiClippingRecommendedSoundProvider()
        }
        
        factory<ContentFeatureProvider<TrackData, Fragment>>(named("musicTrackProvider")) {
		         SoundstripeProvider()
        }
    }
}
  ```
  
## Migration guide
### 1.41.1
  Add support [Android 16 KB memory page size](https://developer.android.com/guide/practices/page-sizes)
  ```Kotlin
  def banubaSdkVersion = '1.41.1'

// UPDATE!
**implementation "com.banuba.sdk:ffmpeg:5.3.0"
**
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
  
  ### [1.40.0]
  Released on January 23, 2025
  > 💡 All migrations to 1.40.x releases you can find in the main sample on [GitHub](https://github.com/Banuba/ve-sdk-android-integration-sample/commits/main/)
  [TOC]
## List of changes
### ❗New Editor UI/UX
  With the new interface, better controls, and additional quality of life improvements, making stunning videos is easier and more fun than ever.
  Design and user experience principles are constantly evolving. To keep up with the latest developments and best practices, our team has completely redesigned the Video Editor SDK to be as convenient and enjoyable as possible.
  ![](attachment:15f48b38-3e9f-4688-baf2-1cc9b4fd2687:VE_Main_3s_296x640_.gif)
  ![](attachment:91095e57-5b06-4c8b-a47b-666b252e092f:VE_MusLIb_4s_296x640_.gif)
  ![](attachment:b2ab92f9-e571-4f4b-8a50-700f63c10deb:VE_Trimming_4s_296x640_.gif)
  
## Migration guide
### Upgrade SDK version
  > ❗ Please check out [Pull Request ](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/290/files) with migration changes.
  ```Groovy
  def banubaSdkVersion = '1.40.0'
implementation "com.banuba.sdk:ffmpeg:5.1.3"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"
  ```
### Enable New Editor UI/UX
  Set the following parameter `EXTRA_USE_EDITOR_V2` to `true` in `Bundle` to enable new Editor UI/UX
  ```Kotlin
  // Bundle with Editor UI V2 configuration
private val editorV2Extras = bundleOf("EXTRA_USE_EDITOR_V2" to true)
...

// Pass the bundle to start VideoCreationActivity
val videoCreationIntent = VideoCreationActivity.startFromCamera(
		context = this,
    // set PiP video configuration
    pictureInPictureConfig = PipConfig(
		    video = pipVideo,
        openPipSettings = false
    ),
    // setup what kind of action you want to do with VideoCreationActivity
    // setup data that will be acceptable during export flow
    additionalExportData = null,
    // set TrackData object if you open VideoCreationActivity with preselected music track
    audioTrackData = null
    audioTrackData = null,
    // set Bundle to enable Editor V2
    extras = editorV2Extras
  )

  ```
  > ❗ Old Editor UI/UX is enabled by default.
  ### [1.44.0]
  Released on June 6,  2025
  > 💡 
  All migrations to 1.44.x releases you can find in the main sample on [GitHub](https://github.com/Banuba/ve-sdk-android-integration-sample/commits/main/)
  [TOC]
## List of changes
### Video Templates
  Templates let users create stunning videos quickly and easily using predefined sets of effects, transitions, and music. All it takes to make a shareable piece is changing the placeholders. With templates, even people who are new to video editing or just lack time can make impressive content in minutes.
  ![](attachment:f1529bb6-c57f-408b-ac00-272553131c5b:ve_templates1_296x640_.gif)
  ![](attachment:e3e5fbe0-0e06-4024-a3a8-90d11f5da1ee:ve_templates2_296x640_.gif)
  ![](attachment:ab7051a4-962c-4ce0-a07a-c5cac235fc38:ve_templates3_296x640_.gif)
  > ❗ 
  The feature is not enabled by default.
  Contact Banuba representatives to know more.
## Migration guide
### Upgrade SDK version
  > ❗ Please check out [Pull Request ](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/307/files) with migration changes.
  ```Groovy
  def banubaSdkVersion = '1.44.0'

implementation "com.banuba.sdk:ffmpeg:5.3.0"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"

// Remove this dependency if you only use Video Editor SDK
def banubaPESdkVersion = '1.2.13'
implementation("com.banuba.sdk:pe-sdk:${banubaPESdkVersion}")
  ```
  Remove ~~`ioDispatcher`~~from `ArEffectsRepositoryProvider`
  ```Kotlin
   single<ArEffectsRepositoryProvider>(createdAtStart = true) {
            ArEffectsRepositoryProvider(
                arEffectsRepository = get(named("backendArEffectsRepository")),
                ~~ioDispatcher = get(named("ioDispatcher"))~~
            )
        }
  ```
### Launch Video Templates 
  ```Kotlin
  val templatesIntent =  VideoCreationActivity.startFromTemplates(context)
startActivity(templatesIntent)
  ```
  
  
  ### [1.43.0]
  
  Released on May 8,  2025
  > 💡 
  All migrations to 1.43.x releases you can find in the main sample on [GitHub](https://github.com/Banuba/ve-sdk-android-integration-sample/commits/main/)
  [TOC]
## List of changes
### Closed Captions API V2
  We added new API for integrating Closed Captions feature. This API simplified integration and allows to track usage.
  Migration Guide
### Video Drag & Drop feature in NEW UI
  Let users quickly rearrange the frames on their timeline by dragging and dropping them wherever they want.
## Migration guide
### Upgrade SDK version
  > ❗ Please check out [Pull Request ](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/305) with migration changes.
  ```Groovy
  def banubaSdkVersion = '1.43.0'

implementation "com.banuba.sdk:ffmpeg:5.3.0"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"

// Remove this dependency if you only use Video Editor SDK
def banubaPESdkVersion = '1.2.12'
implementation("com.banuba.sdk:pe-sdk:${banubaPESdkVersion}")
  ```
### Integrate Closed Captions API V2 
  > ❗ 
  Request API V2 key from Banuba representatives.
  ```Kotlin
  val launchExtra = bundleOf(
            CaptionsApiService.ARG_API_KEY_V2 to "...",
            "EXTRA_USE_EDITOR_V2" to true
)
val intent = VideoCreationActivity.startFromCamera(applicationContext, launchExtra)
startActivity(intent)
  ```
  
  ### [1.45.0]
  Released on July 11,  2025
  > 💡 
  All migrations to 1.45.x releases you can find in the main sample on [GitHub](https://github.com/Banuba/ve-sdk-android-integration-sample/commits/main/)
  [TOC]
## List of changes
### ❗New feature - Weatherman
  Weatherman mode is an improvement on top of Banuba's cutting-edge background replacement. It allows users to drag and drop themselves on any place on the screen to emulate the look of a TV presenter the feature is named after. Weatherman is useful for reactions, learning content, presentations, explainers and other similar videos thanks to the professional feel it creates.
  ![](attachment:f3c5b818-6c17-454d-ab71-d4c6a6b250be:VE_Weatherman_GIF1_296x640_.gif)
  ![](attachment:235b6937-19d6-4f03-991a-e6b473bf9829:VE_Weatherman_GIF2_296x640_.gif)
### Support  FaceAR version 1.17.3
  New release fully supports [Face AR version 1.17.3](https://docs.banuba.com/far-sdk/tutorials/changelog#1172---2025-05-23)
## Migration guide
### Upgrade SDK version
  > ❗ Please check out [Pull Request ](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/310) with migration changes.
  ```Groovy
  def banubaSdkVersion = '1.45.0'

implementation "com.banuba.sdk:ffmpeg:5.3.0"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"

// Remove this dependency if you only use Video Editor SDK
def banubaPESdkVersion = '1.2.14'
implementation("com.banuba.sdk:pe-sdk:${banubaPESdkVersion}")
  ```
  ### [1.45.1]
  Released on July 14,  2025
  > 💡 All migrations to 1.45.x releases you can find in the main sample on [GitHub](https://github.com/Banuba/ve-sdk-ios-integration-sample)
  [TOC]
## Migration guide
### Upgrade SDK version
  > ❗ Please check out [Pull Request ](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/311) with migration changes.
  ```Groovy
  def banubaSdkVersion = '1.45.1'

implementation "com.banuba.sdk:ffmpeg:5.3.0"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"

// Remove this dependency if you only use Video Editor SDK
def banubaPESdkVersion = '1.2.14'
implementation("com.banuba.sdk:pe-sdk:${banubaPESdkVersion}")
  ```
### New config - auto start local mask
  This setting allows you to enable the mask on the startup of the camera screen.
  Use `CameraConfig.autoStartLocalMask` property for loading any Face AR mask stored on the device. Update `CameraConfig` in your Koin module
  ```Kotlin
  single {
		CameraConfig(
	    autoStartLocalMask = ... //Use mask name 
    )
}
  ```
  
  ### [1.46.0]
  Released on July 29,  2025
  > 💡 All migrations to 1.46.x releases you can find in the main sample on [GitHub](https://github.com/Banuba/ve-sdk-android-integration-sample/commits/main/)
  [TOC]
## List of changes
### ❗New feature - Drawing
  Lets your users draw freely on screen. It is a convenient tool for highlighting important objects in the video or spicing up the frame with funny doodles or stylish art. There are 5 line variants to choose from for more self-expression opportunities.
  > ❗ 
  The feature is not enabled by default.
  Contact to Banuba representatives to trial this feature.
  ![](attachment:57d64329-59c5-4a14-8951-60497adbb96f:VE_Draw_3_296x640_.gif)
  ![](attachment:4e835ac1-46e5-4a2a-a7f7-5c91c206cd18:VE_Draw_2_296x640_.gif)
  ![](attachment:6eed97d7-1262-48c8-9fac-8e47aff03d00:VE_Draw_1_296x640_.gif)
## Migration Guide
### Upgrade SDK version
  > ❗ Please check out [Pull Request ](https://github.com/Banuba/ve-sdk-android-integration-sample/pull/312) with migration changes.
  ```Groovy
  def banubaSdkVersion = '1.46.0'

implementation "com.banuba.sdk:ffmpeg:5.3.0"
implementation "com.banuba.sdk:camera-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:camera-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-flow-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-ui-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-effects-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
implementation "com.banuba.sdk:ar-cloud:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-audio-browser-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-export-sdk:${banubaSdkVersion}"
implementation "com.banuba.sdk:ve-playback-sdk:${banubaSdkVersion}"

// Remove this dependency if you only use Video Editor SDK
def banubaPESdkVersion = '1.2.15'
implementation("com.banuba.sdk:pe-sdk:${banubaPESdkVersion}")
  ```
  
</details>

### [1.48.0]
### [1.47.0]
### [1.48.1]
### [**Reducing SDK Size on Android**]
### [1.49.0]
### [1.50.0]
### [1.50.1]
### [1.51.0]
### [1.51.1]
### [1.51.2]
### [1.51.3]