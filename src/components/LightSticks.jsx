import { useRef, useMemo } from "react";
import * as THREE from "three";

const sideSticksFragment = `
varying vec3 vColor;

void main() {
  vec3 color = vec3(vColor);
  gl_FragColor = vec4(color,1.);
}
`;

const sideSticksVertex = `
attribute float aOffset;
attribute vec3 aColor;
attribute vec2 aMetric;

uniform float uTravelLength;
uniform float uTime;

varying vec3 vColor;

  void main(){
    vec3 transformed = position.xyz;
    float width = aMetric.x;
    float height = aMetric.y;

    transformed.xy *= vec2(width,height);
    float time = mod(uTime  * 60. *2. + aOffset , uTravelLength);

    transformed = (rotationY(3.14/2.) * vec4(transformed,1.)).xyz;

    transformed.z +=  - uTravelLength + time;

    transformed.y += height /2.;
    transformed.x += -width/2.;
    vec4 mvPosition = modelViewMatrix * vec4(transformed,1.);
    gl_Position = projectionMatrix * mvPosition;
    vColor = aColor;
  }
`;

const random = (base) => {
  if (Array.isArray(base)) return Math.random() * (base[1] - base[0]) + base[0];
  return Math.random() * base;
};

const pickRandom = (arr) => {
  if (Array.isArray(arr)) return arr[Math.floor(Math.random() * arr.length)];
  return arr;
};

const LightSticks = ({ options }) => {
  const meshRef = useRef();
  let totalSticks = options.totalSideLightSticks;
  let stickoffset = options.length / (totalSticks - 1);

  const aOffset = useMemo(() => {
    const aOffsets = [];

    for (let i = 0; i < totalSticks; i++) {
      aOffsets.push((i - 1) * stickoffset * 2 + stickoffset * Math.random());
    }

    return new Float32Array(aOffsets);
  }, [options]);

  const aMetric = useMemo(() => {
    const aMetrics = [];

    for (let i = 0; i < totalSticks; i++) {
      let width = random(options.lightStickWidth);
      let height = random(options.lightStickHeight);

      aMetrics.push(width);
      aMetrics.push(height);
    }

    return new Float32Array(aMetrics);
  }, [options]);

  const aColor = useMemo(() => {
    const aColors = [];

    let colors = options.colors.sticks;
    if (Array.isArray(colors)) {
      colors = colors.map((c) => new THREE.Color(c));
    } else {
      colors = new THREE.Color(colors);
    }

    for (let i = 0; i < totalSticks; i++) {

      let color = pickRandom(colors);
      aColors.push(color.r);
      aColors.push(color.g);
      aColors.push(color.b);
    }

    return new Float32Array(aColors);
  }, [options]);



  return (
    <instancedMesh
      ref={meshRef}
      args={[null, null, options.totalSideLightSticks]}
      geometry={null}
    >
      <planeGeometry attach="geometry" args={[1,1]}>
        <instancedBufferAttribute
          attach="attributes-aOffset"
          args={[aOffset, 1, false]}
        />
        <instancedBufferAttribute
          attach="attributes-aMetric"
          args={[aMetric, 2, false]}
        />
        <instancedBufferAttribute
          attach="attributes-aColor"
          args={[aColor, 3, false]}
        />
      </planeGeometry>
      <shaderMaterial
        attach="material"
        uniforms={{
          uTravelLength: new THREE.Uniform(options.length),
          uTime: new THREE.Uniform(0),
        }}
        fragmentShader={sideSticksFragment}
        vertexShader={sideSticksVertex}
      />
    </instancedMesh>
  );
};

export default LightSticks;
