"use client";

import { Widget } from "@/components/component/widget";
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from "react";

async function fetchInitPlayer(playerName) {
  const res = await fetch(`https://mcsrranked.com/api/users/${playerName}`);
    const result = await res.json();
    console.log(result);
    return result.data;
}

async function fetchPlayerMatches(playerUUID) {
    const res = await fetch(`https://mcsrranked.com/api/users/${playerUUID}/matches?type=2&excludedecay=false`);
    const result = await res.json();
    console.log(result);
    return result.data;
}

function getCurrentTimestamp() {
    const date = Math.floor(Date.now() / 1000);
    // adjust the date +2 hours
    console.log(date - 2 * 60 * 60);
    return date;

    // return Math.floor(Date.now() / 1000);
}

function getWinLoss(matches, playerUUID, startTimestamp) {
    let wins = 0;
    let losses = 0;

    console.log("startTimestamp: " + startTimestamp + " in date format: " + new Date(startTimestamp * 1000));
  
    matches.forEach(match => {
      if (match.date > startTimestamp) {
        if (match.result.uuid === playerUUID) {
          wins++;
        } else {
          losses++;
        }
      }
    });
  
    return { wins, losses };
}


/*
 "data": [
    {
      "id": 1317319,
      "type": 2,
      "category": "ANY",
      "gameMode": "default",
      "players": [
        {
          "uuid": "70eb9286e3e24153a8b37c8f884f1292",
          "nickname": "7rowl",
          "roleType": 0,
          "eloRate": 1699,
          "eloRank": 53,
          "weeklyRaces": []
        },
        {
          "uuid": "a81886565121479782d42408d94fe97d",
          "nickname": "affordab1e",
          "roleType": 1,
          "eloRate": 1542,
          "eloRank": 114,
          "weeklyRaces": []
        }
      ],
      "spectators": [],
      "result": {
        "uuid": "a81886565121479782d42408d94fe97d",
        "time": 9936
      },
      "forfeited": true,
      "decayed": false,
      "rank": {
        "season": null,
        "allTime": null
      },
      "changes": [
        {
          "uuid": "a81886565121479782d42408d94fe97d",
          "change": 26,
          "eloRate": 1550
        },
        {
          "uuid": "70eb9286e3e24153a8b37c8f884f1292",
          "change": -26,
          "eloRate": 1725
        }
      ],
      "season": 6,
      "date": 1729251645,
      "seedType": "BURIED_TREASURE",
      "bastionType": "TREASURE",
      "tag": null
    },
*/
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




export default function Page() {
  const searchParams = useSearchParams();
  const player = searchParams.get('player'); 

  const [playerUUID, setPlayerUUID] = useState(null);
  const [startElo, setStartElo] = useState(null);
  const [currentElo, setCurrentElo] = useState(null);
  const [eloPlusMinus, setEloPlusMinus] = useState(null);
  const [initialTimestamp, setInitialTimestamp] = useState(null);

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
        const initialTimestamp = getCurrentTimestamp();
        setInitialTimestamp(initialTimestamp);
      

  
        fetchPlayerMatches(data.uuid).then((matches) => {
            console.log(initialTimestamp);
          const { wins, losses } = getWinLoss(matches, data.uuid, initialTimestamp);
          setWinCount(wins);
          setLossCount(losses);

          
        });
  
        interval = setInterval(() => {
            console.log("fetching new win loss data");
            console.log("current timestamp: " + initialTimestamp);
          fetchPlayerMatches(data.uuid).then((matches) => {
            const { wins, losses } = getWinLoss(matches, data.uuid, initialTimestamp);
            setWinCount(wins);
            setLossCount(losses);

            console.log("win count: " + wins);
            console.log("loss count: " + losses);

            // set eloPlusMinus to the (+/-) elo change from statTimestamp to furure
            setEloPlusMinus(getEloPlusMinus(matches, data.uuid, initialTimestamp));
            // update currentElo
            setCurrentElo(matches[0].players.find(player => player.uuid === data.uuid).eloRate);
          });
        }, 2 * 60 * 1000); // 2 minutes
  
        console.log(data);
  
        // if currentElo is null, set it to startElo
        if (currentElo === null) {
          setCurrentElo(data.eloRate);
          setEloPlusMinus(0);
        }
  
        // set playerRank
        setPlayerRank(getRank(data.eloRate));
      });
  
      return () => clearInterval(interval); // Clear interval on component unmount
    }
  }, [player]);
  
        
  return (
    <div className="relative min-h-screen">
      <div className="absolute top-0 left-0">
        <Widget uuid= {playerUUID} elo={currentElo} eloPlusMinus={eloPlusMinus} playerRank={playerRank} startTimestamp={initialTimestamp} winCount={winCount} lossCount= {lossCount} /> 
        {/* <a>playerName: {player}</a> */}
      </div>
    </div>
  );
}