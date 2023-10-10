import * as THREE from 'three';

const Road = ({options}) => {

  const fragmentShader = `
    uniform vec3 uColor;
    void main() {
      gl_FragColor = vec4(uColor, 1.0);
    }
  `;

  const vertexShader = `
    void main() {
      vec3 transformed = position.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed.xyz, 1.0);
    }
  `;

  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, - options.length / 2 ]}>
      <planeGeometry attach="geometry" args={[options.roadWidth + 10, options.length + 50 , 20, 100]} />
      <shaderMaterial
        attach="material"
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={{
          uColor: { value: new THREE.Color(options.colors.roadColor) },
        }}
      />
    </mesh>
  );
};

export default Road;
