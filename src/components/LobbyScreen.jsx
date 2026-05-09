import useGameStore from '../store/gameStore';
import { useMultiplayer } from '../hooks/useMultiplayer';

const LobbyScreen = () => {
  const { players, playerId, isHost, roomCode, updateGameState } = useGameStore();
  const { broadcastState } = useMultiplayer();

  const myPlayer = players[playerId] || {};
  const isLeaderA = Object.values(players).find(p => p.team === 'A' && p.isLeader)?.name === myPlayer.name;
  const isLeaderB = Object.values(players).find(p => p.team === 'B' && p.isLeader)?.name === myPlayer.name;

  const handleAssignTeam = (targetPlayerId, team) => {
    if (!myPlayer.isLeader) return;
    
    // Quick check: Leader A can only add to Team A, Leader B to Team B
    if (myPlayer.team !== team) return;

    const newPlayers = { ...players };
    newPlayers[targetPlayerId].team = team;
    updateGameState({ players: newPlayers });
    broadcastState({ players: newPlayers });
  };

  const startGame = () => {
    if (isHost) {
      // Calculate max rounds based on team size
      const teamA = Object.values(players).filter(p => p.team === 'A').length;
      const teamB = Object.values(players).filter(p => p.team === 'B').length;
      const maxPlayers = Math.max(teamA, teamB);
      const roundsToPlay = Math.max(5, maxPlayers); // Default 5 or more

      const newState = { gameState: 'WORD_SELECTION', maxRounds: roundsToPlay, currentRound: 1, currentTurnTeam: 'B' };
      updateGameState(newState);
      broadcastState(newState);
    }
  };

  const pool = Object.entries(players).filter(([id, p]) => { void id; return p.team === null; });
  const teamA = Object.entries(players).filter(([id, p]) => { void id; return p.team === 'A'; });
  const teamB = Object.entries(players).filter(([id, p]) => { void id; return p.team === 'B'; });

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-6 font-sans">
      <div className="w-full max-w-5xl bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 p-6 rounded-3xl shadow-2xl">
        <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
          <h2 className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Lobby Room
          </h2>
          <div className="bg-gray-900 px-6 py-2 rounded-xl border border-gray-700 shadow-inner">
            <span className="text-gray-400 text-sm mr-2">CODE:</span>
            <span className="text-2xl font-mono font-bold tracking-widest text-white">{roomCode}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Team A */}
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-2xl p-4 flex flex-col h-full shadow-[0_0_15px_rgba(168,85,247,0.1)]">
            <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center">
              <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div> Team A
            </h3>
            <div className="flex-1 space-y-2">
              {teamA.map(([id, p]) => (
                <div key={id} className="bg-gray-800 rounded-lg p-3 flex justify-between items-center border border-gray-700">
                  <span className="font-medium">{p.name} {id === playerId && '(You)'}</span>
                  {p.isLeader && <span className="bg-purple-600/30 text-purple-300 text-xs px-2 py-1 rounded font-bold">LEADER</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Waiting Pool */}
          <div className="bg-gray-800/50 border border-gray-600 rounded-2xl p-4 flex flex-col h-full">
            <h3 className="text-xl font-bold text-gray-300 mb-4 text-center">Waiting Pool</h3>
            <div className="flex-1 space-y-2 overflow-y-auto">
              {pool.length === 0 ? (
                <div className="text-center text-gray-500 py-8 italic">Pool is empty</div>
              ) : (
                pool.map(([id, p]) => (
                  <div key={id} className="bg-gray-700 rounded-lg p-3 flex flex-col gap-2">
                    <span className="font-medium text-center">{p.name} {id === playerId && '(You)'}</span>
                    <div className="flex justify-center gap-2 mt-1">
                      {isLeaderA && (
                         <button onClick={() => handleAssignTeam(id, 'A')} className="text-xs bg-purple-600 hover:bg-purple-500 px-3 py-1.5 rounded transition-colors">Pick for A</button>
                      )}
                      {isLeaderB && (
                         <button onClick={() => handleAssignTeam(id, 'B')} className="text-xs bg-pink-600 hover:bg-pink-500 px-3 py-1.5 rounded transition-colors">Pick for B</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Team B */}
          <div className="bg-pink-900/20 border border-pink-500/30 rounded-2xl p-4 flex flex-col h-full shadow-[0_0_15px_rgba(236,72,153,0.1)]">
            <h3 className="text-xl font-bold text-pink-400 mb-4 flex items-center justify-end">
              Team B <div className="w-3 h-3 rounded-full bg-pink-500 ml-2"></div>
            </h3>
            <div className="flex-1 space-y-2">
              {teamB.map(([id, p]) => (
                <div key={id} className="bg-gray-800 rounded-lg p-3 flex justify-between items-center border border-gray-700">
                  {p.isLeader && <span className="bg-pink-600/30 text-pink-300 text-xs px-2 py-1 rounded font-bold">LEADER</span>}
                  <span className="font-medium">{p.name} {id === playerId && '(You)'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {isHost ? (
          <button 
            onClick={startGame}
            disabled={teamA.length === 0 || teamB.length === 0}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xl py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all transform hover:scale-[1.01] active:scale-[0.99]"
          >
            START GAME
          </button>
        ) : (
          <div className="text-center text-gray-400 animate-pulse font-medium py-4">
            Waiting for Host to start the game...
          </div>
        )}
      </div>
    </div>
  );
};

export default LobbyScreen;
