"use client";

import { useState, useEffect } from "react";
import { calWinRate, countMatches, normalizePlusMinusElo, rankIcons } from "@/lib/widgetUtils";

// Snap position to grid based on existing elements
function snapToGrid(x, y, gridSize = 10) {
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize,
  };
}

// Sample data for preview
const SAMPLE_DATA = {
  playerRank: 'Diamond 1',
  elo: 1650,
  eloPlusMinus: '+25',
  wins: 15,
  losses: 8,
  draws: 2,
  winRate: '65.2',
  totalMatches: 25,
  countdown: 120,
  rankIcon: '/diamond.png',
  averageTime: '12:34'
};

// Available widget features
const AVAILABLE_FEATURES = [
  { id: 'rankIcon', label: 'Rank Icon', width: 40, height: 40, type: 'image', defaultColor: '#FFFFFF' },
  { id: 'playerHead', label: 'Player Head', width: 40, height: 40, type: 'image', defaultColor: '#FFFFFF' },
  { id: 'playerRank', label: 'Player Rank', width: 100, height: 24, type: 'text', defaultColor: '#FFFFFF' },
  { id: 'elo', label: 'ELO Rating', width: 80, height: 20, type: 'text', defaultColor: '#FFFFFF' },
  { id: 'eloPlusMinus', label: 'ELO +/-', width: 60, height: 20, type: 'text', defaultColor: '#9CA3AF' },
  { id: 'wins', label: 'Wins', width: 50, height: 20, type: 'text', defaultColor: '#10B981' },
  { id: 'losses', label: 'Losses', width: 50, height: 20, type: 'text', defaultColor: '#EF4444' },
  { id: 'draws', label: 'Draws', width: 50, height: 20, type: 'text', defaultColor: '#9CA3AF' },
  { id: 'winRate', label: 'Win Rate %', width: 80, height: 20, type: 'text', defaultColor: '#FFFFFF' },
  { id: 'totalMatches', label: 'Total Matches', width: 120, height: 20, type: 'text', defaultColor: '#9CA3AF' },
  { id: 'countdown', label: 'Countdown Timer', width: 60, height: 20, type: 'text', defaultColor: '#9CA3AF' },
  { id: 'averageTime', label: 'Average Time', width: 100, height: 20, type: 'text', defaultColor: '#60A5FA' },
];

function DraggableFeature({ feature, isPlaced, onDragStart }) {
  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('featureId', feature.id);
    onDragStart(feature);
  };

  return (
    <div
      draggable={!isPlaced}
      onDragStart={handleDragStart}
      className={`p-1.5 rounded transition text-center ${
        isPlaced 
          ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
          : 'bg-blue-600 hover:bg-blue-700 text-white cursor-grab active:cursor-grabbing'
      }`}
    >
      <div className="text-xs font-medium">{feature.label}</div>
    </div>
  );
}

function CanvasElement({ element, onMove, onRemove, isSelected, onSelect, canvasWidth = 300, canvasHeight = 100, showRemoveButton = true }) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    e.stopPropagation();
    
    // Store initial mouse position
    setDragStartPos({ x: e.clientX, y: e.clientY });
    
    // Calculate offset from mouse to element's top-left corner
    const elementRect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - elementRect.left,
      y: e.clientY - elementRect.top,
    });
    
    // Select the element
    onSelect(element.id);
    
    // Set up listeners for potential drag
    const handleMouseMove = (moveEvent) => {
      const dx = Math.abs(moveEvent.clientX - e.clientX);
      const dy = Math.abs(moveEvent.clientY - e.clientY);
      
      // Only start dragging if mouse moved more than 5px
      if (dx > 5 || dy > 5) {
        setIsDragging(true);
        document.removeEventListener('mousemove', handleMouseMove);
      }
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const canvas = document.getElementById('widget-canvas');
      if (!canvas) return;
      
      const canvasRect = canvas.getBoundingClientRect();
      
      // Calculate new position relative to canvas
      let newX = e.clientX - canvasRect.left - dragOffset.x;
      let newY = e.clientY - canvasRect.top - dragOffset.y;
      
      // Snap to grid if Shift key is held
      if (e.shiftKey) {
        const snapped = snapToGrid(newX, newY, 10);
        newX = snapped.x;
        newY = snapped.y;
      }
      
      onMove(element.id, {
        x: Math.max(0, Math.min(newX, canvasWidth - element.width)),
        y: Math.max(0, Math.min(newY, canvasHeight - element.height)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, element, onMove]);

  // Render actual content based on element type
  const renderContent = () => {
    switch (element.id) {
      case 'rankIcon':
        return (
          <img 
            src={SAMPLE_DATA.rankIcon} 
            alt="Rank" 
            className="w-full h-full object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        );
      case 'playerHead':
        return (
          <img 
            src="https://mc-heads.net/avatar/Notch/40" 
            alt="Player Head" 
            className="w-full h-full object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        );
      case 'playerRank':
        return <div className="font-bold text-sm" style={{ color: element.color || '#FFFFFF' }}>{SAMPLE_DATA.playerRank}</div>;
      case 'elo':
        return <div className="text-sm" style={{ color: element.color || '#FFFFFF' }}>{SAMPLE_DATA.elo} ELO</div>;
      case 'eloPlusMinus':
        return <div className="text-sm" style={{ color: element.color || '#9CA3AF' }}>({SAMPLE_DATA.eloPlusMinus})</div>;
      case 'wins':
        return <div className="font-bold text-sm" style={{ color: element.color || '#10B981' }}>{SAMPLE_DATA.wins}W</div>;
      case 'losses':
        return <div className="font-bold text-sm" style={{ color: element.color || '#EF4444' }}>{SAMPLE_DATA.losses}L</div>;
      case 'draws':
        return <div className="font-bold text-sm" style={{ color: element.color || '#9CA3AF' }}>{SAMPLE_DATA.draws}D</div>;
      case 'winRate':
        return <div className="text-sm" style={{ color: element.color || '#FFFFFF' }}>{SAMPLE_DATA.winRate}% WR</div>;
      case 'totalMatches':
        return <div className="text-sm" style={{ color: element.color || '#9CA3AF' }}>{SAMPLE_DATA.totalMatches} MATCHES</div>;
      case 'countdown':
        return <div className="text-xs" style={{ color: element.color || '#9CA3AF' }}>{SAMPLE_DATA.countdown}s</div>;
      case 'averageTime':
        return <div className="text-sm" style={{ color: element.color || '#60A5FA' }}>Avg: {SAMPLE_DATA.averageTime}</div>;
      default:
        return <div className="text-xs" style={{ color: element.color || '#FFFFFF' }}>{element.label}</div>;
    }
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onClick={(e) => e.stopPropagation()}
      className={`absolute cursor-move rounded flex items-center justify-center ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#171e1f]' : ''
      }`}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        userSelect: 'none',
      }}
    >
      {renderContent()}
      {showRemoveButton && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(element.id);
          }}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 z-10"
        >
          ×
        </button>
      )}
    </div>
  );
}

export function CustomizableWidget({ uuid, elo, eloPlusMinus, playerRank, startTimestamp, winCount, lossCount, drawCount, layout, playerName, canvasWidth = 300, canvasHeight = 100, averageTime }) {
  const winRate = calWinRate(winCount, lossCount, drawCount);
  const totalGames = countMatches(winCount, lossCount, drawCount);
  eloPlusMinus = normalizePlusMinusElo(eloPlusMinus);
  const rankIcon = rankIcons[playerRank];

  const [countdown, setCountdown] = useState(120);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 120));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // If no layout provided, show default
  if (!layout || layout.length === 0) {
    return (
      <div className="bg-[#171e1f] text-white rounded-md relative overflow-hidden flex items-center justify-center" style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}>
        <div className="text-gray-500 text-sm">No layout configured</div>
      </div>
    );
  }

  // Render element based on its type
  const renderElement = (element) => {
    switch (element.id) {
      case 'rankIcon':
        return (
          <img 
            src={rankIcon} 
            alt="Rank" 
            className="w-full h-full object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        );
      case 'playerHead':
        return (
          <img 
            src={`https://mc-heads.net/avatar/${playerName || 'Steve'}/${element.width}`}
            alt="Player Head" 
            className="w-full h-full object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        );
      case 'playerRank':
        return <div className="font-bold text-sm whitespace-nowrap" style={{ color: element.color || '#FFFFFF' }}>{playerRank}</div>;
      case 'elo':
        return <div className="text-sm whitespace-nowrap" style={{ color: element.color || '#FFFFFF' }}>{elo} ELO</div>;
      case 'eloPlusMinus':
        return <div className="text-sm whitespace-nowrap" style={{ color: element.color || '#9CA3AF' }}>({eloPlusMinus})</div>;
      case 'wins':
        return <div className="font-bold text-sm whitespace-nowrap" style={{ color: element.color || '#10B981' }}>{winCount}W</div>;
      case 'losses':
        return <div className="font-bold text-sm whitespace-nowrap" style={{ color: element.color || '#EF4444' }}>{lossCount}L</div>;
      case 'draws':
        return <div className="font-bold text-sm whitespace-nowrap" style={{ color: element.color || '#9CA3AF' }}>{drawCount}D</div>;
      case 'winRate':
        return <div className="text-sm whitespace-nowrap" style={{ color: element.color || '#FFFFFF' }}>{winRate}% WR</div>;
      case 'totalMatches':
        return <div className="text-sm whitespace-nowrap" style={{ color: element.color || '#9CA3AF' }}>{totalGames} {totalGames === 1 ? 'MATCH' : 'MATCHES'}</div>;
      case 'countdown':
        return <div className="text-xs whitespace-nowrap" style={{ color: element.color || '#9CA3AF' }}>{countdown}s</div>;
      case 'averageTime':
        return <div className="text-sm whitespace-nowrap" style={{ color: element.color || '#60A5FA' }}>Avg: {averageTime || 'N/A'}</div>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#171e1f] text-white rounded-md relative overflow-hidden" style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}>
      {layout.map((element) => (
        <div
          key={element.id}
          className="absolute flex items-center justify-center"
          style={{
            left: `${element.x}px`,
            top: `${element.y}px`,
            width: `${element.width}px`,
            height: `${element.height}px`,
          }}
        >
          {renderElement(element)}
        </div>
      ))}
    </div>
  );
}

export function DragDropWidgetEditor({ onLayoutChange, initialLayout, canvasWidth = 300, canvasHeight = 100 }) {
  const [canvasElements, setCanvasElements] = useState(initialLayout || []);
  const [selectedElement, setSelectedElement] = useState(null);
  const [draggedFeature, setDraggedFeature] = useState(null);
  const [dropPreview, setDropPreview] = useState(null);
  const [showRemoveButtons, setShowRemoveButtons] = useState(true);
  const [isShiftHeld, setIsShiftHeld] = useState(false);

  useEffect(() => {
    if (onLayoutChange) {
      onLayoutChange(canvasElements);
    }
  }, [canvasElements, onLayoutChange]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Shift') setIsShiftHeld(true);
    };
    const handleKeyUp = (e) => {
      if (e.key === 'Shift') setIsShiftHeld(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    
    if (draggedFeature) {
      const canvas = document.getElementById('widget-canvas');
      const rect = canvas.getBoundingClientRect();
      let x = Math.max(0, Math.min(e.clientX - rect.left - draggedFeature.width / 2, canvasWidth - draggedFeature.width));
      let y = Math.max(0, Math.min(e.clientY - rect.top - draggedFeature.height / 2, canvasHeight - draggedFeature.height));
      
      // Snap to grid if Shift key is held
      if (e.shiftKey) {
        const snapped = snapToGrid(x, y, 10);
        x = snapped.x;
        y = snapped.y;
      }
      
      setDropPreview({ ...draggedFeature, x, y });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const featureId = e.dataTransfer.getData('featureId');
    const feature = AVAILABLE_FEATURES.find(f => f.id === featureId);
    
    if (feature && !canvasElements.find(el => el.id === feature.id)) {
      const canvas = document.getElementById('widget-canvas');
      const rect = canvas.getBoundingClientRect();
      let x = Math.max(0, Math.min(e.clientX - rect.left - feature.width / 2, canvasWidth - feature.width));
      let y = Math.max(0, Math.min(e.clientY - rect.top - feature.height / 2, canvasHeight - feature.height));
      
      // Snap to grid if Shift key is held
      if (e.shiftKey) {
        const snapped = snapToGrid(x, y, 10);
        x = snapped.x;
        y = snapped.y;
      }
      
      setCanvasElements([...canvasElements, {
        id: feature.id,
        label: feature.label,
        x,
        y,
        width: feature.width,
        height: feature.height,
        type: feature.type,
        color: feature.defaultColor,
      }]);
    }
    
    setDropPreview(null);
    setDraggedFeature(null);
  };

  const handleDragLeave = (e) => {
    const canvas = document.getElementById('widget-canvas');
    if (e.target === canvas) {
      setDropPreview(null);
    }
  };

  const handleMoveElement = (id, position) => {
    setCanvasElements(canvasElements.map(el =>
      el.id === id ? { ...el, x: position.x, y: position.y } : el
    ));
  };

  const handleRemoveElement = (id) => {
    setCanvasElements(canvasElements.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  const handleClearCanvas = () => {
    setCanvasElements([]);
    setSelectedElement(null);
  };

  const handleColorChange = (id, color) => {
    setCanvasElements(canvasElements.map(el =>
      el.id === id ? { ...el, color } : el
    ));
  };

  const renderPreviewContent = (feature) => {
    switch (feature.id) {
      case 'rankIcon':
        return (
          <img 
            src={SAMPLE_DATA.rankIcon} 
            alt="Rank" 
            className="w-full h-full object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        );
      case 'playerHead':
        return (
          <img 
            src="https://mc-heads.net/avatar/Notch/40" 
            alt="Player Head" 
            className="w-full h-full object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        );
      case 'playerRank':
        return <div className="font-bold text-sm" style={{ color: feature.defaultColor }}>{SAMPLE_DATA.playerRank}</div>;
      case 'elo':
        return <div className="text-sm" style={{ color: feature.defaultColor }}>{SAMPLE_DATA.elo} ELO</div>;
      case 'eloPlusMinus':
        return <div className="text-sm" style={{ color: feature.defaultColor }}>({SAMPLE_DATA.eloPlusMinus})</div>;
      case 'wins':
        return <div className="font-bold text-sm" style={{ color: feature.defaultColor }}>{SAMPLE_DATA.wins}W</div>;
      case 'losses':
        return <div className="font-bold text-sm" style={{ color: feature.defaultColor }}>{SAMPLE_DATA.losses}L</div>;
      case 'draws':
        return <div className="font-bold text-sm" style={{ color: feature.defaultColor }}>{SAMPLE_DATA.draws}D</div>;
      case 'winRate':
        return <div className="text-sm" style={{ color: feature.defaultColor }}>{SAMPLE_DATA.winRate}% WR</div>;
      case 'totalMatches':
        return <div className="text-sm" style={{ color: feature.defaultColor }}>{SAMPLE_DATA.totalMatches} MATCHES</div>;
      case 'countdown':
        return <div className="text-xs" style={{ color: feature.defaultColor }}>{SAMPLE_DATA.countdown}s</div>;
      case 'averageTime':
        return <div className="text-sm" style={{ color: feature.defaultColor }}>Avg: {SAMPLE_DATA.averageTime}</div>;
      default:
        return <div className="text-xs" style={{ color: feature.defaultColor || '#FFFFFF' }}>{feature.label}</div>;
    }
  };

  return (
    <div className="bg-gray-800 p-3 rounded-md">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-white font-bold text-sm">Customize Widget Layout</h3>
      </div>
      <p className="text-gray-400 text-xs mb-3">Drag features from the palette to the canvas and position them</p>
      
      <div className="grid grid-cols-2 gap-3">
        {/* Feature Palette */}
        <div>
          <h4 className="text-white text-xs font-semibold mb-2">Available Features</h4>
          <div className="bg-gray-700 p-2 rounded-md space-y-1.5 max-h-[220px] overflow-y-auto">
            {AVAILABLE_FEATURES.map((feature) => (
              <DraggableFeature
                key={feature.id}
                feature={feature}
                isPlaced={canvasElements.some(el => el.id === feature.id)}
                onDragStart={setDraggedFeature}
              />
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-white text-xs font-semibold">Canvas ({canvasWidth}x{canvasHeight}px)</h4>
            <button
              onClick={handleClearCanvas}
              className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            >
              Clear All
            </button>
          </div>
          <div
            id="widget-canvas"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
            onClick={() => setSelectedElement(null)}
            className="bg-[#171e1f] rounded-md relative border-2 border-dashed border-gray-600 overflow-hidden"
            style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
          >
            {/* Grid lines when Shift is held */}
            {isShiftHeld && (
              <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            )}
            
            {/* Placed elements */}
            {canvasElements.map((element) => (
              <CanvasElement
                key={element.id}
                element={element}
                onMove={handleMoveElement}
                onRemove={handleRemoveElement}
                isSelected={selectedElement === element.id}
                onSelect={setSelectedElement}
                canvasWidth={canvasWidth}
                canvasHeight={canvasHeight}
                showRemoveButton={showRemoveButtons}
              />
            ))}
            
            {/* Drop preview */}
            {dropPreview && (
              <div
                className="absolute pointer-events-none opacity-50 border-2 border-blue-500 rounded flex items-center justify-center"
                style={{
                  left: `${dropPreview.x}px`,
                  top: `${dropPreview.y}px`,
                  width: `${dropPreview.width}px`,
                  height: `${dropPreview.height}px`,
                }}
              >
                {renderPreviewContent(dropPreview)}
              </div>
            )}
            
            {canvasElements.length === 0 && !dropPreview && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs pointer-events-none">
                Drag features here
              </div>
            )}
          </div>
          <p className="text-gray-400 text-xs mt-2">
            💡 Drag to canvas to add • Click and drag to reposition • Click × to remove • Hold Shift for grid snap
          </p>
          <button
            onClick={() => setShowRemoveButtons(!showRemoveButtons)}
            className={`text-xs px-2 py-1 rounded mt-1 ${
              showRemoveButtons 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            {showRemoveButtons ? 'Hide ×' : 'Show ×'}
          </button>
          
          {/* Color Picker for selected element */}
          {selectedElement && canvasElements.find(el => el.id === selectedElement)?.type === 'text' && (
            <div className="mt-3 bg-gray-700 p-2 rounded-md">
              <label className="text-white text-xs font-semibold block mb-1">
                Color: {canvasElements.find(el => el.id === selectedElement)?.label}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={canvasElements.find(el => el.id === selectedElement)?.color || '#FFFFFF'}
                  onChange={(e) => handleColorChange(selectedElement, e.target.value)}
                  className="w-12 h-8 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={canvasElements.find(el => el.id === selectedElement)?.color || '#FFFFFF'}
                  onChange={(e) => handleColorChange(selectedElement, e.target.value)}
                  className="flex-1 bg-gray-600 text-white text-xs px-2 py-1 rounded"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
