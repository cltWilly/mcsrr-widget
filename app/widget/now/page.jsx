"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DefaultWidget, OnlySmallBoxWidget } from "@/components/widget";
import { CustomizableWidget } from "@/components/customizableWidget";

async function fetchInitPlayer(playerName) {
  const res = await fetch(`https://mcsrranked.com/api/users/${playerName}`);
  const result = await res.json();
  console.log(result);
  return result.data;
}

// Update this function to accept 'page' parameter
async function fetchPlayerMatches(playerUUID, page = 0) {
  const res = await fetch(`https://mcsrranked.com/api/users/${playerUUID}/matches?type=2&excludedecay=false&count=50&page=${page}`);
  const result = await res.json();
  console.log(result);
  return result.data;
}

function getCurrentTimestamp() {
  const date = Math.floor(Date.now() / 1000);
  // adjust the date +2 hours
  console.log(date - 2 * 60 * 60);
  return date;
}

function getWinLoss(matches, playerUUID, startTimestamp) {
  let wins = 0;
  let losses = 0;
  let draws = 0;

  matches.forEach(match => {
    if (match.date > startTimestamp) {
      if (match.result.uuid === playerUUID) {
        wins++;
      } else if (match.result.uuid === null) {
        draws++;
      } else {
        losses++;
      }
    }
  });

  return { wins, losses, draws };
}

function getEloPlusMinus(matches, playerUUID, startTimestamp) {
  let eloPlusMinus = 0;

  matches.forEach(match => {
    if (match.date > startTimestamp) {
      match.changes.forEach(change => {
        if (change.uuid === playerUUID) {
          eloPlusMinus += change.change;
        }
      });
    }
  });

  return eloPlusMinus;
}

function calculateAverageTime(matches, playerUUID, startTimestamp) {
  const wonMatches = matches.filter(match => 
    match.date > startTimestamp && 
    match.result && 
    match.result.uuid === playerUUID && 
    match.result.time
  );

  if (wonMatches.length === 0) return null;

  const totalTime = wonMatches.reduce((sum, match) => sum + match.result.time, 0);
  const averageTimeMs = totalTime / wonMatches.length;
  
  return averageTimeMs;
}

function formatTime(milliseconds) {
  if (!milliseconds) return 'N/A';
  
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Add a function to fetch all matches across pages
async function fetchAllMatches(playerUUID, startTimestamp) {
  let page = 0;
  let allMatches = [];
  let winCount = 0;
  let lossCount = 0;
  let drawsCount = 0;

  while (true) {
    const matches = await fetchPlayerMatches(playerUUID, page);
    allMatches = allMatches.concat(matches);

    const { wins, losses, draws } = getWinLoss(matches, playerUUID, startTimestamp);
    winCount += wins;
    lossCount += losses;
    drawsCount += draws;

    // If fewer than 50 matches are returned, or the last match's date is older than the start timestamp, stop fetching
    if (matches.length < 50 || matches[matches.length - 1].date <= startTimestamp) {
      break;
    }

    page++;
  }

  return { allMatches, winCount, lossCount, drawsCount };
}

function WidgetPage() {
  const searchParams = useSearchParams();
  const player = searchParams.get('player');
  const widgetType = searchParams.get('widgetType');
  const layoutParam = searchParams.get('layout');
  const canvasWidth = parseInt(searchParams.get('width')) || 300;
  const canvasHeight = parseInt(searchParams.get('height')) || 100;
  
  // Parse layout configuration
  let layout = null;
  if (layoutParam) {
    try {
      layout = JSON.parse(decodeURIComponent(layoutParam));
    } catch (e) {
      console.error('Failed to parse layout:', e);
    }
  }

  const [playerUUID, setPlayerUUID] = useState(null);
  const [playerName, setPlayerName] = useState(player);
  const [startElo, setStartElo] = useState(null);
  const [currentElo, setCurrentElo] = useState(null);
  const [eloPlusMinus, setEloPlusMinus] = useState(null);
  const [initialTimestamp, setInitialTimestamp] = useState(null);

  const [playerRank, setPlayerRank] = useState(null);
  const [winCount, setWinCount] = useState(null);
  const [lossCount, setLossCount] = useState(null);
  const [drawCount, setDrawCount] = useState(null);
  const [matches, setMatches] = useState(null);
  const [averageTime, setAverageTime] = useState(null);

  const ranksTable = {
    "0-400": "Coal 1",
    "401-500": "Coal 2",
    "501-600": "Coal 3",
    "601-700": "Iron 1",
    "701-800": "Iron 2",
    "801-900": "Iron 3",
    "901-1000": "Gold 1",
    "1001-1100": "Gold 2",
    "1101-1200": "Gold 3",
    "1201-1300": "Emerald 1",
    "1301-1400": "Emerald 2",
    "1401-1500": "Emerald 3",
    "1501-1650": "Diamond 1",
    "1651-1800": "Diamond 2",
    "1801-2000": "Diamond 3",
    "2001+": "Netherite 1",
  };



  function getRank(elo) {
    console.log(elo);

    if (elo > 2001) {
      return "Netherite 1";
    }

    for (const range in ranksTable) {
      const [min, max] = range.split('-').map(Number);
      if (elo >= min && elo <= max) {
        return ranksTable[range];
      }
    }
    return "Unranked";
  }

  useEffect(() => {
    if (player) {
      let interval;

      fetchInitPlayer(player).then((data) => {
        setPlayerUUID(data.uuid);
        setStartElo(data.eloRate);
        const initialTimestamp = getCurrentTimestamp();
        setInitialTimestamp(initialTimestamp);

        // Fetch all matches across pages using the new function
        fetchAllMatches(data.uuid, initialTimestamp).then(({ allMatches, winCount, lossCount, drawsCount }) => {
          setMatches(allMatches);
          setWinCount(winCount);
          setLossCount(lossCount);
          setDrawCount(drawsCount);

          // Calculate Elo change and set current Elo based on the matches
          setEloPlusMinus(getEloPlusMinus(allMatches, data.uuid, initialTimestamp));
          setCurrentElo(allMatches[0].players.find(player => player.uuid === data.uuid).eloRate);
          
          // Calculate average time
          const avgTimeMs = calculateAverageTime(allMatches, data.uuid, initialTimestamp);
          setAverageTime(formatTime(avgTimeMs));
        });

        interval = setInterval(() => {
          console.log("fetching new win/loss data");
          console.log("current timestamp: " + initialTimestamp);

          // Refetch matches every 2 minutes
          fetchAllMatches(data.uuid, initialTimestamp).then(({ allMatches, winCount, lossCount, drawsCount }) => {
            setMatches(allMatches);
            setWinCount(winCount);
            setLossCount(lossCount);
            setDrawCount(drawsCount);

            console.log("win count: " + winCount);
            console.log("loss count: " + lossCount);
            console.log("draw count: " + drawsCount);

            setEloPlusMinus(getEloPlusMinus(allMatches, data.uuid, initialTimestamp));
            setCurrentElo(allMatches[0].players.find(player => player.uuid === data.uuid).eloRate);
            
            // Update average time
            const avgTimeMs = calculateAverageTime(allMatches, data.uuid, initialTimestamp);
            setAverageTime(formatTime(avgTimeMs));
          });
        }, 2 * 60 * 1000); // 2 minutes

        console.log(data);

        // If currentElo is null, set it to startElo
        if (currentElo === null) {
          setCurrentElo(data.eloRate);
          setEloPlusMinus(0);
        }

        // Set player rank
        setPlayerRank(getRank(data.eloRate));
      });

      return () => clearInterval(interval); // Clear interval on component unmount
    }
  }, [player]);

  // Recalculate player rank whenever currentElo changes
  useEffect(() => {
    if (currentElo !== null) {
      setPlayerRank(getRank(currentElo));
    }
  }, [currentElo]);

  return (
    <div className="relative min-h-screen">
      <div className="absolute top-0 left-0">
      {widgetType === '1' ? (
          <DefaultWidget
            uuid={playerUUID}
            elo={currentElo}
            eloPlusMinus={eloPlusMinus}
            playerRank={playerRank}
            startTimestamp={initialTimestamp}
            winCount={winCount}
            lossCount={lossCount}
            drawCount={drawCount}
          />
        ) : widgetType === '2' ? (
          <OnlySmallBoxWidget
            uuid={playerUUID}
            elo={currentElo}
            eloPlusMinus={eloPlusMinus}
            playerRank={playerRank}
            startTimestamp={initialTimestamp}
            winCount={winCount}
            lossCount={lossCount}
            drawCount={drawCount}
          />
        ) : widgetType === '3' ? (
          <CustomizableWidget
            uuid={playerUUID}
            elo={currentElo}
            eloPlusMinus={eloPlusMinus}
            playerRank={playerRank}
            startTimestamp={initialTimestamp}
            winCount={winCount}
            lossCount={lossCount}
            drawCount={drawCount}
            layout={layout}
            playerName={playerName}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            averageTime={averageTime}
          />
        ) : (
          <div>widgetType is missing</div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WidgetPage />
    </Suspense>
  );
}