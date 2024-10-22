"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Widget } from "@/components/component/widget";

async function fetchInitPlayer(playerName) {
  const res = await fetch(`https://mcsrranked.com/api/users/${playerName}`);
  const result = await res.json();
  console.log(result);
  return result.data;
}

async function fetchPlayerMatches(playerUUID, page = 0) {
  const res = await fetch(`https://mcsrranked.com/api/users/${playerUUID}/matches?type=2&excludedecay=false&count=50&page=${page}`);
  const result = await res.json();
  console.log(result);
  return result.data;
}

function convertDateToTimestamp(date) {
  const decodedDate = decodeURIComponent(date);
  return Math.floor(new Date(decodedDate).getTime() / 1000);
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

async function fetchAllMatches(playerUUID, startTimestamp) {
  let page = 0;
  let allMatches = [];
  let winCount = 0;
  let lossCount = 0;

  while (true) {
    const matches = await fetchPlayerMatches(playerUUID, page);
    allMatches = allMatches.concat(matches);

    const { wins, losses, draws } = getWinLoss(matches, playerUUID, startTimestamp);
    winCount += wins;
    lossCount += losses;

    if (matches.length < 50 || matches[matches.length - 1].date <= startTimestamp) {
      break;
    }

    page++;
  }

  return { allMatches, winCount, lossCount };
}

function WidgetPage({ params }) {
  const searchParams = useSearchParams();
  const player = searchParams.get('player');
  const timestamp = params.time;

  console.log("timestamp: " + timestamp);

  const [playerUUID, setPlayerUUID] = useState(null);
  const [startElo, setStartElo] = useState(null);
  const [currentElo, setCurrentElo] = useState(null);
  const [eloPlusMinus, setEloPlusMinus] = useState(null);
  const [initialTimestamp, setInitialTimestamp] = useState(convertDateToTimestamp(timestamp));

  console.log("initialTimestamp: " + initialTimestamp);

  const [playerRank, setPlayerRank] = useState(null);
  const [winCount, setWinCount] = useState(null);
  const [lossCount, setLossCount] = useState(null);
  const [matches, setMatches] = useState(null);

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

        fetchAllMatches(data.uuid, initialTimestamp).then(({ allMatches, winCount, lossCount }) => {
          setMatches(allMatches);
          setWinCount(winCount);
          setLossCount(lossCount);

          setEloPlusMinus(getEloPlusMinus(allMatches, data.uuid, initialTimestamp));
          setCurrentElo(allMatches[0].players.find(player => player.uuid === data.uuid).eloRate);
        });

        interval = setInterval(() => {
          console.log("fetching new win loss data");
          console.log("current timestamp: " + initialTimestamp);
          fetchAllMatches(data.uuid, initialTimestamp).then(({ allMatches, winCount, lossCount }) => {
            setMatches(allMatches);
            setWinCount(winCount);
            setLossCount(lossCount);

            console.log("win count: " + winCount);
            console.log("loss count: " + lossCount);

            setEloPlusMinus(getEloPlusMinus(allMatches, data.uuid, initialTimestamp));
            setCurrentElo(allMatches[0].players.find(player => player.uuid === data.uuid).eloRate);
          });
        }, 2 * 60 * 1000); // 2 minutes

        console.log(data);

        if (currentElo === null) {
          setCurrentElo(data.eloRate);
          setEloPlusMinus(0);
        }

        setPlayerRank(getRank(data.eloRate));
      });

      return () => clearInterval(interval); // Clear interval on component unmount
    }
  }, [player]);

  return (
    <div className="relative min-h-screen">
      <div className="absolute top-0 left-0">
        <Widget uuid={playerUUID} elo={currentElo} eloPlusMinus={eloPlusMinus} playerRank={playerRank} startTimestamp={initialTimestamp} winCount={winCount} lossCount={lossCount} />
      </div>
    </div>
  );
}

export default function Page({ params }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WidgetPage params={params} />
    </Suspense>
  );
}