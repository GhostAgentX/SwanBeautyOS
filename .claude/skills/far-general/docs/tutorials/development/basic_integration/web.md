# web

## Requirements

* [Nodejs](https://nodejs.org/en/) installed
* Browser with [WebGL 2.0](https://caniuse.com/#feat=webgl2) and higher

## Integration

1. Setup the client token
```js
window.BANUBA_CLIENT_TOKEN = "PUT YOUR CLIENT TOKEN HERE"
```

2. Import the required types from the [@banuba/webar](https://www.npmjs.com/package/@banuba/webar) NPM package
```js
const {
  Dom,
  Effect,
  Image,
  ImageCapture,
  Module,
  Player,
  VideoRecorder,
  Webcam,
  VERSION,
} = await import(
  `https://cdn.jsdelivr.net/npm/@banuba/webar@${SDK_VERSION}/dist/BanubaSDK.browser.esm.min.js`
);
```

:::info
See the details about the NPM package in [Installation](/tutorials/development/installation).
:::

3. Initialize `Player` and apply the `Effect`
```js
const player = await Player.create({
  clientToken: window.BANUBA_CLIENT_TOKEN,
  proxyVideoRequestsTo: isSafari ? "___range-requests___/" : null,
  useFutureInterpolate: false,
  locateFile: `${sdkUrl}@${SDK_VERSION}/dist`,
});
```
```js
await Promise.all(
  modulesList.map((moduleId) => {
    return new Promise(async (resolve) => {
      try {
        const module = await Module.preload(
          `https://cdn.jsdelivr.net/npm/@banuba/webar@${SDK_VERSION}/dist/modules/${moduleId}.zip`
        );
        await player.addModule(module);
      } catch (error) {
        console.warn(`Load module ${moduleId} error: `, error);
      }

      return resolve();
    });
  })
);
```
```js
export const applyEffect = async (effectName) => {
  currentEffect = new Effect(effectName);
  await player.applyEffect(currentEffect);
};
```

4. Run a local web server from a terminal inside the folder
```bash
npx live-server
```

5. Open [localhost:8080](http://localhost:8080) and start clicking 🎉 🚀 💅

:::tip
Follow the instructions of the demo app [README.md](https://github.com/Banuba/quickstart-web/blob/master/README.md) 
to get more info.
:::

:::note
The demo app leverages [jsDelivr](https://jsdelivr.com/) CDN for ease of getting started, for a real life 
application please use the [@banuba/webar](https://www.npmjs.com/package/@banuba/webar) npm package.
:::