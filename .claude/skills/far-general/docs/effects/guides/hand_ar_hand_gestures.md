# How to use the Hand gestures feature

This tutorial will guide you on how to get and use hand gesture triggers using Banuba API. The API provides ready-made documented methods making it easy for developers to call AR features in their apps.

At the the moment, our algorithms are able to recognize 5 hand gestures:

* Like 👍
* Ok 👌
* Palm ✋
* Rock 🤘
* Victory/Peace ✌️

[](pathname:///generated/effects/test_gestures.zip)

[Download example](pathname:///generated/effects/test_gestures.zip)

note

Hand gesture tracking requires the [Hand gesture tracking neural network](/tutorials/capabilities/sdk_features.md). Please, make sure your licence plan includes one by contacting your sales manager or fill in the website form to request it.

## Integrating the hand gesture tracking feature into your app[​](#integrating-the-hand-gesture-tracking-feature-into-your-app "Direct link to Integrating the hand gesture tracking feature into your app")

1. [Build your project with Banuba SDK](/tutorials/development/basic_integration.md).
2. Use the `test_gestures` effect or your version of this effect to enable the hand gestures feature. If you are using the SDK demo app, just copy (if it's not already there) the `test_gestures` effect folder to `effects` folder and load it on demand using the code below:

* Swift
* Java

```
// private BanubaSdkManager mSdkManager;
// ...
mSdkManager.loadEffect("test_gestures")
```

```
// private let sdkManager = BanubaSdkManager()
// ...
sdkManager.loadEffect("test_gestures")
```

note

Hand gesture tracking with the trigger function being called in config.js may be added to any of your effects. It can be done by simply adding the "hand\_gestures" option to the "recognizer" property array in the config.json file.

3. Process the hand gestures tracking data we receive in the Effect. There is a trigger function being called in JS by the SDK every frame while any of the hand gestures are being recognized:

   * `setGesture(json)` - this function recieves a json with an idx of a currently recognized gesture. Its possible values are:

     <!-- -->

     * 0 - none,
     * 1 - like,
     * 2 - ok,
     * 3 - palm,
     * 4 - rock,
     * 5 - victory/peace.

   You may extend this trigger function behaviour by adding your custom logic to config.js from the "test\_gestures" effect folder. E.g. play a guitar solo audio every time someone shows the "rock":

   ```
   function setGesture(json){
       var gestureInfo = JSON.parse(json);
       switch (gestureInfo.idx) {
           case 4:
               Api.playSound("rockme.ogg", false, 1);
               break;
           default:
               break;
       }
   }
   ```

   The only limit is your creativity!

4. Now you can run your application to test hand gestures tracking and your custom logic.
