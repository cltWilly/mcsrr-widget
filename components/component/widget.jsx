import { useState, useEffect } from "react";
import { calWinRate, countMatches, normalizePlusMinusElo, rankIcons } from "@/lib/widgetUtils";


export function DefaultWidget({ uuid, elo, eloPlusMinus, playerRank, startTimestamp, winCount, lossCount, drawCount }) {

  const winRate = calWinRate(winCount, lossCount, drawCount);
  const totalGames = countMatches(winCount, lossCount, drawCount);
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
            <span className="text-green-500">{winCount}W</span> <span className="text-red-500">{lossCount}L</span> <span className="text-gray-400">{drawCount}D</span>
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



export function OnlySmallBoxWidget({ uuid, elo, eloPlusMinus, playerRank, startTimestamp, winCount, lossCount, drawCount })  {

  const winRate = calWinRate(winCount, lossCount, drawCount);
  const totalGames = countMatches(winCount, lossCount, drawCount);
  eloPlusMinus = normalizePlusMinusElo(eloPlusMinus);

  const [countdown, setCountdown] = useState(120);

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
          <span className="text-green-500">{winCount}W</span> <span className="text-red-500">{lossCount}L</span> <span className="text-gray-400">{drawCount}D</span>
        </div>
        <div className="text-base mb-0.5">{winRate}% WR</div> 
        <div className="text-base text-gray-400"> 
          {totalGames} {totalGames === 1 ? "MATCH" : "MATCHES"}
        </div>
      </div>
    </div>
  );
}
