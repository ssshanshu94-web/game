import { useEffect } from 'react';
import useGameStore from './store/gameStore';
import JoinScreen from './components/JoinScreen';
import LobbyScreen from './components/LobbyScreen';
import WordSelection from './components/WordSelection';
import DrawingBoard from './components/DrawingBoard';
import { useMultiplayer } from './hooks/useMultiplayer';

function App() {
  const { gameState, currentRound, maxRounds, teamAScore, teamBScore, currentTurnTeam } = useGameStore();
  
  // Initialize multiplayer hook at root so it listens to changes
  useMultiplayer();

  const renderContent = () => {
    switch(gameState) {
      case 'LOBBY': return <JoinScreen />;
      case 'ROOM': return <LobbyScreen />;
      case 'WORD_SELECTION': return <WordSelection />;
      case 'DRAWING': return <DrawingBoard />;
      case 'GAME_OVER': return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-6">
           <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Game Over!</h1>
           <div className="text-3xl text-white">
              Team A: <span className="font-bold text-purple-400">{teamAScore}</span> - 
              Team B: <span className="font-bold text-pink-400">{teamBScore}</span>
           </div>
           <h2 className="text-4xl text-white mt-4">
              {teamAScore > teamBScore ? '🏆 Team A Wins!' : teamBScore > teamAScore ? '🏆 Team B Wins!' : '🤝 It\'s a Tie!'}
           </h2>
           <button onClick={() => window.location.reload()} className="mt-8 bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-xl border border-gray-600 transition">Play Again</button>
        </div>
      );
      default: return <JoinScreen />;
    }
  };

  // Logic to transition from JOIN to ROOM
  const { playerId } = useGameStore();
  useEffect(() => {
    if (playerId && gameState === 'LOBBY') {
       useGameStore.getState().updateGameState({ gameState: 'ROOM' });
    }
  }, [playerId, gameState]);


  return (
    <div className="min-h-screen bg-[#0f172a] text-white selection:bg-purple-500/30 overflow-x-hidden">
      {gameState !== 'LOBBY' && gameState !== 'ROOM' && gameState !== 'GAME_OVER' && (
        <header className="w-full bg-gray-900/80 backdrop-blur-md border-b border-gray-800 p-4 sticky top-0 z-50 flex justify-between items-center shadow-lg">
          <div className="text-xl font-black bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Draw & Guess
          </div>
          <div className="flex gap-6 items-center">
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Round</span>
              <span className="text-lg font-mono text-gray-300">{currentRound} <span className="text-gray-600">/</span> {maxRounds}</span>
            </div>
            <div className="h-8 w-px bg-gray-700"></div>
            <div className="flex gap-4 font-mono">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-purple-400 font-bold">TEAM A</span>
                <span className="text-xl font-bold">{teamAScore}</span>
              </div>
              <div className="text-gray-600 mt-2">:</div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-pink-400 font-bold">TEAM B</span>
                <span className="text-xl font-bold">{teamBScore}</span>
              </div>
            </div>
            <div className="h-8 w-px bg-gray-700"></div>
            <div className="text-sm">
               Turn: <span className={currentTurnTeam === 'A' ? 'text-purple-400 font-bold' : 'text-pink-400 font-bold'}>Team {currentTurnTeam}</span>
            </div>
          </div>
        </header>
      )}
      
      <main className="p-4 md:p-8 pt-6">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
