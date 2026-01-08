"use client";

import { useState, useEffect } from "react";
import { DefaultWidget, OnlySmallBoxWidget } from "./widget";
import { GraphWidget } from "./graphWidget";

export function CarouselWidget({ 
  carouselWidgets = ["1", "4"], 
  transitionDuration = 5,
  playerData,
  playerUUID,
  startTimestamp,
  graphType = "winLossHistory",
  opacity = 100,
  bgColor = "#171e1f",
  showTimer = true,
  fontFamily = "Inter, system-ui, sans-serif",
  showProgressIndicator = true
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [countdown, setCountdown] = useState(120);

  useEffect(() => {
    if (carouselWidgets.length === 0) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselWidgets.length);
        setIsTransitioning(false);
      }, 300); // Fade out duration
    }, transitionDuration * 1000);

    return () => clearInterval(interval);
  }, [carouselWidgets.length, transitionDuration]);

  // Shared countdown timer for carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 120));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!carouselWidgets || carouselWidgets.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-red-500">
        No widgets selected for carousel
      </div>
    );
  }

  const currentWidgetType = carouselWidgets[currentIndex];

  const renderWidget = () => {
    switch (currentWidgetType) {
      case "1":
        return (
          <DefaultWidget
            uuid={playerUUID}
            rankIcon={playerData.rankIcon}
            playerRank={playerData.playerRank}
            elo={playerData.elo}
            eloPlusMinus={playerData.eloPlusMinus}
            winCount={playerData.winCount}
            lossCount={playerData.lossCount}
            drawCount={playerData.drawCount || 0}
            startTimestamp={startTimestamp}
            opacity={opacity}
            bgColor={bgColor}
            showTimer={false}
            fontFamily={fontFamily}
          />
        );
      case "2":
        return (
          <OnlySmallBoxWidget
            uuid={playerUUID}
            elo={playerData.elo}
            eloPlusMinus={playerData.eloPlusMinus}
            playerRank={playerData.playerRank}
            winCount={playerData.winCount}
            lossCount={playerData.lossCount}
            drawCount={playerData.drawCount || 0}
            startTimestamp={startTimestamp}
            opacity={opacity}
            bgColor={bgColor}
            fontFamily={fontFamily}
          />
        );
      case "4":
        return (
          <GraphWidget
            matches={playerData.matches || []}
            playerUUID={playerUUID}
            startTimestamp={startTimestamp}
            graphType={graphType}
            opacity={opacity}
            bgColor={bgColor}
            showTimer={false}
            fontFamily={fontFamily}
            graphWidth={320}
            graphHeight={96}
          />
        );
      default:
        return <div>Unknown widget type</div>;
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div
        className={`transition-opacity duration-300 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        {renderWidget()}
      </div>
      
      {/* Progress indicator */}
      {showProgressIndicator && (
        <div className={`absolute left-1/2 transform -translate-x-1/2 flex gap-1.5 ${
          currentWidgetType === "2" ? "bottom-1" : "bottom-2"
        }`}>
          {carouselWidgets.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? "w-6 bg-blue-500" 
                  : "w-1.5 bg-gray-500"
              }`}
            />
          ))}
        </div>
      )}
      
      {/* Shared timer for all widgets in carousel */}
      {showTimer && (
        <div className="absolute bottom-1 left-2 text-xs text-gray-400">
          {countdown}s
        </div>
      )}
    </div>
  );
}
