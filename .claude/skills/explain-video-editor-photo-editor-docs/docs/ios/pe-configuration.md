# Configure Photo Editor on iOS

> Configure Photo Editor on iOS

# Configure Photo Editor on iOS  

Guide to modifying Photo Editor SDK.

## Initial screen (entry point) selection

By default the built-in gallery will be shown first after the presentation of the Photo Editor. In some cases the hosting app may already provide the photo selection functionality using its own custom gallery and it is necessary to directly open the photo editing screen with a preselected photo. To support such use cases there is the `entryPoint` property in `PhotoEditorLaunchConfig`. By using the `editorWithImage` or `editorWithURL` options you can specify the edited image by directly providing either the `UIImage` instance or the *local* `URL` to the on-disk binary image representation.

In the following example the image stored in the app's bundle will be opened in the Photo Editor SDK:
```swift
let url = Bundle.main.url(forResource: "image", withExtension: "jpg")!
let launchConfig = PhotoEditorLaunchConfig(
  hostController: ...,
  entryPoint: .editorWithURL(url)
)
photoEditorSDK.presentPhotoEditor(
  withLaunchConfiguration: launchConfig,
  completion: nil
)
```
Should there be any problem with decoding the image at the provided url, an error message will be logged into the console by the SDK.

## Configuration of the sharing screen 

After finishing editing an image, a user is navigated to the Sharing screen. If Facebook or Instagram is installed on the user's phone, it will be possible to present an option to share the image as a Facebook or Instagram Story. To enable such a functionality you need to specify the Facebook app id:
```swift
var configuration = PhotoEditorConfig() 
configuration.previewScreenMode = .enabled(
  previewScreenConfiguration: .init(
    shareButtonsMode: .enabled(
      shareButtonsConfiguration: .init(facebookId: "1234567890")
    )
  )
)
let photoEditorSDK = BanubaPhotoEditor(
  token: "***",
  configuration: configuration
)
```
Read more about sharing to Instagram and Facebook stories at https://developers.facebook.com/docs/instagram/sharing-to-stories/.
The sharing screen can be disabled entirely. In such case a user will be redirected back to your hosting app after tapping the "Save" button at image editing screen:
```swift
var configuration = PhotoEditorConfig() 
configuration.previewScreenMode = .disabled
```
Alternatively, you can also hide the social networks sharing buttons while keeping the sharing screen:
```swift
var configuration = PhotoEditorConfig() 
configuration.previewScreenMode = .enabled(
  previewScreenConfiguration: .init(shareButtonsMode: .disabled)
)
```

## Disable publishing image to Gallery

```swift
var configuration = PhotoEditorConfig()
configuration.editorScreenConfiguration = .init(saveResultToPhotoLibrary: false)
```

## Add localization strings

The Photo Editor SDK displays a number of strings that can be freely changed in the Localizable.strings file of your app.
Please, make sure that you've included all the strings with the `photoEditor` key prefix in your app's Localizable.strings file from the [Localized Strings](https://github.com/Banuba/ve-sdk-ios-integration-sample/blob/main/Example/Example/en.lproj/Localizable.strings) file provided with the sample project to prevent placeholders from showing up in the photo editor's UI.

If you are still seeing placeholders, make sure that the App Language in the Xcode Scheme Options is set to English as this is the only language supported by this demo app.
