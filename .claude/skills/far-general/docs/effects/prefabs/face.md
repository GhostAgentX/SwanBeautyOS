# On Face Prefabs

## GLTF[​](#gltf "Direct link to GLTF")

```
"faces": [
    {
        "gltf": {
            "@mesh": "path/to/gltf/model",
            "rotation": "0 0 0",
            "scale": "1.0 1.0 1.0",
            "translation": "0.0 0.0 0.0",
            "animation": {
                "name": "Animation 1",
                "mode": "loop",
                "seek_position": 100
            },
            "@use_physics": false,
            "gravity": "0.0 -1000.0 0.0",
            "bones": {
                "bone_1": 1.0,
                "bone_2": 0.0,
                "bone_3": 1.0,
                "bone_4": 0.0,
                "bone_5": 1.0
            },
            "colliders": [
                {
                    "center": "0. 0. 0.",
                    "radius": 100.0
                },
                {
                    "center": "10. 110. 420.",
                    "radius": 650.0
                },
                {
                    "center": "14. 300. 156.",
                    "radius": 10.0
                }
            ],
            "constraints": [
                {
                    "from": "bone_1",
                    "to": "bone_2",
                    "distance": 10.0
                },
                {
                    "from": "bone_2",
                    "to": "bone_3",
                    "distance": 50.0
                },
                {
                    "from": "bone_3",
                    "to": "bone_4",
                    "distance": 30.0
                },
                {
                    "from": "bone_4",
                    "to": "bone_5",
                    "distance": 60.0
                }
            ],
            "damping": 0.99
        }
        // ...
    }
    // ...
]
```

Place a 3D model in the GLTF format on the face.

| Parameter      | Description                                                                                                                                                                                                                                                                                                                                                                                                      |                           Optional                           | Default Value |
| :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------: | :-----------: |
| `@mesh`        | Path to a GLTF model. Note the leading `@` in the parameter, it is mandatory. Supported formats: `.glb`, `.gltf`. Note that all included files, such as GLTF model, shaders, textures, sounds (if there are any), must be located in one folder.                                                                                                                                                                 |                              *+*                             |      *+*      |
| `rotation`     | Rotation angles (in degrees) over *X*, *Y*, *Z* axes. Note the default value.                                                                                                                                                                                                                                                                                                                                    | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |  `"-90 0 0"`  |
| `scale`        | Scale along X, Y, Z axes.                                                                                                                                                                                                                                                                                                                                                                                        | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |   `"1 1 1"`   |
| `translation`  | Translate the model along *X*, *Y*, *Z* axes (in millimetres).                                                                                                                                                                                                                                                                                                                                                   | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |   `"0 0 0"`   |
| `animation`    | Play animation from GLTF file. **All keys are optional** (in most cases just empty object is enough to play the default animation).*Parameters:*`name` - Select animation from file by name.`seek_position` - Where to start animation relatively from the start position (in ms).`mode` - (`"off"` \| `"loop"` \| `"once"` \| `"once_reversed"` \| `"fixed"`) - how to play the animation selected by `"name"`. | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |      `{}`     |
| `@use_physics` | Load GLTF with physics simulation. Note the leading `@` in the parameter, it is mandatory.                                                                                                                                                                                                                                                                                                                       | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |    `false`    |
| `gravity`      | Sets gravitation vector along *X*, *Y*, *Z* axes.                                                                                                                                                                                                                                                                                                                                                                | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |   `"0 0 0"`   |
| `bones`        | Sets bones inversed mass. Object, where key is a name of bone and parameter is an inversed mass.                                                                                                                                                                                                                                                                                                                 | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |      `[]`     |
| `colliders`    | Add sphere colliders for physical bones. Array of objects, each object is a separate collider.*Parameters:*`center` - *X*, *Y*, *Z* coordinates of the center of sphere.`radius` - float radius of the sphere.                                                                                                                                                                                                   | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |      `[]`     |
| `constraints`  | Add constraint between two bones. Array of objects, each object is a one constraint.*Parameters:*`from` - "from" bone name.`to` - "t" bone name.                                                                                                                                                                                                                                                                 | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |      `[]`     |
| `damping`      | Damping parameter for physics simulation, good values usually are in \[0.9-1.0] range.                                                                                                                                                                                                                                                                                                                           | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.99`    |

note

To create a 3D model in GLTF format for use in the effect, it is recommended to use our [head geometry](/assets/files/head-a7e3b48b08e13d5c85ae83246dbe64cb.glb) as a template. If the model is created without our head geometry, it the scale must be set to `0.1` and the rotation set to `-90` degrees over the `X axis` in the prefab.

## Video Texture[​](#video-texture "Direct link to Video Texture")

```
"faces": [
    {
        "video_texture": {
            "@mesh": "path/to/gltf/model",
            "use_separate_alpha": true,
            "video": "path/to/video/texture",
            "alpha": "path/to/video/texture/alpha",
            "rotation": "0 0 0",
            "scale": "1.0 1.0 1.0",
            "translation": "0.0 0.0 0.0",
        }
        // ...
    }
    // ...
]
```

| Parameter            | Description                                                                                                                                                                                                                                                                                                                                               |                           Optional                           | Default Value |
| :------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------: | :-----------: |
| `@mesh`              | Path to a GLTF model. Note the leading `@` in the parameter, it is mandatory. Supported formats: `.glb`, `.gltf`. Plane quad is set by default.                                                                                                                                                                                                           | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |      \`\`     |
| `use_separate_alpha` | If provided video will be combined (common video on the left and video's alpha on the right) this field must be set to `false`. If there will be two separate videos (common video and alpha) this field must be set to `true`.                                                                                                                           |                              *+*                             |      *+*      |
| `video`              | Path to a video texture file. Note that if use\_separate\_alpha is set to `false`, this video must be split in half: left is the common video and right is the video's alpha. Information about supported formats can be find here [video formats](https://docs.banuba.com/far-sdk/tutorials/capabilities/technical_specification#video-formats-support). |                              *+*                             |      *+*      |
| `alpha`              | Path to a video texture alpha file. Note that if use\_separate\_alpha is set to `true`, this video will be used as the alpha for the video. Information about supported formats can be find here [video formats](https://docs.banuba.com/far-sdk/tutorials/capabilities/technical_specification#video-formats-support).                                   | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |      \`\`     |
| `rotation`           | Rotation angles (in degrees) over *X*, *Y*, *Z* axes. Note the default value.                                                                                                                                                                                                                                                                             | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |  `"-90 0 0"`  |
| `scale`              | Scale along *X*, *Y*, *Z* axes.                                                                                                                                                                                                                                                                                                                           | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |   `"1 1 1"`   |
| `translation`        | Translate the model along *X*, *Y*, *Z* axes (in millimetres).                                                                                                                                                                                                                                                                                            | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |   `"0 0 0"`   |

## Earrings[​](#earrings "Direct link to Earrings")

```
"faces": [
    {
        "earrings": {
            "@mesh_left": "path/to/left/gltf/model",
            "@mesh_right": "path/to/right/gltf/model",
            "@use_physics": true,
            "left": {
                "scale": "1 1 1",
                "rotation": "0 0 0",
                "translation": "0 0 0",
                "animation": {
                    "name": "static",
                    "mode": "fixed"
                },
                "gravity": "0.0 -1800.0 0.0",
                "damping": 0.99,
                "bones": {
                    "Bone_L_1": 0.0,
                    "Bone_L_2": 1.0,
                    "Bone_L_3": 1.0,
                    "Bone_L_4": 1.0,
                    "Bone_L_5": 1.0
                }
            },
            "right": {
                "scale": "1 1 1",
                "rotation": "0 0 0",
                "translation": "0 0 0",
                "animation": {
                    "name": "static",
                    "mode": "fixed"
                },
                "gravity": "0.0 -1800.0 0.0",
                "damping": 0.99,
                "bones": {
                    "Bone_R_1": 0.0,
                    "Bone_R_2": 1.0,
                    "Bone_R_3": 1.0,
                    "Bone_R_4": 1.0,
                    "Bone_R_5": 1.0
                }
            },
            "bones_in_mv_space": false
        }
        // ...
    }
    // ...
]
```

Place two 3D models of earring in GLTF format on the each ear.

| Parameter      | Description                                                                                                                                                                                                                                                                                                                                                                                                       |                           Optional                           | Default Value |
| :------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------: | :-----------: |
| `@mesh_left`   | Path to the left earring GLTF model. Note the leading `@` in the parameter, it is mandatory. Supported formats: `.glb`, `.gltf`. Note that all included files, such as GLTF model, shaders, textures, sounds (if there are any), must be located in one folder.                                                                                                                                                   |                              *+*                             |      *+*      |
| `@mesh_right`  | Path to the right earring GLTF model. Note the leading `@` in the parameter, it is mandatory. Supported formats: `.glb`, `.gltf`. Note that all included files, such as GLTF model, shaders, textures, sounds (if there are any), must be located in one folder.                                                                                                                                                  |                              *+*                             |      *+*      |
| `@use_physics` | Load GLTF models with physics simulation. Note the leading `@` in the parameter, it is mandatory.                                                                                                                                                                                                                                                                                                                 | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `true`    |
| `left`         | Container of params for the left earring.                                                                                                                                                                                                                                                                                                                                                                         | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |  `undefined`  |
| `right`        | Container of params for the right earring.                                                                                                                                                                                                                                                                                                                                                                        | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |  `undefined`  |
| `scale`        | Sets scale along *X*, *Y*, *Z* axes.                                                                                                                                                                                                                                                                                                                                                                              | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |   `"1 1 1"`   |
| `rotation`     | Rotation angles (in degrees) over *X*, *Y*, *Z* axes.                                                                                                                                                                                                                                                                                                                                                             | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |   `"0 0 0"`   |
| `translation`  | Translate the model along *X*, *Y*, *Z* axes (in millimetres).                                                                                                                                                                                                                                                                                                                                                    | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |   `"0 0 0"`   |
| `animation`    | Play animation from GLTF files. **All keys are optional** (in most cases just empty object is enough to play the default animation).*Parameters:*`name` - Select animation from file by name.`seek_position` - Where to start animation relatively from the start position (in ms).`mode` - (`"off"` \| `"loop"` \| `"once"` \| `"once_reversed"` \| `"fixed"`) - how to play the animation selected by `"name"`. | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |      `{}`     |
| `gravity`      | Sets gravitation vector along *X*, *Y*, *Z* axes.                                                                                                                                                                                                                                                                                                                                                                 | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |   `"0 0 0"`   |
| `bones`        | It sets the bones' inverse mass. The object, where the key is the bone's name and the parameter is the inverse mass.                                                                                                                                                                                                                                                                                              | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |      `[]`     |
| `damping`      | Damping parameter for physics simulation, good values usually are in \[0.9-1.0] range.                                                                                                                                                                                                                                                                                                                            | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.99`    |

## Action Units[​](#action-units "Direct link to Action Units")

```
"faces": [
    {
        "action_units": {},
        // ...
    }
    // ...
]
```

Enable action units from a GLTF model.

## Eyes Whitening[​](#eyes-whitening "Direct link to Eyes Whitening")

**Usage**

```
"faces": [
    {
        "eyes_whitening": {
            "strength": 1.0
        }
        // ...
    }
    // ...
]
```

Makes the look more expressive by whitening the eyes.

| Parameter  | Description                                             | Optional | Default Value |
| :--------- | :------------------------------------------------------ | :------: | :-----------: |
| `strength` | Eyes whitening. Float number in the range `[0.0, 1.0]`. |    *+*   |      *+*      |

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/EyesWhitening-53c06893890dff12356d60e292ee7b23.jpg)

Drag

## Eyes Flare[​](#eyes-flare "Direct link to Eyes Flare")

**Usage**

```
"faces": [
    {
        "eyes_flare": {
            "strength": 1.0
        }
        // ...
    }
    // ...
]
```

Apply flare to the eyes.

| Parameter  | Description                                               | Optional | Default Value |
| :--------- | :-------------------------------------------------------- | :------: | :-----------: |
| `strength` | Flare brightness. Float number in the range `[0.0, 1.0]`. |    *+*   |      *+*      |

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/EyesFlare-aaa9dfc2204ee98f6874e0556099d0c8.jpg)

Drag

## Teeth Whitening[​](#teeth-whitening "Direct link to Teeth Whitening")

**Usage**

```
"faces": [
    {
        "teeth_whitening": {
            "strength": 1.0
        }
        // ...
    }
    // ...
]
```

Apply whitening to the teeth.

| Parameter  | Description                                              | Optional | Default Value |
| :--------- | :------------------------------------------------------- | :------: | :-----------: |
| `strength` | Teeth whitening. Float number in the range `[0.0, 1.0]`. |    *+*   |      *+*      |

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/teeth-ad89bfabc20c76750c21b2348693680b.jpg)

Drag

## Softlight[​](#softlight "Direct link to Softlight")

**Usage**

```
"faces": [
    {
        "softlight": {
            "strength": 1.0,
            "texture": "path/to/file"
        }
        // ...
    }
    // ...
]
```

Apply softlight to the face.

| Parameter  | Description                                                 |                           Optional                           | Default Value |
| :--------- | :---------------------------------------------------------- | :----------------------------------------------------------: | :-----------: |
| `strength` | Softlight strength. Float number in the range `[0.0, 1.0]`. |                              *+*                             |      *+*      |
| `texture`  | Path to custom softlight texture.                           | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |      \`\`     |

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/SkinSoftening-e7800133c7d654b8372366266bdbf026.jpg)

Drag

## Morphing[​](#morphing "Direct link to Morphing")

Morph (i.e. deform) certain parts of the face.

**Usage**

```
"faces": [
    {
        "morphing": {
            "eyebrows": {
                "spacing": 0.6,
                "height": 0.1,
                "bend": 1.0
            },
            "eyes": {
                "rounding": 0.6,
                "enlargement": 0.3,
                "height": 0,
                "spacing": 0.3,
                "squint": 0.3,
                "lower_eyelid_pos": 0,
                "lower_eyelid_size": 0,
                "down": 0,
                "eyelid_upper": 0,
                "eyelid_lower": 0
            },
            "face": {
                "narrowing": 0,
                "v_shape": 0,
                "cheekbones_narrowing": 0,
                "cheeks_narrowing": 0,
                "jaw_narrowing": 0,
                "chin_shortening": 0.3,
                "chin_narrowing": 0,
                "sunken_cheeks": 0.0,
                "cheeks_jaw_narrowing": 0,
                "jaw_wide_thin": 0,
                "chin": 0,
                "forehead": 0.3
            },
            "nose": {
                "width": 0.3,
                "length": 0.2,
                "tip_width": 0.1,
                "down_up": 0.1,
                "sellion": 0.2
            },
            "lips": {
                "size": 0.4,
                "height": 1.0,
                "thickness": 0.1,
                "mouth_size": 0.2,
                "smile": 0.8,
                "shape": 0.4,
                "sharp": 0.6
            }
        }
        // ...
    }
    // ...
]
```

All settings are optional.

### Eyebrows[​](#eyebrows "Direct link to Eyebrows")

| Parameter      | Description                                          |                           Optional                           | Default Value |
| :------------- | :--------------------------------------------------- | :----------------------------------------------------------: | :-----------: |
| `spacing`      | Adjusting the space between the eyebrows *\[-1; 1]*. | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |
| `heightheight` | Raising/lowering the eyebrows *\[-1; 1]*.            | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |
| `bend`         | Adjusting the bend of the eyebrows *\[-1; 1]*.       | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |

### Eyes[​](#eyes "Direct link to Eyes")

| Parameter           | Description                                                   |                           Optional                           | Default Value |
| :------------------ | :------------------------------------------------------------ | :----------------------------------------------------------: | :-----------: |
| `rounding`          | Adjusting the roundness of the eyes *\[0; 1]*.                | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |
| `enlargement`       | Enlarging the eyes *\[0; 1]*.                                 | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |
| `height`            | Raising/lowering the eyes *\[-1; 1]*.                         | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |
| `spacing`           | Adjusting the space between the eyes *\[-1; 1]*.              | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |
| `squint`            | Making the person squint by adjusting the eyelids *\[-1; 1]*. | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |
| `lower_eyelid_pos`  | Raising/lowering the lower eyelid *\[-1; 1]*.                 | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |
| `lower_eyelid_size` | Enlarging/shrinking the lower eyelid *\[-1; 1]*.              | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |
| `down`              | Eyes down *\[0; 1]*.                                          | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |
| `eyelid_upper`      | Eyelid upper *\[0; 1]*.                                       | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |
| `eyelid_lower`      | Eyelid lower *\[0; 1]*.                                       | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |

### Face[​](#face "Direct link to Face")

| Parameter                  | Description                                                  |                           Optional                           | Default Value |
| :------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------: | :-----------: |
| `narrowing`                | Narrowing the face *\[0; 1]*.                                | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |
| `v_shape`                  | Shrinking the chin and narrowing the cheeks *\[0; 1]*.       | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |
| `cheekbones_narrowing`     | Narrowing the cheekbones *\[-1; 1]*.                         | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |
| `cheeks_narrowing`         | Narrowing the cheeks *\[0; 1]*.                              | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |
| `jaw_narrowing`            | Narrowing the jaw *\[0; 1]*.                                 | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |
| `chin_shortening`          | Decreasing the length of the chin *\[0; 1]*.                 | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |
| `chin_narrowing`           | Narrowing the chin *\[0; 1]*.                                | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |
| `sunken_cheeks`            | Sinking the cheeks and emphasizing the cheekbones *\[0; 1]*. | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |
| `cheeks_and_jaw_narrowing` | Narrowing the cheeks and the jaw *\[0; 1]*.                  | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |
| `jaw_wide_thin`            | Jaw wide/thin *\[0; 1]*.                                     | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |
| `chin`                     | Face chin *\[0; 1]*.                                         | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |
| `forehead`                 | Forehead *\[0; 1]*.                                          | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |

### Nose[​](#nose "Direct link to Nose")

| Parameter   | Description                             |                           Optional                           | Default Value |
| :---------- | :-------------------------------------- | :----------------------------------------------------------: | :-----------: |
| `width`     | Adjusting the nose width *\[-1; 1]*.    | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |
| `length`    | Adjusting the nose length *\[-1; 1]*.   | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |
| `tip_width` | Adjusting the nose tip width *\[0; 1]*. | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |
| `down_up`   | Nose down/up *\[0; 1]*.                 | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |
| `sellion`   | Nose sellion *\[0; 1]*.                 | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |

### Lips[​](#lips "Direct link to Lips")

| Parameter    | Description                                                   |                           Optional                           | Default Value |
| :----------- | :------------------------------------------------------------ | :----------------------------------------------------------: | :-----------: |
| `size`       | Adjusting the width and vertical size of the lips *\[-1; 1]*. | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |
| `height`     | Raising/lowering the lips *\[-1; 1]*.                         | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |
| `thickness`  | Adjusting the thickness of the lips *\[-1; 1]*.               | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |
| `mouth_size` | Adjusting the size of the mouth *\[-1; 1]*.                   | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |
| `smile`      | Making a person smile *\[0; 1]*.                              | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |
| `shape`      | Adjusting the shape of the lips *\[-1; 1]*.                   | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |
| `sharp`      | Lips sharp *\[0; 1]*.                                         | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |     `0.0`     |

**Preview**

![Right image compare](/assets/images/original2-f74f044be90519e96c2b58b2db7ddce2.jpg)![Left image compare](/assets/images/morphing-92a63912987e8ddc904b6bf20cbea396.jpg)

Drag

## Eyes[​](#eyes-1 "Direct link to Eyes")

Eyes recoloring.

**Usage**

```
"faces": [
    {
        "eyes": {
            "eyes": "0 0.2 0.8 0.64",
            "corneosclera": "1 1 1 1",
            "pupil": "0 0 0 1"
        }
        // ...
    }
    // ...
]
```

| Parameter      | Description                                                |                           Optional                           | Default Value |
| :------------- | :--------------------------------------------------------- | :----------------------------------------------------------: | :-----------: |
| `eyes`         | Eyes (i.e. iris) color. See note about color format above. | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |   `"0 0 0"`   |
| `corneosclera` | Corneosclera ("sclera" in everyday language) color.        | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |   `"0 0 0"`   |
| `pupil`        | Pupil color. See note about color format above.            | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |   `"0 0 0"`   |

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/eyes-c3613cadd6bb4ebe4eccbf7084c669f5.jpg)

Drag

## Hair[​](#hair "Direct link to Hair")

Hair recoloring. Usually one parameter is used to set the hair color:

```
"faces": [
    {
        "hair": {
            "color": [
                "0.19 0.06 0.25 1.0"
            ]
        }
        // ...
    }
    // ...
]
```

But hair recoloring supports up to 5 parameters to make vertical colors gradient. Here is the example with 2 color parameters:

```
"faces": [
    {
        "hair": {
            "color": [
                "0.19 0.06 0.25 1.0",
                "0.09 0.25 0.38 1.0"
            ]
        }
        // ...
    }
    // ...
]
```

| Parameter | Description                                                                                                                                 |                           Optional                           | Default Value |
| :-------- | :------------------------------------------------------------------------------------------------------------------------------------------ | :----------------------------------------------------------: | :-----------: |
| `color`   | Apply solid color if one element supplied or gradient recoloring if array (like `stands` in the sample). See note about color format above. | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |  `"0 0 0 0"`  |

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/hair_colors-e5dc1a08bb938c142a4519d44206d47f.jpg)

Drag

## Hair Strands[​](#hair-strands "Direct link to Hair Strands")

Hair strands recoloring. Supports from 1 to 5 colors parameters to recolor different strands.

```
"faces": [
    {
        "hair_strands": {
            "color": [
                "0.80 0.40 0.40 1.0",
                "0.83 0.40 0.40 1.0",
                "0.85 0.75 0.75 1.0",
                "0.87 0.60 0.60 1.0",
                "0.99 0.65 0.65 1.0"
            ]
        }
        // ...
    }
    // ...
]
```

| Parameter | Description                                                                                                 |                           Optional                           | Default Value |
| :-------- | :---------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------: | :-----------: |
| `color`   | Apply colors to hair strands. Supports up to 5 different colors in array. You can also provide one element. | ![\`${props.title} icon\`](/img/icons/check.svg "Supported") |  `"0 0 0 0"`  |

**Preview**

![Right image compare](/assets/images/original-8823b66ca7c9e5a54656f6ee9b77c29f.jpg)![Left image compare](/assets/images/hair_strands-0a1cc04eb7f5482cef64a0567d00716f.jpg)

Drag
