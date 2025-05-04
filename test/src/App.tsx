import Overlay from "./Overlay";
import WebsocketData from "./WebsocketData";
import { RLProvider } from "../../dist/RLProvider";
import RenderCounter from "./RenderCounter";

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
