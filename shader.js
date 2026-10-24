// A fluid-looking background that costs one fragment shader. The original used two GPU libraries for this.
const canvas = document.getElementById("shader");
const gl = canvas.getContext("webgl", { antialias:false, alpha:false, powerPreference:"low-power" });
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;
const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes, uMouse, uClick;
uniform float uT, uClickT;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p){
  float v = 0., a = .5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.02; a *= .5; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes.y;
  vec2 m = uMouse * vec2(uRes.x / uRes.y, 1.);
  vec2 q = uv * 1.6;
  float t = uT * .06;

  // Push the field away from the cursor, then warp it twice.
  vec2 d = uv - m;
  q += d / (dot(d, d) * 14. + .4) * .25;
  vec2 w = vec2(fbm(q + vec2(0., t)), fbm(q + vec2(5.2, 1.3) - t));
  float f = fbm(q + 2.2 * w + vec2(t, -t));

  // Click ripple.
  vec2 c = uClick * vec2(uRes.x / uRes.y, 1.);
  float age = uT - uClickT;
  float rd = (distance(uv, c) - age * .5) * 9.;
  float ring = exp(-rd * rd) * exp(-age * 1.6);
  f += ring * .35;

  vec3 ink = vec3(.027, .031, .047);
  vec3 red = vec3(1., .29, .24);
  vec3 purple = vec3(.71, .55, 1.);
  vec3 col = mix(ink, purple, smoothstep(.35, .8, w.x) * .5);
  col = mix(col, red, smoothstep(.45, .95, f) * .75);
  col = mix(ink, col, .6 + ring * .4);
  gl_FragColor = vec4(col, 1.);
}`;

function compile(type, src){
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}

if (gl) {
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = Object.fromEntries(["uRes", "uMouse", "uClick", "uT", "uClickT"].map(n => [n, gl.getUniformLocation(prog, n)]));
  const mouse = { x:.5, y:.5, tx:.5, ty:.5 };
  let clickT = -99;
  gl.uniform2f(U.uClick, .5, .5);

  // Half resolution: the output is blurry noise anyway.
  const SCALE = .5;
  function resize(){
    canvas.width = Math.ceil(innerWidth * SCALE);
    canvas.height = Math.ceil(innerHeight * SCALE);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
  }
  resize();
  addEventListener("resize", resize);

  addEventListener("pointermove", e => { mouse.tx = e.clientX / innerWidth; mouse.ty = 1 - e.clientY / innerHeight; });
  addEventListener("pointerdown", e => {
    gl.uniform2f(U.uClick, e.clientX / innerWidth, 1 - e.clientY / innerHeight);
    clickT = performance.now() / 1000;
  });

  function frame(now){
    const t = reduceMotion ? 20 : now / 1000;
    mouse.x += (mouse.tx - mouse.x) * .06;
    mouse.y += (mouse.ty - mouse.y) * .06;
    gl.uniform1f(U.uT, t);
    gl.uniform1f(U.uClickT, reduceMotion ? -99 : clickT);
    gl.uniform2f(U.uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!reduceMotion) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  canvas.classList.add("on");
}
