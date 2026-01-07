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
  'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
  'Roboto, system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial',
  '"Press Start 2P", "Courier New", monospace',
  '"Minecraft", "Press Start 2P", monospace',
  'Georgia, serif',
  'Courier New, Courier, monospace'
];
