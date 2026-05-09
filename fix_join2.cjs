const fs = require('fs');
let joinStr = fs.readFileSync('src/components/JoinScreen.jsx', 'utf8');

// The issue is myId wasn't updated to host ID in JoinScreen creation correctly in earlier attempt
joinStr = joinStr.replace(
  "const myId = `player-${Math.random().toString(36).substring(2, 8)}`;",
  "const myId = `host-${roomId}`;"
);

// Wait, looking at the previous output, `Host log: My peer ID is: player-z4q2fu` means it was still a player ID.
joinStr = `import { useState } from 'react';
import useGameStore from '../store/gameStore';

const JoinScreen = () => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const { setPlayerInfo, updateGameState } = useGameStore();

  const handleCreate = () => {
    if (!name) return;
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const myId = \`host-\${roomId}\`;
    setPlayerInfo(myId, name, true, roomId);
    updateGameState({ 
        players: { [myId]: { name, team: 'A', isLeader: true } }
    });
  };

  const handleJoin = () => {
    if (!name || !code) return;
    const myId = \`player-\${Math.random().toString(36).substring(2, 8)}\`;
    setPlayerInfo(myId, name, false, code);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4 font-sans">
      <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-md border border-gray-700 p-8 rounded-2xl shadow-2xl">
        <h1 className="text-4xl font-extrabold text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          Draw & Guess
        </h1>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Your Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              placeholder="Enter your nickname..."
            />
          </div>

          <div className="pt-4 border-t border-gray-700">
            <button 
              onClick={handleCreate}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-purple-500/30"
            >
              Create New Room
            </button>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-700"></div>
            <span className="flex-shrink-0 mx-4 text-gray-500 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-700"></div>
          </div>

          <div className="flex space-x-2">
            <input 
              type="text" 
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all uppercase"
              placeholder="ROOM CODE"
            />
            <button 
              onClick={handleJoin}
              className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg shadow-pink-500/30"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinScreen;
`;
fs.writeFileSync('src/components/JoinScreen.jsx', joinStr);
