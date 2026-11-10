# Editor screen on iOS

> Editor screen on iOS

# Editor screen on iOS

Guide to integrating and customizing Editor screen.

## Change icons

You can use your app specific icons in Video Editor SDK. Add icon files to Xcode ```Assets``` folder with predefined names.

&nbsp;

To add custom icons, use the ```AdditionalEffectsButtonConfiguration``` within ```EditorConfiguration```. Refer to the configuration below. To exclude any button, just don't include it in the ```additionalEffectsButtons``` array.

```swift
var config = VideoEditorConfig()
    
config.editorConfiguration.additionalEffectsButtons = [
  AdditionalEffectsButtonConfiguration(
    identifier: .sticker,
    imageConfiguration: ImageConfiguration(imageName: "stickers"),
    selectedImageConfiguration: ImageConfiguration(imageName: "stickersSelected")
  ),
  AdditionalEffectsButtonConfiguration(
    identifier: .text,
    imageConfiguration: ImageConfiguration(imageName: "text"),
    selectedImageConfiguration: ImageConfiguration(imageName: "textSelected")
  ),
  AdditionalEffectsButtonConfiguration(
    identifier: .captions,
    imageConfiguration: ImageConfiguration(imageName: "captions"),
    selectedImageConfiguration: ImageConfiguration(imageName: "captionsSelected")
  ),
  AdditionalEffectsButtonConfiguration(
    identifier: .effects,
    imageConfiguration: ImageConfiguration(imageName: "effects"),
    selectedImageConfiguration: ImageConfiguration(imageName: "effectsSelected")
  ),
  AdditionalEffectsButtonConfiguration(
    identifier: .masks,
    imageConfiguration: ImageConfiguration(imageName: "masks"),
    selectedImageConfiguration: ImageConfiguration(imageName: "masksSelected")
  ),
  AdditionalEffectsButtonConfiguration(
    identifier: .sound,
    imageConfiguration: ImageConfiguration(imageName: "music"),
    selectedImageConfiguration: ImageConfiguration(imageName: "musicSelected")
  ),
  AdditionalEffectsButtonConfiguration(
    identifier: .time,
    imageConfiguration: ImageConfiguration(imageName: "time"),
    selectedImageConfiguration: ImageConfiguration(imageName: "timeSelected")
  ),
  AdditionalEffectsButtonConfiguration(
    identifier: .color,
    imageConfiguration: ImageConfiguration(imageName: "filters"),
    selectedImageConfiguration: ImageConfiguration(imageName: "filtersSelected")
  ),
  AdditionalEffectsButtonConfiguration(
    identifier: .blur,
    imageConfiguration: ImageConfiguration(imageName: "blur"),
    selectedImageConfiguration: ImageConfiguration(imageName: "blurSelected")
  ),
  AdditionalEffectsButtonConfiguration(
    identifier: .autoCut,
    imageConfiguration: ImageConfiguration(imageName: "autocut"),
    selectedImageConfiguration: ImageConfiguration(imageName: "autocutSelected")
  )
]
```
