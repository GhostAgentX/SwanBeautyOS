# desktop

The steps below apply to desktop integration (**Windows** and/or **macOS**) with **C++**.

1. Download **Banuba SDK** binaries 
[from GitHub](https://github.com/Banuba/FaceAR-SDK-desktop-releases).

2. Integrate libraries downloaded on the previous step into your build system. 
If you use **CMake**, consider our 
[quickstart-desktop-cpp](https://github.com/Banuba/quickstart-desktop-cpp) sample. 

:::note for Windows
Besides the **Banuba SDK** itself, you will require third party libraries from the `bin` 
folder.
::: 

3. Create rendering context or copy and paste into your project 
[ready-to-use helpers](https://github.com/Banuba/quickstart-desktop-cpp/tree/master/helpers/src)
sources based on [GLFW](https://www.glfw.org/)

4. Setup `BNB_CLIENT_TOKEN` 
```cpp
#define BNB_CLIENT_TOKEN <#Place your token here#>
```

5. Initialize **Banuba SDK** with the **Client Token** and path to resources from the archive
with the binaries. Create `Player`, `Camera`, `Input` and `Output` and load the **effect**.

```cpp
#include <bnb/player_api/interfaces/render_target/metal_render_target.hpp>

using namespace bnb::interfaces;

namespace
{
    render_backend_type render_backend = BNB_APPLE ? render_backend_type::metal : render_backend_type::opengl;
}

int main()
{
    // Initialize BanubaSDK with token and paths to resources
    bnb::utility utility({bnb::sdk_resources_path(), BNB_RESOURCES_FOLDER}, BNB_CLIENT_TOKEN);
    // Create render delegate based on GLFW
    auto renderer = std::make_shared<GLFWRenderer>(render_backend);
    // Create render target
    bnb::player_api::render_target_sptr render_target;
    if (render_backend == render_backend_type::opengl) {
        render_target = bnb::player_api::opengl_render_target::create();
    } else if (render_backend == render_backend_type::metal) {
        render_target = bnb::player_api::metal_render_target::create();
    }
    // Create player
    auto player = bnb::player_api::player::create(30, render_target, renderer);
    // Create live input, for realtime camera
    auto input = bnb::player_api::live_input::create();
    // On-screen output
    auto window_output = bnb::player_api::window_output::create(renderer->get_native_surface());
    
    player->use(input).use(window_output);
    player->load_async("effects/TrollGrandma");

    // Create camera device input with callback
    // that is called when new frames are received.
    auto camera = bnb::create_camera_device([input](bnb::full_image_t image) {
        auto now_us = std::chrono::duration_cast<std::chrono::microseconds>(
            std::chrono::high_resolution_clock::now().time_since_epoch()
        ).count();
        input->push(image, now_us);
    }, 0);
    
    // Setup callbacks for glfw window
    renderer->get_window()->set_callbacks([window_output](uint32_t w, uint32_t h){
        window_output->set_frame_layout(0, 0, w, h);
    }, nullptr);
    
    // Run main loop
    renderer->get_window()->show_window_and_run_events_loop();
    return 0;
}
```
6. Run the application! 🎉 🚀 💅

:::info 
The **effects** are also resources, you may initialize **Banuba SDK** with several resource 
paths (one for effects and one for SDK assets).
:::

:::note for macOS
Resources for **MacOS** are inside `BanubaEffectPlayer.xcframework`.
:::