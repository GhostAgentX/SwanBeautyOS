# Launching Photo Editor on iOS

> Launching Photo Editor on iOS

# Launching Photo Editor on iOS

Guide to launching Photo Editor SDK.

## Launch

Create an instance of `BanubaPhotoEditor`  using the license token:
```swift
var configuration = PhotoEditorConfig()
let photoEditorSDK = BanubaPhotoEditor(
  token: token,
  configuration: configuration
)
photoEditorSDK?.delegate = delegate
photoEditorSDK?.presentPhotoEditor(
  withLaunchConfiguration: launchConfig,
  completion: nil
)
```

`photoEditorSDK` is `nil` when the license token is incorrect i.e. empty, truncated.
If `photoEditorSDK` is not `nil`, you can proceed and start the Video Editor.

Next, we strongly recommend checking your license state before starting the Photo Editor:
```swift
photoEditorSDK?.getLicenseState(completion: { [weak self] isValid in
  if isValid {
    print("✅ License is active, all good")
  } else {
    print("❌ License is either revoked or expired")
  }
  ...
  completion(isValid)
})
```

:::danger

 The "Photo editing is unavailable" screen will appear if you start the Photo Editor SDK with a revoked or expired license.

:::

:::warning

If you have also integrated the Video Editor SDK into your app, make sure to deallocate any instances of `BanubaVideoEditor` that remain in memory before presenting the Photo Editor in order to prevent crashes:

:::

```swift
videoEditorSDK = nil
...
photoEditorSDK?.presentPhotoEditor(
  withLaunchConfiguration: launchConfig,
  completion: nil
)
```

## Photo Editor Lifecycle Events

To receive the notifications when a user has either closed the editor or finished editing and saved the edited photo, create a class that conforms to the `BanubaPhotoEditorDelegate` protocol and assign its reference to the `BanubaPhotoEditor.delegate` property:
```swift
photoEditorSDK?.delegate = delegate
```
During handling of both notifications you must dismiss the Photo Editor:
```swift
/// User closed photo editor without editing image
func photoEditorDidCancel(
  _ photoEditor: BanubaPhotoEditorSDK.BanubaPhotoEditor
) {
  photoEditor.dismissPhotoEditor(animated: true, completion: nil)
}

/// User closed photo editor after saving image
func photoEditorDidFinishWithImage(
  _ photoEditor: BanubaPhotoEditorSDK.BanubaPhotoEditor,
  image: UIImage
) {
  photoEditor.dismissPhotoEditor(animated: true, completion: nil)
  // Do something with received image
}
```
