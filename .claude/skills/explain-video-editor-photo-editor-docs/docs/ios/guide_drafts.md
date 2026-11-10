# Drafts screen on iOS

> Drafts screen on iOS

# Drafts screen on iOS

Guide to integrating and customizing drafts screen on Video Editor SDK.

## Configuration

Drafts are enabled by default, asks the user to save a draft before leave any VideoEditor screen. If you need to change drafts configuration you should add the code below in the [VideoEditorModule](https://github.com/Banuba/ve-sdk-ios-integration-sample/blob/main/Example/Example/VideoEditorModule.swift#L83):

```swift
var config = VideoEditorConfig()

config.featureConfiguration.draftsConfig = .enabled
```

You can choose one of these options:

- ```.enabled``` - drafts enabled, asks the user to save a draft
- ```.enabledSaveToDraftsByDefault``` - drafts enabled, saved by default without asking the user
- ```.enabledAskIfSaveNotExport``` - drafts enabled, asks the user to save a draft without export
- ```.disabled``` - disabled drafts

The default value is ```.enabled```

## Draft Service

The `DraftsService`  class is used for managing drafts:

```swift
/// External Draft of video session
typealias ExternalDraft = VideoSequence

/// Allows you to manage drafts
class DraftsService {
  
  /// Get drafted video sequences
  func getDrafts() -> [ExternalDraft]
  
  /// Remove specific video sequence
  /// - parameters:
  ///  - externalDraft: Drafted video sequence
  func removeExternalDraft(_ externalDraft: ExternalDraft) -> Bool
  
  /// Get preview for specific drafted video sequence
  /// - parameters:
  ///  - externalDraft: Drafted video sequence
  ///  - thumbnailHeight: Preview height
  ///  - completion: Completion when preview UIImage generated
  func getPreviewForVideoSequence(
    _ externalDraft: ExternalDraft,
    thumbnailHeight: CGFloat,
    completion: ((_ preview: UIImage?) -> Void)?
  )
}
```

To get the instance of `DraftsService` use the `BanubaVideoEditor` instance.

***Example of usage:***
```swift
let videoEditorSDK = BanubaVideoEditor(...) // Initialization of main entity
let drafts = videoEditorSDK?.draftsService.getDrafts() // Get drafts list

let draft = drafts.first!

// Get draft preview
videoEditorSDK?.draftsService.getPreviewForVideoSequence(
  // Choosen draft from list of drafts
  draft,
  // Default config, where config is VideoEditorConfig instance
  thumbnailHeight: config.videoResolutionConfiguration.currentThumbnailHeight, 
  completion: { preview in
    // Preview usage
  }
)

// Remove draft and use returned value to your own condition usage if needed
let _ = videoEditorSDK?.draftsService.removeVideoSequence(videoSequence)

// Open Video Editor with preselected draft
let draftedConfig = VideoEditorLaunchConfig.DraftedLaunchConfig(
  // Choosen draft from list of drafts 
  externalDraft: draft,
  // Any case from DraftsFeatureConfig entity
  draftsConfig: .enabled
)
          
let config = VideoEditorLaunchConfig(
  entryPoint: .editor,
  hostController: self,
  draftedLaunchConfig: draftedConfig,
  animated: true
)
          
// Present Video Editor
self.videoEditorSDK?.presentVideoEditor(
  withLaunchConfiguration: config,
  completion: nil
)
```

## Transferring drafts

BanubaVideoEditor supports archiving drafts into a zip file. It may help you with backing up user data to the server or sharing video content across the devices.

For exporting and importing `BanubaVideoEditor` has the following methods:
```swift
  /// Archive and compress external draft into zip file.
  /// Returns URL to archive
  /// Discussion: After performing all actions with zip file your are responsible to remove archive file.
  func exportExternalDraft(_ externalDraft: ExternalDraft) throws -> URL

  /// Unarchive ExternalDraft from zip file
  func importExternalDraft(fromZipUrl url: URL) throws -> ExternalDraft
```

***Example of usage:***
```swift
let videoEditorSDK = BanubaVideoEditor(...) // Initialization of main entity
let drafts = videoEditorSDK?.draftsService.getDrafts() // Get drafts list

let draft = drafts.first!

// Make archive from draft
let archiveURL = try? videoEditorSDK?.exportExternalDraft(draft)

// Import draft from archive
let importedDraft = try! videoEditorSDK?.importExternalDraft(fromZipUrl: archiveURL)

// Open Video Editor with unarchived draft
let draftedConfig = VideoEditorLaunchConfig.DraftedLaunchConfig(
  externalDraft: importedDraft,
  draftsConfig: .enabled
)
          
let config = VideoEditorLaunchConfig(
  entryPoint: .editor,
  hostController: self,
  draftedLaunchConfig: draftedConfig,
  animated: true
)

self.videoEditorSDK?.presentVideoEditor(
  withLaunchConfiguration: config,
  completion: nil
)
```
