# ios

## Installation

1. Add [BanubaSdk SPM packages](/tutorials/development/installation?ios-packages=spm#spm-packages) into your project

:::info
Details about the **SPM** and **CocoaPods** packages see in [Installation](/tutorials/development/installation).
:::

## Integration

1. Setup `banubaClientToken`

```swift
    var banubaClientToken: String = <#Place your token here#>
```

2. Initialize `BanubaSdkManager`

```swift
        BanubaSdkManager.initialize(
            // This is array of paths where to seach for resources. E.g. for effects
            resourcePath: [
                Bundle.main.bundlePath + "/effects",
                Bundle.main.bundlePath // also seacrh dirrectly in app bundle
            ],
            clientTokenString: banubaClientToken
        )
```

3. Create `Player` and `load` the effect

```swift
import UIKit
import BNBSdkApi
import BNBSdkCore

class ViewController: UIViewController {
    // Output surface for the `Player`
    @IBOutlet weak var effectView: EffectPlayerView!
    
    // Input stream for the `Player`
    private let cameraDevice = CameraDevice(
        cameraMode: .FrontCameraSession,
        captureSessionPreset: .hd1280x720
    )
    
    // `Player` process frames from the input and render them into the outputs
    private var player: Player?
    
    // Current effect
    private var effect: BNBEffect?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        player = Player()
        
        // Connect `CameraDevice` and `EffectPlayerView` to `Player`
        player?.use(input: Camera(cameraDevice: cameraDevice))
        player?.use(outputs: [effectView])
        player?.play()
        
        // Load effect from `effects` folder
        effect = player?.load(effect: "TrollGrandma")
        
        // Start feeding frames from camera
        cameraDevice.start()
    }

    @IBAction func closeCamera(_ sender: UIBarButtonItem) {
        dismiss(animated: true, completion: nil)
    }
}

```

4. Run the application! 🎉 🚀 💅

:::tip
See more use cases and code samples in the [GitHub repo](https://github.com/Banuba/banuba-sdk-ios-samples).
:::