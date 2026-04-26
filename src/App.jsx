import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import Sidebar from "./SideBar";
import "./App.css";
import Playground from "./Playground";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="appContainer">
      <Sidebar />
      <Playground />
    </div>
  );
}

export default App;
