import { useState, useRef, useEffect } from 'react';
import CanvasDraw from 'react-canvas-draw';
import useGameStore from '../store/gameStore';

import { Eraser, Trash2, Send } from 'lucide-react';

const DrawingBoard = () => {
  const { 
    players, playerId, currentTurnTeam, secretWord, 
    updateGameState, chatHistory, teamAScore, teamBScore,
    broadcastState, sendChat 
  } = useGameStore();
  const canvasRef = useRef(null);
  
  const [color, setColor] = useState('#ffffff');
  const [brushRadius, setBrushRadius] = useState(3);
  const [chatInput, setChatInput] = useState('');

  const myPlayer = players[playerId];
  const myTeam = myPlayer.team;

  // Drawer logic: Simplest approach for MVP - 1st player of currentTurnTeam is drawer.
  // We can enhance this to rotate drawers.
  const turnTeamPlayers = Object.entries(players).filter(([id, p]) => { void id; return p.team === currentTurnTeam; });
  const drawerId = turnTeamPlayers.length > 0 ? turnTeamPlayers[0][0] : null; 
  const isDrawer = playerId === drawerId;

  // The team opposing the drawing team is the judging team
  const judgingTeam = currentTurnTeam === 'A' ? 'B' : 'A';
  const isJudgingTeam = myTeam === judgingTeam;

  // Handle canvas changes
  const handleDraw = () => {
    if (!isDrawer || !canvasRef.current) return;
    const data = canvasRef.current.getSaveData();
    // In a real app, sending full save data on every stroke might be heavy, 
    // but works for simple peer-to-peer MVP.
    broadcastState({ drawingData: data });
  };

  // Listen for drawing data from host/peers
  useEffect(() => {
    const unsub = useGameStore.subscribe((state) => {
      if (!isDrawer && canvasRef.current && state.drawingData) {
        // Only load if it's new
        const currentData = canvasRef.current.getSaveData();
        if (state.drawingData !== currentData) {
          canvasRef.current.loadSaveData(state.drawingData, true);
        }
      }
    });
    return unsub;
  }, [isDrawer]);


  const handleChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    sendChat({ sender: myPlayer.name, team: myTeam, text: chatInput });
    setChatInput('');
  };

  const handleScore = (points) => {
    if (!isJudgingTeam) return;

    // Award points
    const newA = currentTurnTeam === 'A' ? teamAScore + points : teamAScore;
    const newB = currentTurnTeam === 'B' ? teamBScore + points : teamBScore;

    // Move to next round/turn
    const currentState = useGameStore.getState();
    const isGameOver = currentState.currentRound >= currentState.maxRounds * 2; // *2 because each round has 2 turns (A & B)
    
    const nextState = {
      teamAScore: newA,
      teamBScore: newB,
      currentTurnTeam: judgingTeam, // Switch turns
      gameState: isGameOver ? 'GAME_OVER' : 'WORD_SELECTION',
      secretWord: '',
      drawingData: '',
      suggestedWords: []
    };

    if (!isGameOver && currentTurnTeam === 'B') {
        nextState.currentRound = currentState.currentRound + 1; // Increment round only after both teams have played
    }

    updateGameState(nextState);
    broadcastState(nextState);
  };

  const colors = ['#ffffff', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#a855f7'];

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto h-[80vh]">
      
      {/* Left: Canvas Area */}
      <div className="flex-1 flex flex-col bg-gray-800/80 border border-gray-700 rounded-3xl overflow-hidden shadow-2xl relative">
        
        {/* Header Overlay */}
        <div className="absolute top-0 w-full bg-gray-900/90 backdrop-blur border-b border-gray-700 p-4 flex justify-between items-center z-10">
          <div className="text-white font-bold">
            {isDrawer ? (
              <span className="flex items-center gap-2">
                <span className="text-gray-400">Word to draw:</span> 
                <span className="bg-blue-600/30 text-blue-300 px-3 py-1 rounded-lg text-xl uppercase tracking-widest">{secretWord}</span>
              </span>
            ) : isJudgingTeam ? (
              <span className="flex items-center gap-2">
                <span className="text-gray-400">Secret Word:</span> 
                <span className="text-red-400 font-mono line-through opacity-70 text-lg">{secretWord}</span>
                <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-500 ml-2">(They can't see this)</span>
              </span>
            ) : (
              <span className="text-purple-400 animate-pulse">Guess the word!</span>
            )}
          </div>
          
          {isJudgingTeam && (
            <div className="flex gap-2">
              <button onClick={() => handleScore(0)} className="bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/50 px-4 py-1.5 rounded-lg text-sm font-bold transition">Time Up / +0</button>
              <button onClick={() => handleScore(5)} className="bg-green-600 hover:bg-green-500 text-white shadow-[0_0_15px_rgba(22,163,74,0.4)] px-4 py-1.5 rounded-lg text-sm font-black transition">Correct / +5</button>
            </div>
          )}
        </div>

        {/* Tools (Only for Drawer) */}
        {isDrawer && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray-900/90 backdrop-blur border border-gray-700 p-2 rounded-2xl flex flex-col gap-3 z-10 shadow-xl">
            {colors.map(c => (
              <button key={c} onClick={() => {setColor(c); setBrushRadius(3)}} className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110" style={{ backgroundColor: c, borderColor: color === c ? 'white' : 'transparent' }} />
            ))}
            <div className="w-full h-[1px] bg-gray-700 my-1"></div>
            <button onClick={() => {setColor('#1f2937'); setBrushRadius(20)}} className={`p-2 rounded-xl flex justify-center items-center ${color === '#1f2937' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}>
              <Eraser size={20} />
            </button>
            <button onClick={() => canvasRef.current?.clear()} className="p-2 rounded-xl flex justify-center items-center text-red-400 hover:bg-red-900/30">
              <Trash2 size={20} />
            </button>
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 bg-[#1f2937] w-full h-full pt-16">
          <CanvasDraw
            ref={canvasRef}
            disabled={!isDrawer}
            hideGrid={true}
            brushColor={color}
            brushRadius={brushRadius}
            lazyRadius={0}
            canvasWidth="100%"
            canvasHeight="100%"
            onChange={handleDraw}
            backgroundColor="#1f2937"
          />
        </div>
      </div>

      {/* Right: Chat & Logs */}
      <div className="w-full lg:w-80 flex flex-col bg-gray-800/50 border border-gray-700 rounded-3xl overflow-hidden shadow-xl">
        <div className="bg-gray-900 p-4 border-b border-gray-700 flex justify-between items-center">
           <h3 className="font-bold text-white">Chat & Guesses</h3>
           <div className="flex gap-3 text-xs font-mono">
              <span className="text-purple-400">A: {teamAScore}</span>
              <span className="text-pink-400">B: {teamBScore}</span>
           </div>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.sender === myPlayer.name ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] text-gray-500 mb-1">{msg.sender} (Team {msg.team})</span>
              <div className={`px-3 py-2 rounded-2xl max-w-[85%] text-sm ${
                msg.sender === myPlayer.name ? 'bg-blue-600 text-white rounded-br-none' : 
                msg.team === 'A' ? 'bg-purple-900/50 text-purple-100 rounded-bl-none border border-purple-500/20' : 
                'bg-pink-900/50 text-pink-100 rounded-bl-none border border-pink-500/20'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleChat} className="p-3 bg-gray-900 border-t border-gray-700 flex gap-2">
          <input 
            type="text" 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={isDrawer || isJudgingTeam}
            placeholder={isDrawer ? "Drawers can't chat" : isJudgingTeam ? "You are judging" : "Type your guess..."}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          />
          <button type="submit" disabled={isDrawer || isJudgingTeam || !chatInput.trim()} className="bg-blue-600 disabled:opacity-50 text-white p-2 rounded-xl hover:bg-blue-500 transition">
            <Send size={18} />
          </button>
        </form>
      </div>

    </div>
  );
};

export default DrawingBoard;
