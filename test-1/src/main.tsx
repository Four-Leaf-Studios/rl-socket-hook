import React from "react";
import ReactDOM from "react-dom/client";
import Overlay from "./Overlay";
import WebsocketData from "./WebsocketData";
import "./globals.css";

const App = () => {
  return (
    <>
      <Overlay />
      <WebsocketData />
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
