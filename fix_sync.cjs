const fs = require('fs');
let text = fs.readFileSync('src/hooks/useMultiplayer.js', 'utf8');

text = text.replace(
  "          updateGameState({ players: newPlayers });\n          broadcastState({ players: newPlayers, gameState: currentState.gameState });\n          connectionsRef.current[data.payload.id] = conn;",
  "          connectionsRef.current[data.payload.id] = conn;\n          updateGameState({ players: newPlayers });\n          broadcastState({ players: newPlayers, gameState: currentState.gameState, currentRound: currentState.currentRound, maxRounds: currentState.maxRounds, teamAScore: currentState.teamAScore, teamBScore: currentState.teamBScore });"
);

fs.writeFileSync('src/hooks/useMultiplayer.js', text);
