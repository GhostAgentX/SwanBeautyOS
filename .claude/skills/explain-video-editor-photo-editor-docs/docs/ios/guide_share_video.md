# Share video screen on iOS

> Share video screen on iOS

# Share video screen on iOS

Share video screen allows users to easily share an exported video using popular social media services and OS specific components.

:::info
This is an optional screen that you can add to your video editing flow.
:::

It can be configured by `SharingScreenConfiguration` which is provided to the `presentSharingViewController` function that shows the screen. `SharingScreenConfiguration` has two key properties:
* `sharingModels` - describes what kind of sharing services are available on the sharing screen;
* `facebookId` - a required option for Facebook/Instagram reels and stories:

```swift
private func showSharingScreen(videoUrl: URL, exportCoverImages: ExportCoverImages?) {
  let config = SharingScreenConfiguration(
    sharingModels: [
      SharingServiceModel(
        sharingType: .facebookReels,
        sharingTitle: "Facebook\nReels",
        sharingImage: UIImage(named: "FbReels") ?? UIImage()
      ),
      SharingServiceModel(
        sharingType: .facebookStories,
        sharingTitle: "Facebook\nStories",
        sharingImage: UIImage(named: "FbStories") ?? UIImage()
      ),
      SharingServiceModel(
        sharingType: .instagramStories,
        sharingTitle: "Instagram\nStories",
        sharingImage: UIImage(named: "InstStories") ?? UIImage()
      ),
      SharingServiceModel(
        sharingType: .other,
        sharingTitle: "Other",
        sharingImage: UIImage(named: "Share") ?? UIImage()
      )
    ],
    videoImageViewCornerRadius: 15.0,
    sharingVideoTextConfiguration: TextConfiguration(
      font: UIFont.boldSystemFont(ofSize: 22.0),
      color: .white,
      text: "Share video"
    ),
    backgroundConfiguration: BackgroundConfiguration(
      cornerRadius: 15.0,
      color: #colorLiteral(red: 0.1215686275, green: 0.1294117647, blue: 0.1411764706, alpha: 1)
    ),
    sharingCellConfiguration: SharingCellConfiguration(
      titleTextConfiguration: TextConfiguration(
        font: UIFont.systemFont(ofSize: 10.0),
        color: #colorLiteral(red: 0.4756349325, green: 0.4756467342, blue: 0.4756404161, alpha: 1)
      )
    ),
    closeButtonConfiguration: RoundedButtonConfiguration(
      textConfiguration: TextConfiguration(
        font: UIFont.systemFont(ofSize: 12.0),
        color: .white,
        text: "CLOSE"
      ),
      cornerRadius: 20.0,
      backgroundColor: .clear,
      borderWidth: 1.0,
      borderColor: #colorLiteral(red: 0.4756349325, green: 0.4756467342, blue: 0.4756404161, alpha: 1)
    ),
    facebookId: "YOUR FACEBOOK APP ID"
  )
  
  BanubaVideoEditor.presentSharingViewController(
    from: self,
    configuration: config,
    mainVideoUrl: videoUrl,
    videoUrls: [videoUrl],
    previewImage: exportCoverImages?.coverImage ?? UIImage(),
    animated: true,
    completion: nil
  )
}
```
