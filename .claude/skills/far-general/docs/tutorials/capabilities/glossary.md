# FaceAR Glossary

## AR Technologies[​](#ar-technologies "Direct link to AR Technologies")

### FRX (Face tracking)[​](#frx-face-tracking "Direct link to FRX (Face tracking)")

The technology to detect and track the presence of a human face in a digital video frame to enable FaceAR camera experiences.

### Face match[​](#face-match "Direct link to Face match")

Comparing a face in the image/video to one reference image.

### Face attributes[​](#face-attributes "Direct link to Face attributes")

Detection of multiple facial parameters: hair color, eye color, skin tone, gender, hair & facial hair style, nose & lips shape.

### Face shape[​](#face-shape "Direct link to Face shape")

Face shape detection that can be used for things like personalized recommendations

### Background separation[​](#background-separation "Direct link to Background separation")

Neural network that separates a user on the foreground from the background in a sequence of video frames to remove the background or replace it with another image. As a standalone feature, the background segmentation is used in video conferencing, live streaming and video communication apps. It also can be used as part of face filter together with facial animation in entertainment apps.

### Bokeh effect[​](#bokeh-effect "Direct link to Bokeh effect")

The algorithm that separates a person on the foreground and blurs the background as in photography.

### Skin segmentation[​](#skin-segmentation "Direct link to Skin segmentation")

Neural network trained to recognize and segment the skin area for recoloring tasks, e.g. make the skin tone lighter or darker.

### Skin smoothing[​](#skin-smoothing "Direct link to Skin smoothing")

Neural network trained to segment and blur the skin on the face to create a retouch effect similar to professional photography.

### Neck segmentation and smoothing[​](#neck-segmentation-and-smoothing "Direct link to Neck segmentation and smoothing")

Segmentation of the neck for applying effects like skin smoothing or trying on appropriate items (e.g. scarves)

### Hair Segmentation[​](#hair-segmentation "Direct link to Hair Segmentation")

Neural network to detect and segment the image into hair, face and background to allow for real-time hair modification such as change the hair color.

### Eye segmentation[​](#eye-segmentation "Direct link to Eye segmentation")

Neural network to detect and segment the eye into iris, pupil and eyeball for eye recoloring and virtual contact lens try on.

### Eye lenses[​](#eye-lenses "Direct link to Eye lenses")

Applying virtual contact lenses and changing lenses color on physical glasses.

### Pupillary distance[​](#pupillary-distance "Direct link to Pupillary distance")

Measuring distance between the centers of the person's pupils, a useful parameter for eyewear try-on.

### Brows segmentation[​](#brows-segmentation "Direct link to Brows segmentation")

Segmentation of eyebrows for applying effects like facial feature editing.

### Lips segmentation[​](#lips-segmentation "Direct link to Lips segmentation")

Neural network to detect and segment the lips on the users face for virtual lipstic try on effect.

### Full body segmentation[​](#full-body-segmentation "Direct link to Full body segmentation")

Neural network trained to recognize the human body in full length and separate it from the background in images and videos.

### Acne removal (tap)[​](#acne-removal-tap "Direct link to Acne removal (tap)")

[Acne removal](/effects/guides/feature_params.md#acne-removal) is an algorithm to remove acne in photos by single taps on the selected area.

### Acne removal (auto)[​](#acne-removal-auto "Direct link to Acne removal (auto)")

The algorithm to automatically remove acne in photos.

### Eye bag removal[​](#eye-bag-removal "Direct link to Eye bag removal")

The algorithm segments and lightens the area under the eyes in photos for beautification purposes.

### Hair strands painting[​](#hair-strands-painting "Direct link to Hair strands painting")

The algorithms to change the hair color with several colors applied simultaneously, e.g. for strands highlight or coloring.

### Teeth tone[​](#teeth-tone "Direct link to Teeth tone")

Detection of the person's teeth shade. Can be used for dental bleaching simulation.

## Features[​](#features "Direct link to Features")

### 2+ faces detection (Multi-face)[​](#2-faces-detection-multi-face "Direct link to 2+ faces detection (Multi-face)")

Algorithm allowing for AR 3D Masks application to several people simultaneously for more engaging group AR experiences. For the quality user experience, we generally don’t recommend supporting more than 3 faces on mobile devices due to limited computing capabilities.

### Pulse (Heart rate)[​](#pulse-heart-rate "Direct link to Pulse (Heart rate)")

Algorithm analyses fine patterns of the facial areas and their color variations within time to detect pulse frequency in real-time.

### Ruler (Distance to phone)[​](#ruler-distance-to-phone "Direct link to Ruler (Distance to phone)")

Algorithm analyses face area size to estimate distance from user's face to camera in real-time.

### Text Texture (on AR 3D Mask)[​](#text-texture-on-ar-3d-mask "Direct link to Text Texture (on AR 3D Mask)")

Allows to write text as texture on any 2D or 3D model in the effect.

### AR 3D Mask on a picture from Camera Roll[​](#ar-3d-mask-on-a-picture-from-camera-roll "Direct link to AR 3D Mask on a picture from Camera Roll")

AR 3D Mask application on pre-recorded images the user uploads from the Camera Roll.

### AR 3D Mask on video from Camera Roll[​](#ar-3d-mask-on-video-from-camera-roll "Direct link to AR 3D Mask on video from Camera Roll")

AR 3D Mask application on pre-recorded videos the user uploads from the Camera Roll.

### Post-processing effects[​](#post-processing-effects "Direct link to Post-processing effects")

Graphical camera effects and animations applied on pre-recorded videos.

### Continuous photo editing[​](#continuous-photo-editing "Direct link to Continuous photo editing")

AR effect is processed in real-time on the image. E.g. beautification slider to control the face modification or "Before/After" slider.

### Touches[​](#touches "Direct link to Touches")

Small AR scenarios enabled thought the user touches on the screen. AR objects or camera effects can change color and behaviour. Applied in FaceAR games or interactive face filters to increase engagement.

### Trigger[​](#trigger "Direct link to Trigger")

Small AR scenarios enabled through user facial expressions. The user can interact with effects or call them opening mouth, smiling, raising eyebrows or frowning. Applied in FaceAR games or interactive face filters to increase engagement.

### SFX[​](#sfx "Direct link to SFX")

Sound effects support in FaceAR experiences, e.g. add music to filters.

### Glasses detection[​](#glasses-detection "Direct link to Glasses detection")

The algorithm detects if the user wears glasses and removes them in a virtual AR 3D Mask. Applied in glasses try-on for convenient frame choice and face filters for AR glasses would not overlay the real glasses.

### Glasses frame color[​](#glasses-frame-color "Direct link to Glasses frame color")

Detection of the color of the glasses that the person is wearing.

## Graphical technologies[​](#graphical-technologies "Direct link to Graphical technologies")

### Face beautification[​](#face-beautification "Direct link to Face beautification")

The AR filter based on face tracking which automatically retouches the appearance applying skin smooth, morphing, eye makeup, teeth whitening, eye flare and LUT effect.

### Morphing[​](#morphing "Direct link to Morphing")

Changing the size and proportions of the face, e.g. slim down the cheeks, nose or modify them for fun AR 3D Masks.

### Skinned mesh animation[​](#skinned-mesh-animation "Direct link to Skinned mesh animation")

AR models look not static but moving, animated and transforming.

### Physically-based rendering[​](#physically-based-rendering "Direct link to Physically-based rendering")

AR models behave like the real objects in the flow of real-world light and physics, e.g. support gravity or mirror the light with the camera rotates and user tilts.

### LUT post-processing[​](#lut-post-processing "Direct link to LUT post-processing")

Real-time or offline color correction of pre-recorded images, e.g. Instagram-like filters.

### Texture sequences[​](#texture-sequences "Direct link to Texture sequences")

The digital representation of the surface of an AR object providing the sophisticated and life-like object representation.

### Video textures[​](#video-textures "Direct link to Video textures")

Infuse a static image with dynamic qualities and explicit action to achieve an enhanced look and feel of the FaceAR video experience.

### Action units[​](#action-units "Direct link to Action units")

The fundamental actions of individual muscles or groups of muscles of the face that enable the AR 3D Mask to support user facial expressions, e.g. in emojis, avatars or full-face AR 3D Masks.

### Lips shine, gloss, chameleon[​](#lips-shine-gloss-chameleon "Direct link to Lips shine, gloss, chameleon")

Effects simulating lipstick/lip gloss in several texture types: shine, gloss, & chameleon respectively.

### Eyelids gloss, chameleon[​](#eyelids-gloss-chameleon "Direct link to Eyelids gloss, chameleon")

Effects simulating eyeshadow in several texture types: shine, gloss, and chameleon.

### Light correction[​](#light-correction "Direct link to Light correction")

Automaatic correction of lighting to make the image/video feed look more aesthetically pleasing
