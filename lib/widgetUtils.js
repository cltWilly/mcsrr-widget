export function calWinRate(winCount, lossCount, drawsCount) {
    let totalGames = winCount + lossCount + drawsCount;
    if (totalGames === 0) {
        return 0;
    }
    let winRate = (winCount / totalGames) * 100;
    return winRate.toFixed(0);
}
    // const winRate = calWinRate(winCount, lossCount);
  
export function countMatches(winCount, lossCount, drawsCount) {
    let totalGames = winCount + lossCount + drawsCount;
    return totalGames;
}
    // const totalGames = countMatches(winCount, lossCount);
  
export function normalizePlusMinusElo(eloPlusMinus) {
    if (eloPlusMinus > 0) {
        return `+${eloPlusMinus}`;
    }
    return eloPlusMinus;
}

export function calculateAverageTime(matches, playerUUID, startTimestamp) {
    const wonMatches = matches.filter(match => 
        match.date > startTimestamp && 
        match.result && 
        match.result.uuid === playerUUID && 
        match.result.time
    );

    if (wonMatches.length === 0) return null;

    const totalTime = wonMatches.reduce((sum, match) => sum + match.result.time, 0);
    const averageTimeMs = totalTime / wonMatches.length;
    
    return averageTimeMs;
}

export function formatTime(milliseconds) {
    if (!milliseconds) return 'N/A';
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export const rankIcons = {
    "Iron 1": "/iron.png",
    "Iron 2": "/iron.png",
    "Iron 3": "/iron.png",
    "Gold 1": "/gold.png",
    "Gold 2": "/gold.png",
    "Gold 3": "/gold.png",
    "Emerald 1": "/emerald.png",
    "Emerald 2": "/emerald.png",
    "Emerald 3": "/emerald.png",
    "Diamond 1": "/diamond.png",
    "Diamond 2": "/diamond.png",
    "Diamond 3": "/diamond.png",
    "Netherite 1": "/netherite.png",
};

export const ranksTable = {
    "0-400": "Coal 1",
    "401-500": "Coal 2",
    "501-600": "Coal 3",
    "601-700": "Iron 1",
    "701-800": "Iron 2",
    "801-900": "Iron 3",
    "901-1000": "Gold 1",
    "1001-1100": "Gold 2",
    "1101-1200": "Gold 3",
    "1201-1300": "Emerald 1",
    "1301-1400": "Emerald 2",
    "1401-1500": "Emerald 3",
    "1501-1650": "Diamond 1",
    "1651-1800": "Diamond 2",
    "1801-2000": "Diamond 3",
    "2001+": "Netherite 1",
};
