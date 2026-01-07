"use client";

import { useState, useEffect, useRef } from "react";

export function GraphWidget({ 
  matches, 
  playerUUID, 
  startTimestamp,
  graphType = "winLossHistory",
  graphWidth = 320,
  graphHeight = 96 
}) {
  const canvasRef = useRef(null);
  const [countdown, setCountdown] = useState(120);
  const [animationProgress, setAnimationProgress] = useState(0);
  const animationRef = useRef(null);
  
  // Calculate match count
  const matchCount = matches ? matches.filter(match => match.date > startTimestamp).length : 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 120));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !matches || matches.length === 0) return;

    // Reset animation
    setAnimationProgress(0);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const startTime = Date.now();
    const duration = 1000; // 1 second animation

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
      
      setAnimationProgress(easeProgress);
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (graphType === "winLossHistory") {
        drawWinLossHistory(ctx, matches, playerUUID, startTimestamp, graphWidth, graphHeight, easeProgress);
      } else if (graphType === "eloProgression") {
        drawEloProgression(ctx, matches, playerUUID, startTimestamp, graphWidth, graphHeight, easeProgress);
      } else if (graphType === "winRateOverTime") {
        drawWinRateOverTime(ctx, matches, playerUUID, startTimestamp, graphWidth, graphHeight, easeProgress);
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [matches, playerUUID, startTimestamp, graphType, graphWidth, graphHeight]);

  return (
    <div 
      className="bg-[#171e1f] text-white rounded-md relative" 
      style={{ 
        width: graphWidth, 
        height: graphHeight + 40
      }}
    >
      <div className="p-2">
        <div className="text-sm font-semibold mb-2">
          {graphType === "winLossHistory" && "Win/Loss History"}
          {graphType === "eloProgression" && "ELO Progression"}
          {graphType === "winRateOverTime" && "Win Rate Over Time"}
        </div>
        <canvas 
          ref={canvasRef} 
          width={graphWidth - 16} 
          height={graphHeight - 20}
          className="w-full"
        />
      </div>
      <div className="absolute bottom-1 left-2 text-xs text-gray-400">
        {countdown}s
      </div>
      <div className="absolute bottom-1 right-2 text-xs text-gray-400">
        {matchCount} matches
      </div>
    </div>
  );
}

function drawWinLossHistory(ctx, matches, playerUUID, startTimestamp, width, height, progress = 1) {
  // Filter matches after the start timestamp and sort by date
  const filteredMatches = matches
    .filter(match => match.date > startTimestamp)
    .sort((a, b) => a.date - b.date);

  if (filteredMatches.length === 0) {
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No matches yet', (width - 16) / 2, (height - 20) / 2);
    return;
  }

  const canvasWidth = width - 16;
  const canvasHeight = height - 20;
  const padding = 15;
  const graphWidth = canvasWidth - padding * 2;
  const graphHeight = canvasHeight - padding * 2;

  // Calculate cumulative record
  let cumulativeWins = 0;
  let cumulativeLosses = 0;
  
  const dataPoints = filteredMatches.map((match, index) => {
    const isWin = match.result && match.result.uuid === playerUUID;
    const isDraw = match.result && match.result.uuid === null;
    const isLoss = !isWin && !isDraw;

    if (isWin) cumulativeWins++;
    if (isLoss) cumulativeLosses++;
    
    const netWins = cumulativeWins - cumulativeLosses;
    
    return {
      x: padding + (index / Math.max(filteredMatches.length - 1, 1)) * graphWidth,
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
  const range = Math.max(maxNet - minNet, 5); // Minimum range of 5 for visibility

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
    ctx.setLineDash([3, 3]);
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

  // Draw points with glow effect (animate appearance)
    dataPoints.forEach((point, index) => {
      const pointProgress = Math.max(0, Math.min(1, (progress * dataPoints.length - index) / 1));
      if (pointProgress <= 0) return;
      
      const scale = pointProgress;
      ctx.globalAlpha = pointProgress;
      
      // Glow
      ctx.shadowBlur = 6 * scale;
      ctx.shadowColor = point.isWin ? '#22c55e' : point.isDraw ? '#9ca3af' : '#ef4444';
      
      // Outer circle
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3.5 * scale, 0, 2 * Math.PI);
      ctx.fillStyle = point.isWin ? '#22c55e' : point.isDraw ? '#6b7280' : '#ef4444';
      ctx.fill();
      
      // Reset shadow
      ctx.shadowBlur = 0;
      
      // Inner highlight
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2 * scale, 0, 2 * Math.PI);
      ctx.fillStyle = point.isWin ? '#4ade80' : point.isDraw ? '#9ca3af' : '#f87171';
      ctx.fill();
      
      // Border
      ctx.strokeStyle = '#171e1f';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      ctx.globalAlpha = 1;
    });

  // Draw labels
  ctx.globalAlpha = progress;
  ctx.fillStyle = '#d1d5db';
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`+${maxNet}`, 1, padding + 8);
  ctx.fillText(`${minNet}`, 1, canvasHeight - padding);
  
  // Draw legend
  ctx.textAlign = 'right';
  ctx.font = '8px sans-serif';
  
//   // Win indicator
//   ctx.fillStyle = '#22c55e';
//   ctx.beginPath();
//   ctx.arc(canvasWidth - 42, 8, 2.5, 0, 2 * Math.PI);
//   ctx.fill();
//   ctx.fillStyle = '#d1d5db';
//   ctx.fillText('Win', canvasWidth - 30, 11);
  
//   // Loss indicator
//   ctx.fillStyle = '#ef4444';
//   ctx.beginPath();
//   ctx.arc(canvasWidth - 15, 8, 2.5, 0, 2 * Math.PI);
//   ctx.fill();
//   ctx.fillStyle = '#d1d5db';
//   ctx.fillText('Loss', canvasWidth - 3, 11);
  
  ctx.globalAlpha = 1;
}

function drawEloProgression(ctx, matches, playerUUID, startTimestamp, width, height, progress = 1) {
  const filteredMatches = matches
    .filter(match => match.date > startTimestamp)
    .sort((a, b) => a.date - b.date);

  if (filteredMatches.length === 0) {
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No matches yet', (width - 16) / 2, (height - 20) / 2);
    return;
  }

  const canvasWidth = width - 16;
  const canvasHeight = height - 20;
  const padding = 40;
  const graphWidth = canvasWidth - padding * 2;
  const graphHeight = canvasHeight - padding * 2;

  // Get ELO values
  const eloValues = filteredMatches.map(match => {
    const player = match.players.find(p => p.uuid === playerUUID);
    return player ? player.eloRate : null;
  }).filter(elo => elo !== null);

  if (eloValues.length === 0) return;

  const minElo = Math.min(...eloValues);
  const maxElo = Math.max(...eloValues);
  const eloRange = maxElo - minElo || 100; // Avoid division by zero

  // Draw axes
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, canvasHeight - padding);
  ctx.lineTo(canvasWidth - padding, canvasHeight - padding);
  ctx.stroke();

  // Draw ELO line with animation
  const animatedCount = Math.ceil(eloValues.length * progress);
  
  ctx.strokeStyle = '#8b5cf6';
  ctx.lineWidth = 2;
  ctx.beginPath();

  eloValues.slice(0, animatedCount).forEach((elo, index) => {
    const x = padding + (index / Math.max(eloValues.length - 1, 1)) * graphWidth;
    const y = canvasHeight - padding - ((elo - minElo) / eloRange) * graphHeight;

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();

  // Draw points with animation
  eloValues.slice(0, animatedCount).forEach((elo, index) => {
    const x = padding + (index / Math.max(eloValues.length - 1, 1)) * graphWidth;
    const y = canvasHeight - padding - ((elo - minElo) / eloRange) * graphHeight;

    const pointProgress = Math.max(0, Math.min(1, (progress * eloValues.length - index) / 1));
    ctx.globalAlpha = pointProgress;

    ctx.beginPath();
    ctx.arc(x, y, 3 * pointProgress, 0, 2 * Math.PI);
    ctx.fillStyle = '#8b5cf6';
    ctx.fill();
  });

  ctx.globalAlpha = 1;

  // Draw labels
  ctx.globalAlpha = progress;
  ctx.fillStyle = '#9ca3af';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${maxElo}`, 5, padding + 10);
  ctx.fillText(`${minElo}`, 5, canvasHeight - padding - 5);
  
  ctx.textAlign = 'right';
  ctx.fillText(`Current: ${eloValues[eloValues.length - 1]}`, canvasWidth - 5, 15);
  ctx.globalAlpha = 1;
}

function drawWinRateOverTime(ctx, matches, playerUUID, startTimestamp, width, height, progress = 1) {
  const filteredMatches = matches
    .filter(match => match.date > startTimestamp)
    .sort((a, b) => a.date - b.date);

  if (filteredMatches.length === 0) {
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No matches yet', (width - 16) / 2, (height - 20) / 2);
    return;
  }

  const canvasWidth = width - 16;
  const canvasHeight = height - 20;
  const padding = 40;
  const graphWidth = canvasWidth - padding * 2;
  const graphHeight = canvasHeight - padding * 2;

  // Calculate win rate over time
  const winRates = [];
  let wins = 0;
  let total = 0;

  filteredMatches.forEach(match => {
    total++;
    if (match.result && match.result.uuid === playerUUID) {
      wins++;
    }
    winRates.push((wins / total) * 100);
  });

  // Draw axes
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, canvasHeight - padding);
  ctx.lineTo(canvasWidth - padding, canvasHeight - padding);
  ctx.stroke();

  // Draw 50% reference line
  ctx.strokeStyle = '#4b5563';
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  const fiftyPercentY = canvasHeight - padding - (graphHeight * 0.5);
  ctx.moveTo(padding, fiftyPercentY);
  ctx.lineTo(canvasWidth - padding, fiftyPercentY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw win rate line with animation
  const animatedCount = Math.ceil(winRates.length * progress);
  
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 2;
  ctx.beginPath();

  winRates.slice(0, animatedCount).forEach((rate, index) => {
    const x = padding + (index / Math.max(winRates.length - 1, 1)) * graphWidth;
    const y = canvasHeight - padding - (rate / 100) * graphHeight;

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();

  // Draw final point with animation
  if (animatedCount > 0) {
    const lastIndex = animatedCount - 1;
    const lastX = padding + (lastIndex / Math.max(winRates.length - 1, 1)) * graphWidth;
    const lastY = canvasHeight - padding - (winRates[lastIndex] / 100) * graphHeight;
    
    const pointProgress = Math.max(0, Math.min(1, (progress * winRates.length - lastIndex) / 1));
    ctx.globalAlpha = pointProgress;
    
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4 * pointProgress, 0, 2 * Math.PI);
    ctx.fillStyle = '#22c55e';
    ctx.fill();
  }

  ctx.globalAlpha = 1;

  // Draw labels
  ctx.globalAlpha = progress;
  ctx.fillStyle = '#9ca3af';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('100%', 5, padding + 10);
  ctx.fillText('50%', 5, fiftyPercentY + 4);
  ctx.fillText('0%', 5, canvasHeight - padding - 5);
  
  ctx.textAlign = 'right';
  const currentWinRate = winRates[winRates.length - 1].toFixed(1);
  ctx.fillText(`${currentWinRate}%`, canvasWidth - 5, 15);
  ctx.globalAlpha = 1;
}
