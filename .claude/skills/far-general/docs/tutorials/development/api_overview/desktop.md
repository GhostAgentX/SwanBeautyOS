# desktop

**Banuba SDK** for **desktop** can be divided into three main entities: `input`, `player` and `output`.
The plethora of input options multiplied by the plethora of output options covers many use cases.

## Basic Player API interfaces:
* `bnb::player_api::interfaces::input` - receive frames and transfer them to the `player`.
* `bnb::player_api::interfaces::output` - presents frames on the surface or read in memory.
* `bnb::player_api::interfaces::player` - frames processing and rendering.
* `bnb::player_api::interfaces::render_target` - rendering context.
* `bnb::player_api::interfaces::render_delegate` - connection between the application rendering and `player` rendering.

## Input

Processes frames from one of the producers:
* `bnb::player_api::live_input` - live stream with the ability to skip frames.
* `bnb::player_api::photo_input` - photo or image.
* `bnb::player_api::stream_input` - stream without frames skipping.
* Custom - your own implementation for the `bnb::player_api::interfaces::input` interface.

## Output 

Presents a rendered frame onto one of the available surfaces:
* `bnb::player_api::opengl_frame_output` - array of pixels, should be used with `opengl_render_target`.
* `bnb::player_api::metal_frame_output` - array of pixels, should be used with `metal_render_target`.
* `bnb::player_api::texture_output` - **GPU** texture, texture type depends on the used `render_target`.
* `bnb::player_api::window_output` - window should work with the same **GAPI** as the used `render_target`.
* Custom - your own implementation for the `bnb::player_api::interfaces::output` interface.

## Player

* `bnb::player_api::player` - processes frames and applies effects.

## Render target

* `bnb::player_api::opengl_render_target` - **OpenGL** implementation for the `render_target`
* `bnb::player_api::metal_render_target` - **Metal** implementation for the `render_target`.

## Render delegate

This is always a custom implementation. To implement the interface, you need to inherit from
interface `bnb::player_api::interfaces::render_delegate` and override three methods:
* `activate()` - activating the rendering context, if necessary.
* `started()` - frame rendering has started. After this, `finished(...)` will be called.
* `finished(int64_t frame_number)` - frame rendering has ended. The frame number is any non-negative number. If `-1` is passed, then the frame rendering has failed.

## Input and output of user data
The **input** and the **output** can operate on a pixel buffer.
* `bnb::full_image_t` - provides access to an array of pixels as a byte buffer.
* `bnb::pixel_buffer_format` - pixel buffer format can be one of: `bpc8_rgb`, `bpc8_rgba`, `bpc8_bgr`,
`bpc8_bgra`, `bpc8_argb`, `i420`, `nv12`.

## Use cases

### live_input

Used to receive and subsequently process frames in real time. If a new frame is received and the
player has not yet processed the previous frame, the new frame will be skipped. Suitable for
receiving frames from a camera.

```cpp
#include <bnb/player_api/interfaces/input/live_input.hpp>
...
    // Creating an instance
    auto input = bnb::player_api::live_input::create();
...
    // Adding an input to the player
    player->use(input);
...
    // Somewhere in the loop
    auto frame = bnb::full_image_t::create_bpc8(...);
auto frame_time = get_my_current_timestamp_us();
// Pushing frame asynchronously into input
input.push(frame, frame_time);
```

### photo_input

Used for obtaining and subsequent processing of photographs.

```cpp
#include <bnb/player_api/interfaces/input/photo_input.hpp>
...
    // Creating an instance
    auto input = bnb::player_api::photo_input::create();
...
    // Adding an input to the player
    player->use(input);
... auto filepath = std::string("/path/to/the/photo.png");
// Somewhere where need to upload a photo
input.push(filepath);
```

### stream_input

Used to receive and subsequently process a stream of frames. Does not skip frames if the previous
frame is still not processed. Suitable for processing video streams.

```cpp
#include <bnb/player_api/interfaces/input/stream_input.hpp>
...
    // Creating an instance
    auto input = bnb::player_api::stream_input::create();
...
    // Adding an input to the player
    player->use(input);
...
    // Somewhere in the loop
    auto frame = bnb::full_image_t::create_bpc8(...);
auto frame_time = get_my_video_timestamp_us();
// Pushing frame synchronously into input
input.push(frame, frame_time);
```

### Custom input

A custom **input** is needed if the standard implementation does not contain the required logic.

```cpp
#include <bnb/player_api/interfaces/input.hpp>
#include <bnb/types/interfaces/all.hpp>

class my_custom_input : public bnb::player_api::interfaces::input
{
public:
    my_custom_input()
    {
        auto config = bnb::interfaces::processor_configuration::create();
        m_frame_processor = bnb::interfaces::frame_processor::create_video_processor(config);
    }

    void my_custom_push_method(...)
    {
        m_timestamp_us = get_timestamp();
        auto fi = bnb::full_image_t::create_bpc8(...); // create an RGB image
        auto fd = bnb::interfaces::frame_data::create();
        fd->add_full_img(fi);
        fd->add_timestamp_us(m_timestamp_us);
        m_frame_processor->push(fd);
    }

    frame_processor_sptr get_frame_processor() const noexcept override
    {
        return m_frame_processor;
    }

    uint64_t get_frame_time_us() const noexcept override
    {
        return m_timestamp_us;
    }

private:
    bnb::player_api::frame_processor_sptr m_frame_processor;
    uint64_t m_timestamp_us;
};
```

### opengl_frame_output

Allows you to receive the processing result frames as an array of pixels
in the desired format and orientation.

:::warning Important
`opengl_frame_output` only works in conjunction with `opengl_render_target`.
:::

```cpp
#include <bnb/player_api/interfaces/output/opengl_frame_output.hpp>
...
    // Creating an instance
    auto output = bnb::player_api::opengl_frame_output::create([](const bnb::full_image_t& image) {
        // We work here with the resulting `image`
    },
                                                               bnb::pixel_buffer_format::bpc8_rgba);
output->set_orientation(bnb::orientation::left, true);
...
    // Adding an output to the player
    player->use(output);
```

### metal_frame_output

Allows you to receive the processing result frames as an array of pixels
in the desired format and orientation.

:::warning Important
`metal_frame_output` only works in conjunction with `metal_render_target` and it available only on `Apple` platform.
:::

```cpp
#include <bnb/player_api/interfaces/output/metal_frame_output.hpp>
...
    // Creating an instance
    auto output = bnb::player_api::metal_frame_output::create([](const bnb::full_image_t& image) {
        // We work here with the resulting `image`
    },
                                                              bnb::pixel_buffer_format::bpc8_rgba);
output->set_orientation(bnb::orientation::left, true);
...
    // Adding an output to the player
    player->use(output);
```

### texture_output

Allows you to get texture.

```cpp
#include <bnb/player_api/interfaces/output/texture_output.hpp>
...
    // Creating an instance
    auto output = bnb::player_api::texture_output::create([](const bnb::player_api::texture_t texture) {
        // We work here with the resulting `texture`
    });
...
    // Adding an output to the player
    player->use(output);
```

### window_output

Renders frames onto the window surface, at the specified location, and in the specified orientation.

```cpp
#include <bnb/player_api/interfaces/output/window_output.hpp>
...
    // Creating an instance with opengl_render_target
    auto output = bnb::player_api::window_output::create(nullptr);
...
    // Or creating an instance with metal_render_target
    CAMetalLayer* metal_layer = get_my_metal_layer();
// When using metal rendering, you need to pass the render layer.
auto output = bnb::player_api::window_output::create(static_cast<void*>(metal_layer));
...
    // Setup orientaion and mirroring
    output->set_orientation(bnb::orientation::left, true);
...
    // Adding an output to the player
    player->use(output);
...
    // Set the rendering size and position.
    output->set_frame_layout(position_left, position_top, render_width, render_height);
```

### Custom output

A custom **output** is needed if the standard implementation does not contain the required logic.

```cpp
#include <bnb/player_api/interfaces/output.hpp>
... class my_custom_output : public bnb::player_api_interfaces
{
public:
    void attach() override
    { /* output is attached to the player */
    }

    void detach() override
    { /* output is detached from the player */
    }

    void present(const bnb::player_api::render_target_sptr& render_target) override
    {
        // custom code
        ... render_target->present(position_left, position_top, render_width, render_height, my_orientaion_matrix_4x4);
    }
};
```

### full_image_t

Three functions are available to create images in different formats: 
* `bnb::full_image_t::create_bpc8` - for image formats `bpc8_rgb`, `bpc8_rgba`, `bpc8_bgr`, `bpc8_bgra`, `bpc8_argb`.
* `bnb::full_image_t::create_nv12` - for nv12 yuv images with `bt601` or `bt709` color standard and with `full` or `video` color range.
* `bnb::full_image_t::create_i420` - for i420 yuv images with `bt601` or `bt709` color standard and with `full` or `video` color range.

```cpp
#include <bnb/types/full_image.hpp>
...
    // creating RGB image
    auto rgb_image = bnb::full_image_t::create_bpc8(
        rgb_image_data,                                     // uint8_t* raw pointer to image data
        width * 3,                                          // rgb image stride.
        width,                                              // width of the image
        height,                                             // height of the image
        bnb::pixel_buffer_format::bpc8_rgb,                 // image format
        bnb::orientation::up,                               // image orientation
        false,                                              // image mirroring
        [](uint8_t* data) { /* deleting the image data */ } // deleter of the image data
    );
```

Retrieving image data:

```cpp
#include <bnb/types/full_image.hpp>
...
    // Getting RGB image data
    auto rgb_image = bnb::full_image_t::create_bpc8(...);
uint8_t* rgb_image_bytes = rgb_image.get_base_ptr_of_plane(0);
int32_t width = rgb_image.get_width_of_plane(0);
int32_t height = rgb_image.get_height_of_plane(0);
int32_t stride = rgb_image.get_bytes_per_row_of_plane(0);
```

### player

The **player** requests frames from the input, then processes those frames using the Banuba SDK and
passes the results to one or more outputs. Default frame processing in Banuba SDK works automatically.
If you wish, you can enable on-demand processing.

```cpp
#include <bnb/player_api/interfaces/player/player.hpp>
... auto fps = 30;
auto render_target = /* render target */;
auto renderer = /* my custom renderer */
    // Creating an instance
    auto player = bnb::player_api::player::create(fps, render_target, renderer);
...
    // Configuring the player and loading the effect
    player->use(/* some input */)
        .use(/* some output */)
        .use(/* some output */);
player->load_async(/* path to the effect */);
```

### opengl_render_target

The render target allows the player to render frames processed by the player onto outputs using
OpenGL technology.

:::warning Important
`opengl_render_target` only works with OpenGL based outputs.
:::

```cpp
#include <bnb/player_api/interfaces/render_target/opengl_render_target.hpp>
...
    // Creating an instance
    auto render_target = bnb::player_api::opengl_render_target::create();
...
    // Attach render target to the player
    auto player = bnb::player_api::player::create(/* fps value */, render_target, /* some renderer */);
```

### metal_render_target

The render target allows the player to render frames processed by the player onto outputs using
OpenGL technology.

:::warning Important
`metal_render_target` only works with METAL based outputs.
:::

```cpp
#include <bnb/player_api/interfaces/render_target/metal_render_target.hpp>
...
    // Creating an instance
    auto render_target = bnb::player_api::metal_render_target::create();
...
    // Attach render target to the player
    auto player = bnb::player_api::player::create(/* fps value */, render_target, /* some renderer */);
```

### Custom render delegate

Necessary for connecting the **player** and application in the context of rendering.

```cpp
class my_custom_renderer : public bnb::player_api::interfaces::render_delegate
{
public:
    my_custom_renderer()
    {
    }

    void activate() override
    { /* make context current */
    }

    void started() override
    { /* frame rendering started */
    }

    void finished(int64_t frame_number) override
    { /* frame rendering finished */
    }
};
```
