export function snapToGrid(x, y, gridSize = 10) {
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize,
  };
}

// Helper to get conditional color based on value
export function getConditionalColor(element, value) {
  // If conditional color is disabled or not supported, return default color
  if (!element.useConditionalColor || !element.supportsConditional) {
    return element.color;
  }

  // Handle different conditional types
  switch (element.conditionalType) {
    case 'positive-negative':
      // For ELO +/-, check if value is positive or negative
      if (typeof value === 'string') {
        if (value.startsWith('+') || value.startsWith('(+')) {
          return element.positiveColor || '#10B981'; // Green
        } else if (value.startsWith('-') || value.startsWith('(-')) {
          return element.negativeColor || '#EF4444'; // Red
        }
      }
      return element.neutralColor || element.color || '#9CA3AF'; // Gray

    case 'winrate':
      // For win rate, color based on percentage
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (!isNaN(numValue)) {
        if (numValue >= (element.highThreshold || 60)) {
          return element.highColor || '#10B981'; // Green for high win rate
        } else if (numValue <= (element.lowThreshold || 40)) {
          return element.lowColor || '#EF4444'; // Red for low win rate
        }
      }
      return element.mediumColor || element.color || '#FFFFFF'; // White/neutral

    default:
      return element.color;
  }
}


export const SAMPLE_DATA = {
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

export const AVAILABLE_FEATURES = [
  { id: 'rankIcon', label: 'Rank Icon', width: 40, height: 40, type: 'image', defaultColor: '#FFFFFF', supportsConditional: false },
  { id: 'playerHead', label: 'Player Head', width: 40, height: 40, type: 'image', defaultColor: '#FFFFFF', supportsConditional: false },
  { id: 'playerRank', label: 'Player Rank', width: 100, height: 24, type: 'text', defaultColor: '#FFFFFF', supportsConditional: false },
  { id: 'elo', label: 'ELO Rating', width: 80, height: 20, type: 'text', defaultColor: '#FFFFFF', supportsConditional: false },
  { id: 'eloPlusMinus', label: 'ELO +/-', width: 60, height: 20, type: 'text', defaultColor: '#10b981', supportsConditional: true, conditionalType: 'positive-negative' },
  { id: 'wins', label: 'Wins', width: 50, height: 20, type: 'text', defaultColor: '#10B981', supportsConditional: false },
  { id: 'losses', label: 'Losses', width: 50, height: 20, type: 'text', defaultColor: '#EF4444', supportsConditional: false },
  { id: 'draws', label: 'Draws', width: 50, height: 20, type: 'text', defaultColor: '#9CA3AF', supportsConditional: false },
  { id: 'winRate', label: 'Win Rate %', width: 80, height: 20, type: 'text', defaultColor: '#FFFFFF', supportsConditional: true, conditionalType: 'winrate' },
  { id: 'totalMatches', label: 'Total Matches', width: 120, height: 20, type: 'text', defaultColor: '#9CA3AF', supportsConditional: false },
  { id: 'countdown', label: 'Countdown Timer', width: 60, height: 20, type: 'text', defaultColor: '#9CA3AF', supportsConditional: false },
  { id: 'averageTime', label: 'Average Time', width: 100, height: 20, type: 'text', defaultColor: '#60A5FA', supportsConditional: false },
];

export const AVAILABLE_FONTS = [
  "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
  "Roboto, system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', Arial",
  "'Press Start 2P', 'Courier New', monospace",
  "'Minecraft', 'Press Start 2P', monospace",
  'Georgia, serif',
  'Courier New, Courier, monospace'
];

export const WIDGET_TEMPLATES = [
  // {
  //   id: 'classic',
  //   name: 'Classic Layout',
  //   description: 'Traditional left-to-right layout with rank icon and stats',
  //   canvasWidth: 300,
  //   canvasHeight: 100,
  //   elements: [
  //     { id: 'rankIcon', label: 'Rank Icon', x: 10, y: 30, width: 40, height: 40, type: 'image', color: '#FFFFFF', scale: 1 },
  //     { id: 'playerRank', label: 'Player Rank', x: 60, y: 25, width: 100, height: 24, type: 'text', color: '#FFFFFF', font: AVAILABLE_FONTS[0], scale: 1 },
  //     { id: 'elo', label: 'ELO Rating', x: 60, y: 50, width: 80, height: 20, type: 'text', color: '#FFFFFF', font: AVAILABLE_FONTS[0], scale: 1 },
  //     { id: 'eloPlusMinus', label: 'ELO +/-', x: 145, y: 50, width: 60, height: 20, type: 'text', color: '#9CA3AF', font: AVAILABLE_FONTS[0], scale: 1 },
  //     { id: 'wins', label: 'Wins', x: 215, y: 20, width: 50, height: 20, type: 'text', color: '#10B981', font: AVAILABLE_FONTS[0], scale: 1 },
  //     { id: 'losses', label: 'Losses', x: 215, y: 40, width: 50, height: 20, type: 'text', color: '#EF4444', font: AVAILABLE_FONTS[0], scale: 1 },
  //     { id: 'draws', label: 'Draws', x: 215, y: 60, width: 50, height: 20, type: 'text', color: '#9CA3AF', font: AVAILABLE_FONTS[0], scale: 1 },
  //     { id: 'winRate', label: 'Win Rate %', x: 60, y: 70, width: 80, height: 20, type: 'text', color: '#FFFFFF', font: AVAILABLE_FONTS[0], scale: 1 },
  //   ]
  // },
  // {
  //   id: 'compact',
  //   name: 'Compact View',
  //   description: 'Minimal space with essential stats only',
  //   canvasWidth: 200,
  //   canvasHeight: 80,
  //   elements: [
  //     { id: 'rankIcon', label: 'Rank Icon', x: 10, y: 20, width: 40, height: 40, type: 'image', color: '#FFFFFF', scale: 1 },
  //     { id: 'elo', label: 'ELO Rating', x: 60, y: 15, width: 80, height: 20, type: 'text', color: '#FFFFFF', font: AVAILABLE_FONTS[0], scale: 1 },
  //     { id: 'wins', label: 'Wins', x: 60, y: 35, width: 50, height: 20, type: 'text', color: '#10B981', font: AVAILABLE_FONTS[0], scale: 1 },
  //     { id: 'losses', label: 'Losses', x: 120, y: 35, width: 50, height: 20, type: 'text', color: '#EF4444', font: AVAILABLE_FONTS[0], scale: 1 },
  //     { id: 'winRate', label: 'Win Rate %', x: 60, y: 55, width: 80, height: 20, type: 'text', color: '#FFFFFF', font: AVAILABLE_FONTS[0], scale: 1 },
  //   ]
  // },
  // {
  //   id: 'detailed',
  //   name: 'Detailed Stats',
  //   description: 'Comprehensive layout with all available information',
  //   canvasWidth: 350,
  //   canvasHeight: 120,
  //   elements: [
  //     { id: 'rankIcon', label: 'Rank Icon', x: 10, y: 10, width: 40, height: 40, type: 'image', color: '#FFFFFF', scale: 1 },
  //     { id: 'playerHead', label: 'Player Head', x: 10, y: 60, width: 40, height: 40, type: 'image', color: '#FFFFFF', scale: 1 },
  //     { id: 'playerRank', label: 'Player Rank', x: 60, y: 10, width: 100, height: 24, type: 'text', color: '#FFFFFF', font: AVAILABLE_FONTS[0], scale: 1 },
  //     { id: 'elo', label: 'ELO Rating', x: 60, y: 30, width: 80, height: 20, type: 'text', color: '#FFFFFF', font: AVAILABLE_FONTS[0], scale: 1 },
  //     { id: 'eloPlusMinus', label: 'ELO +/-', x: 145, y: 30, width: 60, height: 20, type: 'text', color: '#9CA3AF', font: AVAILABLE_FONTS[0], scale: 1 },
  //     { id: 'wins', label: 'Wins', x: 60, y: 60, width: 50, height: 20, type: 'text', color: '#10B981', font: AVAILABLE_FONTS[0], scale: 1 },
  //     { id: 'losses', label: 'Losses', x: 120, y: 60, width: 50, height: 20, type: 'text', color: '#EF4444', font: AVAILABLE_FONTS[0], scale: 1 },
  //     { id: 'draws', label: 'Draws', x: 180, y: 60, width: 50, height: 20, type: 'text', color: '#9CA3AF', font: AVAILABLE_FONTS[0], scale: 1 },
  //     { id: 'winRate', label: 'Win Rate %', x: 60, y: 85, width: 80, height: 20, type: 'text', color: '#FFFFFF', font: AVAILABLE_FONTS[0], scale: 1 },
  //     { id: 'totalMatches', label: 'Total Matches', x: 150, y: 85, width: 120, height: 20, type: 'text', color: '#9CA3AF', font: AVAILABLE_FONTS[0], scale: 1 },
  //     { id: 'averageTime', label: 'Average Time', x: 240, y: 10, width: 100, height: 20, type: 'text', color: '#60A5FA', font: AVAILABLE_FONTS[0], scale: 1 },
  //     { id: 'countdown', label: 'Countdown Timer', x: 280, y: 95, width: 60, height: 20, type: 'text', color: '#9CA3AF', font: AVAILABLE_FONTS[0], scale: 1 },
  //   ]
  // },
  {
    id: 'centered',
    name: 'Centered Display',
    description: 'Symmetrical layout with centered elements',
    canvasWidth: 280,
    canvasHeight: 100,
    elements: [
      { id: 'rankIcon', label: 'Rank Icon', x: 120, y: 10, width: 40, height: 40, type: 'image', color: '#FFFFFF', scale: 1 },
      { id: 'playerRank', label: 'Player Rank', x: 90, y: 55, width: 100, height: 24, type: 'text', color: '#FFFFFF', font: AVAILABLE_FONTS[0], scale: 1 },
      { id: 'wins', label: 'Wins', x: 50, y: 75, width: 50, height: 20, type: 'text', color: '#10B981', font: AVAILABLE_FONTS[0], scale: 1 },
      { id: 'elo', label: 'ELO Rating', x: 100, y: 75, width: 80, height: 20, type: 'text', color: '#FFFFFF', font: AVAILABLE_FONTS[0], scale: 1 },
      { id: 'losses', label: 'Losses', x: 180, y: 75, width: 50, height: 20, type: 'text', color: '#EF4444', font: AVAILABLE_FONTS[0], scale: 1 },
    ]
  },
  // {
  //   id: 'minimal',
  //   name: 'Minimal Clean',
  //   description: 'Simple and clean with just rank and ELO',
  //   canvasWidth: 180,
  //   canvasHeight: 60,
  //   elements: [
  //     { id: 'rankIcon', label: 'Rank Icon', x: 10, y: 10, width: 40, height: 40, type: 'image', color: '#FFFFFF', scale: 1 },
  //     { id: 'playerRank', label: 'Player Rank', x: 60, y: 10, width: 100, height: 24, type: 'text', color: '#FFFFFF', font: AVAILABLE_FONTS[0], scale: 1 },
  //     { id: 'elo', label: 'ELO Rating', x: 60, y: 35, width: 80, height: 20, type: 'text', color: '#FFFFFF', font: AVAILABLE_FONTS[0], scale: 1 },
  //   ]
  // },
  {
    id: 'sideBySide',
    name: 'Side by Side (compact)',
    description: 'ELO and Rank Icon side by side for a balanced look',
    canvasWidth: 175,
    canvasHeight: 55,
    elements: [
      { id: 'rankIcon', label: 'Rank Icon', x: 4, y: 8, width: 40, height: 40, type: 'image', color: '#FFFFFF', scale: 1 },
      { id: 'elo', label: 'ELO Rating', x: 25, y: 14.5, width: 80, height: 20, type: 'text', color: '#FFFFFF', font: AVAILABLE_FONTS[0], scale: 1.2 },
      { id: 'eloPlusMinus', label: 'ELO +/-', x: 100, y: 14, width: 60, height: 20, type: 'text', color: '#10b981', font: AVAILABLE_FONTS[0], scale: 1.2, useConditionalColor: true, conditionalType: 'positive-negative', supportsConditional: true, positiveColor: '#10B981', negativeColor: '#EF4444', neutralColor: '#9CA3AF' },
    ] 
  }
];

