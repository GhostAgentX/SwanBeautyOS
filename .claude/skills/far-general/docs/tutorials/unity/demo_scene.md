# Unity Demo Scene

Banuba SDK provides a **Demo Scene** for our Unity SDK.

The Demo scene contains several AR effects. To launch the Demo scene on the device follow the steps bellow:

1. In the project files tree, find and open **BanubaSDKDemo.unity** which is located under *Assets* -> *BanubaFaceAR* -> *Demo*

2. To add effects, find the `EffectsManager` object in Hierarchy and populate `Effects` list in Inspector with desired effects prefabs that you can find inside folders under *Assets* -> *BanubaFaceAR* -> *Effects*. At launch, the list will already be filled with all available effects.

![image](/assets/images/demo_1-ca9fb65dd771d6a37a982d28d743b31b.png)

3. Select the **LoaderScene** and **BanubaSDKDemo** scenes in **File** -> **Build Settings** and make sure their indexes are 0 and 1 respectively. Then launch it on the needed platform as usual.

That�s how a properly configured scene should look like.

![image](/assets/images/demo_2-5c138f26f171ec2ec2116b4bb145d819.png)
