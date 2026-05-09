const fs = require('fs');

let file = fs.readFileSync('src/hooks/useMultiplayer.js', 'utf8');

// The issue is that the clients send an UPDATE_STATE (which goes to handleClientConnection)
// But the host only broadcasts `data.payload`, which is the partial state.
// We need the host to merge the partial state into current state, and then broadcast it to ALL clients.
// Currently it does:
// updateGameState(data.payload);
// broadcastState(data.payload);
// But wait, broadcastState only sends to clients, and updates their state.
// Ah, the issue is that when Team B leader assigns someone, they send UPDATE_STATE to Host.
// Team B leader updates their OWN state. Host receives it, updates its own state, and broadcasts the partial state.
// But we need to make sure the state is fully merged and sent, or at least the whole `players` object is broadcasted so no race conditions happen.

file = file.replace(
  "        if (data.type === 'UPDATE_STATE') {\n          updateGameState(data.payload);\n          broadcastState(data.payload); \n        }",
  "        if (data.type === 'UPDATE_STATE') {\n          const newState = { ...currentState, ...data.payload };\n          updateGameState(newState);\n          // It's safer to broadcast the specific complex objects entirely if they change\n          broadcastState(data.payload); \n        }"
);
fs.writeFileSync('src/hooks/useMultiplayer.js', file);

// Second, let's look at LobbyScreen where the assignment happens.
let lobby = fs.readFileSync('src/components/LobbyScreen.jsx', 'utf8');
lobby = lobby.replace(
  "    updateGameState({ players: newPlayers });\n    broadcastState({ players: newPlayers });",
  "    updateGameState({ players: newPlayers });\n    broadcastState({ players: newPlayers });"
);
fs.writeFileSync('src/components/LobbyScreen.jsx', lobby);
