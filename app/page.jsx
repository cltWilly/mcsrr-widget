"use client";

import { useState } from "react";
import { DefaultWidget, OnlySmallBoxWidget } from "@/components/widget";
import { DragDropWidgetEditor } from "@/components/customizableWidget";
import { toast, Toaster } from "sonner";
import {
  fetchInitPlayer,
  fetchAllMatches,
  getCurrentTimestamp,
  getEloPlusMinus
} from "@/lib/generatorUtils";
import { calculateAverageTime, formatTime } from "@/lib/widgetUtils";

export default function Page() {
  const [playerName, setPlayerName] = useState("");
  const [timestampOption, setTimestampOption] = useState("now");
  const [widgetTypeOption, setWidgetTypeOption] = useState("1");
  const [selectedTimestamp, setSelectedTimestamp] = useState("");
  const [previewData, setPreviewData] = useState({});
  const [widgetUrl, setWidgetUrl] = useState("");
  const [widgetLayout, setWidgetLayout] = useState(null);
  const [canvasWidth, setCanvasWidth] = useState(300);
  const [canvasHeight, setCanvasHeight] = useState(100);
  const [appliedCanvasWidth, setAppliedCanvasWidth] = useState(300);
  const [appliedCanvasHeight, setAppliedCanvasHeight] = useState(100);
  const [graphType, setGraphType] = useState("winLossHistory");
  const [graphWidth, setGraphWidth] = useState(320);
  const [graphHeight, setGraphHeight] = useState(96);
  const [appliedGraphWidth, setAppliedGraphWidth] = useState(320);
  const [appliedGraphHeight, setAppliedGraphHeight] = useState(96);

  // Track whether data is being updated
  const [isUpdating, setIsUpdating] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState('Copy URL');

  const handlePlayerNameChange = (e) => {
    setPlayerName(e.target.value);
  };

  const handleTimestampOptionChange = (e) => {
    setTimestampOption(e.target.value);
  };

  const handleTimestampChange = (e) => {
    setSelectedTimestamp(e.target.value);
  };

  const handleWidgetTypeChange = (e) => {
    setWidgetTypeOption(e.target.value);
  };

  const handleGeneratePreview = async () => {
    // Validate player name is not empty
    if (!playerName || playerName.trim() === "") {
      toast.error("Please enter a player name");
      return;
    }

    // Validate custom timestamp is set if custom option is selected
    if (timestampOption === "custom" && (!selectedTimestamp || selectedTimestamp.trim() === "")) {
      toast.error("Please select a custom timestamp");
      return;
    }

    setIsUpdating(true); // Set loading state

    try {
      // Fetch player data
      const playerData = await fetchInitPlayer(playerName);
      
      // Check if player was found
      if (!playerData || !playerData.uuid) {
        toast.error("Player not found. Please check the player name and try again.");
        setIsUpdating(false);
        return;
      }

      const playerUUID = playerData.uuid;
      const startElo = playerData.eloRate;

    // Set timestamp
    const startTimestamp = timestampOption === "now" ? getCurrentTimestamp() : new Date(selectedTimestamp).getTime() / 1000;

    // Fetch all player matches
    const matchesResult = await fetchAllMatches(playerUUID, startTimestamp);
    
    // Check if API call failed
    if (!matchesResult) {
      toast.error("MCSR Ranked API is currently unavailable. Please try again later.");
      setIsUpdating(false);
      return;
    }
    
    const { allMatches, winCount, lossCount, drawCount } = matchesResult;

    // Calculate win rate
    const totalGames = winCount + lossCount;
    const winRate = totalGames > 0 ? ((winCount / totalGames) * 100).toFixed(1) : 0;

    // Calculate elo plus/minus
    const eloPlusMinus = getEloPlusMinus(allMatches, playerUUID, startTimestamp);

    // Calculate average completion time
    const averageTimeMs = calculateAverageTime(allMatches, playerUUID, startTimestamp);
    const averageTime = formatTime(averageTimeMs);

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
      winCount: winCount,
      lossCount: lossCount,
      drawCount: drawCount,
      winRate,
      totalGames,
      averageTime,
    });

    // Generate widget URL
    const baseUrl = window.location.origin;
    const timestamp = timestampOption === "now" ? "now" : selectedTimestamp;
    let url = `${baseUrl}/widget/${encodeURIComponent(timestamp)}?widgetType=${encodeURIComponent(widgetTypeOption)}&player=${encodeURIComponent(playerName)}`;
    
    // Add layout configuration for customizable widget
    if (widgetTypeOption === "3" && widgetLayout) {
      url += `&layout=${encodeURIComponent(JSON.stringify(widgetLayout))}`;
      url += `&width=${canvasWidth}&height=${canvasHeight}`;
    }
    
    // Add graph configuration for graph widget
    if (widgetTypeOption === "4") {
      url += `&graphType=${encodeURIComponent(graphType)}`;
      url += `&graphWidth=${graphWidth}&graphHeight=${graphHeight}`;
    }
    
    // Apply canvas and graph size changes (only when Generate/Update pressed)
    setAppliedCanvasWidth(canvasWidth);
    setAppliedCanvasHeight(canvasHeight);
    setAppliedGraphWidth(graphWidth);
    setAppliedGraphHeight(graphHeight);
    
    setWidgetUrl(url);

    setIsUpdating(false); // Reset loading state
    } catch (error) {
      console.error("Error generating preview:", error);
      toast.error("An error occurred while generating the preview. Please try again.");
      setIsUpdating(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(widgetUrl);

    setCopyButtonText('Copied!');

    setTimeout(() => {
      setCopyButtonText('Copy URL');
    }, 1000); 
  };

  // Recommend sizes based on selected widget and applied dimensions
  const recommendedWidth = widgetTypeOption === "3" ? appliedCanvasWidth : widgetTypeOption === "4" ? appliedGraphWidth : 300;
  const recommendedHeight = widgetTypeOption === "3" ? appliedCanvasHeight : widgetTypeOption === "4" ? appliedGraphHeight : 100;

  return (
    <div className="p-8">
      <Toaster position="top-center" richColors />
      <h1 className="text-2xl font-bold mb-4">Widget Generator</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/2 w-full">
      <div className="mb-4">
        <label className="block text-sm font-medium font-bold">Player Name</label>
        <input
          type="text"
          value={playerName}
          onChange={handlePlayerNameChange}
          className="mt-1 block w-full md:w-1/2 p-2 border border-gray-300 rounded-md bg-gray-900 text-white"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium font-bold">Timestamp</label>
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
            max={new Date().toISOString().slice(0, 16)}
            className="mt-1 block w-full md:w-1/2 p-2 border border-gray-300 rounded-md bg-gray-900 text-white"
          />
        )}
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium font-bold">Widget Type</label>
        <select
          value={widgetTypeOption}
          onChange={handleWidgetTypeChange}
          className="mt-1 block w-full md:w-1/2 p-2 border border-gray-300 rounded-md bg-gray-900 text-white"
        >
          <option value="1">Default Widget</option>
          <option value="2">Small box Widget</option>
          <option value="3">Customizable Widget (Drag & Drop)</option>
          <option value="4">Graph Widget</option>
        </select>
      </div>
     
      {widgetTypeOption === "3" && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium font-bold mb-2">Canvas Size</label>
            <div className="flex gap-4 items-center">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Width (px)</label>
                <input
                  type="number"
                  value={canvasWidth}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || val === '-') {
                      setCanvasWidth(100);
                    } else {
                      const num = parseInt(val);
                      if (!isNaN(num)) {
                        setCanvasWidth(num);
                      }
                    }
                  }}
                  onBlur={(e) => {
                    const num = parseInt(e.target.value);
                    if (isNaN(num) || num < 100) {
                      setCanvasWidth(100);
                    } else if (num > 800) {
                      setCanvasWidth(800);
                    }
                  }}
                  className="block w-24 p-2 border border-gray-300 rounded-md bg-gray-900 text-white"
                  min="100"
                  max="800"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Height (px)</label>
                <input
                  type="number"
                  value={canvasHeight}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || val === '-') {
                      setCanvasHeight(50);
                    } else {
                      const num = parseInt(val);
                      if (!isNaN(num)) {
                        setCanvasHeight(num);
                      }
                    }
                  }}
                  onBlur={(e) => {
                    const num = parseInt(e.target.value);
                    if (isNaN(num) || num < 50) {
                      setCanvasHeight(50);
                    } else if (num > 400) {
                      setCanvasHeight(400);
                    }
                  }}
                  className="block w-24 p-2 border border-gray-300 rounded-md bg-gray-900 text-white"
                  min="50"
                  max="400"
                />
              </div>
              <button
                onClick={() => {
                  setCanvasWidth(300);
                  setCanvasHeight(100);
                }}
                className="mt-4 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md"
              >
                Reset Size
              </button>
            </div>
          </div>
          <div 
            className="mb-4"
            style={{ 
              maxWidth: canvasWidth > 300 ? `${canvasWidth + 236}px` : '535px'
            }}
          >
            <DragDropWidgetEditor 
              onLayoutChange={setWidgetLayout} 
              initialLayout={widgetLayout}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              onCanvasSizeChange={(width, height) => {
                setCanvasWidth(width);
                setCanvasHeight(height);
              }}
            />
          </div>
        </>
      )}
      <button
        onClick={handleGeneratePreview}
        className="mb-4 bg-blue-500 text-white font-bold py-2 px-4 rounded w-full md:w-auto"
        disabled={isUpdating} // Disable button when updating
      >
        {isUpdating 
          ? (widgetTypeOption === "3" && widgetLayout && widgetLayout.length > 0 && widgetUrl ? "Updating..." : "Generating...") 
          : (widgetTypeOption === "3" && widgetLayout && widgetLayout.length > 0 && widgetUrl ? "Update Widget" : "Generate Widget")
        }
      </button>
      </div>
      <div className="lg:w-1/2 w-full">
  
      <div className="mt-8">
        {widgetUrl && (
          <>
            <h2 className="text-xl font-bold mb-4">Widget Preview</h2>
            <div className="mb-4 flex justify-start">
              {widgetUrl && (
                <iframe
                  src={widgetUrl}
                  className="rounded-md"
                    style={{ 
                    width: widgetTypeOption === "3" ? `${appliedCanvasWidth}px` : widgetTypeOption === "4" ? `${appliedGraphWidth}px` : '100%',
                    height: widgetTypeOption === "3" ? `${appliedCanvasHeight}px` : widgetTypeOption === "4" ? `${appliedGraphHeight + 40}px` : '6.0rem',
                    overflow: 'hidden' 
                  }}
                  title="Widget Preview"
                  scrolling="no"
                ></iframe>
              )}
            </div>
            {widgetUrl && (
              <div className="mt-4">
                <h3 className="text-lg font-bold mb-2">Widget URL</h3>
                <div className="flex items-center flex-nowrap">
                  <input
                    type="text"
                    value={widgetUrl}
                    readOnly
                    className="p-2 h-10 w-full border border-gray-300 rounded-md bg-gray-900 text-white"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="ml-2 px-4 bg-green-500 text-white rounded-md h-10 flex items-center justify-center whitespace-nowrap min-w-max"
                  >
                    {copyButtonText}
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Copy this link and paste it into a browser source. Recommended size: <strong>{recommendedWidth}px</strong> width and <strong>{recommendedHeight}px</strong> height.
                </p>
              </div>
            )}
          </>
        )}
      </div>
      </div>
      </div>
    </div>
  );
}