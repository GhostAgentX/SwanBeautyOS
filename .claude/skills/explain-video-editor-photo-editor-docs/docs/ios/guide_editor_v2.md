# NEW Editor screen on iOS

> NEW Editor screen on iOS

# NEW Editor screen on iOS

Guide to integrating and customizing New Editor screen.

## Overview

With the new interface, better controls, and additional quality of life improvements, making stunning videos is easier and more fun than ever.

Design and user experience principles are constantly evolving. To keep up with the latest developments and best practices, our team has completely redesigned the Video Editor SDK to be as convenient and enjoyable as possible.

&nbsp;
&nbsp;
&nbsp;

## Integration

Init the Video Editor with argument ```[.useEditorV2: true]``` to enable ```Editor UI V2```:

```swift
let videoEditorSDK = BanubaVideoEditor(
  token: token,
  arguments: [.useEditorV2: true],
  configuration: createConfiguration()
 )
```
