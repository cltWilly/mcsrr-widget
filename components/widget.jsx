import { useState, useEffect } from "react";
import { calWinRate, countMatches, normalizePlusMinusElo, rankIcons } from "@/lib/widgetUtils";
import { AnimatedNumber, AnimatedPercentage } from "./AnimatedNumber";

export function DefaultWidget({ uuid, elo, eloPlusMinus, playerRank, startTimestamp, winCount, lossCount, drawCount }) {

  const winRate = calWinRate(winCount, lossCount, drawCount);
  const totalGames = countMatches(winCount, lossCount, drawCount);
  eloPlusMinus = normalizePlusMinusElo(eloPlusMinus);
  const rankIcon = rankIcons[playerRank];

  const [countdown, setCountdown] = useState(120);
  const [debugMode, setDebugMode] = useState(false);
  const [debugElo, setDebugElo] = useState(null);
  const [debugWins, setDebugWins] = useState(null);
  const [debugLosses, setDebugLosses] = useState(null);
  const [debugDraws, setDebugDraws] = useState(null);

  // Use debug values if available, otherwise use props
  const displayElo = debugElo ?? elo;
  const displayWins = debugWins ?? winCount;
  const displayLosses = debugLosses ?? lossCount;
  const displayDraws = debugDraws ?? drawCount;
  const displayWinRate = calWinRate(displayWins, displayLosses, displayDraws);
  const displayTotal = countMatches(displayWins, displayLosses, displayDraws);

  const simulateIncrease = () => {
    setDebugElo((prev) => (prev ?? elo) + Math.floor(Math.random() * 20) + 5);
    setDebugWins((prev) => (prev ?? winCount) + 1);
  };

  const simulateDecrease = () => {
    setDebugElo((prev) => Math.max(0, (prev ?? elo) - Math.floor(Math.random() * 15) - 5));
    setDebugLosses((prev) => (prev ?? lossCount) + 1);
  };

  const resetDebug = () => {
    setDebugElo(null);
    setDebugWins(null);
    setDebugLosses(null);
    setDebugDraws(null);
  };


  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 120));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#171e1f] text-white p-4 rounded-md w-full max-w-xs relative">
      <div className="flex items-center space-x-4">
        <img
          src={rankIcon}
          alt="Rank Icon"
          className="w-10 h-10"
          width="64"
          height="64"
          style={{ aspectRatio: "40/40", objectFit: "cover", imageRendering: "pixelated" }} />
        <div>
          <div className="text-lg font-bold">{playerRank}</div>
          <div className="text-sm text-gray-400">
            <AnimatedNumber value={displayElo} /> ELO ({eloPlusMinus})
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className="font-bold text-sm">
            <span className="text-green-500"><AnimatedNumber value={displayWins} />W</span>{" "}
            <span className="text-red-500"><AnimatedNumber value={displayLosses} />L</span>{" "}
            <span className="text-gray-400"><AnimatedNumber value={displayDraws} />D</span>
          </div>
          <div className="text-sm"><AnimatedPercentage value={parseFloat(displayWinRate)} />% WR</div>
          <div className="text-sm text-gray-400">
            <AnimatedNumber value={displayTotal} /> {displayTotal === 1 ? "MATCH" : "MATCHES"}
          </div>
        </div>
      </div>
      <div className="absolute bottom-1 left-2 text-xs text-gray-400">
        {countdown}s
      </div>
      {/* Debug controls */}
      {/* <div className="absolute top-1 right-1">
        <button
          onClick={() => setDebugMode(!debugMode)}
          className="text-xs px-1 py-0.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
          title="Toggle debug mode"
        >
         🐛
        </button>
      </div> */}
      {debugMode && (
        <div className="absolute -bottom-12 left-0 right-0 flex gap-1 justify-center">
          <button
            onClick={simulateIncrease}
            className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-white"
          >
            +Win
          </button>
          <button
            onClick={simulateDecrease}
            className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-white"
          >
            +Loss
          </button>
          <button
            onClick={resetDebug}
            className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-white"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}

export function OnlySmallBoxWidget({ uuid, elo, eloPlusMinus, playerRank, startTimestamp, winCount, lossCount, drawCount })  {

  const winRate = calWinRate(winCount, lossCount, drawCount);
  const totalGames = countMatches(winCount, lossCount, drawCount);
  eloPlusMinus = normalizePlusMinusElo(eloPlusMinus);

  const [countdown, setCountdown] = useState(120);
  const [debugMode, setDebugMode] = useState(false);
  const [debugWins, setDebugWins] = useState(null);
  const [debugLosses, setDebugLosses] = useState(null);
  const [debugDraws, setDebugDraws] = useState(null);

  // Use debug values if available, otherwise use props
  const displayWins = debugWins ?? winCount;
  const displayLosses = debugLosses ?? lossCount;
  const displayDraws = debugDraws ?? drawCount;
  const displayWinRate = calWinRate(displayWins, displayLosses, displayDraws);
  const displayTotal = countMatches(displayWins, displayLosses, displayDraws);

  const simulateIncrease = () => {
    setDebugWins((prev) => (prev ?? winCount) + 1);
  };

  const simulateDecrease = () => {
    setDebugLosses((prev) => (prev ?? lossCount) + 1);
  };

  const resetDebug = () => {
    setDebugWins(null);
    setDebugLosses(null);
    setDebugDraws(null);
  };


  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 120));
    }, 1000);

    return () => clearInterval(interval);
  }, []);



  return (
    <div className="bg-[#171e1f] text-white p-2 rounded-md w-full max-w-xs relative">
      <div className="flex flex-col items-center justify-center h-full mb-0">
        <div className="font-bold text-xl mb-0.5"> 
          <span className="text-green-500"><AnimatedNumber value={displayWins} />W</span>{" "}
          <span className="text-red-500"><AnimatedNumber value={displayLosses} />L</span>{" "}
          <span className="text-gray-400"><AnimatedNumber value={displayDraws} />D</span>
        </div>
        <div className="text-base mb-0.5"><AnimatedPercentage value={parseFloat(displayWinRate)} />% WR</div> 
        <div className="text-base text-gray-400"> 
          <AnimatedNumber value={displayTotal} /> {displayTotal === 1 ? "MATCH" : "MATCHES"}
        </div>
      </div>
      {/* Debug controls */}
      <div className="absolute top-1 right-1">
        <button
          onClick={() => setDebugMode(!debugMode)}
          className="text-xs px-1 py-0.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
          title="Toggle debug mode"
        >
          🐛
        </button>
      </div>
      {debugMode && (
        <div className="absolute -bottom-10 left-0 right-0 flex gap-1 justify-center">
          <button
            onClick={simulateIncrease}
            className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-white"
          >
            +W
          </button>
          <button
            onClick={simulateDecrease}
            className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-white"
          >
            +L
          </button>
          <button
            onClick={resetDebug}
            className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-white"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
