import { create } from 'zustand';

const useGameStore = create((set) => ({
  playerId: null,
  playerName: '',
  isHost: false,
  roomCode: null,
  
  // Players: { id: { name, team: null | 'A' | 'B', isLeader: false } }
  players: {}, 
  
  gameState: 'LOBBY', // LOBBY, WORD_SELECTION, DRAWING, ROUND_OVER, GAME_OVER
  
  // Game data
  currentRound: 1,
  maxRounds: 5,
  teamAScore: 0,
  teamBScore: 0,
  
  currentTurnTeam: 'B', // A gives word, B draws and guesses
  secretWord: '',
  suggestedWords: [], // { word, suggestedBy }
  
  chatHistory: [], // { sender, text, time }

  setPlayerInfo: (id, name, isHost, roomCode) => set({ playerId: id, playerName: name, isHost, roomCode }),
  
  updateGameState: (newState) => set((state) => ({ ...state, ...newState })),
  
  addChat: (msg) => set((state) => ({ chatHistory: [...state.chatHistory, msg] }))
}));

export default useGameStore;
