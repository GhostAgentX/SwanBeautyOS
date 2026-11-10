# AI Clipping on Android

> AI Clipping on Android

# AI Clipping on Android  

The [AI Clipping](https://www.banuba.com/ai-sdk) feature automates the video creation process by leveraging the power of artificial intelligence. The neural network transforms raw input into ready-to-post videos with various transitions, effects, and a precise music match.

:::important
The ```AI Clipping``` is based on the [Banuba Face AR SDK](https://www.banuba.com/facear-sdk/face-filters) product. Since this feature uses additional services, it is disabled by default. Please contact Banuba representatives to know more about using this feature.
:::

Here is how users can interact with it:

1. User selects clips and music. People can choose their desired clips and accompanying music within the app.
2. AI trims the videos. The AI algorithm intelligently trims the selected clips to match the tempo and rhythm of the chosen track.
3. AI adds various effects. AI Clipping enhances the content by adding a variety of effects to create visually stunning content.
4. User exports, edits, or regenerates the clip. Upon completion, users have the flexibility to export the video as is, make further edits, or regenerate the clip for a fresh perspective.

Regardless of the user’s editing skills, with the help of AI Clipping, everyone can get a stunning video within seconds.

&nbsp;

## Supported Music Providers

- [Banuba Music](guide_audio_content.md#connect-banuba-music)
- [Soundstripe](guide_audio_content.md#connect-soundstripe)

## Integration

### Setup configuration

Add ```Banuba Face AR SDK``` module by following the [Face AR instruction](guide_far_arcloud.md#integrate-face-ar).
Set up ```AiClippingConfig```, ```AutoCutTrackLoader``` and ```ContentFeatureProvider``` dependencies in [VideoEditorModule](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/src/main/java/com/banuba/example/integrationapp/VideoEditorModule.kt#L51)

:::important
Contact Banuba representative to get trial keys for ```audioDataUrl``` and ```audioTracksUrl```
:::

### Config with Banuba Music provider

```kotlin
factory {
    AiClippingConfig(
        audioDataUrl = "https://d27n29bgbvbeer.cloudfront.net/index-staging.zip",
        audioTracksUrl = ""
    )
}

factory <AutoCutTrackLoader> {
    AiClippingBanubaMusicTrackLoader(contentProvider = get())
}

factory<ContentFeatureProvider<TrackData, Fragment>>(
    named("recommendedSoundsMusicTrackProvider")
) {
    AiClippingRecommendedSoundProvider()
}
```

### Config with Soundstripe provider

```kotlin
factory {
    AiClippingConfig(
        audioDataUrl = "...",
        audioTracksUrl = "..."
    )
}
    
factory <AutoCutTrackLoader> {
    AiClippingSoundstripeTrackLoader(soundstripeApi = get())
}
        
factory<ContentFeatureProvider<TrackData, Fragment>>(
    named("recommendedSoundsMusicTrackProvider")
) {
    AiClippingRecommendedSoundProvider()
}
```

### Launch AI Clipping

:::info
Video creation with AI Clipping is available on Gallery screen by default.
:::

For better experience we added new entry point to `VideoCreationActivity` for opening AI Clipping as a separate mode. In this scenario the user starts from the gallery screen and is taken to AI Clipping screen after selecting media.  Use the `Intent` to start new mode.

```kotlin
val intent = VideoCreationActivity.startFromAiClipping(Context)
```
