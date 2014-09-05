var gl

var gfx = {
  textures: {},
  uniforms: {},
  geometries: {},
  programs: {},
  locations: [
    "a_position",
    "a_uv",
    "a_normal",
    "a_color",
    "a_param_buf",
  ],
  POS: 0,
  UV: 1,
  NORMAL: 2,
  COLOR: 3,
  PARAM_BUF: 4,
  uniforms_names: [
    "u_vp_mat",
    "u_vp_mat_inv",
    "u_resolution",
    "u_light_pos",
    "u_texture_0",
    "u_texture_1",
    "u_texture_2",
    "u_texture_3",
    "u_texture_4",
    "u_clip_time",
    "u_num_params",
    "u_float_param_0",
    "u_float_param_1",
    "u_float_param_2",
    "u_float_param_3",
  ],
  scenes: {},
  current_scene: null
}

var canvas
var textureCanvas
var textureContext

function on_load() {
  canvas = document.getElementById("canvas");
  gl_init();

  gfx.programs.uv = load_shader_program("uv-vs", "uv-fs");
  gfx.programs.lines1 = load_shader_program("lines1-vs", "lines1-fs");
  gfx.programs.background = load_shader_program("uv-vs", "background-fs");

  geom_init();

  scenes_init();

  prepare_fbos(gfx.scenes);

  clear();

  gfx_main_loop();
}

function gl_init() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  gl = canvas.getContext("webgl");


  gl.viewport(0, 0, canvas.width, canvas.height);
  console.log("width: " + canvas.width + " height: "+ canvas.height);

  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  var quad = new Float32Array([-1, -1, -1,  1, 1, -1, 1,  1]);
  gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
  _quad_vbo = buffer;

  // get readable strings for error enum values
  for (var propertyName in gl) {
    if (typeof gl[propertyName] == 'number') {
      _enums[gl[propertyName]] = propertyName;
    }
  }
}

function log_error(a,b) {
  alert(a + b);
}

var _quad_vbo = null;
var _enums = _enums = { };

function gl_error() {
  var v = gl.getError();
  if (v == gl.NO_ERROR) { return null; }
  var name = _enums[v];
  var error_str = (name !== undefined) ? ("gl." + name) :
      ("/*UNKNOWN WebGL ENUM*/ 0x" + v.toString(16) + "");
  console.log(error_str);
  return error_str;
}

function prepare_fbos(scenes) {
  // replace the render passes' texture arrays by actual frame buffer objects
  // this is far from optimal...
  for (var s=0; s<scenes.length; ++s) {
    var scene = scenes[s];
    for (var p=0; p<scene.passes.length; ++p) {
      var pass = scene.passes[p];
      if (pass.render_to) {
        pass.fbo = frame_buffer(pass.render_to);
      }
    }
  }
}

function make_vbo(location, buffer) {
  if (!buffer) { return null; }
  check_nan(buffer);
  var vbo = gl.createBuffer();
  gl_error();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffer), gl.STATIC_DRAW);
  gl_error();
  return {location: location, vbo: vbo, length: buffer.length};
}

function create_geom(desc, vertex_count) {
  return {
    buffers: [
      make_vbo(gfx.POS, desc.positions),
      make_vbo(gfx.NORMAL, desc.normals),
      make_vbo(gfx.UV, desc.uvs),
      make_vbo(gfx.COLOR, desc.colors),
      make_vbo(gfx.PARAM_BUF, desc.param_buf),
    ],
    mode: gl.TRIANGLES,
    vertex_count: vertex_count || desc.positions.length / 3
  };
}

function replace_geom(old_geom, new_geom) {
  gl.deleteBuffer(old_geom.vbo);
  gl.deleteBuffer(old_geom.ibo);
  old_geom.src = new_geom.src;
  old_geom.vbo = new_geom.vbo;
  old_geom.ibo = new_geom.ibo;
  old_geom.num_indices = new_geom.num_indices;
  old_geom.components_per_vertex = new_geom.components_per_vertex;
  old_geom.attribs = new_geom.attribs;
}

function draw_quad() {
  gl.disable(gl.DEPTH_TEST);
  gl.bindBuffer(gl.ARRAY_BUFFER, _quad_vbo);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

// actually renders
function draw_geom(data, depth_test) {
  gl_error();
  if (depth_test) {
    gl.enable(gl.DEPTH_TEST);
  } else {
    gl.disable(gl.DEPTH_TEST);
  }
  for (var i in data.buffers) {
    var buffer = data.buffers[i];
    if (!buffer) { continue; }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vbo);
    gl.enableVertexAttribArray(buffer.location);
    gl.vertexAttribPointer(buffer.location, buffer.length / data.vertex_count, gl.FLOAT, false, 0, 0);
    gl_error()
  }
  gl.drawArrays(data.mode, 0, data.vertex_count);
  gl_error();
}

// to use with the timeline
function draw_mesh(data, depth_test) {
  return function() {
    draw_geom(data, depth_test);
  }
}

var shader_prelude = "precision lowp float;\n"
                   + "uniform mat4 u_vp_mat;\n"
                   + "uniform mat4 u_vp_mat_inv;\n"
                   + "uniform vec2 u_resolution;\n"
                   + "uniform sampler2D u_texture_0;\n"
                   + "uniform sampler2D u_texture_1;\n"
                   + "uniform sampler2D u_texture_2;\n"
                   + "uniform sampler2D u_texture_3;\n"
                   + "uniform sampler2D u_texture_4;\n"
                   + "uniform float u_clip_time;\n"
                   + "uniform float u_num_params;\n"
                   + "uniform float u_float_param_0;\n"
                   + "uniform float u_float_param_1;\n"
                   + "uniform float u_float_param_2;\n"
                   + "uniform float u_float_param_3;\n"
                   + "#define PI 3.1415926535897932384626433832795\n"
                   + "//17\n"

var vs_prelude = "attribute vec3 a_position;\n"
               + "attribute vec3 a_normal;\n"
               + "attribute vec3 a_color;\n"
               + "attribute vec2 a_uv;\n"
               + "attribute float a_param_buf;\n"
               + "//23\n"

// Taken from MDN
function get_shader(id) {
  var shaderScript, theSource, currentChild, shader;

  shaderScript = document.getElementById(id);

  if (!shaderScript) {
    alert("missing shader "+ id);
    return null;
  }

  theSource = "";
  currentChild = shaderScript.firstChild;

  while(currentChild) {
    if (currentChild.nodeType == currentChild.TEXT_NODE) {
      theSource += currentChild.textContent;
    }
    currentChild = currentChild.nextSibling;
  }

  if (shaderScript.type == "x-shader/x-fragment") {
    return compile_shader(shader_prelude + theSource, gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    return compile_shader(shader_prelude + vs_prelude + theSource, gl.VERTEX_SHADER);
  } else {
    alert("unknown shader type "+ shaderScript.type);
    return null;
  }
}

// type: gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
function compile_shader(txt_src, type) {
  //console.log(txt_src);
  var shader = gl.createShader(type);
  gl.shaderSource(shader, txt_src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    log_error(gl.getShaderInfoLog(shader), "Shader compilation failed");
  }
  return shader;
}

function load_shader_program(vs, fs) {
  var program = gl.createProgram();
  gl.attachShader(program, get_shader(vs));
  gl.attachShader(program, get_shader(fs));

  for (var i in gfx.locations) {
    gl.bindAttribLocation(program, i, gfx.locations[i]);
  }

  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    log_error(gl.getProgramInfoLog(program), "Program link error");
  }
  return program;
}

function set_texture_flags(texture, allow_repeat, linear_filtering, mipmaps) {
  gl.bindTexture(gl.TEXTURE_2D, texture);

  var wrap = allow_repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
  var min_filtering = linear_filtering
                    ? mipmaps ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR
                    : gl.NEAREST;
  var mag_filtering = linear_filtering ? gl.LINEAR : gl.NEAREST;

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, min_filtering);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, mag_filtering);
  if (mipmaps) {
    gl.generateMipmap(gl.TEXTURE_2D);
  }
}

function create_texture(width, height, format, data, allow_repeat, linear_filtering, mipmaps) {
  format = format || gl.RGBA;
  width = width || canvas.width;
  height = height || canvas.height;

  var texture = gl.createTexture();

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0,
                format,
                (format == gl.DEPTH_COMPONENT) ? gl.UNSIGNED_SHORT
                                               : gl.UNSIGNED_BYTE, data ? new Uint8Array(data, 0, 0)
                                                                        : null);

  set_texture_flags(texture, allow_repeat, linear_filtering, mipmaps);

  return {
    tex: texture,
    width: width,
    height: height
  };
}

function texture_unit(i) { return gl.TEXTURE0+i; }

function frame_buffer_error(e) {
  if (e == gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT) {
      return "FRAMEBUFFER_INCOMPLETE_ATTACHMENT";}
  if (e == gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT) {
      return "FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT";}
  if (e == gl.FRAMEBUFFER_INCOMPLETE_DRAW_BUFFER) {
      return "FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT";}
  if (e == gl.FRAMEBUFFER_UNSUPPORTED) {
      return "FRAMEBUFFER_UNSUPPORTED";}
  if (e == gl.FRAMEBUFFER_INCOMPLETE_MULTISAMPLE) {
      return "FRAMEBUFFER_INCOMPLETE_MULTISAMPLE";}
  return "unknown framebuffer error";
}

function frame_buffer(target) {
  var fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

  if (target.color) gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.color.tex, 0);
  if (target.depth) gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, target.depth.tex, 0);

  var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (status != gl.FRAMEBUFFER_COMPLETE) {
    log_error(frame_buffer_error(status), "Incomplete framebuffer");
  }

  return fbo;
}

function set_fallback_uniforms() {
  if (!gfx.uniforms.u_vp_mat) {
    gfx.uniforms.u_vp_mat = mat4.create();
    mat4.identity(gfx.uniforms.u_vp_mat);
  }
  if (!gfx.uniforms.u_resolution) {
    gfx.uniforms.u_resolution = [canvas.width, canvas.height];
  }
  if (!gfx.uniforms.u_clip_time) {
    gfx.uniforms.u_clip_time = 0;
  }
  if (!gfx.uniforms.u_num_params) {
    gfx.uniforms.u_num_params = gfx.geometries.param_buffers.length;
  }
}

function send_uniforms(program) {
  for (var uniform_name in gfx.uniforms) {
    var val = gfx.uniforms[uniform_name];

    var location = gl.getUniformLocation(program, uniform_name);
    if (!location) {
      continue;
    }

    // if val is a bare number, make a one-element array
    if (typeof val == "number")
      val = [val];

    switch (val.length) {
      case 1: gl.uniform1fv(location, val); break;
      case 2: gl.uniform2fv(location, val); break;
      case 3: gl.uniform3fv(location, val); break;
      case 4: gl.uniform4fv(location, val); break;
      case 9: gl.uniformMatrix3fv(location, 0, val); break;
      case 16: gl.uniformMatrix4fv(location, 0, val); break;
    }
  }
}

function clear() {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
}

function render_scene(scene, demo_time, scene_time) {
  if (!scene) {
    return;
  }
  var clip_time_norm = scene_time/scene.duration;
  gfx.uniforms.u_clip_time = scene_time;
  var t = {
    scene_norm: clip_time_norm,
    demo: demo_time,
    scene: scene_time
  };
  if (scene.update) {
    scene.update(t);
  }
  gl.disable(gl.BLEND);
  for (var p in scene.passes) {
    var pass = scene.passes[p];
    if (pass.update) {
      pass.update(t);
    }
    if (pass.program) {
      var shader_program = pass.program;
      if (!shader_program) {
        console.log("Missing shader program in this render pass!");
      }
      gl.useProgram(shader_program);
      var rx = canvas.width;
      var ry = canvas.height;
      if (pass.render_to) {
        rx = pass.render_to.color.width;
        ry = pass.render_to.color.height;
      }
      gfx.uniforms.u_resolution = [rx,ry];
      set_fallback_uniforms();
      send_uniforms(shader_program);
      gl.viewport(0, 0, rx, ry);
    }
    if (pass.fbo) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, pass.fbo);
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    if (pass.texture_inputs) {
      for (var i=0; i<pass.texture_inputs.length; ++i) {
        var tex = pass.texture_inputs[i].tex;
        gl.activeTexture(texture_unit(i));
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniform1i(gl.getUniformLocation(shader_program,"texture_"+i), i);
      }
    }
    if (pass.blend) {
      gl.enable(gl.BLEND);
      gl.blendFunc.apply(gl, pass.blend);
    }
    if (pass.render) {
      pass.render(pass.program);
    }
  }
}


var _fake_audio_time = 0;
function get_audio_time() {
  _fake_audio_time += 1;
  return _fake_audio_time;
}

var _time = 0;
function gfx_main_loop() {
  _time = get_audio_time();
  render_scene(gfx.current_scene, _time, _time);
  requestAnimationFrame(gfx_main_loop);
}

function check_nan(array) {
  if (!debug) {
    return;
  }
  for (i=0; i<array.length; ++i) {
    if (array[i] != array[i]) {
      alert("NaN in a vertex buffer!");
      debugger;
    }
  }
}

function assert(cond, msg) {
  if (!cond) {
    if (msg) {
      console.log(msg);
    } else {
      console.log("Assertion failure!");  
    }
    debugger;
  }
}

var debug = true;