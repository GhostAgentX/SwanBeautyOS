# ios

**Banuba SDK** for **iOS** can be divided into three main entities: `Input`, `Player` and `Output`.
The plethora of input options multiplied by the plethora of output options covers many use cases.


## Input

Processes frames from one of the producers:
* `Camera` - a real-time `CameraDevice` feed
* `Photo` - an image from the gallery or a photo taken from `CameraDevice`
* `Stream` - a frames sequence from the _WebRTC_ stream or any other provider
* Custom - your own implementation for the `Input` protocol

## Player

Allows to `use` different data inputs like `Camera` feed or `Photo`, to apply an **effect** 
on top of it and to `use` several outputs like `View` and `Video` file simultaneously.

The `Effect` component makes up an essential part of the SDK usage. The **effect** is represented 
as a folder with scripts and resources and can be loaded with the `load` method.

Supports the following rendering modes:
* `loop` _(default)_ - render in the display-linked loop with the defined FPS
* `manual` - render manually by calling the `render` method

## Output 

Presents a rendered frame onto one of the available surfaces:
* `View` - on screen presentation
* `Frame`, `PixelBuffer`, `PixelBufferYUV` - in memory presentation
* `Video` - in video file presentation
* Custom - your own implementation for the `Output` protocol

## CameraDevice

Accesses the device's camera to generate a feed of frames in real time or takes high-quality photos.  
By default, tracks UI orientation to properly manage frame rotation.

## RenderTarget

Manages a `CALayer` object with a `Metal` context and provides offscreen rendering for the `Player` 
and presenting for the `Output`.


## Use cases

Common use cases and relevant samples are described in 
[this repository](https://github.com/Banuba/banuba-sdk-ios-samples).  

<br/>

:::tip
See more use cases in [Samples](../samples.md).
:::
