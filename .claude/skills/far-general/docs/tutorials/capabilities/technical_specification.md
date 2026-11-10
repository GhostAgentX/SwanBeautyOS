# Technical Specification

This page provides technical metrics of the Face AR SDK feature performance. The values below are for your reference, as they were achieved under fixed lab conditions. Many factors can influence performance, including the state of the specific device, other apps running in the background, Wi-Fi being enabled, etc. We encourage you to test each feature within your environment.

Please visit the [SDK Features](/tutorials/capabilities/sdk_features.md) page for more information on feature availability on different platforms.

note

* **FPS** - Frames per second of the face detection algorithm on a given device.
* **Angles** - The maximum angle at which the technology was able to work during the measurement.
* **Distance** - Maximum distance at which the technology was able to work during the measurement.
* **Real-time (online)** - Technology performance in real-time.
* **Photo (offline)** - The processing time needed to take a photo or process it from the gallery.

## SDK Features[​](#sdk-features "Direct link to SDK Features")

### Single-face Tracking[​](#single-face-tracking "Direct link to Single-face Tracking")

**Android**

|                | Android Low | Android High |
| -------------- | ----------- | ------------ |
| FPS            | 25          | 30           |
| Angles, degree | 80          | 80           |
| Distance, cm   | 170         | 180          |

**iOS**

|                | iOS Mid | iOS High |
| -------------- | ------- | -------- |
| FPS            | 30      | 30       |
| Angles, degree | 80      | 80       |
| Distance, cm   | 230     | 230      |

### Multi-face Tracking[​](#multi-face-tracking "Direct link to Multi-face Tracking")

**Android**

|              | Android Low | Android High |
| ------------ | ----------- | ------------ |
| Max Faces    | 5           | 5            |
| 4 Faces, FPS | 23          | 28           |
| 5 Faces, FPS | 22          | 27           |

**iOS**

|              | iOS Mid | iOS High |
| ------------ | ------- | -------- |
| Max Faces    | 5       | 5        |
| 4 Faces, FPS | 30      | 30       |
| 5 Faces, FPS | 30      | 30       |

Max Faces\* - the maximum number of faces that the SDK can track with acceptable quality and performance on most mobile devices. The actual peak number is limited only by the physical capabilities of the device and its screen proportions.

## Effect performance[​](#effect-performance "Direct link to Effect performance")

Banuba SDK allows for a variety of Face AR effects. Some of them only require face tracking and can be represented as a single AR 3D Mask with textures and materials. Other effects are implemented with separately trained neural networks.

Below, you may find information on the real-time performance of Face AR effects which only require face tracking, i.e. face filters, avatars with action units, beautification, and makeup filter (without lipstick).

**Android**

|     | Android Low | Android High |
| --- | ----------- | ------------ |
| FPS | 25          | 29           |

**iOS**

|     | iOS Mid | iOS High |
| --- | ------- | -------- |
| FPS | 30      | 30       |

## Beautification[​](#beautification "Direct link to Beautification")

### Beautification filter[​](#beautification-filter "Direct link to Beautification filter")

Basic face beautification filter includes skin smoothing, morphing, teeth whitening, eyes flare and LUT. It only requires face tracking, so please, refer to the [Effects performance](#effect-performance) section.

## Makeup[​](#makeup "Direct link to Makeup")

The Makeup filter allows for a realistic try on of foundation, eyeshadow, eyeliner, highlighter, contour, and blusher. It only requires face tracking, so please, refer to the [Effects performance](#effect-performance) section. The lipstick try on requires lips segmentation neural network with a separate algorithm for Lips Shine effect.

### Lips coloring[​](#lips-coloring "Direct link to Lips coloring")

**Android**

|                | Android Low | Android High |
| -------------- | ----------- | ------------ |
| Real-time, FPS | 25          | 30           |
| Photo, sec     | 1           | < 1          |

**iOS**

|                | iOS Mid | iOS High |
| -------------- | ------- | -------- |
| Real-time, FPS | 30      | 30       |
| Photo, sec     | < 1     | < 1      |

**Web**

|        | Real-time, FPS |
| ------ | -------------- |
| Chrome | 30             |
| Safari | 26             |

### Lips Shine (Glossy lipstick)[​](#lips-shine-glossy-lipstick "Direct link to Lips Shine (Glossy lipstick)")

**Android**

|                | Android Low | Android High |
| -------------- | ----------- | ------------ |
| Real-time, FPS | 25          | 30           |
| Photo, sec     | 1           | < 1          |

**iOS**

|                | iOS Mid | iOS High |
| -------------- | ------- | -------- |
| Real-time, FPS | 30      | 30       |
| Photo, sec     | < 1     | < 1      |

**Web**

|        | Real-time, FPS |
| ------ | -------------- |
| Chrome | 30             |
| Safari | 25             |

## Background separation[​](#background-separation "Direct link to Background separation")

**Android**

|               | Android Low | Android High |
| ------------- | ----------- | ------------ |
| Real-time,FPS | 25          | 30           |
| Photo, sec    | 1           | < 1          |

**iOS**

|                | iOS Mid | iOS High |
| -------------- | ------- | -------- |
| Real-time, FPS | 30      | 30       |
| Photo, sec     | < 1     | < 1      |

### Distance[​](#distance "Direct link to Distance")

| Device       | Distance, cm                           |
| ------------ | -------------------------------------- |
| iOS High     | Portrait 280 cm,<br />Landscape 360 cm |
| iOS Low      | Portrait 280 cm,<br />Landscape 360 cm |
| Android High | Portrait 310 cm,<br />Landscape 370 cm |
| Mac Mid      | 330 cm                                 |

### Image formats support[​](#image-formats-support "Direct link to Image formats support")

Currently, the following images formats are supported as a background texture: `.jpeg`, `.jpg`, `.png`, `.ktx`, `.gif`.

### Video formats support[​](#video-formats-support "Direct link to Video formats support")

Used as a part of an animated background.

| Video format | MacOS\* | iOS | Android\*\* | Windows |
| ------------ | ------- | --- | ----------- | ------- |
| .mp4         | ✅      | ✅  | ✅          | ✅      |
| .avi         | ✅      | ❌  | ❌          | ✅      |
| .flv         | ✅      | ❌  | ❌          | ✅      |
| .mkv         | ✅      | ❌  | ✅          | ✅      |
| .mov         | ✅      | ✅  | ❌          | ✅      |
| .mts         | ✅      | ❌  | ❌          | ✅      |
| .webm        | ✅      | ❌  | ✅          | ✅      |
| .wmv         | ✅      | ❌  | ❌          | ✅      |

\* MacOS is rather sensitive not only to containers (i.e. file extensions) but to video codecs itself. In case of problems observe application log to find corresponding error messages and test carefully before release.

\*\* See more information about supported video formats on Android in the official Android developers guide - <https://developer.android.com/guide/topics/media/media-formats#video-codecs>.

## Hair segmentation[​](#hair-segmentation "Direct link to Hair segmentation")

### Hair Recoloring[​](#hair-recoloring "Direct link to Hair Recoloring")

**Android**

|               | Android Low | Android High |
| ------------- | ----------- | ------------ |
| Real-time,FPS | 25          | 30           |
| Photo, sec    | 1           | < 1          |

**iOS**

|               | iOS Mid | iOS High |
| ------------- | ------- | -------- |
| Real-time,FPS | 30      | 30       |
| Photo, sec    | < 1     | < 1      |

## Skin segmentation[​](#skin-segmentation "Direct link to Skin segmentation")

**Android**

|               | Android Low | Android High |
| ------------- | ----------- | ------------ |
| Real-time,FPS | 25          | 30           |
| Photo, sec    | < 1         | < 1          |

**iOS**

|               | iOS Mid | iOS High |
| ------------- | ------- | -------- |
| Real-time,FPS | 30      | 30       |
| Photo, sec    | < 1     | < 1      |

## Eyes recoloring[​](#eyes-recoloring "Direct link to Eyes recoloring")

**Android**

|               | Android Low | Android High |
| ------------- | ----------- | ------------ |
| Real-time,FPS | 25          | 30           |
| Photo, sec    | < 1         | < 1          |

**iOS**

|               | iOS Mid | iOS High |
| ------------- | ------- | -------- |
| Real-time,FPS | 30      | 30       |
| Photo, sec    | < 1     | < 1      |

## Hand gestures[​](#hand-gestures "Direct link to Hand gestures")

**Basic information**

* Supported gestures:

  <!-- -->

  * Palm ✋
  * Victory✌️
  * Rock 🤘
  * Like 👍
  * Ok 👌

* Maximum distance - 2.5m

**iOS**

| Device | Realtime FPS |
| ------ | ------------ |
| Mid    | 30           |
| High   | 30           |

**Android**

| Device | Realtime FPS |
| ------ | ------------ |
| Low    | 30           |
| High   | 30           |
