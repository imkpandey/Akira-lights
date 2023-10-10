import { Canvas } from "@react-three/fiber";
import "./App.css";
import Scene from "./components/Scene";

function App() {
  return (
    <div id="container">
      <img className="logo" src="/kanji.png" alt="akira-japanese" />
      <h1 className="title">Infinite Lights</h1>
      <h1 className="hint">Hint: Press to speed up</h1>
      <h1 className="akira">AKIRA</h1>
      <Canvas camera={{ position: [0, 7, 12] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Scene />
      </Canvas>
    </div>
  );
}

export default App;
