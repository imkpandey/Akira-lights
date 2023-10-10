import Road from "./Road";
import CarLights from "./CarLights";
import * as THREE from 'three'
import { OrbitControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import LightSticks from "./LightSticks";

const lerp = (current, target, speed = 0.1, limit = 0.001) => {
  let change = (target - current) * speed;
  if (Math.abs(change) < limit) {
    change = target - current;
  }
  return change;
};

const Scene = () => {
  const meshRef = useRef();
  const options = {
    length: 400,
    roadSections: 3,
    roadWidth: 10,
    islandWidth: 2,
    lanesPerRoad: 3,

    fov: 90,
    fovSpeedUp: 140,
    speedUp: 2,
    carLightsFade: 0.4,

    totalSideLightSticks: 50,
    lightPairsPerRoadWay: 50,

    // Percentage of the lane's width
    shoulderLinesWidthPercentage: 0.05,
    brokenLinesWidthPercentage: 0.1,
    brokenLinesLengthPercentage: 0.5,

    /*** These ones have to be arrays of [min,max].  ***/
    lightStickWidth: [0.12, 0.5],
    lightStickHeight: [1.3, 1.7],

    movingAwaySpeed: [60, 80],
    movingCloserSpeed: [-120, -160],

    /****  Anything below can be either a number or an array of [min,max] ****/

    // Length of the lights. Best to be less than total length
    carLightsLength: [400 * 0.05, 400 * 0.15],
    // Radius of the tubes
    carLightsRadius: [0.05, 0.14],
    // Width is percentage of a lane. Numbers from 0 to 1
    carWidthPercentage: [0.3, 0.5],
    // How drunk the driver is.
    // carWidthPercentage's max + carShiftX's max -> Cannot go over 1.
    // Or cars start going into other lanes
    carShiftX: [-0.2, 0.2],
    // Self Explanatory
    carFloorSeparation: [0.05, 1],

    colors: {
      roadColor: 0x080808,
      islandColor: 0x0a0a0a,
      background: 0x000000,
      shoulderLines: 0x131318,
      brokenLines: 0x131318,
      /***  Only these colors can be an array ***/
      leftCars: [0xff102a, 0xeb383e, 0xff102a],
      rightCars: [0xdadafa, 0xbebae3, 0x8f97e4],
      sticks: 0xdadafa,
    },
  };
  const [timeOffset, setTimeOffset] = useState(0);
  const [speedUp, setSpeedUp] = useState(0);
  const [speedUpTarget, setSpeedUpTarget] = useState(0);
  const [fovTarget, setFovTarget] = useState(90);

  const RightCarLights = () => {
    return (
      <CarLights
        options={options}
        colorArray={options.colors.rightCars}
        positionX={options.roadWidth / 2 + options.islandWidth / 2}
        speedArray={options.movingCloserSpeed}
        fade={new THREE.Vector2(1, 0 + options.carLightsFade)}
      />
    );
  };

  const LeftCarLights = () => {
    return (
      <CarLights
        options={options}
        colorArray={options.colors.leftCars}
        positionX={-options.roadWidth / 2 - options.islandWidth / 2}
        speedArray={options.movingAwaySpeed}
        fade={new THREE.Vector2(1, 0 + options.carLightsFade)}
      />
    );
  };

  // Event handlers for mouse down and up
  const onMouseDown = () => {
    setSpeedUpTarget(options.speedUp);
    setFovTarget(options.fovSpeedUp);
  };

  const onMouseUp = () => {
    setSpeedUpTarget(0);
    setFovTarget(options.fov);
  };

  useEffect(() => {
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mouseout", onMouseUp);

    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mouseout", onMouseUp);
    };
  }, []);

  useFrame((state, delta) => {
    const lerpT = Math.exp(-(-60 * Math.log2(1 - 0.1)) * delta);

    // Use lerp to smoothly adjust speedUp
    const newSpeedUp = speedUp + lerp(speedUp, speedUpTarget, lerpT, 0.00001);
    setSpeedUp(newSpeedUp);

    const newTimeOffset = timeOffset + speedUp * delta;
    setTimeOffset(newTimeOffset);

    const time = state.clock.getElapsedTime() + timeOffset;

    // Update the uTime uniform with the elapsed time to animate
    meshRef.current.children[0].material.uniforms.uTime.value = time;
    meshRef.current.children[1].material.uniforms.uTime.value = time;

    const fovChange = lerp(state.camera.fov, fovTarget, lerpT);
    if (fovChange !== 0) {
      state.camera.fov += fovChange * delta * 6;
      state.camera.updateProjectionMatrix();
    }
  });

  return (
    <>
      {/* <OrbitControls /> */}
      <Road options={options} />
      <group ref={meshRef}>
        <LeftCarLights />
        <RightCarLights />
      </group>
      {/* <LightSticks options={options} /> */}
      <EffectComposer>
        <Bloom
          intensity={1}
          luminanceThreshold={0.2}
          luminanceSmoothing={0}
          resolutionScale={1}
        />
      </EffectComposer>
    </>
  );
};

export default Scene;
