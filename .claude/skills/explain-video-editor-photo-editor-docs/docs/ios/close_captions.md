# Closed Captions on iOS

> Closed Captions on iOS

# Closed Captions on iOS

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

Set up ```captionsUploadUrl```, ```captionsTranscribeUrl``` and ```apiKey``` values in the VideoEditorModule.

### Closed Captions V2 (Recommended)

:::important
Request API V2 key from Banuba representatives.
:::

```swift
config.captionsConfiguration.apiV2Key = "..."
```

### Closed Captions V1

:::important
Request keys from Banuba representatives.
:::

```swift
config.captionsConfiguration.captionsUploadUrl = "..."
config.captionsConfiguration.captionsTranscribeUrl = "..."
config.captionsConfiguration.apiKey = "..."
```
