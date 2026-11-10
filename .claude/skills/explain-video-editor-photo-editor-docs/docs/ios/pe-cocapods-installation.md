# Installation with CocoaPods

> Installation with CocoaPods

# Installation with CocoaPods

Learn the [CocoaPods Getting Started Guide](https://guides.cocoapods.org/using/getting-started.html) if you are new to CocoaPods.

:::info
It is advised to use the latest version of CocoaPods. Please, check your version with ```pod --version``` and upgrade it if necessary.
:::

Complete the following steps to get the Photo Editor SDK dependencies using CocoaPods:
1. install CocoaPods using Homebrew:
   ```sh
   brew install cocoapods 
   ```
2. create a new Podfile in your project folder or edit the existing one:
   ```sh
   pod init
   ```
3. add the necessary pods and our podspecs sources to the Podfile. The list of the required Photo Editor dependencies can be found in the [Podfile](https://github.com/Banuba/ve-sdk-ios-integration-sample/blob/main/Example/Podfile) example:
   ```ruby
   source 'https://cdn.cocoapods.org/'
   source 'https://github.com/Banuba/specs.git'
   source 'https://github.com/sdk-banuba/banuba-sdk-podspecs.git'

   pod 'BanubaPhotoEditorSDK', '1.4.1'
   ```
4. install the Video Editor SDK pods:
   ```sh
   pod install --repo-update
   ```
4. open the ```***.xcworkspace``` workspace in Xcode and run the project.
