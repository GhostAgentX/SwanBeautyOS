# Banuba Face AR SDK

## Introduction[​](#introduction "Direct link to Introduction")

Welcome to **Banuba Face AR SDK**. This document will help you to get started with our SDK and guide you on how to create your project with **Face AR** features.

Banuba SDK allows developers to include AR features into their applications. Our documentation will give you a complite guide how to use the features described.

How to read this documentation:

1. [**View the samples.**](/tutorials/development/samples.md) The SDK is delivered with examples of feature applications for each platform. They cover a variety of real-life use cases and give a comprehensive overview of how to run and use the SDK.
2. [**Setup your project**](/tutorials/development/basic_integration.md) using our examples.
3. [**This document**](/tutorials/capabilities/sdk_features.md) review the features across the supported platforms.
4. Try to create your own effect with [**Banuba Studio**](https://studio.banuba.com/) or buy some from the [**Banuba Asset Store**](https://assetstore.banuba.net/).

## Architecture[​](#architecture "Direct link to Architecture")

The image below shows the components of the **Banuba Face AR SDK**.

![image](/assets/images/introduction_0-e6e520e3eafab1de9d6776fe0c97fc71.svg)

### EffectPlayer[​](#effectplayer "Direct link to EffectPlayer")

EffectPlayer is a low-level library for effects' playing. Its code doesn’t depend on any platform-specific APIs or compilers.

EffectPlayer is written in **C++**, but has bindings to all supported platform-specific languages and runtimes. You need to use **Java** or **Kotlin** on Android, and **Objective-C** or **Swift** on iOS and macOS for dealing with this API. Additionally, **C++** API is available on Windows and macOS.

EffectPlayer features:

* Consumes the camera frames and requests for the frame drawing. Serves it in an asynchronous manner using multithreading if available on a platform.
* Runs all recognition operations on the input frames.
* Runs and manages all platform-specific modules encapsulated in C++. For example audio playback, video playback, accelerometer, scripting engine, etc.
* Implements all logic of loading and playing interactive effects (loading from disk, rendering, scripting of effect logic, etc).

### Platform modules[​](#platform-modules "Direct link to Platform modules")

The functionality of the platform modules depends on the specific platform. Generally, it includes:

* camera features (permission management, configuration, lifecycle implementation)
* effect's rendering context setup
* video recording
* high-resolution photo taking
* preparing of EffectPlayer's resources on the app's launch

The source code of the platform modules is included in SDK's distribution archive. You can modify the code and adapt the SDK up to your use case if its default functionality is not enough.

## More info[​](#more-info "Direct link to More info")

* Visit our [getting started](/tutorials/development/basic_integration.md) page for more information about SDK integration and examples of Demo apps.
* Have questions about Face AR SDK? Visit the [FAQ page](https://www.banuba.com/faq/).
* Can't find an answer? [Contact our support](/support/.md).
