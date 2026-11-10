# SPM Mandatory modules

> SPM Mandatory modules

# SPM Mandatory modules

The following modules must be installed in all cases:

| Package name | GitHub link |
|----------|-------------|
| BanubaVideoEditorSDK-iOS | https://github.com/Banuba/BanubaVideoEditorSDK-iOS |

If you are **not** using the Face AR SDK together with the VE, you must add one additional module:
| Package name | GitHub link |
|----------|-------------|
| BanubaSDKSimple-IOS | https://github.com/Banuba/BanubaSDKSimple-IOS |

## Face AR interoperation modules
If your license includes the Face AR SDK, please, add the additional modules listed below:

| Package name | GitHub link |
|----------|-------------|
| BanubaSDK-iOS | https://github.com/Banuba/BanubaSDK-iOS |

The Face AR packages (`BNB***`) hosted by the `sdk-banuba` account follow their own versioning. The following table specifies the mapping between the compatible VE and Face AR versions. Please, make sure that you specify the correct Face AR version, otherwise run-time incompatibilities may arise leading to crashes:

| Video Editor SDK versions              | Compatible FaceAR SDK version |
|----------------------------------------|-------------------------------|
| 1.48.0                                 | 1.17.5                        |
| 1.47.0, 1.47.1, 1.47.2                 | 1.17.4                        |
| 1.44.0, 1.45.0, 1.45.1 , 1.46.0        | 1.17.3                        |
| 1.43.0                                 | 1.17.1                        |
| 1.42.0, 1.42.1                         | 1.17.0                        |
| 1.39.0, 1.40.0, 1.41.0                 | 1.16.1                        |
| 1.38.1                                 | 1.15.2                        |
| 1.38.0, 1.37.0, 1.36.6                 | 1.14.2                        |
| 1.36.2                                 | 1.14.1                        |
| 1.36.0                                 | 1.14.0                        |
| 1.35.1                                 | 1.12.0                        |
| 1.35.0                                 | 1.11.1                        |
| 1.34.1, 1.34.0, 1.33.3, 1.33.2, 1.33.1 | 1.10.1                        |
| 1.33.0                                 | 1.9.3                         |
| 1.32.2, 1.32.1, 1.32.0                 | 1.9.1                         |

If your license includes [AR Cloud](guide_far_arcloud.md), please, also add the following package:
| Package name | GitHub link |
|----------|-------------|
| BanubaARCloudSDK-IOS | https://github.com/Banuba/BanubaARCloudSDK-IOS |

## Optional modules

You may skip the module below only if your app provides custom implementations of [Audio Browser](guide_audio_content.md). Otherwise make sure to add it to your project:
| Package name | GitHub link |
|----------|-------------|
| BanubaAudioBrowserSDK-iOS | https://github.com/Banuba/BanubaAudioBrowserSDK-iOS |
