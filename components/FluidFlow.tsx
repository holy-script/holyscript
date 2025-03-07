"use client";
import { useTheme } from "@/providers/ThemeContext";
import { useEffect, useRef } from "react";

const FluidFlow = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const darkColor = "vec3(0.02, 0.05, 0.3)";
  const lightColor = "vec3(0.1, 0.3, 0.7)";
  const elapsedTimeRef = useRef(0);

  const { isDarkMode } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }
    glRef.current = gl;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Handle resizing
    const handleResize = () => {
      if (!canvasRef.current || !glRef.current) return;
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
      glRef.current.viewport(0, 0, window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    window.addEventListener("resize", handleResize);

    // Vertex Shader
    const vertexShaderSource = `
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment Shader (Realistic Evolving Water)
    const fragmentShaderSource = `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uResolution;

      vec2 hash(vec2 p) {
          p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
          return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
      }

      // Perlin Noise with Smoother Sampling
      float perlinNoise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);  // Smoother interpolation

          return mix(
              mix(dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                  dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), f.x),
              mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                  dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), f.x),
              f.y
          );
      }


      float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          float frequency = 2.0;
          for (int i = 0; i < 6; i++) {
              value += amplitude * perlinNoise(p * frequency);
              frequency *= 2.0;
              amplitude *= 0.5;
          }
          return value;
      }

      float rippleEffect(vec2 p, float time) {
          return sin(p.x * 5.0 + time) * sin(p.y * 5.0 + time) * 0.2;
      }

      void main() {
          vec2 uv = (vUv - 0.5) * 2.0;
          uv.x *= uResolution.x / uResolution.y;

          float evolvingNoise = fbm(uv * 3.0 + uTime * 0.1);
          float ripple = rippleEffect(uv * 2.0, uTime * 0.5);

          vec3 color = ${isDarkMode ? darkColor : lightColor
      } + evolvingNoise * 0.3 + ripple * 0.2;
          gl_FragColor = vec4(color, 0.3);
      }
    `;

    const compileShader = (source: string, type: number) => {
      if (!glRef.current) return null;
      const shader = glRef.current.createShader(type);
      if (!shader) return null;
      glRef.current.shaderSource(shader, source);
      glRef.current.compileShader(shader);
      if (!glRef.current.getShaderParameter(shader, glRef.current.COMPILE_STATUS)) {
        console.error(glRef.current.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    };

    if (!glRef.current) return;

    const vertexShader = compileShader(vertexShaderSource, glRef.current.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, glRef.current.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return;

    // Create and link program
    const program = glRef.current.createProgram();
    if (!program) return;
    programRef.current = program;

    glRef.current.attachShader(program, vertexShader);
    glRef.current.attachShader(program, fragmentShader);
    glRef.current.linkProgram(program);
    if (!glRef.current.getProgramParameter(program, glRef.current.LINK_STATUS)) {
      console.error(glRef.current.getProgramInfoLog(program));
      return;
    }

    // Create Buffer
    const buffer = glRef.current.createBuffer();
    glRef.current.bindBuffer(glRef.current.ARRAY_BUFFER, buffer);
    glRef.current.bufferData(glRef.current.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), glRef.current.STATIC_DRAW);

    const position = glRef.current.getAttribLocation(program, "position");
    glRef.current.enableVertexAttribArray(position);
    glRef.current.vertexAttribPointer(position, 2, glRef.current.FLOAT, false, 0, 0);

    // Uniform locations
    const uTime = glRef.current.getUniformLocation(program, "uTime");
    const uResolution = glRef.current.getUniformLocation(program, "uResolution");

    let time = elapsedTimeRef.current;

    const render = () => {
      if (!glRef.current) return;
      time += 0.015;
      glRef.current.viewport(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      glRef.current.clear(glRef.current.COLOR_BUFFER_BIT);
      glRef.current.useProgram(programRef.current);

      glRef.current.uniform1f(uTime, time);
      glRef.current.uniform2f(uResolution, canvasRef.current!.width, canvasRef.current!.height);

      glRef.current.drawArrays(glRef.current.TRIANGLE_STRIP, 0, 4);
      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      elapsedTimeRef.current = time;
      window.removeEventListener("resize", handleResize);
    };

  }, [isDarkMode]);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none"></canvas>;
};

export default FluidFlow;
