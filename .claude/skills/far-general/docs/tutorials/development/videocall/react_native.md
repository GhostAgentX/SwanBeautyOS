# react\_native

Due to **React Native** limitations, for every videocall solution you have to create a **React native module**. We developed one for integration with [Agora](https://docs.agora.io). It is expected that you will develop your own [React native module](https://reactnative.dev/docs/native-modules-intro) if **Agora** isn't suitable for you.

We have created [Agora Extension](https://docs.agora.io/en/video-calling/develop/use-an-extension?platform=react-native) which is accessible from **React Native**.

[The sample](https://github.com/Banuba/banuba-react-native-agora) described below is a fork of [React Native around Agora](https://github.com/AgoraIO-Extensions/react-native-agora). Follow the instructions in `README.md` to run it.

These are general steps to integrate the sample code into your app:

* Android
* iOS

1. Add the **Client Token** and extension properties keys constants

example/src/examples/basic/JoinChannelVideo/JoinChannelVideo.tsx

```tsx
const banubaClientToken = <#Place client token here#>

const banubaExtprovider = 'Banuba';
const banubaExtension = 'BanubaFilter';
const loadEffect = 'load_effect';
const unloadEffect = 'unload_effect';
const setEffectsPath = 'set_effects_path';
const setToken = 'set_banuba_license_token';
const evelJs = 'eval_js';
```

![Icon](/img/icons/github.svg "GitHub")

2. Add the common methods to interact with **Banuba extension**

example/src/examples/basic/JoinChannelVideo/JoinChannelVideo.tsx

```tsx
/*
   * Banuba integration
   */

  protected enableExtension() {
    if (Platform.OS === 'android') {
      this.engine?.loadExtensionProvider(`banuba`);
      this.engine?.loadExtensionProvider(`banuba-plugin`);
    }
    const result =
      this.engine?.enableExtension(banubaExtprovider, banubaExtension, true) ??
      -1;
    if (result < 0) {
      throw new Error('Failed to load Banuba extention library');
    }
  }
  
  protected disableExtension() {
    this.engine?.enableExtension(banubaExtprovider, banubaExtension, false);
  }
  
  protected intiBanuba() {
    this.enableExtension();
    this.engine?.setExtensionProperty(
      banubaExtprovider,
      banubaExtension,
      setToken,
      banubaClientToken
    );
  }

  protected loadEffect(name: string) {
    this.engine?.setExtensionProperty(
      banubaExtprovider,
      banubaExtension,
      loadEffect,
      'effects/' + name
    );
  }
}
```

![Icon](/img/icons/github.svg "GitHub")

3. Initialize **Banuba** and load an **effect**

example/src/examples/basic/JoinChannelVideo/JoinChannelVideo.tsx

```tsx
this.intiBanuba();
    this.loadEffect('Glasses');
```

![Icon](/img/icons/github.svg "GitHub")

warning

`intiBanuba()` must be called just after `engine.initialize(...)`, calling it later will cause an error during extention loading.

4. Copy effects in [`effects`](https://github.com/Banuba/banuba-react-native-agora/tree/main/example/effects) folder

5. Add a reference to the **Banuba Maven repo**

example/android/build.gradle

```groovy
allprojects {
    repositories {
        google()
        mavenCentral()
        maven {
            url("$rootDir/../node_modules/detox/Detox-android")
        }
        maven {
            name = "BanubaMaven"
            url = uri("https://nexus.banuba.net/repository/maven-releases")
        }
    }
}
```

![Icon](/img/icons/github.svg "GitHub")

6. Add **Banuba dependencies** and prepare a task to copy effects into app

example/android/app/build.gradle

```groovy
dependencies {
    androidTestImplementation('com.wix:detox:+')
    implementation 'androidx.appcompat:appcompat:1.1.0'
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.3'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.4.0'
    implementation fileTree(dir: "libs", include: ["*.jar"])

    // The version of react-native is set by the React Native Gradle Plugin
    implementation("com.facebook.react:react-android")

    debugImplementation("com.facebook.flipper:flipper:${FLIPPER_VERSION}")
    debugImplementation("com.facebook.flipper:flipper-network-plugin:${FLIPPER_VERSION}") {
        exclude group:'com.squareup.okhttp3', module:'okhttp'
    }

    debugImplementation("com.facebook.flipper:flipper-fresco-plugin:${FLIPPER_VERSION}")
    if (hermesEnabled.toBoolean()) {
        implementation("com.facebook.react:hermes-android")
    } else {
        implementation jscFlavor
    }

    implementation 'com.banuba.sdk:banuba_sdk:1.17.+'
    implementation 'com.banuba.sdk.android:agora-extension:1.5.+'
}
```

![Icon](/img/icons/github.svg "GitHub")

1. Add **Client Token** and extension properties keys constants

example/src/examples/basic/JoinChannelVideo/JoinChannelVideo.tsx

```tsx
const banubaClientToken = <#Place client token here#>

const banubaExtprovider = 'Banuba';
const banubaExtension = 'BanubaFilter';
const loadEffect = 'load_effect';
const unloadEffect = 'unload_effect';
const setEffectsPath = 'set_effects_path';
const setToken = 'set_banuba_license_token';
const evelJs = 'eval_js';
```

![Icon](/img/icons/github.svg "GitHub")

2. Add common methods to interact with the **Banuba extension**

example/src/examples/basic/JoinChannelVideo/JoinChannelVideo.tsx

```tsx
protected enableExtension() {
    if (Platform.OS === 'android') {
      this.engine?.loadExtensionProvider(`banuba`);
      this.engine?.loadExtensionProvider(`banuba-plugin`);
    }
    const result =
      this.engine?.enableExtension(banubaExtprovider, banubaExtension, true) ??
      -1;
    if (result < 0) {
      throw new Error('Failed to load Banuba extention library');
    }
  }
  
  protected disableExtension() {
    this.engine?.enableExtension(banubaExtprovider, banubaExtension, false);
  }
  
  protected intiBanuba() {
    this.enableExtension();
    this.engine?.setExtensionProperty(
      banubaExtprovider,
      banubaExtension,
      setToken,
      banubaClientToken
    );
  }

  protected loadEffect(name: string) {
    this.engine?.setExtensionProperty(
      banubaExtprovider,
      banubaExtension,
      loadEffect,
      'effects/' + name
    );
  }
```

![Icon](/img/icons/github.svg "GitHub")

3. Initialize **Banuba** and load an **effect**

example/src/examples/basic/JoinChannelVideo/JoinChannelVideo.tsx

```tsx
this.intiBanuba();
    this.loadEffect('Glasses');
```

![Icon](/img/icons/github.svg "GitHub")

warning

`intiBanuba()` must be called immediately after `engine.initialize(...)`, calling it later will cause an error during extention loading.

4. Copy effects in [`effects`](https://github.com/Banuba/banuba-react-native-agora/tree/main/example/effects) folder

5. Add **Banuba dependencies** to `Podfile`

example/ios/Podfile

```Podfile
source 'https://github.com/CocoaPods/Specs.git'
source 'https://github.com/sdk-banuba/banuba-sdk-podspecs.git'
```

![Icon](/img/icons/github.svg "GitHub")

6. Add the `effects` folder added earlier into your project. Link it with your app: add the folder into **Xcode** project (`File` -> `Add Files to '<You project>'...`).
