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
