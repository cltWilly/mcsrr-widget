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
  {
    id: 'Default',
    name: 'Default Layout (replica)',
    description: 'Replicates the default widget layout',
    canvasWidth: 284,
    canvasHeight: 96,
    elements: [
      { id: 'rankIcon', label: 'Rank Icon', x: 8, y: 19, width: 40, height: 40, type: 'image', color: '#FFFFFF', scale: 1.15 },
      { id: 'playerRank', label: 'Player Rank', x: 60, y: 20.5, width: 80, height: 20, type: 'text', color: '#FFFFFF', scale: 1.25, bold: true },
      { id: 'elo', label: 'ELO Rating', x: 64, y: 53, width: 80, height: 20, type: 'text', color: '#FFFFFF', scale: 1 },
      { id: 'eloPlusMinus', label: 'ELO +/-', x: 121, y: 52.5, width: 60, height: 20, type: 'text', color: '#10b981', scale: 1, useConditionalColor: true, conditionalType: 'positive-negative', supportsConditional: true, positiveColor: '#10B981', negativeColor: '#EF4444', neutralColor: '#9CA3AF' },
      { id: 'wins', label: 'Wins', x: 181, y: 11.5, width: 50, height: 20, type: 'text', color: '#10B981', scale: 1, bold: true },
      { id: 'losses', label: 'Losses', x: 211, y: 11.5, width: 50, height: 20, type: 'text', color: '#EF4444', scale: 1, bold: true },
      { id: 'draws', label: 'Draws', x: 234, y: 11.5, width: 50, height: 20, type: 'text', color: '#9CA3AF', scale: 1, bold: true },
      { id: 'winRate', label: 'Win Rate', x: 197, y: 35, width: 80, height: 20, type: 'text', color: '#FFFFFF', scale: 1 },
      { id: 'totalMatches', label: 'Total Matches', x: 179, y: 59, width: 100, height: 20, type: 'text', color: '#9CA3AF', scale: 1 },
      { id: 'countdown', label: 'Countdown Timer', x: 0, y: 73, width: 60, height: 20, type: 'text', color: '#9CA3AF', scale: 0.85 }
    ]
  },
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

