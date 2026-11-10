# How to combine the Makeup API and Beauty API features

danger

**This feature is deprecated**. [We recommend you to use Prefabs](/effects/prefabs/overview.md)

As you can notice, both the **Makeup API** and [**Beauty API**](/effects/makeup_deprecated/face_beauty.md) are using the same Face Filter. As a result, it is possible to combine their features in your application.

You can consume the effect API in several ways.

## Via effect's *config.js*[​](#via-effects-configjs "Direct link to via-effects-configjs")

Add to the bottom of the `Makeup/config.js` file:

```
/* Feel free to add your custom code below */

Lips.matt("0.85 0.23 0.2 0.8")
```

## From application[​](#from-application "Direct link to From application")

In your app code use `evalJs` from Banuba SDK:

* Java
* Swift
* JavaScript

```
// Effect mCurrentEffect = ...

// set lips matt color
mCurrentEffect.evalJs("Lips.matt('0.85 0.23 0.2 0.8')", null);
```

```
// var currentEffect: BNBEffect = ...

// set lips matt color
currentEffect?.evalJs("Lips.matt('0.85 0.23 0.2 0.8')", resultCallback: nil);
```

```
// set lips matt color
await effect.evalJs("Lips.matt('0.85 0.23 0.2 0.8')")
```

## Combine features[​](#combine-features "Direct link to Combine features")

To combine the Makeup API features, call the desired methods in your app or in `config.js` as shown above.

**Example:**

* config.js
* Java
* Swift
* JavaScript

```
/* Feel free to add your custom code below */

Lips.matt("0.85 0.23 0.2 0.8")
Makeup.eyeshadow("0.6 0.5 1 0.6")
Makeup.contour("0.3 0.1 0.1 0.2")
```

```
// Effect mCurrentEffect = ...

mCurrentEffect.evalJs("Lips.matt('0.85 0.23 0.2 0.8')", null);
mCurrentEffect.evalJs("Makeup.eyeshadow('0.6 0.5 1 0.6')", null);
mCurrentEffect.evalJs("Makeup.contour('0.3 0.1 0.1 0.2')", null);
```

```
// var currentEffect: BNBEffect = ...

currentEffect?.evalJs("Lips.matt('0.85 0.23 0.2 0.8')", resultCallback: nil);
currentEffect?.evalJs("Makeup.eyeshadow('0.6 0.5 1 0.6')", resultCallback: nil);
currentEffect?.evalJs("Makeup.contour('0.3 0.1 0.1 0.2')", resultCallback: nil);
```

```
await effect.evalJs("Lips.matt('0.85 0.23 0.2 0.8')")
await effect.evalJs("Makeup.eyeshadow('0.6 0.5 1 0.6')")
await effect.evalJs("Makeup.contour('0.3 0.1 0.1 0.2')")
```

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/multiple_features-9024a99b4558c5965d099d96f0b3fdb4.jpg)

Drag
