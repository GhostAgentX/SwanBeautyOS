# Optimization Guides

* Web

## Optimizing WebAR SDK bundle size[​](#optimizing-webar-sdk-bundle-size "Direct link to Optimizing WebAR SDK bundle size")

**Banuba WebAR SDK** is [tree-shakable](https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking), so import only the modules your application relies on:

```
// the named import saves extra KBs
import { Webcam, Player, Effect, Dom } from "@banuba/webar"

// ...
```

## Optimizing WebAR SDK assets size[​](#optimizing-webar-sdk-assets-size "Direct link to Optimizing WebAR SDK assets size")

`BanubaSDK.wasm` and `BanubaSDK.simd.wasm` are the heavy ones. But they have a good compressability due to the internal format of the files.

| Asset               | Original | Gzip  | Brotli |
| ------------------- | -------- | ----- | ------ |
| BanubaSDK.wasm      | 12Mb     | 3.5Mb | 2.5Mb  |
| BanubaSDK.simd.wasm | 13Mb     | 3.8Mb | 2.7Mb  |

Most hosting environments like [Netlify](https://www.netlify.com/) automatically precompress the files, but sometimes you may have to compress them yourself for better downloading times. You can run the command in the assets folder to get them compressed:

```
npx gzipper compress --brotli .
```

See [gzipper docs](https://www.npmjs.com/package/gzipper#compressc-1) for details.

## Speed up WebAR SDK on modern browsers[​](#speed-up-webar-sdk-on-modern-browsers "Direct link to Speed up WebAR SDK on modern browsers")

Banuba WebAR SDK ships with the `BanubaSDK.simd.wasm` file - the SIMD version of the `BanubaSDK.wasm`. Without digging into the details of what SIMD is, the SIMD-enabled file can make processing performance up to several times faster. Taking into consideration that SIMD has [a good support across modern browsers](https://webassembly.org/roadmap/), you should definitely give it a try.

SIMD support detection is built into the WebAR SDK. It means the SDK will try to load `BanubaSDK.simd.wasm` if the current browser supports SIMD and will load `BanubaSDK.wasm` otherwise.

Don't forget to point BanubaSDK to the SIMD file location if you are using `locateFile`:

```
const player = await Player.create({
  clientToken: "xxx-xxx-xxx",
  // point BanubaSDK where to find these vital files
  locateFile: {
    "BanubaSDK.data": "/path/to/BanubaSDK.data",
    "BanubaSDK.wasm": "/path/to/BanubaSDK.wasm",
    "BanubaSDK.simd.wasm": "/path/to/BanubaSDK.simd.wasm",
  },
})
```

See [Player.create()](/generated/typedoc/classes/Player.html#create) and [locateFile](/generated/typedoc/types/SDKOptions.html) for details.

## Reducing CPU/GPU usage on HiDPI devices[​](#reducing-cpugpu-usage-on-hidpi-devices "Direct link to Reducing CPU/GPU usage on HiDPI devices")

On HiDPI devices Banuba WebAR SDK scales the output frames by the [device pixel ratio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio). This approach allows the SDK to render face AR 3D Masks in a high quality and keep all the AR 3D Mask details.

Despite the better rendering quality, this approach utilizes more CPU and GPU resources since the frame size to be processed scales geometrically.

One can simply opt out of the default behavior and reduce CPU/GPU utilization by overriding the `devicePixelRatio` used by the SDK:

```
const player = await Player.create({
  clientToken: "xxx-xxx-xxx",
  devicePixelRatio: 1,
})
```

See the [Player.create()](/generated/typedoc/classes/Player.html#create) method docs for more details.

The CPU and GPU usage can be reduced even more by processing frames of smaller size, e.g the 640x480 webcam frame size can be used instead of the default 1280x720 frame size:

```
await player.use(new Webcam({ width: 640, height: 480 }))
```

Check out the [Video cropping](/tutorials/development/samples.md#video-cropping) sample for more details.

## Preloading Effects[​](#preloading-effects "Direct link to Preloading Effects")

Sometimes you may experience a time lag between [player.applyEffect()](/generated/typedoc/classes/Player.html#applyEffect) call and a visual change due to the long time of the effect archive download.

To speed up things, you can preload the Effect and apply it later on demand:

```
const preloaded = await Effect.preload("SomeBigEffect.zip"))

// ...

player.applyEffect(preloaded)
```

You can also scale the approach and add a local cache of the preloaded effects, or preload an effect on some user interaction like mouse hover a button.

Still have questions about FaceAR SDK?

Visit our [FAQ](https://www.banuba.com/faq/) or [contact our support](/support/.md).
