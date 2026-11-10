# android

## Packages

**Maven** 

To start using **Banuba SDK** , add a custom maven repo to your
`build.gradle.kts`:

```kotlin reference title="build.gradle.kts"
https://github.com/Banuba/banuba-sdk-android-samples/blob/master/camera/settings.gradle.kts#L14-L25
```

Refer to our [Maven](https://nexus.banuba.net/#browse/browse:maven-releases) 
to find the list of all available packages and their versions.

## How to choose required packages

:::warning
Use only the packages with the same version! Packages with different versions (even minor) may conflict or work incorrectly with each other.
:::

:::tip
If **feature** or **effect** works incorrect, see application **logs**, to figure out which package is missed.
:::

Add packages depends on the specific **features** or **effects**, which your app will use.
It is your responsibility to include everything required for the desired behaviour.  
See detailed [packages description](#list-of-all-available-packages) in the table below.

```kotlin reference title="build.gradle.kts"
https://github.com/Banuba/banuba-sdk-android-samples/blob/master/common/build.gradle.kts#L51-L63
```

## List of all available packages

| Package name                         | Description |
|--------------------------------------|---------------------------------------|
| com.banuba.sdk.sdk_api               | platform-specific APIs, like `Player`, `Input`, `Output`, etc. |
| com.banuba.sdk.sdk_core              | provides the functionality of the native `EffectPlayer`. |
| com.banuba.sdk.effect_player         | contains the necessary shaders, used by `sdk_core` package and provides the following features: math utilities, texture utilities, morphing, beautification, etc. |
| com.banuba.sdk.scripting             | includes the basic functionality used by the effect api, see [Effects](/effects/overview). |
| com.banuba.sdk.face_tracker          | consists of neural network models used to track a face and its features: lips, eyes, etc. Include it whenever you deal with tracking. See more about [FRX](/tutorials/capabilities/glossary#frx-face-tracking). |
| com.banuba.sdk.face_attributes       | package consists of neural network models used to extract face attributes: skin color, gender, face shape etc. |
| com.banuba.sdk.face_match            | package provides facilities to measure how faces are similar on two photos |
| com.banuba.sdk.makeup                | provides prefabs for [Makeup](/effects/prefabs/makeup). |
| com.banuba.sdk.lips                  | provides neural network models for lips segmentation. See more about [Lips Segmentation](/tutorials/capabilities/glossary#lips-segmentation). |
| com.banuba.sdk.hair                  | provides neural network models for hair segmentation. See more about [Hair Segmentation](/tutorials/capabilities/glossary#hair-segmentation). |
| com.banuba.sdk.hands                 | provides neural network models for hand, nail, and finger segmentation. |
| com.banuba.sdk.eyes                  | provides neural network models for eyes segmentation. See more about [Eye Segmentation](/tutorials/capabilities/glossary#eye-segmentation). |
| com.banuba.sdk.skin                  | provides neural network models for skin segmentation. See more about [Skin Segmentation](/tutorials/capabilities/glossary#skin-segmentation). |
| com.banuba.sdk.background            | provides neural network models for background separation. See more about [Background Separation](/tutorials/capabilities/glossary#background-separation). |
| com.banuba.sdk.body                  | provides neural network model to recognize the human body in full and separate it from the background in images and videos. |
| com.banuba.sdk.acne_eyebags_removal  | provides neural network models for acne removal and eye bag removal. |
| com.banuba.sdk.neck                  | provides neural network models for neck segmentation. |
| com.banuba.sdk.banuba_sdk_resources  | includes all the resources of the all packages. **Use it when you don't care about the size or you need all the features!** |
| com.banuba.sdk.pose_estimation       | private |
| com.banuba.sdk.banuba_sdk            | depends on the all the packages for the operation of all available features. **Use it when you don't care about the size or you need all the features!** |
