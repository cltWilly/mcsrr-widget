// Safe fetch wrapper that handles errors gracefully
async function safeFetchJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Fetch failed for ${url}: ${res.status} ${res.statusText}`);
      return null;
    }
    const result = await res.json();
    return result.data || result;
  } catch (error) {
    console.error(`Network error for ${url}:`, error);
    return null;
  }
}

// Fetch player data
export async function fetchInitPlayer(playerName) {
  const data = await safeFetchJson(`https://mcsrranked.com/api/users/${playerName}`);
  return data;
}

// Fetch player matches with pagination support
export async function fetchPlayerMatches(playerUUID, page = 1) {
  const data = await safeFetchJson(`https://mcsrranked.com/api/users/${playerUUID}/matches?type=2&excludedecay=false&count=50&page=${page}`);
  return data || [];
}

// Function to fetch all matches with pagination
export async function fetchAllMatches(playerUUID, startTimestamp) {
  let page = 0;
  let allMatches = [];
  let winCount = 0;
  let lossCount = 0;
  let drawCount = 0;

  while (true) {
    const matches = await fetchPlayerMatches(playerUUID, page);
    
    // If matches is null (API error), return null to signal failure
    if (matches === null) {
      return null;
    }
    
    allMatches = allMatches.concat(matches);

    const { wins, losses, draws } = getWinLoss(matches, playerUUID, startTimestamp);
    winCount += wins;
    lossCount += losses;
    drawCount += draws;

    if (matches.length < 50 || matches[matches.length - 1].date <= startTimestamp) {
      break;
    }
    page++;
  }

  return { allMatches, winCount, lossCount, drawCount };
}

export function getCurrentTimestamp() {
  const date = Math.floor(Date.now() / 1000);
  return date;
}

export function getWinLoss(matches, playerUUID, startTimestamp) {
  let wins = 0;
  let losses = 0;
  let draws = 0;

  matches.forEach(match => {
    if (match.date > startTimestamp) {
      if (match.result.uuid === playerUUID) {
        wins++;
      } else if (match.result.uuid === null) {
        draws++;
      } else {
        losses++;
      }
    }
  });

  return { wins, losses, draws };
}

export function getEloPlusMinus(matches, playerUUID, startTimestamp) {
  let eloPlusMinus = 0;

  matches.forEach(match => {
    if (match.date > startTimestamp) {
      match.changes.forEach(change => {
        if (change.uuid === playerUUID) {
          eloPlusMinus += change.change;
        }
      });
    }
  });

  return eloPlusMinus;
}
