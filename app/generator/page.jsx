"use client";

import { useState } from "react";
import { Widget } from "@/components/component/widget";

async function fetchInitPlayer(playerName) {
  const res = await fetch(`https://mcsrranked.com/api/users/${playerName}`);
  const result = await res.json();
  console.log(result);
  return result.data;
}

async function fetchPlayerMatches(playerUUID) {
  const res = await fetch(`https://mcsrranked.com/api/users/${playerUUID}/matches?type=2&excludedecay=false&count=50`);
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
  const [playerName, setPlayerName] = useState("");
  const [timestampOption, setTimestampOption] = useState("now");
  const [selectedTimestamp, setSelectedTimestamp] = useState("");
  const [previewData, setPreviewData] = useState({});
  const [widgetUrl, setWidgetUrl] = useState("");

  const handlePlayerNameChange = (e) => {
    setPlayerName(e.target.value);
  };

  const handleTimestampOptionChange = (e) => {
    setTimestampOption(e.target.value);
  };

  const handleTimestampChange = (e) => {
    setSelectedTimestamp(e.target.value);
  };

  const handleGeneratePreview = async () => {
    // Fetch player data
    const playerData = await fetchInitPlayer(playerName);
    const playerUUID = playerData.uuid;
    const startElo = playerData.eloRate;

    // Fetch player matches
    const matches = await fetchPlayerMatches(playerUUID);
    const startTimestamp = timestampOption === "now" ? getCurrentTimestamp() : new Date(selectedTimestamp).getTime() / 1000;
    const { wins, losses } = getWinLoss(matches, playerUUID, startTimestamp);

    // Calculate win rate
    const totalGames = wins + losses;
    const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : 0;

    // Calculate elo plus minus
    const eloPlusMinus = getEloPlusMinus(matches, playerUUID, startTimestamp);

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

    const rankIcon = rankIcons[getRank(startElo)];
    const playerRank = getRank(startElo);


    // Update preview data
    setPreviewData({
      rankIcon: rankIcon,
      playerRank: playerRank,
      elo: startElo,
      eloPlusMinus: eloPlusMinus,
      winCount: wins,
      lossCount: losses,
      winRate,
      totalGames,
    });
    // Generate widget URL
    const baseUrl = window.location.origin;
    const timestamp = timestampOption === "now" ? "now" : selectedTimestamp;
    const url = `${baseUrl}/widget/${encodeURIComponent(timestamp)}?player=${encodeURIComponent(playerName)}`;
    setWidgetUrl(url);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(widgetUrl);
    alert("URL copied to clipboard!");
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Widget Generator</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Player Name</label>
        <input
          type="text"
          value={playerName}
          onChange={handlePlayerNameChange}
          className="mt-1 block w-1/2 p-2 border border-gray-300 rounded-md bg-gray-900 text-white"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Timestamp</label>
        <div className="mt-1">
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="now"
              checked={timestampOption === "now"}
              onChange={handleTimestampOptionChange}
              className="form-radio"
            />
            <span className="ml-2">Now</span>
          </label>
          <label className="inline-flex items-center ml-4">
            <input
              type="radio"
              value="custom"
              checked={timestampOption === "custom"}
              onChange={handleTimestampOptionChange}
              className="form-radio"
            />
            <span className="ml-2">Custom</span>
          </label>
        </div>
        {timestampOption === "custom" && (
          <input
            type="datetime-local"
            value={selectedTimestamp}
            onChange={handleTimestampChange}
            className="mt-1 block w-1/2 p-2 border border-gray-300 rounded-md bg-gray-900 text-white"
          />
        )}
      </div>
      <button
        onClick={handleGeneratePreview}
        className="px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        Generate Preview
      </button>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Widget Preview</h2>
        <Widget {...previewData} />
      </div>
      {widgetUrl && (
       <div className="mt-4">
       <h3 className="text-lg font-bold mb-2">Widget URL</h3>
       <div className="flex items-center">
         <input
           type="text"
           value={widgetUrl}
           readOnly
           className="p-2 w-1/2 border border-gray-300 rounded-md bg-gray-900 text-white"
         />
         <button
           onClick={handleCopyUrl}
           className="ml-2 px-4 py-2 bg-green-500 text-white rounded-md"
         >
           Copy URL
         </button>
       </div>
       <p className="mt-2 text-sm text-gray-600">
         Copy this link and paste it into a browser source. It is recommended to use width of <strong>300px</strong> and height of <strong>100px</strong>.
       </p>
     </div>
      )}
    </div>
  );
}