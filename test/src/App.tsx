import Overlay from "./Overlay";
import WebsocketData from "./WebsocketData";
import RenderCounter from "./RenderCounter";
import { RLProvider } from "@four-leaf-studios/rl-socket-hook";
import Scoreboard from "./Scoreboard";

function App() {
  return (
    <RLProvider>
      <RenderCounter
        event={"game:update_state"}
        selector={(state) => state?.players}
      />
      <Overlay />
      <Scoreboard />
      <WebsocketData />
    </RLProvider>
  );
}

export default App;
