# Camera screen on iOS

> Camera screen on iOS

# Camera screen on iOS

Guide to modifying camera UI elements and screen configuration.

## Change icons

You can use your app specific icons in Video Editor SDK. Add icon files to Xcode ```Assets``` folder with predefined names.

&nbsp;

To add custom icons, use the ```AdditionalEffectsButtonConfiguration``` within ```RecorderConfiguration```, ```TimerConfiguration``` and ```SpeedBarButtonsConfiguration```. Refer to the configuration below. To exclude any button, just don't include it in the ```additionalEffectsButtons``` array.

```swift
var config = VideoEditorConfig()

config.recorderConfiguration.additionalEffectsButtons = [
  AdditionalEffectsButtonConfiguration(
    identifier: .toggle,
    imageConfiguration: ImageConfiguration(imageName:"toggle.png"),
    selectedImageConfiguration: ImageConfiguration(imageName: "toggleSelected.png")
  ),
  AdditionalEffectsButtonConfiguration(
    identifier: .flashlight,
    imageConfiguration: ImageConfiguration(imageName:"flashlight.png"),
    selectedImageConfiguration: ImageConfiguration(imageName:"flashlightSelected.png")
  ),
  AdditionalEffectsButtonConfiguration(
    identifier: .speed,
    imageConfiguration: ImageConfiguration(imageName:"speed.png"),
    selectedImageConfiguration: ImageConfiguration(imageName: "speedSelected.png")
  ),
  AdditionalEffectsButtonConfiguration(
    identifier: .sound,
    imageConfiguration: ImageConfiguration(imageName:"sound.png"),
    selectedImageConfiguration: ImageConfiguration(imageName: "soundSelected.png")
  ),
  AdditionalEffectsButtonConfiguration(
    identifier: .muteSound,
    imageConfiguration: ImageConfiguration(imageName:"muteSound.png"),
    selectedImageConfiguration: ImageConfiguration(imageName:"muteSoundSelected.png")
  ),
  AdditionalEffectsButtonConfiguration(
    identifier: .pip,
    imageConfiguration: ImageConfiguration(imageName:"pip.png"),
    selectedImageConfiguration: ImageConfiguration(imageName:"pipSelected.png")
  ),
  AdditionalEffectsButtonConfiguration(
    identifier: .beauty,
    imageConfiguration: ImageConfiguration(imageName:"beauty.png"),
    selectedImageConfiguration: ImageConfiguration(imageName: "beautySelected.png")
  ),
  AdditionalEffectsButtonConfiguration(
    identifier: .effects,
    imageConfiguration: ImageConfiguration(imageName:"effects.png"),
    selectedImageConfiguration: ImageConfiguration(imageName:"effectsSelected.png")
  ),
  AdditionalEffectsButtonConfiguration(
    identifier: .masks,
    imageConfiguration: ImageConfiguration(imageName:"masks.png"),
    selectedImageConfiguration: ImageConfiguration(imageName: "masksSelected.png")
  ),
  AdditionalEffectsButtonConfiguration(
    identifier: .timer,
    imageConfiguration: ImageConfiguration(imageName:"timer.png"),
    selectedImageConfiguration: ImageConfiguration(imageName: "timerSelected.png")
  )
]

config.recorderConfiguration.timerConfiguration.defaultButton = ImageButtonConfiguration(
  imageConfiguration: ImageConfiguration(imageName:"timer.png")
)
    
config.recorderConfiguration.speedBarButtons = SpeedBarButtonsConfiguration(
  imageHalf: ImageConfiguration(imageName:"imageHalf.png"),
  imageNormal: ImageConfiguration(imageName:"imageNormal.png"),
  imageDouble: ImageConfiguration(imageName:"imageDouble.png"),
  imageTriple: ImageConfiguration(imageName:"imageTriple.png"),
  selectedTitleColor: UIColor,
  titleColor: UIColor,
  backgroundColor: UIColor,
  cornerRadius: CGFloat
)
```
