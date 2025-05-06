import Overlay from "./Overlay";
import RenderCounter from "./RenderCounter";
import { RLProvider } from "@four-leaf-studios/rl-socket-hook";
import Scoreboard from "./Scoreboard";
import WebsocketData from "@four-leaf-studios/rl-socket-hook";

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
