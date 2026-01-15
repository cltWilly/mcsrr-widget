"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DefaultWidget, OnlySmallBoxWidget } from "@/components/widget";
import { CustomizableWidget } from "@/components/customizableWidget";
import { GraphWidget } from "@/components/graphWidget";
import { CarouselWidget } from "@/components/carouselWidget";
import { 
  fetchInitPlayer, 
  fetchAllMatches, 
  getEloPlusMinus 
} from "@/lib/generatorUtils";
import { calculateAverageTime, formatTime, calWinRate, rankIcons, ranksTable } from "@/lib/widgetUtils";

function convertDateToTimestamp(date) {
  const decodedDate = decodeURIComponent(date);
  return Math.floor(new Date(decodedDate).getTime() / 1000);
}

function WidgetPage({ params }) {
  const searchParams = useSearchParams();
  const player = searchParams.get('player');
  const widgetType = searchParams.get('widgetType');
  const layoutParam = searchParams.get('layout');
  const canvasWidth = parseInt(searchParams.get('width')) || 300;
  const canvasHeight = parseInt(searchParams.get('height')) || 100;
  const graphType = searchParams.get('graphType') || 'winLossHistory';
  const graphWidth = parseInt(searchParams.get('graphWidth')) || 320;
  const graphHeight = parseInt(searchParams.get('graphHeight')) || 96;
  const opacity = parseInt(searchParams.get('opacity')) || 100;
  const bgColor = searchParams.get('bgColor') || "#171e1f";
  const showTimer = searchParams.get('showTimer') === 'false' ? false : true;
  const fontFamily = searchParams.get('fontFamily') || "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial";
  
  // Bold text options
  const boldRank = searchParams.get('boldRank') === 'true' || searchParams.get('boldRank') === null;
  const boldElo = searchParams.get('boldElo') === 'true';
  const boldWLD = searchParams.get('boldWLD') === 'true' || searchParams.get('boldWLD') === null;
  const boldWinRate = searchParams.get('boldWinRate') === 'true';
  const boldMatches = searchParams.get('boldMatches') === 'true';
  
  // Player head option
  const usePlayerHead = searchParams.get('usePlayerHead') === 'true';
  
  const carouselWidgetsParam = searchParams.get('carouselWidgets');
  const carouselWidgets = carouselWidgetsParam ? carouselWidgetsParam.split(',') : ["1", "4"];
  const transitionDuration = parseInt(searchParams.get('transitionDuration')) || 5;
  const showProgressIndicator = searchParams.get('showProgressIndicator') === 'false' ? false : true;
  const timestamp = params.time;
  
  // Parse layout configuration
  let layout = null;
  if (layoutParam) {
    try {
      layout = JSON.parse(decodeURIComponent(layoutParam));
    } catch (e) {
      console.log("Parsed layout:", layout);
      console.error('Failed to parse layout:', e);
    }
  }

  console.log("timestamp: " + timestamp);

  const [playerUUID, setPlayerUUID] = useState(null);
  const [playerName, setPlayerName] = useState(player);
  const [startElo, setStartElo] = useState(null);
  const [currentElo, setCurrentElo] = useState(null);
  const [eloPlusMinus, setEloPlusMinus] = useState(null);
  const [initialTimestamp, setInitialTimestamp] = useState(convertDateToTimestamp(timestamp));

  console.log("initialTimestamp: " + initialTimestamp);

  const didFetchRef = useRef(false);

  const [playerRank, setPlayerRank] = useState(null);
  const [eloRank, setEloRank] = useState(null);
  const [winCount, setWinCount] = useState(null);
  const [lossCount, setLossCount] = useState(null);
  const [drawCount, setDrawCount] = useState(null);
  const [matches, setMatches] = useState(null);
  const [averageTime, setAverageTime] = useState(null);
  const [apiError, setApiError] = useState(null);



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
    if (!player || didFetchRef.current) {
      return;
    }
    didFetchRef.current = true;
    let interval;

    fetchInitPlayer(player).then((data) => {
        if (!data) {
          setApiError('MCSR Ranked API is currently unavailable. Please try again later.');
          return;
        }
        
        setApiError(null);
        setPlayerUUID(data.uuid);
        setStartElo(data.eloRate);
        setEloRank(data.eloRank || null);

        fetchAllMatches(data.uuid, initialTimestamp).then((result) => {
          if (!result) {
            setApiError('Failed to fetch match data. API may be down for maintenance.');
            return;
          }
          
          const { allMatches, winCount, lossCount, drawsCount } = result;
          setMatches(allMatches);
          setWinCount(winCount);
          setLossCount(lossCount);
          setDrawCount(drawsCount);

          setEloPlusMinus(getEloPlusMinus(allMatches, data.uuid, initialTimestamp));
          setCurrentElo(allMatches[0]?.players.find(player => player.uuid === data.uuid)?.eloRate || data.eloRate);
          
          // Calculate average time
          const avgTimeMs = calculateAverageTime(allMatches, data.uuid, initialTimestamp);
          setAverageTime(formatTime(avgTimeMs));
        });

        interval = setInterval(async () => {
          console.log("fetching new win loss data");
          console.log("current timestamp: " + initialTimestamp);

          // Only fetch eloRank for customizable widget (type 3)
          if (widgetType === '3') {
            const updatedPlayerData = await fetchInitPlayer(player);
            if (updatedPlayerData) {
              setEloRank(updatedPlayerData.eloRank || null);
            }
          }
          
          const result = await fetchAllMatches(data.uuid, initialTimestamp);
          if (!result) {
            setApiError('Failed to refresh match data. API may be down.');
            return;
          }
          
          setApiError(null);
          const { allMatches, winCount, lossCount, drawsCount } = result;
          setMatches(allMatches);
          setWinCount(winCount);
          setLossCount(lossCount);
          setDrawCount(drawsCount);

          console.log("win count: " + winCount);
          console.log("loss count: " + lossCount);
          console.log("draw count: " + drawsCount);

          setEloPlusMinus(getEloPlusMinus(allMatches, data.uuid, initialTimestamp));
          setCurrentElo(allMatches[0]?.players.find(player => player.uuid === data.uuid)?.eloRate || currentElo);
          
          // Update average time
          const avgTimeMs = calculateAverageTime(allMatches, data.uuid, initialTimestamp);
          setAverageTime(formatTime(avgTimeMs));
        }, 2 * 60 * 1000); // 2 minutes

        console.log(data);

        if (currentElo === null) {
          setCurrentElo(data.eloRate);
          setEloPlusMinus(0);
        }

        setPlayerRank(getRank(data.eloRate));
      });

  return () => clearInterval(interval); // Clear interval on component unmount
  }, [player]);

  // Recalculate player rank whenever currentElo changes
  useEffect(() => {
    if (currentElo !== null) {
      setPlayerRank(getRank(currentElo));
    }
  }, [currentElo]);

  return (
    <div className="relative min-h-screen" style={{ opacity: opacity / 100 }}>
      <div className="absolute top-0 left-0">
        {apiError ? (
          <div className="bg-[#171e1f] text-white rounded-md p-6 shadow-lg border-2 border-red-500" style={{ width: widgetType === '3' ? `${canvasWidth}px` : widgetType === '4' ? `${graphWidth}px` : '300px', minHeight: widgetType === '3' ? `${canvasHeight}px` : widgetType === '4' ? `${graphHeight}px` : '100px' }}>
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <div className="text-red-400 font-bold text-lg mb-2">API Error</div>
              <div className="text-gray-300 text-sm leading-relaxed">{apiError}</div>
              <div className="mt-4 text-xs text-gray-500">Retrying automatically...</div>
            </div>
          </div>
        ) : widgetType === '1' ? (
          <DefaultWidget
            uuid={playerUUID}
            elo={currentElo}
            eloPlusMinus={eloPlusMinus}
            playerRank={playerRank}
            startTimestamp={initialTimestamp}
            winCount={winCount}
            lossCount={lossCount}
            drawCount={drawCount}
            bgColor={bgColor}
            showTimer={showTimer}
            fontFamily={fontFamily}
            boldRank={boldRank}
            boldElo={boldElo}
            boldWLD={boldWLD}
            boldWinRate={boldWinRate}
            boldMatches={boldMatches}
            usePlayerHead={usePlayerHead}
            playerName={playerName}
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
            bgColor={bgColor}
            fontFamily={fontFamily}
            boldWLD={boldWLD}
            boldWinRate={boldWinRate}
            boldMatches={boldMatches}
          />
        ) : widgetType === '3' ? (
          <CustomizableWidget
            uuid={playerUUID}
            elo={currentElo}
            eloRank={eloRank}
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
            bgColor={bgColor}
          />
        ) : widgetType === '4' ? (
          <GraphWidget
            matches={matches || []}
            playerUUID={playerUUID}
            startTimestamp={initialTimestamp}
            graphType={graphType}
            graphWidth={graphWidth}
            graphHeight={graphHeight}
            bgColor={bgColor}
            fontFamily={fontFamily}
            showTimer={showTimer}
          />
        ) : widgetType === '5' ? (
          <CarouselWidget
            carouselWidgets={carouselWidgets}
            transitionDuration={transitionDuration}
            playerUUID={playerUUID}
            startTimestamp={initialTimestamp}
            graphType={graphType}
            graphWidth={graphWidth}
            graphHeight={graphHeight}
            playerData={{
              rankIcon: rankIcons[playerRank],
              playerRank: playerRank,
              elo: currentElo,
              eloPlusMinus: eloPlusMinus,
              winCount: winCount,
              lossCount: lossCount,
              drawCount: drawCount,
              winRate: calWinRate(winCount, lossCount, drawCount),
              matches: matches || []
            }}
            opacity={opacity}
            bgColor={bgColor}
            showTimer={showTimer}
            fontFamily={fontFamily}
            showProgressIndicator={showProgressIndicator}
            widget1ShowTimer={showTimer}
            widget4ShowTimer={showTimer}
          />
        ) : (
          <div>widgetType is missing</div>
        )}
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