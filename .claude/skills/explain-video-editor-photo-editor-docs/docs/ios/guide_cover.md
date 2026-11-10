# Cover image on iOS

> Cover image on iOS

# Cover image on iOS

Cover image screen allows users to pick any frame of video as image or choose an image from gallery.

This screen can be turned on or off by changing the `isVideoCoverSelectionEnabled` field of `FeatureConfiguration`:
```swift
let config = VideoEditorConfig()
config.featureConfiguration.isVideoCoverSelectionEnabled = false
``` 

To change the UI elements of the screen (icons, colors, etc.), please, modify the default values of `VideoCoverSelectionConfiguration`:
```swift
let config = VideoEditorConfig()
config.extendedVideoCoverSelectionConfiguration.doneButton.textConfiguration?.color = UIColor.red
```

You can override the following string resources in your app:

| Key        | Default value |
| ------------- | ----------- |
| Choose Cover Screen Name | Thumbnail |
| cover.thumbnail.title | Choose a thumbnail |
| cover.gallery.button.title | Choose from Gallery |
| cover.delete.button.title | Delete |
| Cancel | Cancel | 
| Done | Done |
