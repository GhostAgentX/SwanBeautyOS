# AI Clipping on iOS

> AI Clipping on iOS

# AI Clipping on iOS

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

## Supported Music Providers

- [Banuba Music](guide_audio_content.md#connect-banuba-music)
- [Soundstripe](guide_audio_content.md#connect-soundstripe)

&nbsp;

## Integration

### Setup configuration

Add ```Banuba Face AR SDK``` dependency by following the [Face AR instruction](guide_far_arcloud.md#integrate-face-ar).
Set up ```embeddingsDownloadUrl``` and ```musicProvider``` values in [VideoEditorModule](https://github.com/Banuba/ve-sdk-ios-integration-sample/blob/main/Example/Example/VideoEditorModule.swift#L73)

:::important
Contact Banuba representative to get trial keys for ```tracksURL``` and ```musicProvider```
:::

#### Config with Banuba Music provider

```swift 
let videoEditorConfig = VideoEditorConfig()
videoEditorConfig.aiClippingConfiguration.embeddingsDownloadUrl = "https://d27n29bgbvbeer.cloudfront.net/index-staging.zip"
videoEditorConfig.aiClippingConfiguration.musicProvider = .banubaMusic(tracksURL: URL(string: "https://d27n29bgbvbeer.cloudfront.net/response.json")!)
```

#### Config with Soundstripe provider

```swift
let videoEditorConfig = VideoEditorConfig()
videoEditorConfig.aiClippingConfiguration.embeddingsDownloadUrl = "..."
videoEditorConfig.aiClippingConfiguration.musicProvider = .soundstripe(tracksURL: URL(string: "...")!)
```

### Launch AI Clipping

:::info
Video creation with AI Clipping is available on Gallery screen by default.
:::

For better experience we added new entry point ```.aiClipping```  to ```VideoEditorLaunchConfig``` for opening AI Clipping as separate mode.  In this scenario the user starts from the gallery screen and is taken to AI Clipping screen after selecting media.

```swift
let launchConfiguration = VideoEditorLaunchConfig(
     entryPoint: .aiClipping,
     hostController: self,
     animated: true
)

videoEditorSDK.presentVideoEditor(
     withLaunchConfiguration: launchConfiguration,
     completion: nil
)
```
