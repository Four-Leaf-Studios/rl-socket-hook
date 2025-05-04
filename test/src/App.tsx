import Overlay from "./Overlay";
import WebsocketData from "./WebsocketData";
import RenderCounter from "./RenderCounter";
import { RLProvider } from "@four-leaf-studios/rl-socket-hook";

function App() {
  return (
    <RLProvider>
      <RenderCounter event="game:pre_countdown_begin" />
      <Overlay />
      <WebsocketData />
    </RLProvider>
  );
}

export default App;
