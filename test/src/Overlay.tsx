import { useEvent } from "@four-leaf-studios/rl-socket-hook";

export default function Overlay() {
  const gameState = useEvent("game:update_state");

  const timeConvert = (timee: number) => {
    if (isNaN(timee)) return "0:00";
    const min = Math.floor(timee / 60);
    const sec = timee % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const blueScore = gameState?.game?.teams?.[0]?.score ?? 0;
  const orangeScore = gameState?.game?.teams?.[1]?.score ?? 0;
  const time = gameState?.game?.time_seconds ?? 0;
  const players = gameState?.players ?? {};

  const bluePlayers = Object.values(players).filter((p) => p.team === 0);
  const orangePlayers = Object.values(players).filter((p) => p.team === 1);

  return (
    <div
      className={`h-screen text-white bg-transparent`}
      style={{
        width: 1920,
        height: 1080,
        background: "blue",
        position: "relative",
      }}
    >
      <div
        id="scoreboard"
        className="flex flex-col items-center justify-center"
      >
        <span className="min-w-[800px] h-8 px-5 flex items-center justify-center text-lg uppercase font-semibold tracking-wider bg-neutral-900">
          Title
        </span>
        <div className="flex h-[67px]">
          <div
            id="blueteam"
            className="flex border-r-[10px] border-r-neutral-900"
          >
            <div className="h-full w-24 bg-neutral-900 border-l-[10px] border-l-[#3DAEFF]">
              <div className="p-1 bg-[#3DAEFF] w-full h-full" />
            </div>
            <h1 className="w-[250px] flex items-center justify-center text-3xl font-semibold uppercase bg-gradient-to-t from-[#3DAEFF] to-[#0059A7]">
              Blue Team
            </h1>
          </div>
          <div id="time" className="h-full flex">
            <h1 className="w-[70px] flex items-center justify-center text-5xl font-semibold bg-gradient-to-t from-[#3DAEFF] to-[#0059A7]">
              {blueScore}
            </h1>
            <h1 className="w-[150px] flex items-center justify-center text-5xl text-black">
              {timeConvert(time)}
            </h1>
            <h1 className="w-[70px] flex items-center justify-center text-5xl font-semibold bg-gradient-to-t from-[#F19E18] to-[#E05819]">
              {orangeScore}
            </h1>
          </div>
          <div
            id="orangeteam"
            className="flex border-l-[10px] border-l-neutral-900"
          >
            <h1 className="w-[250px] flex items-center justify-center text-3xl font-semibold uppercase bg-gradient-to-t from-[#F19E18] to-[#E05819]">
              Orange Team
            </h1>
            <div className="h-full w-24 bg-neutral-900 border-r-[10px] border-r-[#F19E18]">
              <div className="p-1 bg-[#F19E18] w-full h-full" />
            </div>
          </div>
        </div>
        <div className="flex">
          <div className="w-[250px] h-5 px-1 flex items-center justify-end bg-neutral-900">
            <div className="h-2 w-10 mx-1 bg-neutral-700" />
            <div className="h-2 w-10 mx-1 bg-neutral-700" />
            <div className="h-2 w-10 mx-1 bg-neutral-700" />
            <div className="h-2 w-10 mx-1 bg-[#3DAEFF]" />
          </div>
          <div className="h-9 w-[290px] px-9 mx-[10px] flex items-center justify-between text-xl font-semibold uppercase bg-neutral-900">
            <p>Game X</p>
            <p>|</p>
            <p>Best of 7</p>
          </div>
          <div className="w-[250px] h-5 px-1 flex items-center justify-start bg-neutral-900">
            <div className="h-2 w-10 mx-1 bg-[#F19E18]" />
            <div className="h-2 w-10 mx-1 bg-neutral-700" />
            <div className="h-2 w-10 mx-1 bg-neutral-700" />
            <div className="h-2 w-10 mx-1 bg-neutral-700" />
          </div>
        </div>
      </div>

      <div
        id="players"
        className="w-full absolute top-4 flex items-center justify-between"
      >
        <div className="flex flex-col">
          {bluePlayers.map((p) => (
            <div
              key={p.id}
              className="min-w-[307px] py-[6px] pl-[26px] pr-[9px] bg-neutral-900"
            >
              <div className="mb-1 flex items-center justify-between font-semibold uppercase">
                <p>{p.name}</p>
                <p>{p.boost}</p>
              </div>
              <div id="boostbar" className="h-[6px] w-full flex relative">
                <div className="w-full h-full flex bg-neutral-700" />
                <div
                  className="absolute h-full bg-[#3DAEFF]"
                  style={{ width: `${p.boost}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col">
          {orangePlayers.map((p) => (
            <div
              key={p.id}
              className="min-w-[307px] py-[6px] pr-[26px] pl-[9px] bg-neutral-900"
            >
              <div className="mb-1 flex items-center justify-between font-semibold uppercase">
                <p>{p.boost}</p>
                <p>{p.name}</p>
              </div>
              <div
                id="boostbar"
                className="h-[6px] w-full flex justify-end relative"
              >
                <div className="w-full h-full flex bg-neutral-700" />
                <div
                  className="absolute h-full bg-[#F19E18]"
                  style={{ width: `${p.boost}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div id="bottomBar" className="w-full flex absolute bottom-0">
        <div className="px-5 bg-[#c8a92e]">
          <p className="font-semibold uppercase">Username</p>
          <div
            id="boostbar"
            className="h-[6px] w-full flex justify-end relative"
          >
            <div className="w-full h-full flex bg-neutral-700" />
            <div
              className="absolute h-full bg-white"
              style={{ width: "60%" }}
            />
          </div>
        </div>
        <div className="px-[10px] flex bg-neutral-900"></div>
      </div>
    </div>
  );
}
