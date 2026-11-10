# Migration Guides

## To version 1.17.0[​](#to-version-1170 "Direct link to To version 1.17.0")

`RenderBackendType`(`render_backend_type`) was moved to `types` package. So, now for:

### Android[​](#android "Direct link to Android")

Change `com.banuba.sdk.scene.RenderBackendType` to `com.banuba.sdk.types.RenderBackendType`.

### C++[​](#c "Direct link to C++")

Change `#include <bnb/scene/interfaces/render_backend_type.hpp>` to `#include <bnb/types/interfaces/render_backend_type.hpp>`

## To version 1.9.0[​](#to-version-190 "Direct link to To version 1.9.0")

BanubaSDK introduces the `Player` API for iOS and Android, which implements the most popular use cases and is highly customizable. We continue to support the old API, but starting from this version it is marked as deprecated. The main changes are described below.

### iOS & Android[​](#ios--android "Direct link to iOS & Android")

* The class `BanubaSdkManager` deprecated now. Static methods for initialization/deinitialization of the Banuba SDK with the client token and resources path still work. But we are suggest to switch to `BNBUtilityManager` for the SDK initialization instead.
* The class `Player` introduced as a replacement for the `BanubaSdkManager`. Now it is the only way to process frames from the `Input`, manage effect playback and present them to the `Output`.
* The protocol `Input` with basic use cases implementations: `Camera`, `Photo`, `Stream`; provides frames to the `Player` for further processing and rendering.
* The protocol `Output` implements endpoint of the presentation surface, which may be `View`, `PixelBuffer`, `Video`, or any other surface, implemented by own. You can have several outputs in use at a time!
* All the three main protocols can be connected between each other through the `player.use(input, outputs)` method call.

More details about new `Player` API you can find in our [github examples](/tutorials/development/samples.md).
