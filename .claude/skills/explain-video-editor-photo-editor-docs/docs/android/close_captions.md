# Closed Captions on Android

> Closed Captions on Android

# Closed Captions on Android  

Closed captions(CC) are a textual representation of the audio within a media file.

:::important
The Close Captions feature is disabled by default. Please contact Banuba representatives to know more about using this feature.
:::

Over 80% of videos played on mobile devices don’t have sound turned on. This means many forms of content (e.g. skits, monologues, educational clips, etc.) will be skipped if there are no subtitles. But making captions by hand is tedious. AI-generated subtitles solve this issue, as they are created and placed automatically. The users can then edit the text as well as change its style and color.

&nbsp;
&nbsp;
&nbsp;

[AWS Transcribe service](https://docs.aws.amazon.com/transcribe/) is used to generate captions.

## Supported languages

- Arabic
- English
- Mandarin
- Spanish
- Portuguese

## Integration

Create ```Bundle``` with Closed Captions configuration and pass ```extras``` to any Video Editor start method.

### Closed Captions V2 (Recommended)

:::important
Request API V2 key from Banuba representatives.
:::

```kotlin
 val extras = bundleOf(
    CaptionsApiService.ARG_API_KEY_V2 to "...",
 )
```

### Closed Captions V1

:::important
Request keys from Banuba representatives.
:::

```kotlin
 val extras = bundleOf(
    CaptionsApiService.ARG_CAPTIONS_UPLOAD_URL to "...",
    CaptionsApiService.ARG_CAPTIONS_TRANSCRIBE_URL to "...",
    CaptionsApiService.ARG_API_KEY to "...",
 )
```

Use ```extras``` in any start method of the Video Editor SDK

```kotlin
VideoCreationActivity.startFromCamera(
    context = applicationContext,
    pictureInPictureConfig = PipConfig(
        video = pipVideo,
        openPipSettings = editorSettingsProvider.openPipSettings
    ),
    audioTrackData = initialTrackData,
    extras = extras
)
```
