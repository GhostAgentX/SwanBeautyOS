# ios

* CocoaPods
* Swift Package Manager

## CocoaPods packages

To start using **Banuba SDK** with [**CocoaPods**](https://guides.cocoapods.org/using/using-cocoapods.html),
add a **custom repository** and desired **packages** to your `Podfile`:

```ruby reference title="Podfile" {4,8}
https://github.com/Banuba/quickstart-ios-objc/blob/master/Podfile
```

Then install pods:

```bash
pod install --repo-update
```

See [banuba-sdk-podspecs](https://github.com/sdk-banuba/banuba-sdk-podspecs) repo for the list of all available packages and versions.

The complete example, configured for **CocoaPods** usage, can be found in our [Objective-C](https://github.com/Banuba/quickstart-ios-objc) quickstart example.

  </TabItem>
  <TabItem value="spm" label="Swift Package Manager">

## SPM packages

**Banuba SDK** provides [Swift Package Manager](https://www.swift.org/package-manager/) packages in the custom repositories.



Add **Banuba SDK** packages, to your Xcode project:

1. **File** > **Add Package Dependencies...**
2. Search for the package, for example https://github.com/sdk-banuba/BNBSdkApi
3. Press the **Add Package** button. After verifying the package, press **Add Package** again.

See the [sdk-banuba](https://github.com/sdk-banuba?tab=repositories&q=swift+package&type=&language=&sort=) 
repositories for the list of all available packages and versions.

The complete example, configured for **SPM** usage, can be found in our [Beauty-iOS](https://github.com/Banuba/banuba-sdk-ios-samples) quickstart example.

  </TabItem>
</Tabs>


## How to choose required packages

:::warning
Only use the packages with the same version! Packages with different versions (even minor) may conflict or work incorrectly with each other.
:::

:::tip
If **feature** or **effect** works incorrect, see application **logs**, to figure out which package is missed.
:::

Add packages depends on the specific **features** or **effects**, which your app will use.
It is your responsibility to include everything required for the desired behaviour.  
See detailed [packages description](#list-of-all-available-packages) in the table below.

Example of the packages set for [Face Tracking](/tutorials/capabilities/glossary#frx-face-tracking) and [Background Separation](/tutorials/capabilities/glossary#background-separation):
* BNBSdkApi
* BNBFaceTracker
* BNBBackground

See detailed [packages description](#list-of-all-available-packages) in the table below.


## List of all available packages

| Package name            | Description                           |
|-------------------------|---------------------------------------|
| BNBSdkApi               | platform-specific API, like `Player`, `Input`, `Output`, etc |
| BNBSdkCore              | provides the functionality of the native `EffectPlayer`. |
| BNBEffectPlayer         | contains the necessary shaders, used by `sdk_core` package and provides the following features: math utilities, texture utilities, morphing, beautification, etc. |
| BNBScripting            | includes the basic functionality used by the effect api, see [Effects](/effects/overview). |
| BNBFaceTracker          | package consists of neural network models used to track face and its features: lips, eyes, etc. Include it whenever you deal with tracking. See more about [Face Tracking](/tutorials/capabilities/glossary#frx-face-tracking). |
| BNBFaceAttributes       | package consists of neural network models used to extract face attributes: skin color, gender, face shape etc. |
| BNBFaceMatch            | package provides facilities to measure how faces are similar on two photos |
| BNBMakeup               | provides prefabs for [Makeup](/effects/prefabs/makeup). |
| BNBLips                 | provides neural network models for lips segmentation. See more about [Lips Segmentation](/tutorials/capabilities/glossary#lips-segmentation). |
| BNBHair                 | provides neural network models for hair segmentation. See more about [Hair Segmentation](/tutorials/capabilities/glossary#hair-segmentation). |
| BNBHands                | provides neural network models for hand, nail, and finger segmentation. |
| BNBEyes                 | provides neural network models for eyes segmentation. See more about [Eye Segmentation](/tutorials/capabilities/glossary#eye-segmentation). |
| BNBSkin                 | provides neural network models for skin segmentation. See more about [Skin Segmentation](/tutorials/capabilities/glossary#skin-segmentation). |
| BNBBackground           | provides neural network models for background separation. See more about [Background Separation](/tutorials/capabilities/glossary#background-separation). |
| BNBBody                 | provides neural network model to recognize the human body in full and separate it from the background in images and videos. |
| BNBAcneEyebagsRemoval   | provides neural network models for acne removal and eye bag removal. |
| BNBNeck                 | provides neural network models for neck segmentation. |
| BNBResources            | includes all the resources of the all packages. **Use it when you don't care about the size or you need all the features!** |
| BNBPoseEstimation       | private |
| BanubaSdk               | depends on the all the packages for the operation of all available features. **Use it when you don't care about the size or you need all the features!** |
