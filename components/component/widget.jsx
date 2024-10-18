import { useState, useEffect } from "react";


export function Widget({ uuid, elo, eloPlusMinus, playerRank, startTimestamp, winCount, lossCount }) {

  const rankIcons = {
    "Iron 1": "/iron.png",
    "Iron 2": "/iron.png",
    "Iron 3": "/iron.png",
    "Gold 1": "/gold.png",
    "Gold 2": "/gold.png",
    "Gold 3": "/gold.png",
    "Emerald 1": "/emerald.png",
    "Emerald 2": "/emerald.png",
    "Emerald 3": "/emerald.png",
    "Diamond 1": "/diamond.png",
    "Diamond 2": "/diamond.png",
    "Diamond 3": "/diamond.png",
    "Netherite 1": "/netherite.png",
  };

  // make playerrank uppercase
 // playerRank = playerRank.toUpperCase();

 function calWinRate(winCount, lossCount) {
  let totalGames = winCount + lossCount;
  let winRate = (winCount / totalGames) * 100;
  return winRate.toFixed(0);
}
  const winRate = calWinRate(winCount, lossCount);

 function countMatches(winCount, lossCount) {
  let totalGames = winCount + lossCount;
  return totalGames;
 }
  const totalGames = countMatches(winCount, lossCount);

  function normalizePlusMinusElo(eloPlusMinus) {
    if (eloPlusMinus > 0) {
      return `+${eloPlusMinus}`;
    }
    return eloPlusMinus;
  }

  eloPlusMinus = normalizePlusMinusElo(eloPlusMinus);

  const rankIcon = rankIcons[playerRank];

  const [countdown, setCountdown] = useState(120);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 120));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#171e1f] text-white p-4 rounded-md w-full max-w-xs relative">
      {/* <div className="text-sm font-bold mb-2">Ranked</div> */}
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
          <div className="text-sm text-gray-400">{elo} ELO ({eloPlusMinus})</div>
        </div>
        <div className="ml-auto text-right">
          <div className="font-bold text-sm">
            <span className="text-green-500">{winCount}W</span> <span className="text-red-500">{lossCount}L</span>
          </div>
          <div className="text-sm">{winRate}% WR</div>
          <div className="text-sm text-gray-400">
            {totalGames} {totalGames === 1 ? "MATCH" : "MATCHES"}
          </div>
        </div>
      </div>
      <div className="absolute bottom-1 left-2 text-xs text-gray-400">
      {countdown}s
      </div>
    </div>
  );
}
