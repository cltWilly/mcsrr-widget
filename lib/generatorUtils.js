// Fetch player data
export async function fetchInitPlayer(playerName) {
  const res = await fetch(`https://mcsrranked.com/api/users/${playerName}`);
  const result = await res.json();
  return result.data;
}

// Fetch player matches with pagination support
export async function fetchPlayerMatches(playerUUID, page = 1) {
  const res = await fetch(`https://mcsrranked.com/api/users/${playerUUID}/matches?type=2&excludedecay=false&count=50&page=${page}`);
  const result = await res.json();
  return result.data;
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
