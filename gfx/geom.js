
function geom_init() {

    gfx.geometries.quad = create_geom({
        positions: [
          -1, -1,  0, // 1\
          -1,  1,  0, // | \
           1, -1,  0, // 0--2

           1, -1,  0, // 4--5
          -1,  1,  0, //  \ |
           1,  1,  0, //   \3
        ],
        uvs: [
          0.0, 0.0,
          0.0, 1.0,
          1.0, 0.0,

          1.0, 0.0,
          0.0, 1.0,
          1.0, 1.0,
        ]
    });

}



var PARAM_MAX = 20;
function create_param_line_geom(id) {
    var positions = [];
    var y0 = 0.0;
    var y1 = 1.0;
    var z = id;
    for (var i = 0; i < PARAM_MAX; ++i) {
        var x0 = i/PARAM_MAX;
        positions.push(x0, y0, z);
        positions.push(x0, y1, z);
    }

    var param_buffer = new Float32Array(positions.length/3 * 2);
    for (var i = 0; i < param_buffer.length; ++i) {
        param_buffer[i] = 1.0;
    }
    return {
        param_buffer: param_buffer,
        buffers: [
            make_vbo(gfx.PARAM_BUF, param_buffer),
            make_vbo(gfx.POS, positions),
        ],
        mode: gl.TRIANGLE_STRIP,
        vertex_count: positions.length/3,
    }
}

function upload_param_buffer(line_geom) {
    var vbo = line_geom.buffers[0].vbo;
    assert(vbo);
    assert(line_geom.param_buffer, "Trying to upload the param buffer on a geometry that doesnt have one.");

    check_nan(line_geom.param_buffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, line_geom.param_buffer, gl.DYNAMIC_DRAW);
    gl_error();
}