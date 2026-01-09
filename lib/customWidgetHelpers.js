export function snapToGrid(x, y, gridSize = 10) {
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize,
  };
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
  // https://mcsrr-widget.cltw.dev/widget/2026-01-08T08%3A13?widgetType=3&player=tapl&opacity=100&bgColor=%23171e1f&layout=%5B%7B%22id%22%3A%22rankIcon%22%2C%22label%22%3A%22Rank%20Icon%22%2C%22x%22%3A4%2C%22y%22%3A8%2C%22width%22%3A40%2C%22height%22%3A40%2C%22type%22%3A%22image%22%2C%22color%22%3A%22%23FFFFFF%22%2C%22scale%22%3A1%7D%2C%7B%22id%22%3A%22elo%22%2C%22label%22%3A%22ELO%20Rating%22%2C%22x%22%3A25%2C%22y%22%3A14.5%2C%22width%22%3A80%2C%22height%22%3A20%2C%22type%22%3A%22text%22%2C%22color%22%3A%22%23FFFFFF%22%2C%22font%22%3A%22Inter%2C%20system-ui%2C%20-apple-system%2C%20%5C%22Segoe%20UI%5C%22%2C%20Roboto%2C%20%5C%22Helvetica%20Neue%5C%22%2C%20Arial%22%2C%22scale%22%3A1.2%7D%2C%7B%22id%22%3A%22eloPlusMinus%22%2C%22label%22%3A%22ELO%20%2B%2F-%22%2C%22x%22%3A100%2C%22y%22%3A14%2C%22width%22%3A60%2C%22height%22%3A20%2C%22type%22%3A%22text%22%2C%22color%22%3A%22%239CA3AF%22%2C%22font%22%3A%22Inter%2C%20system-ui%2C%20-apple-system%2C%20%5C%22Segoe%20UI%5C%22%2C%20Roboto%2C%20%5C%22Helvetica%20Neue%5C%22%2C%20Arial%22%2C%22scale%22%3A1.2%7D%5D&width=175&height=55
  {
    id: 'sideBySide',
    name: 'Side by Side (compact)',
    description: 'ELO and Rank Icon side by side for a balanced look',
    canvasWidth: 175,
    canvasHeight: 55,
    elements: [
      { id: 'rankIcon', label: 'Rank Icon', x: 4, y: 8, width: 40, height: 40, type: 'image', color: '#FFFFFF', scale: 1 },
      { id: 'elo', label: 'ELO Rating', x: 25, y: 14.5, width: 80, height: 20, type: 'text', color: '#FFFFFF', font: AVAILABLE_FONTS[0], scale: 1.2 },
      { id: 'eloPlusMinus', label: 'ELO +/-', x: 100, y: 14, width: 60, height: 20, type: 'text', color: '#9CA3AF', font: AVAILABLE_FONTS[0], scale: 1.2 },
    ] 
  }
];

