"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { StatsGraphWidget } from "@/components/statsGraphWidget";
import { 
  fetchInitPlayer, 
  fetchAllMatches, 
  getCurrentTimestamp, 
  getEloPlusMinus 
} from "@/lib/generatorUtils";
import { calculateAverageTime, formatTime, calWinRate, rankIcons, ranksTable } from "@/lib/widgetUtils";

function StatsWidgetContent() {
  const searchParams = useSearchParams();
  const player = searchParams.get('player');
  const statsSource = searchParams.get('statsSource') || 'now';
  const graphSource = searchParams.get('graphSource') || 'time';
  const timestamp = searchParams.get('time');
  const opacity = parseInt(searchParams.get('opacity')) || 100;
  const bgColor = searchParams.get('bgColor') || "#171e1f";
  const showTimer = searchParams.get('showTimer') === 'false' ? false : true;
  const fontFamily = searchParams.get('fontFamily') || "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial";
  
  const [playerUUID, setPlayerUUID] = useState(null);
  const [currentData, setCurrentData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);

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

  // Convert timestamp string to Unix timestamp if needed
  const getTimestampValue = () => {
    if (!timestamp) return getCurrentTimestamp();
    
    if (!isNaN(timestamp)) return parseInt(timestamp);

    return Math.floor(new Date(timestamp).getTime() / 1000);
  };

  // Initial data fetch
  // Initial data fetch
useEffect(() => {
  if (!player) return;

  let isMounted = true;

  const fetchData = async () => {
    try {
      setApiError(null);
      
      const currentPlayerData = await fetchInitPlayer(player);
      if (!isMounted) return;
      
      if (!currentPlayerData) {
        setApiError('Failed to fetch player data.');
        return;
      }

      setPlayerUUID(currentPlayerData.uuid);

      // Fetch current data with current timestamp
      const currentTimestamp = getCurrentTimestamp();
      const currentResult = await fetchAllMatches(currentPlayerData.uuid, currentTimestamp);
      
      if (!isMounted) return;
      
      if (!currentResult) {
        setApiError('Failed to fetch match data. API may be down.');
        return;
      }

      setCurrentData({
        elo: currentPlayerData.eloRate,
        rank: getRank(currentPlayerData.eloRate),
        matches: currentResult.allMatches,
        winCount: currentResult.winCount,
        lossCount: currentResult.lossCount,
        drawCount: currentResult.drawsCount,
        eloPlusMinus: getEloPlusMinus(currentResult.allMatches, currentPlayerData.uuid, currentTimestamp),
        timestamp: currentTimestamp
      });

      // Fetch historical data only if needed
      if ((statsSource === 'time' || graphSource === 'time') && timestamp) {
        const histTimestamp = getTimestampValue();
        const historicalResult = await fetchAllMatches(currentPlayerData.uuid, histTimestamp);
        
        if (!isMounted) return;
        
        if (historicalResult) {
          setHistoricalData({
            elo: currentPlayerData.eloRate,
            rank: getRank(currentPlayerData.eloRate),
            matches: historicalResult.allMatches,
            winCount: historicalResult.winCount,
            lossCount: historicalResult.lossCount,
            drawCount: historicalResult.drawsCount,
            eloPlusMinus: getEloPlusMinus(historicalResult.allMatches, currentPlayerData.uuid, histTimestamp),
            timestamp: histTimestamp
          });
        }
      }

      setLastFetchTime(Date.now());

    } catch (error) {
      console.error("Error fetching data:", error);
      setApiError('An error occurred while fetching data.');
    }
  };

  fetchData();
  const interval = setInterval(fetchData, 120000);

  return () => {
    isMounted = false;
    clearInterval(interval);
  };
}, [player, statsSource, graphSource, timestamp]);
  // Determine which data to use for stats and graph
  const statsData = statsSource === 'now' ? currentData : historicalData;
  const graphData = graphSource === 'now' ? currentData : historicalData;

  // Check if timestamp is required but not provided
  const needsTimestamp = (statsSource === 'time' || graphSource === 'time') && !timestamp;

  return (
    <div className="relative min-h-screen" style={{ opacity: opacity / 100 }}>
      <div className="absolute top-0 left-0">
        {needsTimestamp ? (
          <div className="bg-[#171e1f] text-white rounded-md p-6 shadow-lg border-2 border-yellow-500" style={{ width: '420px', minHeight: '96px' }}>
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <div className="text-yellow-400 font-bold text-lg mb-2">Configuration Error</div>
              <div className="text-gray-300 text-sm leading-relaxed">Timestamp is required when using historical data sources.</div>
              <div className="mt-2 text-xs text-gray-400">Please add &time=TIMESTAMP to the URL</div>
            </div>
          </div>
        ) : apiError ? (
          <div className="bg-[#171e1f] text-white rounded-md p-6 shadow-lg border-2 border-red-500" style={{ width: '420px', minHeight: '96px' }}>
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <div className="text-red-400 font-bold text-lg mb-2">API Error</div>
              <div className="text-gray-300 text-sm leading-relaxed">{apiError}</div>
              <div className="mt-4 text-xs text-gray-500">Retrying automatically...</div>
            </div>
          </div>
        ) : statsData && graphData ? (
          <StatsGraphWidget
            uuid={playerUUID}
            elo={statsData.elo}
            eloPlusMinus={statsData.eloPlusMinus}
            winCount={statsData.winCount}
            lossCount={statsData.lossCount}
            drawCount={statsData.drawCount}
            matches={graphData.matches || []}
            playerUUID={playerUUID}
            startTimestamp={graphData.timestamp}
            playerRank={statsData.rank}
            bgColor={bgColor}
            showTimer={showTimer}
            fontFamily={fontFamily}
            lastFetchTime={lastFetchTime}
          />
        ) : null}
      </div>
    </div>
  );
}

export default function StatsWidget() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <StatsWidgetContent />
    </Suspense>
  );
}