import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./Sidebar.css";

function Sidebar({sceneInd,setSceneInd}) {
  return (
    <div className="vertRect">
      <div className={`roundSquare ${sceneInd===0?"selected":""}`} onClick={() => setSceneInd(0)}>DVD</div>
      <div className={`roundSquare ${sceneInd===1?"selected":""}`} onClick={() => setSceneInd(1)}>Newtons Cradle</div>
      <div className={`roundSquare ${sceneInd===2?"selected":""}`} onClick={() => setSceneInd(2)}>Friction</div>
      <div className={`roundSquare ${sceneInd===3?"selected":""}`} onClick={() => setSceneInd(3)}>Chaos</div>
      <div className={`roundSquare ${sceneInd===4?"selected":""}`} onClick={() => setSceneInd(4)}>Gravity</div>
    </div>
  );
}

export default Sidebar;
