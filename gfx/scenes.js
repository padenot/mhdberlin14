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

function shift_param_buffer(array, new_val_y0, new_val_y1, decay) {
    var param_buf = gfx.geometries.param_buffers[0].param_buffer;
    for (var i = 1; i < param_buf.length/2; ++i) {
        param_buf[i*2]   = param_buf[(i-1)*2] * decay;
        param_buf[i*2+1] = param_buf[(i-1)*2+1] * decay;
    }
    param_buf[0] = new_val_y0;
    param_buf[1] = new_val_y1;
}

function scenes_init() {
    gfx.scenes = {
        test: {
            passes: [
                {
                  //render_to: {color: textures.buildings},
                  render: draw_mesh(gfx.geometries.quad),
                  program: gfx.programs.background
                },
                {
                    render: draw_mesh_list(gfx.geometries.param_buffers, DISABLE_DEPTH_TEST),
                    program: gfx.programs.lines1,
                    update: function(times) {
                        var param_buf = gfx.geometries.param_buffers[0].param_buffer;
                        var t = times.demo;
                        shift_param_buffer(param_buf, Math.sin(t/10), Math.sin(t/10)*3.0, 0.8);
                        upload_param_buffer(gfx.geometries.param_buffers[0]);
                        gfx.uniforms.u_float_param_0 = 0.2 + 0.1*Math.sin(t/12.0);
                    }
                },
            ]
        }
    }

    gfx.current_scene = gfx.scenes.test;
}
