# NEW Editor screen on Android

> NEW Editor screen on Android

# NEW Editor screen on Android  

Guide to integrating and customizing New Editor screen.

## Overview

With the new interface, better controls, and additional quality of life improvements, making stunning videos is easier and more fun than ever.

Design and user experience principles are constantly evolving. To keep up with the latest developments and best practices, our team has completely redesigned the Video Editor SDK to be as convenient and enjoyable as possible.

&nbsp;
&nbsp;
&nbsp;

## Integration 

Create ```Bundle``` with Editor UI V2 configuration and pass ```extras``` to any Video Editor start method.

```kotlin
 val extras = bundleOf(
    "EXTRA_USE_EDITOR_V2" to true
 )
```

```kotlin
VideoCreationActivity.startFromCamera(
    context = applicationContext,
    pictureInPictureConfig = PipConfig(
        video = pipVideo,
        openPipSettings = false
    ),
    audioTrackData = initialTrackData,
    extras = extras
)
```
