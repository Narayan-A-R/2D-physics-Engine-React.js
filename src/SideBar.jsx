import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./Sidebar.css";

const sceneNames = [
  "Stacking",
  "DVD",
  "Newtons Cradle",
  "Friction",
  "Chaos",
  "Gravity",
];

function Sidebar({ sceneInd, setSceneInd }) {
  return (
    <div className="vertRect">
      {sceneNames.map((sceneName, index) => (
        <div
          key={sceneName}
          className={`roundSquare ${sceneInd === index ? "selected" : ""}`}
          onClick={() => setSceneInd(index)}
        >
          {sceneName}
        </div>
      ))}
    </div>
  );
}

export default Sidebar;
