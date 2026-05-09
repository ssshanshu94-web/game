import { useState } from 'react';
import useGameStore from '../store/gameStore';


const WordSelection = () => {
  const { players, playerId, currentTurnTeam, suggestedWords, updateGameState, broadcastState } = useGameStore();
  const [wordInput, setWordInput] = useState('');

  const myPlayer = players[playerId];
  const opposingTeam = currentTurnTeam === 'A' ? 'B' : 'A';
  
  // If current turn is B drawing, A gives the word. So word giving team is `opposingTeam`
  const isMyTurnToGiveWord = myPlayer.team === opposingTeam;
  const amILeader = myPlayer.isLeader;

  const handleSuggest = () => {
    if (!wordInput.trim()) return;
    
    // In serverless architecture, anyone can send their suggestion to host, host adds to list
    const newSuggestion = { word: wordInput.trim(), suggestedBy: myPlayer.name };
    const updatedSuggestions = [...suggestedWords, newSuggestion];
    
    updateGameState({ suggestedWords: updatedSuggestions });
    broadcastState({ suggestedWords: updatedSuggestions });
    setWordInput('');
  };

  const handleSelectWord = (word) => {
    if (!amILeader) return;
    const newState = { secretWord: word, gameState: 'DRAWING', suggestedWords: [] };
    updateGameState(newState);
    broadcastState(newState);
  };

  if (!isMyTurnToGiveWord) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="animate-pulse bg-gray-800/50 p-8 rounded-3xl border border-gray-700/50">
          <div className="text-6xl mb-4">🤫</div>
          <h2 className="text-2xl font-bold text-gray-300">Team {opposingTeam} is choosing a secret word...</h2>
          <p className="text-gray-500 mt-2">Get ready to draw and guess!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col items-center bg-gray-800/40 p-8 rounded-3xl border border-gray-700 shadow-2xl">
      <h2 className="text-3xl font-black text-white mb-2">Choose the Secret Word</h2>
      <p className="text-gray-400 mb-8">Suggest words. The Leader will pick the final one.</p>

      <div className="w-full flex gap-3 mb-8">
        <input 
          type="text" 
          value={wordInput}
          onChange={(e) => setWordInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSuggest()}
          className="flex-1 bg-gray-900 border border-gray-600 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          placeholder="Type a tricky word..."
        />
        <button 
          onClick={handleSuggest}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 rounded-xl transition-colors shadow-lg shadow-blue-500/20"
        >
          Suggest
        </button>
      </div>

      <div className="w-full space-y-3">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Suggested Words</h3>
        {suggestedWords.length === 0 ? (
          <div className="text-center text-gray-600 py-4 italic">No words suggested yet</div>
        ) : (
          suggestedWords.map((item, idx) => (
            <div key={idx} className="bg-gray-700/50 border border-gray-600 rounded-xl p-4 flex justify-between items-center hover:bg-gray-700 transition-colors">
              <div>
                <span className="text-xl font-bold text-white mr-3">{item.word}</span>
                <span className="text-xs text-gray-400 bg-gray-900 px-2 py-1 rounded">by {item.suggestedBy}</span>
              </div>
              {amILeader && (
                <button 
                  onClick={() => handleSelectWord(item.word)}
                  className="bg-green-600 hover:bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-green-500/20"
                >
                  Select
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WordSelection;
