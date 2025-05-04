import Overlay from "./Overlay";
import WebsocketData from "./WebsocketData";
import RenderCounter from "./RenderCounter";
import { RLProvider } from "../../dist/RLProvider";

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
