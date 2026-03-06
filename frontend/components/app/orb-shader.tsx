'use client';

import { useEffect, useRef } from 'react';

const VERTEX_SRC = `attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT_SRC = `precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_audio;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec2 u_sphere_center;
uniform float u_sphere_scale;

const float GRAIN = 0.07;
const float GRAIN_SPEED = 0.1;
const float SCANLINES = 0.85;
const float SCANLINE_SIZE = 2.0;
const float CHROMATIC = 0.55;
const float VIGNETTE = 0.23;
const float INVERT = 0.93;

float hash3(vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
}

float noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash3(i), hash3(i+vec3(1,0,0)), f.x),
        mix(hash3(i+vec3(0,1,0)), hash3(i+vec3(1,1,0)), f.x), f.y),
    mix(mix(hash3(i+vec3(0,0,1)), hash3(i+vec3(1,0,1)), f.x),
        mix(hash3(i+vec3(0,1,1)), hash3(i+vec3(1,1,1)), f.x), f.y),
    f.z
  );
}

float map(vec3 p) {
  float idle = sin(u_time * 0.8) * 0.015;
  float r = 0.55 + idle + u_audio * 0.4;

  float disp = (noise3(p * 3.0 + u_time * 0.3) - 0.5) * 0.08;
  disp *= u_audio;

  return length(p) - r + disp;
}

vec3 calcNormal(vec3 p) {
  vec2 e = vec2(0.001, 0.0);
  return normalize(vec3(
    map(p+e.xyy) - map(p-e.xyy),
    map(p+e.yxy) - map(p-e.yxy),
    map(p+e.yyx) - map(p-e.yyx)
  ));
}

float hash2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

vec3 renderScene(vec2 uv) {
  vec2 sphereUV = (uv - u_sphere_center) * u_sphere_scale;
  vec3 ro = vec3(0.0, 0.0, 3.0);
  vec3 rd = normalize(vec3(sphereUV, -1.5));

  float t = 0.0;
  float d;
  for (int i = 0; i < 64; i++) {
    d = map(ro + rd * t);
    if (d < 0.001 || t > 20.0) break;
    t += d;
  }

  vec3 col = vec3(0.02, 0.02, 0.06);
  if (d < 0.001) {
    vec3 p = ro + rd * t;
    vec3 n = calcNormal(p);
    vec3 light = normalize(vec3(1.0, 1.0, 1.0));
    float diff = max(dot(n, light), 0.0);
    float spec = pow(max(dot(reflect(-light, n), -rd), 0.0), 32.0);
    float fresnel = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
    col = mix(u_color1, u_color2, fresnel) * (diff * 0.8 + 0.2) + vec3(spec * 0.5);
  }
  return col;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  vec2 fragUV = gl_FragCoord.xy / u_resolution;

  vec2 caDir = (fragUV - 0.5) * CHROMATIC * 0.015;
  vec3 col = vec3(
    renderScene(uv + caDir).r,
    renderScene(uv).g,
    renderScene(uv - caDir).b
  );

  col = mix(col, 1.0 - col, INVERT);

  float sl = sin(gl_FragCoord.y * 3.14159 / SCANLINE_SIZE);
  col *= 1.0 - SCANLINES * 0.08 * (1.0 - sl * sl);

  float grain = (hash2(fragUV * u_resolution + floor(u_time * GRAIN_SPEED * 60.0)) - 0.5) * 2.0;
  col += grain * GRAIN;

  float vig = 1.0 - dot(fragUV - 0.5, fragUV - 0.5) * VIGNETTE * 4.0;
  col *= clamp(vig, 0.0, 1.0);

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(s));
    return null;
  }
  return s;
}

interface OrbShaderProps {
  audioLevel?: number;
  sphereCenter?: [number, number];
  sphereScale?: number;
  /** Width in px of a right-side panel to offset the sphere center for */
  panelRightWidth?: number;
}

export function OrbShader({
  audioLevel = 0,
  sphereCenter = [0, 0.15],
  sphereScale = 3.2,
  panelRightWidth = 0,
}: OrbShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioLevelRef = useRef(audioLevel);
  const smoothAudioRef = useRef(0);
  const rafRef = useRef<number>(0);

  audioLevelRef.current = audioLevel;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const pos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const startTime = Date.now();

    const render = () => {
      const dpr = devicePixelRatio || 1;
      const w = canvas.clientWidth * dpr;
      const h = canvas.clientHeight * dpr;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }

      const target = audioLevelRef.current;
      const rise = target > smoothAudioRef.current ? 0.35 : 0.12;
      smoothAudioRef.current += (target - smoothAudioRef.current) * rise;

      gl.useProgram(program);
      gl.uniform1f(gl.getUniformLocation(program, 'u_time'), (Date.now() - startTime) / 1000);
      gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), w, h);
      gl.uniform1f(gl.getUniformLocation(program, 'u_audio'), smoothAudioRef.current);
      gl.uniform3f(gl.getUniformLocation(program, 'u_color1'), 1.0, 1.0, 1.0);
      gl.uniform3f(gl.getUniformLocation(program, 'u_color2'), 0.11, 0.11, 0.11);
      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;
      const minDim = Math.min(cssW, cssH);
      const panelCenterX = panelRightWidth > 0 ? (cssW - panelRightWidth) / 2 : cssW / 2;
      const offsetX = (panelCenterX - cssW / 2) / minDim;
      gl.uniform2f(
        gl.getUniformLocation(program, 'u_sphere_center'),
        sphereCenter[0] + offsetX,
        sphereCenter[1]
      );
      gl.uniform1f(gl.getUniformLocation(program, 'u_sphere_scale'), sphereScale);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(rafRef.current);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, [sphereCenter, sphereScale, panelRightWidth]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
}
