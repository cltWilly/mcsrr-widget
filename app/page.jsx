"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronRight, Github, Loader2, Info } from "lucide-react";
import { DefaultWidget, OnlySmallBoxWidget } from "@/components/widget";
import { DragDropWidgetEditor } from "@/components/customizableWidget";
import { toast, Toaster } from "sonner";
import {
  fetchInitPlayer,
  fetchAllMatches,
  getCurrentTimestamp,
  getEloPlusMinus
} from "@/lib/generatorUtils";
import { calculateAverageTime, formatTime, getRank } from "@/lib/widgetUtils";
import { AVAILABLE_FONTS } from "@/lib/customWidgetHelpers";

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
  const [opacity, setOpacity] = useState(100);
  const [bgColor, setBgColor] = useState("#171e1f");
  const [showTimer, setShowTimer] = useState(true);
  const [fontFamily, setFontFamily] = useState(AVAILABLE_FONTS[0]);
  
  // Bold text options for default and small widgets
  const [boldRank, setBoldRank] = useState(true);
  const [boldElo, setBoldElo] = useState(false);
  const [boldWLD, setBoldWLD] = useState(true);
  const [boldWinRate, setBoldWinRate] = useState(false);
  const [boldMatches, setBoldMatches] = useState(false);
  
  // Carousel widget configuration
  const [carouselWidgets, setCarouselWidgets] = useState(["1", "4"]); // Default: Default + Graph
  const [transitionDuration, setTransitionDuration] = useState(5); // seconds
  const [showProgressIndicator, setShowProgressIndicator] = useState(true);
  
  // Smart Conditions state
  const [isSmartConditionsOpen, setIsSmartConditionsOpen] = useState(false);
  const [isStyleSettingsOpen, setIsStyleSettingsOpen] = useState(false);

  // Track whether data is being updated
  const [isUpdating, setIsUpdating] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState('Copy URL');
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);

  // Debounce timer ref
  const debounceTimerRef = useRef(null);

  // Auto-update preview with debounce when config changes
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Only auto-update if player name is set and we're not in the middle of an update
    if (playerName && playerName.trim() !== "" && !isUpdating) {
      // For custom timestamp, also check if it's set
      if (timestampOption === "custom" && (!selectedTimestamp || selectedTimestamp.trim() === "")) {
        return;
      }

      // Set a debounce timer (500ms delay)
      debounceTimerRef.current = setTimeout(() => {
        handleGeneratePreview();
      }, 500);
    }

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [playerName, timestampOption, selectedTimestamp, widgetTypeOption, opacity, bgColor, showTimer, fontFamily, widgetLayout, canvasWidth, canvasHeight, graphType, graphWidth, graphHeight, carouselWidgets, transitionDuration, showProgressIndicator, boldRank, boldElo, boldWLD, boldWinRate, boldMatches]);

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
    const newType = e.target.value;
    setWidgetTypeOption(newType);
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
    let url = `${baseUrl}/widget/${encodeURIComponent(timestamp)}?widgetType=${encodeURIComponent(widgetTypeOption)}&player=${encodeURIComponent(playerName)}&opacity=${opacity}&bgColor=${encodeURIComponent(bgColor)}`;
    
    // Add showTimer parameter for default widget and graph widget
    if (widgetTypeOption === "1" || widgetTypeOption === "4") {
      url += `&showTimer=${showTimer}`;
    }
    
    // Add fontFamily parameter for widgets 1, 2, and 4
    if (widgetTypeOption === "1" || widgetTypeOption === "2" || widgetTypeOption === "4") {
      url += `&fontFamily=${encodeURIComponent(fontFamily)}`;
    }
    
    // Add bold text options for default and small widgets
    if (widgetTypeOption === "1" || widgetTypeOption === "2") {
      url += `&boldWLD=${boldWLD}&boldWinRate=${boldWinRate}&boldMatches=${boldMatches}`;
      if (widgetTypeOption === "1") {
        url += `&boldRank=${boldRank}&boldElo=${boldElo}`;
      }
    }
    
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
    
    // Add carousel configuration
    if (widgetTypeOption === "5") {
      url += `&carouselWidgets=${encodeURIComponent(carouselWidgets.join(','))}`;
      url += `&transitionDuration=${transitionDuration}`;
      url += `&showProgressIndicator=${showProgressIndicator}`;
      url += `&showTimer=${showTimer}`;
      url += `&fontFamily=${encodeURIComponent(fontFamily)}`;
      url += `&graphType=${encodeURIComponent(graphType)}`;
      url += `&graphWidth=${graphWidth}&graphHeight=${graphHeight}`;
    }
    
    // Apply canvas and graph size changes (only when Generate/Update pressed)
    setAppliedCanvasWidth(canvasWidth);
    setAppliedCanvasHeight(canvasHeight);
    setAppliedGraphWidth(graphWidth);
    setAppliedGraphHeight(graphHeight);
    
    setWidgetUrl(url);

    // Keep loader visible for at least 800ms for better user feedback
    setTimeout(() => {
      setIsUpdating(false);
    }, 500);
    } catch (error) {
      console.error("Error generating preview:", error);
      toast.error("An error occurred while generating the preview. Please try again.");
      setTimeout(() => {
        setIsUpdating(false);
      }, 500);
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
  const recommendedWidth = widgetTypeOption === "3" ? appliedCanvasWidth : widgetTypeOption === "4" ? 320 : widgetTypeOption === "2" ? 130 : widgetTypeOption === "5" ? 320 : 300;
  const recommendedHeight = widgetTypeOption === "3" ? appliedCanvasHeight : widgetTypeOption === "4" ? 136 : widgetTypeOption === "2" ? 96 : widgetTypeOption === "5" ? 176 : 100;

  return (
    <div className="p-8">
      <div className="mb-6 p-3 bg-blue-900/20 border border-blue-700/30 rounded-md">
        <p className="text-sm text-blue-300">
          <span className="font-semibold">Note:</span> This generator is currently in development. UI improvements and additional functionality will be added in future updates. See roadmap on{" "}
          <a
            href="https://github.com/cltWilly/mcsrr-widget/tree/master?tab=readme-ov-file#-roadmap"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white"
          >
            GitHub
          </a>.
        </p>
      </div>
      <Toaster position="top-center" richColors />
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Widget Generator</h1>
        <a
          href="https://github.com/cltWilly/mcsrr-widget"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <Github className="h-6 w-6" />
          <span className="text-sm">GitHub</span>
        </a>
      </div>
      <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
        <div className="lg:w-1/2 w-full">
          <h2 className="text-xl font-bold mb-4">Configuration</h2>
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
        <div className="flex items-center gap-2 mb-1">
          <label className="block text-sm font-medium font-bold">Timestamp</label>
          <div className="group relative">
            <Info className="h-4 w-4 text-gray-400 cursor-help" />
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-72 p-2 bg-gray-800 text-white text-xs rounded-md shadow-lg z-10 border border-gray-600">
              <strong>Now:</strong> Use as default for OBS. Shows stats from current moment onwards<br/>
              <strong>Custom:</strong> Use for accurate data from a specific date/time (e.g., when OBS crashes and you need to restore from that point)
            </div>
          </div>
        </div>
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
          <option value="5">Carousel (Multiple Widgets)</option>
        </select>
      </div>
      
      {/* Style Settings Collapsible Section */}
      <div className="mb-4 border border-gray-600 rounded-md w-full md:w-1/2">
        <button
          onClick={() => setIsStyleSettingsOpen(!isStyleSettingsOpen)}
          className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-750 text-white font-medium rounded-md flex items-center justify-between transition-colors"
        >
          <span>Style Settings</span>
          {isStyleSettingsOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
        
        {isStyleSettingsOpen && (
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium font-bold mb-2">Widget Opacity</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={opacity}
                  onChange={(e) => setOpacity(parseInt(e.target.value))}
                  className="flex-1 max-w-xs"
                />
                <span className="text-white text-sm w-12">{opacity}%</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium font-bold mb-2">Background Color</label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-10 w-20 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  placeholder="#171e1f"
                  className="w-32 p-2 border border-gray-300 rounded-md bg-gray-900 text-white text-sm"
                />
                <button
                  onClick={() => setBgColor("transparent")}
                  className="px-2 py-2 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded-md whitespace-nowrap"
                >
                  Transparent
                </button>
                <button
                  onClick={() => setBgColor("#171e1f")}
                  className="px-2 py-2 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded-md whitespace-nowrap"
                >
                  Default
                </button>
              </div>
            </div>
            
            {(widgetTypeOption === "1" || widgetTypeOption === "2" || widgetTypeOption === "4") && (
              <div>
                <label className="block text-sm font-medium mb-2">Font Family</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="mt-1 block w-full max-w-sm p-2 border border-gray-300 rounded-md bg-gray-900 text-white text-sm"
                >
                  {AVAILABLE_FONTS.map((font, index) => (
                    <option key={index} value={font} style={{ fontFamily: font }}>
                      {font.split(',')[0].replace(/[\"']/g, '')}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {(widgetTypeOption === "1" || widgetTypeOption === "4") && (
              <div>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showTimer}
                    onChange={(e) => setShowTimer(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span>Show Timer</span>
                </label>
              </div>
            )}
            
            {/* Bold Text Options */}
            {(widgetTypeOption === "1" || widgetTypeOption === "2") && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Bold Text Options</h4>
                <div className="space-y-2">
                  {widgetTypeOption === "1" && (
                    <>
                      <label className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={boldRank}
                          onChange={(e) => setBoldRank(e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <span>Bold Rank Name</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={boldElo}
                          onChange={(e) => setBoldElo(e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <span>Bold ELO</span>
                      </label>
                    </>
                  )}
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={boldWLD}
                      onChange={(e) => setBoldWLD(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span>Bold W/L/D</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={boldWinRate}
                      onChange={(e) => setBoldWinRate(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span>Bold Win Rate</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={boldMatches}
                      onChange={(e) => setBoldMatches(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span>Bold Match Count</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Smart Conditions Collapsible Section */}
      {widgetTypeOption === "3" && (
        <div className="mb-4 border border-gray-600 rounded-md w-full md:w-1/2">
          <button
            onClick={() => setIsSmartConditionsOpen(!isSmartConditionsOpen)}
            className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-750 text-white font-medium rounded-md flex items-center justify-between transition-colors"
          >
            <span>Smart Conditions</span>
            {isSmartConditionsOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
          
          {isSmartConditionsOpen && (
            <div className="p-4">
              <p className="text-sm text-gray-400 mb-3">
                Configure conditional colors for your custom widget elements. Elements like ELO +/- and Win Rate can automatically change colors based on their values.
              </p>
              <div className="bg-gray-900 p-3 rounded-md">
                <h4 className="text-sm font-semibold text-white mb-2">Supported Elements:</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <div>
                      <strong>ELO +/-</strong>
                      <p className="text-xs text-gray-400">Green for positive, red for negative, gray for neutral</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <div>
                      <strong>Win Rate %</strong>
                      <p className="text-xs text-gray-400">Green for high (≥60%), white for medium, red for low (≤40%)</p>
                    </div>
                  </li>
                </ul>
                <div className="mt-3 p-2 bg-blue-900/20 border border-blue-700/30 rounded">
                  <p className="text-xs text-blue-300">
                    To configure: Open Widget Editor → Add an element with smart color support → Click the element → Expand "Smart Color Conditions" in the style settings
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
     
      {widgetTypeOption === "3" && (
        <div className="mb-4">
          <button
            onClick={() => setIsEditorModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded w-full md:w-auto"
          >
            Open Widget Editor
          </button>
          {widgetLayout && widgetLayout.length > 0 && (
            <p className="mt-2 text-sm text-green-400">
              ✓ Layout configured ({widgetLayout.length} elements)
            </p>
          )}
        </div>
      )}
      
      {widgetTypeOption === "5" && (
        <div className="mb-4 p-4 border border-gray-600 rounded-md w-full md:w-1/2">
          <h3 className="text-lg font-bold mb-3">Carousel Configuration</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium font-bold mb-2">Select Widgets to Display</label>
            <div className="space-y-2">
              {[
                { value: "1", label: "Default Widget" },
                { value: "2", label: "Small Box Widget" },
                { value: "4", label: "Graph Widget" }
              ].map(widget => (
                <label key={widget.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={carouselWidgets.includes(widget.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCarouselWidgets([...carouselWidgets, widget.value]);
                      } else {
                        setCarouselWidgets(carouselWidgets.filter(w => w !== widget.value));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm">{widget.label}</span>
                </label>
              ))}
            </div>
            {carouselWidgets.length < 2 && (
              <p className="mt-2 text-sm text-yellow-400">⚠ Select at least 2 widgets for carousel</p>
            )}
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium font-bold mb-2">Transition Duration</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="3"
                max="15"
                value={transitionDuration}
                onChange={(e) => setTransitionDuration(parseInt(e.target.value))}
                className="flex-1 max-w-xs"
              />
              <span className="text-white text-sm w-16">{transitionDuration}s</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">Time each widget displays before transitioning</p>
          </div>
          <div>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showProgressIndicator}
                onChange={(e) => setShowProgressIndicator(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <span>Show Progress Indicator</span>
            </label>
          </div>
          
          {/* Graph Widget Settings (if graph widget is selected) */}
          {carouselWidgets.includes("4") && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <h4 className="text-md font-bold mb-2">Graph Widget Settings</h4>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-2">Graph Type</label>
                <select
                  value={graphType}
                  onChange={(e) => setGraphType(e.target.value)}
                  className="block w-full p-2 border border-gray-300 rounded-md bg-gray-900 text-white text-sm"
                >
                  <option value="winLossHistory">Win/Loss History</option>
                  <option value="eloHistory">ELO History</option>
                  <option value="opponentEloDistribution">Opponent ELO Distribution</option>
                  <option value="winRateByOpponentElo">Win Rate by Opponent ELO</option>
                </select>
              </div>
              <div className="flex gap-4 mb-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-1">Width (px)</label>
                  <input
                    type="number"
                    value={graphWidth}
                    onChange={(e) => setGraphWidth(parseInt(e.target.value) || 320)}
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-900 text-white text-sm"
                    min="200"
                    max="600"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-1">Height (px)</label>
                  <input
                    type="number"
                    value={graphHeight}
                    onChange={(e) => setGraphHeight(parseInt(e.target.value) || 96)}
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-900 text-white text-sm"
                    min="60"
                    max="200"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Generate Widget button - commented out for auto-preview */}
      {/* <button
        onClick={handleGeneratePreview}
        className="mb-4 bg-blue-500 text-white font-bold py-2 px-4 rounded w-full md:w-auto"
        disabled={isUpdating} // Disable button when updating
      >
        {isUpdating 
          ? (widgetTypeOption === "3" && widgetLayout && widgetLayout.length > 0 && widgetUrl ? "Updating..." : "Generating...") 
          : (widgetTypeOption === "3" && widgetLayout && widgetLayout.length > 0 && widgetUrl ? "Update Widget" : "Generate Widget")
        }
      </button> */}
      </div>
      <div className="lg:w-1/2 w-full lg:sticky lg:top-8 lg:self-start">
  
      <div className="lg:mt-0 mt-8">
        {widgetUrl && (
          <>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              Widget Preview
              {isUpdating && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
            </h2>
            <div className="mb-4 flex justify-start">
              {widgetUrl && (
                <iframe
                  src={widgetUrl}
                  className="rounded-md"
                    style={{ 
                    width: widgetTypeOption === "3" ? `${appliedCanvasWidth}px` : widgetTypeOption === "4" ? `${appliedGraphWidth}px` : widgetTypeOption === "5" ? '320px' : '100%',
                    height: widgetTypeOption === "3" ? `${appliedCanvasHeight}px` : widgetTypeOption === "4" ? `${appliedGraphHeight + 40}px` : widgetTypeOption === "5" ? '176px' : '6.0rem',
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

      {/* Custom Widget Editor Modal */}
      {isEditorModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setIsEditorModalOpen(false)}>
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Customize Widget Layout</h2>
              <button
                onClick={() => setIsEditorModalOpen(false)}
                className="text-gray-400 hover:text-white text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium font-bold mb-2 text-white">Canvas Size</label>
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
              <div className="mb-4">
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
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsEditorModalOpen(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}