import React from "react";
import ReactDOM from "react-dom/client";
import PensionCalculator from "./pension-calculator.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PensionCalculator />
  </React.StrictMode>,
);
