# Install Photo Editor on Android

> Install Photo Editor on Android

# Install Photo Editor on Android  

Guide to installing Photo Editor SDK on Android.

SDK modules are stored on GitHub Packages.

## Add repositories

Open your project [gradle](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/build.gradle#L21) file and add repositories to ```allprojects``` section.
```groovy
allprojects {
    repositories {
        maven {
            name = "nexus"
            url = uri("https://nexus.banuba.net/repository/maven-releases")
        }
    }
}
```

## Add dependencies
Specify dependencies in the app [gradle](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/build.gradle#L83) file.

```groovy
    def banubaPESdkVersion = '1.4.1'
    implementation "com.banuba.sdk:pe-sdk:${banubaPESdkVersion}"

    def banubaSdkVersion = '1.53.2'

    implementation "com.banuba.sdk:core-sdk:${banubaSdkVersion}"
    implementation "com.banuba.sdk:core-ui-sdk:${banubaSdkVersion}"
    implementation "com.banuba.sdk:ve-gallery-sdk:${banubaSdkVersion}"
    implementation "com.banuba.sdk:effect-player-adapter:${banubaSdkVersion}"
```

Add ```kotlin-parcelize``` plugin into plugins section of the [gradle](https://github.com/Banuba/ve-sdk-android-integration-sample/blob/main/app/build.gradle#L63) file.
```groovy
plugins {
    id 'com.android.application'
    id 'kotlin-android'
    id 'kotlin-parcelize'
}
```
