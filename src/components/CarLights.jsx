import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const fragmentShader = `
varying vec3 vColor;
varying vec2 vUv;

uniform vec2 uFade;

void main() {
  vec3 color = vec3(vColor);
  float fadeStart = 0.4;
  float maxFade = 0.;
  float alpha = 1.;

  alpha = smoothstep(uFade.x, uFade.y, vUv.x);
  gl_FragColor = vec4(color, alpha);
  if (gl_FragColor.a < 0.0001) discard;
}
`;

const vertexShader = `
attribute vec3 aOffset;
attribute vec3 aMetrics;
attribute vec3 aColor;

uniform float uTime;
uniform float uSpeed;
uniform float uTravelLength;
uniform float uPositionX;

varying vec2 vUv; 
varying vec3 vColor; 

void main() {
  vec3 transformed = position.xyz;

  float radius = aMetrics.x;
  float len = aMetrics.y;
  float speed = aMetrics.z;

  transformed.xy *= radius;
  transformed.z *= len;

  // Adjust the x-coordinate based on positionX and lane width
  transformed.x += uPositionX;

  // Add my length to make sure it loops after the lights hits the end
  transformed.z += len-mod( uTime * speed + aOffset.z, uTravelLength);
  transformed.xy += aOffset.xy;

  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  vUv = uv;
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

const CarLights = ({ options, colorArray, positionX, speedArray, fade }) => {
  const meshRef = useRef();
  const curve = new THREE.LineCurve3(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -1)
  );

  const aOffset = useMemo(() => {
    const offsets = [];

    const laneWidth = options.roadWidth / options.lanesPerRoad;

    for (let i = 0; i < options.lightPairsPerRoadWay; i++) {
      const carLane = i % 3;
      let laneX = carLane * laneWidth - options.roadWidth / 2 + laneWidth / 2;
      const carWidth = random(options.carWidthPercentage) * laneWidth;
      const carShiftX = random(options.carShiftX) * laneWidth;
      laneX += carShiftX;

      const offsetY = random(options.carFloorSeparation) * 1.3;

      const offsetZ = -random(options.length);

      offsets.push(laneX - carWidth / 2, offsetY, offsetZ);
      offsets.push(laneX + carWidth / 2, offsetY, offsetZ);
    }

    return new Float32Array(offsets);
  }, [options, positionX]);

  const aMetrics = useMemo(() => {
    const metrics = [];

    for (let i = 0; i < options.lightPairsPerRoadWay; i++) {
      const radius = random(options.carLightsRadius);
      const length = random(options.carLightsLength);
      const speed = random(speedArray);

      // Push radius, length and speed into metrics array for each light in the pair
      metrics.push(radius, length, speed, radius, length, speed);
    }

    return new Float32Array(metrics);
  }, [options]);

  const aColors = useMemo(() => {
    let colors = colorArray;
    const colorsArray = [];

    if (Array.isArray(colors)) {
      colors = colors.map((c) => new THREE.Color(c));
    } else {
      colors = new THREE.Color(colors);
    }

    for (let i = 0; i < options.lightPairsPerRoadWay; i++) {
      const color = pickRandom(colors);

      colorsArray.push(color.r, color.g, color.b, color.r, color.g, color.b);
    }

    return new Float32Array(colorsArray);
  }, [options]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Update the uTime uniform with the elapsed time to animate
    meshRef.current.material.uniforms.uTime.value = time;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[null, null, options.lightPairsPerRoadWay * 2]}
      geometry={null}
    >
      <tubeGeometry attach="geometry" args={[curve, 40, 1, 8, false]}>
        <instancedBufferAttribute
          attach="attributes-aOffset"
          args={[aOffset, 3, false]}
        />
        <instancedBufferAttribute
          attach="attributes-aMetrics"
          args={[aMetrics, 3, false]}
        />
        <instancedBufferAttribute
          attach="attributes-aColor"
          args={[aColors, 3, false]}
        />
      </tubeGeometry>
      <shaderMaterial
        attach="material"
        transparent
        uniforms={{
          //   uColor: new THREE.Uniform(new THREE.Color(color)),
          uTime: new THREE.Uniform(0),
          //   uSpeed: new THREE.Uniform(speed),
          uTravelLength: new THREE.Uniform(options.length),
          uFade: new THREE.Uniform(fade),
          uPositionX: new THREE.Uniform(positionX)
        }}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
      />
    </instancedMesh>
  );
};

export default CarLights;
