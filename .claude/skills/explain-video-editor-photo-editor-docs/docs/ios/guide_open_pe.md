# Open Photo Editor SDK from Camera screen on iOS

> Open Photo Editor SDK from Camera screen on iOS

# Open Photo Editor SDK from Camera screen on iOS

This guide demonstrates how to open [Photo Editor SDK](https://www.banuba.com/photo-editor-sdk) just after taking a photo on Video Editor Camera screen.

All recorded video or taken images on Camera screen can be handled using ```videoEditor``` of protocol ```BanubaVideoEditorDelegate```.
Provide custom implementation of ```videoEditor``` method to override flow.

``` diff
class ViewController: UIViewController, BanubaVideoEditorDelegate, BanubaPhotoEditorDelegate {

...

// highlight-add-next-line
func videoEditor(_ videoEditor: BanubaVideoEditor, shouldProcessMediaUrls urls: [URL]) -> Bool {
    // Filter media resources to find the target image for Photo Editor SDK
    guard let jpegURL = urls.first(where: { $0.pathExtension.lowercased() == "jpeg" }),
          let imageData = try? Data(contentsOf: jpegURL),
          !imageData.isEmpty,
          let resultImage = UIImage(data: imageData) else {
      return true
    }

    // Close Video Editor SDK
    videoEditor.dismissVideoEditor(animated: true) {
      DispatchQueue.main.async { [weak self] in
        guard let self else { return }
        // Calling clearSessionData() also removes any files stored in urls array
        videoEditorModule?.videoEditorSDK?.clearSessionData()

        // Use this launch config to open Photo Editor SDK 
        let launchConfig = PhotoEditorLaunchConfig(
          hostController: self,
          entryPoint: .editorWithImage(resultImage)
        )
      }
    }

    return false
  }

}
```
