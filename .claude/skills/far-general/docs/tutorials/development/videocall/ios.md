# ios

[Example of using video calls with the Banuba SDK](https://github.com/Banuba/banuba-sdk-ios-samples/tree/master/videocall)

<br/><br/>

## Installation

1. Add `banuba-sdk-podspecs` repo along with `AgoraRtcEngine_iOS` and `BanubaSdk` packages into the your `Podfile`. 
Alternatively you may use our [SPM modules](/tutorials/development/installation#spm-packages)


:::info
See the details about the **Banuba SDK** packages in [Installation](/tutorials/development/installation/).
:::

## Integration

1. Setup client tokens

```swift
internal let agoraAppID =  <#Agora app id#>
internal let agoraClientToken = <# agora client token #>
internal let agoraChannelId = <# agora channel id #>
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

3. Initialize `AgoraRtcEngineKit`, setup video/audio encoders and join the channel

```swift
    
    func rtcEngine(_ engine: AgoraRtcEngineKit, didJoinedOfUid uid: UInt, elapsed: Int) {
        let videoCanvas = AgoraRtcVideoCanvas()
        videoCanvas.uid = uid
        videoCanvas.view = view.remoteVideoView
        videoCanvas.renderMode = .hidden
        agoraKit.setupRemoteVideo(videoCanvas)
    }
    
    func rtcEngine(_ engine: AgoraRtcEngineKit, didOccurError errorCode: AgoraErrorCode) {
        print("❌ AgoraRtcEngineKit Error: \(errorCode)")
    }
    
    // MARK: - AgoraKit interoperation
    
    private func pushPixelBufferIntoAgoraKit(pixelBuffer: CVPixelBuffer) {
        let videoFrame = AgoraVideoFrame()
        // Video format = 12 means iOS texture (CVPixelBufferRef)
        videoFrame.format = 12
        videoFrame.time = CMTimeMakeWithSeconds(NSDate().timeIntervalSince1970, preferredTimescale: 1000)
        videoFrame.textureBuf = pixelBuffer
        agoraKit.pushExternalVideoFrame(videoFrame)
    }

    private func setupVideo() {
        agoraKit.enableVideo()
        agoraKit.enableAudio()
        
        // Enable external video source
        agoraKit.setExternalVideoSource(true, useTexture: true, sourceType: .videoFrame)
        
        agoraKit.setChannelProfile(.liveBroadcasting)
        agoraKit.setClientRole(.broadcaster)

        agoraKit.setVideoEncoderConfiguration(
            AgoraVideoEncoderConfiguration(
                size: AgoraVideoDimension1280x720,
                frameRate: .fps30,
                bitrate: AgoraVideoBitrateStandard,
                orientationMode: .adaptative,
                mirrorMode: .enabled
            )
        )
    }
    
    private func joinChannel() {
        let option = AgoraRtcChannelMediaOptions()
        option.publishCustomAudioTrack = false
        option.publishCustomVideoTrack = true
        
        agoraKit.setDefaultAudioRouteToSpeakerphone(true)
        agoraKit.joinChannel(
            byToken: agoraClientToken,
            channelId: agoraChannelId,
            uid: 0,
            mediaOptions: option,
            joinSuccess: { _, _, _ in
                print("✅ Successfuly connected to channel")
            }
        )
        UIApplication.shared.isIdleTimerDisabled = true
    }
}
```

4. Setup `Player`, load the effect and start `Camera` frames forwarding

```swift
    init(view: MainScreenProtocol) {
        self.view = view
        
        selectedEffect = EffectsFactory.arVideoCallEffects.first!
        
        player = Player()

        // Create a camera device in front facing mode and HD resolution
        cameraDevice = CameraDevice(
            cameraMode: .FrontCameraSession,
            captureSessionPreset: .hd1280x720
        )

        agoraKit = AgoraRtcEngineKit.sharedEngine(withAppId: agoraAppID, delegate: nil)
        
        super.init()
        
        agoraKit.delegate = self
        
        // Create a PixelBuffer output, where `Player` will present frames
        let outputPixelBuffer = PixelBuffer(onPresent: { [weak self] (pixelBuffer) -> Void in
            // Push CVPixelBuffer into the Agora engine
            self?.pushPixelBufferIntoAgoraKit(pixelBuffer: pixelBuffer!)
        })
        
        // Use `CameraDevice` as an `Player` input
        player.use(input: Camera(cameraDevice: cameraDevice))
        
        // Use `View` and `PixelBuffer` as an `Player` outputs
        player.use(outputs: [view.localVideoView, outputPixelBuffer])
        
        player.play()
    }
```

5. Run the application! 🎉 🚀 💅
