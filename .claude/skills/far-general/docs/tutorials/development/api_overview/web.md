# web

![image](/assets/images/web_overview-747754fce3a1ba126bdff47046ba649d.svg)

`BanubaSDK.js` exports different APIs for **Web AR** development like _Player_, _Effect_, several types of _Input_ and _Output_.


A generic workflow looks like:

> _Input_ -> _Player_ + _Effect_ -> _Output_ 

### Player

The _Player_ allows to consume different data inputs like webcam or image file, 
to apply an effect on top of it and to produce an output like rendering to DOM node or an image file. 

### Effect

The _Effect_ allows to consume an effect or a face filter as remote or local archive.

### Input 
The _Input_ can be one of the following:
- Webcam
- Image as Blob or URL
- Video as Blob or URL
- 3rd-party MediaStream like HTMLVideoElement stream or WebRTC stream

### Output 

The _Output_ can be one of the following:
- HTML Element
- Image as Blob 
- Video as Blob
- MediaStream that can be used by 3rd-parties like WebRTC peer connection

The plenty of input options multiplied by the plenty of output options covers lots of use cases like:

- Photo booth app with realtime webcam video processing and photo capturing
- Photo and video files post-processing app
- P2P video call app with face filter applied

And many more.

## How it looks in JavaScript

Real-time webcam video processing and DOM rendering:

```js
import { Webcam, Player, Module, Effect, Dom } from "https://cdn.jsdelivr.net/npm/@banuba/webar/dist/BanubaSDK.browser.esm.js"

const player = await Player.create({ clientToken: "xxx-xxx-xxx" })
await player.addModule(new Module("https://cdn.jsdelivr.net/npm/@banuba/webar/dist/modules/face_tracker.zip"))

await player.use(new Webcam())
player.applyEffect(new Effect("Glasses.zip"))

Dom.render(player, "#webar-app")
```

And with screenshot capturing:

```js {1,11,12}
import { Webcam, Player, Effect, Module, Dom, ImageCapture } from "https://cdn.jsdelivr.net/npm/@banuba/webar/dist/BanubaSDK.browser.esm.js"

const player = await Player.create({ clientToken: "xxx-xxx-xxx" })
await player.addModule(new Module("https://cdn.jsdelivr.net/npm/@banuba/webar/dist/modules/face_tracker.zip"))

await player.use(new Webcam())
player.applyEffect(new Effect("Glasses.zip"))

Dom.render(player, "#webar-app")

const capture = new ImageCapture(player)
const photo = await capture.takePhoto()
```
