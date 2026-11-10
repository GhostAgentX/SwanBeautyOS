# web

## NPM Package

**[Banuba WebAR](https://www.npmjs.com/package/@banuba/webar)** is delivered as an NPM package, which includes executables (`.js`, `.wasm`, `.simd.wasm`) and resources modules (`modules/*.zip`).

```bash
npm i @banuba/webar
```

## Resources Modules

| Module name               | Description                           |
|---------------------------|---------------------------------------|
| face_tracker.zip          | consists of neural network models used to track a face and its features: lips, eyes, etc. Include it whenever you deal with tracking. See more about [FRX](/tutorials/capabilities/glossary#frx-face-tracking). |
| face_attributes.zip       | package consists of neural network models used to extract face attributes: skin color, gender, face shape etc. |
| face_match.zip            | package provides facilities to measure how faces are similar on two photos |
| makeup.zip                | provides prefabs for [Makeup](/effects/prefabs/makeup). |
| lips.zip                  | provides neural network models for lips segmentation. See more about [Lips Segmentation](/tutorials/capabilities/glossary#lips-segmentation). |
| hair.zip                  | provides neural network models for hair segmentation. See more about [Hair Segmentation](/tutorials/capabilities/glossary#hair-segmentation). |
| hands.zip                 | provides neural network models for hand, nail, and finger segmentation. |
| eyes.zip                  | provides neural network models for eyes segmentation. See more about [Eye Segmentation](/tutorials/capabilities/glossary#eye-segmentation). |
| skin.zip                  | provides neural network models for skin segmentation. See more about [Skin Segmentation](/tutorials/capabilities/glossary#skin-segmentation). |
| background.zip            | provides neural network models for background separation. See more about [Background Separation](/tutorials/capabilities/glossary#background-separation). |
| body.zip                  | provides neural network model to recognize the human body in full and separate it from the background in images and videos. |
| acne_eyebags_removal.zip  | provides neural network models for acne removal and eye bag removal. |
| neck.zip                  | provides neural network models for neck segmentation. |
| pose_estimation.zip       | private |


## Bundlers

**[Banuba WebAR](https://www.npmjs.com/package/@banuba/webar)** depends on 
`BanubaSDK.data` and `BanubaSDK.wasm` (or `BanubaSDK.simd.wasm` if you are targeting 
[SIMD](/tutorials/development/guides/optimization#speed-up-webar-sdk-on-modern-browsers)) files.
By default the SDK expects these files to be accessible from the application root 
i.e. by the `/BanubaSDK.data`, `/BanubaSDK.wasm` `/BanubaSDK.simd.wasm` links.
It must be taken into consideration when working with application bundlers like 
[Vite](https://vitejs.dev/), [Rollup](https://rollupjs.org/guide/en/) or [Webpack](https://webpack.js.org/).

Generally speaking one should be able to put `BanubaSDK.data`, `BanubaSDK.wasm` and `BanubaSDK.simd.wasm` 
files into the application assets folder (usually `public/`) and get the SDK loading these files properly.

But you may want to place the files somewhere else, that case the 
[locateFile](pathname:///generated/typedoc/types/SDKOptions.html) property of the 
[Player.create()](pathname:///generated/typedoc/classes/Player.html#create) 
method should help you to set-up SDK properly.

<Tabs groupId="web-bundlers" queryString>
  <TabItem value="vite" label="Vite">

### Vite

```ts
import { Player, Module /* ... */ } from "@banuba/webar"
// vite uses special ?url syntax to import files as URLs
import data from "@banuba/webar/BanubaSDK.data?url"
import wasm from "@banuba/webar/BanubaSDK.wasm?url"
import simd from "@banuba/webar/BanubaSDK.simd.wasm?url"

import FaceTracker from "@banuba/webar/face_tracker.zip?url"
import Background from "@banuba/webar/background.zip?url"

// ...

const player = await Player.create({
  clientToken: "xxx-xxx-xxx",
  // point BanubaSDK where to find these vital files
  locateFile: {
    "BanubaSDK.data": data,
    "BanubaSDK.wasm": wasm,
    "BanubaSDK.simd.wasm": simd,
  },
})

await player.addModule(new Module(FaceTracker), new Module(Background))

// ...
```
:::tip
See Vite [Explicit URL imports](https://vitejs.dev/guide/assets.html#explicit-url-imports) docs for details.
:::

  </TabItem>
  <TabItem value="rollup" label="Rollup">

### Rollup

```ts
import { Player, Module /* ... */ } from "@banuba/webar"
// you need to set-up @rollup/plugin-url for the import syntax to work
import data from "@banuba/webar/BanubaSDK.data"
import wasm from "@banuba/webar/BanubaSDK.wasm"
import simd from "@banuba/webar/BanubaSDK.simd.wasm"

import FaceTracker from "@banuba/webar/face_tracker.zip"
import Background from "@banuba/webar/background.zip"

// ...

const player = await Player.create({
  clientToken: "xxx-xxx-xxx",
  // point BanubaSDK where to find these vital files
  locateFile: {
    "BanubaSDK.data": data,
    "BanubaSDK.wasm": wasm,
    "BanubaSDK.simd.wasm": simd,
  },
})

await player.addModule(new Module(FaceTracker), new Module(Background))

// ...
```

:::tip
See [@rollup/plugin-url](https://www.npmjs.com/package/@rollup/plugin-url#include) docs for details.
:::

  </TabItem>
  <TabItem value="webpack" label="Webpack">

### Webpack

Depending on the version of **Webpack** used, you may have to add following rule to the `module.rules` section of the `webpack.config.js`:

```ts
module.exports = {
  module: {
    rules: [
      // ...
      {
        test: /\.wasm$/,
        type: 'javascript/auto',
        loader: 'file-loader',
      },
      // ...
    ],
    },
  },
}
```

Now import of `.wasm` files as URLs should work properly:

```ts
import { Player, Module /* ... */ } from "@banuba/webar"
import data from "@banuba/webar/BanubaSDK.data"
import wasm from "@banuba/webar/BanubaSDK.wasm"
import simd from "@banuba/webar/BanubaSDK.simd.wasm"

import FaceTracker from "@banuba/webar/face_tracker.zip"
import Background from "@banuba/webar/background.zip"

// ...

const player = await Player.create({
  clientToken: "xxx-xxx-xxx",
  // point BanubaSDK where to find these vital files
  locateFile: {
    "BanubaSDK.data": data,
    "BanubaSDK.wasm": wasm,
    "BanubaSDK.simd.wasm": simd,
  },
})

await player.addModule(new Module(FaceTracker), new Module(Background))

// ...
```

:::info
See the related [Webpack issue](https://github.com/webpack/webpack/issues/7352) for details.
:::

  </TabItem>
</Tabs>
