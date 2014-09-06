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

function shift_param_buffer(array, new_val_y0, new_val_y1, chicken, param) {
    for (var i = 1; i < array.length/4; ++i) {
        var d1 = array[(i-1)*4] - array[i*4];
        var d2 = array[(i-1)*4+2] - array[i*4+2];
        array[i*4]   += d1 * chicken;
        array[i*4+1] = param;
        array[i*4+2] += d2 * chicken;
        array[i*4+3] = param;
    }
    array[0] = new_val_y0;
    array[2] = new_val_y1;
    array[1] = param;
    array[3] = param;
    assert(param <= 1.5);
}

var crazy_spin_factor = 2.0;
var crazy_spin_speed = 1000.0;

var more_crazy_spin_factor = 10.0;
var more_crazy_spin_speed = 10.0;

var yet_another_param_to_shake_things_up = 10;
var yet_another_param_to_shake_things_up_speed = 20;

var camera_shakiness = 100.0;
var camera_radius = 0.5;

function scenes_init() {

    gfx.programs.uv = load_shader_program("uv-vs", "uv-fs");
    gfx.programs.lines1 = load_shader_program("lines1-vs", "lines1-fs");
    gfx.programs.background = load_shader_program("uv-vs", "background-fs");
    gfx.programs.textured = load_shader_program("uv-vs", "textured-fs");

    gfx.geometries.param_buffers = [];
    var id = 0;
    gfx.geometries.param_buffers.push(
        create_param_line_geom(id++),
        create_param_line_geom(id++),
        create_param_line_geom(id++),
        create_param_line_geom(id++),
        create_param_line_geom(id++),
        create_param_line_geom(id++),
        create_param_line_geom(id++),
        create_param_line_geom(id++),
        create_param_line_geom(id++),
        create_param_line_geom(id++),
        create_param_line_geom(id++),
        create_param_line_geom(id++),
        create_param_line_geom(id++),
        create_param_line_geom(id++),
        create_param_line_geom(id++),
        create_param_line_geom(id++),
        create_param_line_geom(id++),
        create_param_line_geom(id++),
        create_param_line_geom(id++),
        create_param_line_geom(id++),
        create_param_line_geom(id++),
        create_param_line_geom(id++),
        create_param_line_geom(id++),
        create_param_line_geom(id++),
        create_param_line_geom(id++)
    );

    gfx.textures.intermediate = create_texture();

    gfx.scenes = {
        test: {
            passes: [
                {
                  //render_to: {color: gfx.textures.intermediate},
                  render: draw_mesh(gfx.geometries.quad),
                  program: gfx.programs.background
                },
                {
                    render: draw_mesh_list(gfx.geometries.param_buffers, DISABLE_DEPTH_TEST),
                    program: gfx.programs.lines1,
                    update: function(times) {
                        for (var i = 0; i < gfx.geometries.param_buffers.length; ++i) {
                            var param = params_for_visualization[i] * 0.01;
                            if (param) {
                                console.log("param "+i+": "+param);
                            }

                            var param_buf = gfx.geometries.param_buffers[i].param_buffer;
                            var t = times.demo;
                            var twist = yet_another_param_to_shake_things_up*Math.sin(t/yet_another_param_to_shake_things_up_speed)
                            shift_param_buffer(param_buf,
                                Math.sin(t*param) + crazy_spin_factor*twist+2*twist*Math.sin(t/crazy_spin_speed)
                                                  + more_crazy_spin_factor * Math.sin(t/more_crazy_spin_speed),
                                Math.sin(t*param) + crazy_spin_factor*(twist+2)+2*(twist+2)*Math.sin(t/crazy_spin_speed)
                                                  + more_crazy_spin_factor * Math.sin(t/more_crazy_spin_speed),
                                0.15,
                                param
                            );
                            upload_param_buffer(gfx.geometries.param_buffers[i]);
                            gfx.uniforms.u_cam_pos = [
                                camera_radius*Math.cos(t/camera_shakiness),
                                camera_radius*Math.sin(t/camera_shakiness),
                            ]
                        }
                        gfx.uniforms.u_float_param_0 = 0.2 + 0.1*Math.sin(t/(i+2));
                    }
                },
            ]
        }
    }

    gfx.current_scene = gfx.scenes.test;
}
