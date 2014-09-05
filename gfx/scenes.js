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
    for (var i = 1; i < array.length/2; ++i) {
        var d1 = array[(i-1)*2] - array[i*2];
        var d2 = array[(i-1)*2+1] - array[i*2+1];
        array[i*2]   += d1 * decay;
        array[i*2+1] += d2 * decay;
    }
    array[0] = new_val_y0;
    array[1] = new_val_y1;
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
                        for (var i = 0; i < gfx.geometries.param_buffers.length; ++i) {
                            var param_buf = gfx.geometries.param_buffers[i].param_buffer;
                            var t = times.demo;
                            var twist = 5*Math.sin(t/20)
                            shift_param_buffer(param_buf,
                                2*twist+2*twist*Math.sin(t/10),
                                2*(twist+2)+2*(twist+2)*Math.sin(t/10),
                                0.3
                            );
                            upload_param_buffer(gfx.geometries.param_buffers[i]);
                        }
                        gfx.uniforms.u_float_param_0 = 0.2 + 0.1*Math.sin(t/(i+2));
                    }
                },
            ]
        }
    }

    gfx.current_scene = gfx.scenes.test;
}
