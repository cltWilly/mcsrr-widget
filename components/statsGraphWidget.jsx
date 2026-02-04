"use client";

import { useState, useEffect, useRef } from "react";
import { calWinRate, countMatches, normalizePlusMinusElo, rankIcons } from "@/lib/widgetUtils";
import { AnimatedNumber, AnimatedPercentage } from "./AnimatedNumber";

export function StatsGraphWidget({ 
  uuid, 
  elo, 
  eloPlusMinus, 
  winCount, 
  lossCount, 
  drawCount,
  matches,
  playerUUID,
  startTimestamp,
  playerRank,
  bgColor = "#171e1f", 
  fontFamily = "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
  lastFetchTime = null 
}) {
  const canvasRef = useRef(null);
  const [countdown, setCountdown] = useState(120);
  const animationRef = useRef(null);

  const winRate = calWinRate(winCount, lossCount, drawCount);
  const totalGames = countMatches(winCount, lossCount, drawCount);
  const normalizedEloDiff = normalizePlusMinusElo(eloPlusMinus);
  
  // Calculate match count
  const matchCount = matches ? matches.filter(match => match.date > startTimestamp).length : 0;
  
  // Get rank icon
  const rankIcon = rankIcons[playerRank] || "/coal.png";

  useEffect(() => {
    if (lastFetchTime) {
      setCountdown(120);
    }
  }, [lastFetchTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 120));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Draw mini graph
  useEffect(() => {
    if (!canvasRef.current || !matches || matches.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const startTime = Date.now();
    const duration = 1000;

    const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawEloGraph(ctx, matches, playerUUID, startTimestamp, canvas.width, canvas.height, easeProgress, elo, eloPlusMinus);
    
    if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
    }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [matches, playerUUID, startTimestamp]);

  return (
    <div 
      className="relative flex items-stretch overflow-hidden rounded-lg"
      style={{ 
        backgroundColor: bgColor,
        fontFamily: fontFamily,
        width: '420px',
        height: '96px'
      }}
    >
      {/* Rank Icon */}
      <div className="flex items-center justify-center pl-3 pr-2">
        <img 
          src={rankIcon} 
          alt={playerRank} 
          className="w-10 h-10"
          width="64"
          height="64"
          style={{ aspectRatio: "40/40", objectFit: "cover", imageRendering: "pixelated" }}
        />
      </div>
      
      {/* Left side - Stats */}
      <div className="flex flex-col justify-center pr-1 py-3" style={{ width: '200px' }}>
        {/* Elo with difference */}
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[32px] font-bold text-white leading-none">
            <AnimatedNumber value={elo} duration={1000} />
          </div>
          <div className={`text-[20px] font-semibold leading-none ${eloPlusMinus >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {normalizedEloDiff}
          </div>
        </div>
        
        {/* Stats row */}
        <div className="flex items-center gap-3 text-white">
          {/* W/L record */}
          <div className="text-sm font-semibold">
            {winCount}W {lossCount}L
          </div>
          
          {/* Win rate */}
          <div className="text-sm font-semibold">
            <AnimatedPercentage value={winRate} duration={1000} />%
          </div>
          
          {/* Rank */}
          <div className="text-sm font-semibold text-gray-300">
            #{matchCount}
          </div>
        </div>
      </div>

      {/* Divider */}
      {/* {bgColor !== 'transparent' && (
           <div className="w-px bg-gray-700 my-2" /> 
      )} */}

      {/* Right side - Mini Graph */}
      <div className="flex-1 flex items-center justify-center pl-1 py-1 relative">
        <canvas 
          ref={canvasRef} 
          width={200}
          height={92}
          style={{ width: '200px', height: '92px' }}
        />
      </div>

      {/* Timer
      {showTimer && (
        <div className="absolute bottom-1 left-2 text-xs text-gray-400">
          {countdown}s
        </div>
      )} */}
      
      {/* Match count */}
      {/* <div className="absolute bottom-1 right-2 text-xs text-gray-400">
        {matchCount} matches
      </div> */}
    </div>
  );
}

function drawEloGraph(ctx, matches, playerUUID, startTimestamp, width, height, progress = 1, currentElo, eloPlusMinus) {
 const canvasWidth = width;
 const canvasHeight = height;

  const filteredMatches = matches
    .filter(match => match.date > startTimestamp)
    .sort((a, b) => a.date - b.date);

  if (filteredMatches.length === 0) {
    ctx.fillStyle = '#9ca3af';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No matches yet', width / 2, height / 2);
    return;
  }

  // Take only last 15 matches for better spacing in mini graph
  const recentMatches = filteredMatches;

//   const canvasWidth = width - 16;
//   const canvasHeight = height - 20;
  const padding = 12;
  const graphWidth = canvasWidth - padding * 2;
  const graphHeight = canvasHeight - padding * 2;

  let cumulativeWins = 0;
  let cumulativeLosses = 0;
  
  const dataPoints = recentMatches.map((match, index) => {
    const isWin = match.result && match.result.uuid === playerUUID;
    const isDraw = match.result && match.result.uuid === null;
    const isLoss = !isWin && !isDraw;

    if (isWin) cumulativeWins++;
    if (isLoss) cumulativeLosses++;
    
    const netWins = cumulativeWins - cumulativeLosses;
    
    return {
      x: padding + (index / Math.max(recentMatches.length - 1, 1)) * graphWidth,
      y: 0,
      netWins,
      isWin,
      isDraw,
      isLoss
    };
  });

  // Find min/max for better scaling 
  const netWinsArray = dataPoints.map(p => p.netWins);
  const minNet = Math.min(...netWinsArray, 0);
  const maxNet = Math.max(...netWinsArray, 0);
  const baseRange = maxNet - minNet;
  const range = Math.max(baseRange + 4, 10);
  // Calculate Y positions 
  dataPoints.forEach(point => {
    const normalized = (point.netWins - minNet) / range;
    point.y = canvasHeight - padding - (normalized * graphHeight);
  });

  // Draw horizontal grid lines
  ctx.strokeStyle = '#2d3748';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 2; i++) {
    const y = padding + (i / 2) * graphHeight;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(canvasWidth - padding, y);
    ctx.stroke();
  }

  // Draw zero line if visible
  if (minNet < 0 && maxNet > 0) {
    const zeroY = canvasHeight - padding - ((-minNet) / range * graphHeight);
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(padding, zeroY);
    ctx.lineTo(canvasWidth - padding, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Draw area under line with gradient (animate with progress)
  if (dataPoints.length > 0 && progress > 0) {
    const animatedDataPoints = dataPoints.slice(0, Math.ceil(dataPoints.length * progress));
    
    const gradient = ctx.createLinearGradient(0, padding, 0, canvasHeight - padding);
    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.3)');
    gradient.addColorStop(0.5, 'rgba(96, 165, 250, 0.2)');
    gradient.addColorStop(1, 'rgba(239, 68, 68, 0.3)');
    
    ctx.globalAlpha = progress;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(animatedDataPoints[0].x, canvasHeight - padding);
    ctx.lineTo(animatedDataPoints[0].x, animatedDataPoints[0].y);
    animatedDataPoints.forEach(point => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.lineTo(animatedDataPoints[animatedDataPoints.length - 1].x, canvasHeight - padding);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Draw connecting line with gradient (animate with progress)
  if (dataPoints.length > 0 && progress > 0) {
    const animatedDataPoints = dataPoints.slice(0, Math.ceil(dataPoints.length * progress));
    
    const lineGradient = ctx.createLinearGradient(0, padding, 0, canvasHeight - padding);
    lineGradient.addColorStop(0, '#10b981');
    lineGradient.addColorStop(0.5, '#3b82f6');
    lineGradient.addColorStop(1, '#ef4444');
    
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(animatedDataPoints[0].x, animatedDataPoints[0].y);
    animatedDataPoints.forEach(point => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
  }

  // Draw points with glow effect (animate appearance) - scaled up for better visibility
  dataPoints.forEach((point, index) => {
    const pointProgress = Math.max(0, Math.min(1, (progress * dataPoints.length - index) / 1));
    if (pointProgress <= 0) return;
    
    const scale = pointProgress;
    ctx.globalAlpha = pointProgress;
    
    // Glow
    ctx.shadowBlur = 5 * scale;
    ctx.shadowColor = point.isWin ? '#22c55e' : point.isDraw ? '#9ca3af' : '#ef4444';
    
    // Outer circle - slightly bigger for small graph visibility
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3 * scale, 0, 2 * Math.PI);
    ctx.fillStyle = point.isWin ? '#22c55e' : point.isDraw ? '#6b7280' : '#ef4444';
    ctx.fill();
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    // Inner highlight
    ctx.beginPath();
    ctx.arc(point.x, point.y, 2 * scale, 0, 2 * Math.PI);
    ctx.fillStyle = point.isWin ? '#4ade80' : point.isDraw ? '#9ca3af' : '#f87171';
    ctx.fill();
    
    // Border for better contrast
    ctx.strokeStyle = '#171e1f';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    ctx.globalAlpha = 1;
  });

  // Draw labels for min/max values
  ctx.globalAlpha = progress;
  ctx.fillStyle = '#d1d5db';
  ctx.font = 'bold 8px sans-serif';
  ctx.textAlign = 'left';
  
// const maxDataY = Math.min(...dataPoints.map(p => p.y));
// const minDataY = Math.max(...dataPoints.map(p => p.y));

  const maxY = canvasHeight - padding - ((maxNet - minNet) / range * graphHeight);
  const minY = canvasHeight - padding - ((minNet - minNet) / range * graphHeight);

  // Top label (max value)
  if (maxNet > 0) {
    ctx.fillText(`+${maxNet}`, 2, maxY + 7);
  } else {
    ctx.fillText(`${maxNet}`, 2, maxY + 7);
  }
  
  // Bottom label (min value)
  ctx.fillText(`${minNet}`, 2, minY + 3);
  
  ctx.globalAlpha = 1;
}