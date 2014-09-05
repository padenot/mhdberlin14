var ENABLE_DEPTH_TEST = true;
var DISABLE_DEPTH_TEST = false;

function draw_mesh_list(list) {
    return function() {
        for (var i in list) {
            draw_geom(list[i]);
            var err = gl_error();
            if (err) {
                console.log(err);
            }
        }
    }
}

function scenes_init() {
    gfx.scenes = {
        test: {
            passes: [
                {
                  //render_to: {color: textures.buildings},
                  render: draw_mesh(gfx.geometries.quad),
                  program: gfx.programs.uv
                },
                {
                    render: draw_mesh_list(gfx.geometries.param_buffers, DISABLE_DEPTH_TEST),
                    program: gfx.programs.lines1,
                    update: function(times) {
                        var v = times.demo;
                        var param_buf = gfx.geometries.param_buffers[0].param_buffer;
                        for (i = 0; i < param_buf.length/2; ++i) {
                            v++;
                            param_buf[i*2] = Math.sin(v/10);
                            param_buf[i*2+1] = Math.sin(v/10)*3.0;
                        }
                        upload_param_buffer(gfx.geometries.param_buffers[0]);
                    }
                },
            ]
        }
    }

    gfx.current_scene = gfx.scenes.test;
}
