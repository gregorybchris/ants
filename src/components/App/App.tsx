import "./App.sass";
import "@fontsource/poppins";

import { useEffect, useState } from "react";

import Simluation from "../Simluation/Simulation";

export default function App() {
  const [data, setData] = useState("Hello");

  useEffect(() => {
    console.log("App data: ", data);
  }, []);

  return (
    <div className="App">
      {/* <div>{data}</div> */}
      <Simluation />
    </div>
  );
}
