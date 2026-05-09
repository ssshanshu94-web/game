import { useEffect, useRef, useCallback } from 'react';
import Peer from 'peerjs';
import useGameStore from '../store/gameStore';

export const useMultiplayer = () => {
  const connectionsRef = useRef({});
  const { 
    playerId, playerName, isHost, roomCode, 
    updateGameState, addChat
  } = useGameStore();

  const broadcastState = useCallback((partialState) => {
    if (!isHost) {
      if (connectionsRef.current['host']) {
        connectionsRef.current['host'].send({ type: 'UPDATE_STATE', payload: partialState });
      }
      return;
    }

    Object.values(connectionsRef.current).forEach(conn => {
      if (conn.open) {
        conn.send({ type: 'SYNC_STATE', payload: partialState });
      }
    });
  }, [isHost]);

  useEffect(() => {
    if (!playerId) return;

    const newPeer = new Peer(playerId);

    const handleHostMessage = (conn) => {
      conn.on('data', (data) => {
        console.log('Client received:', data);
        if (data.type === 'SYNC_STATE') {
          updateGameState(data.payload);
        }
      });
    };

    const handleClientConnection = (conn) => {
      conn.on('data', (data) => {
        console.log('Host received:', data);
        
        const currentState = useGameStore.getState();
        
        if (data.type === 'JOIN') {
          const newPlayers = { ...currentState.players, [data.payload.id]: { name: data.payload.name, team: null, isLeader: false } };
          
          const playerIds = Object.keys(newPlayers);
          if (playerIds.length === 1) newPlayers[playerIds[0]].isLeader = true; 
          if (playerIds.length === 2) newPlayers[playerIds[1]].isLeader = true; 

          updateGameState({ players: newPlayers });
          broadcastState({ players: newPlayers, gameState: currentState.gameState });
          connectionsRef.current[data.payload.id] = conn;
        }

        if (data.type === 'UPDATE_STATE') {
          updateGameState(data.payload);
          broadcastState(data.payload); 
        }

        if (data.type === 'CHAT') {
          addChat(data.payload);
          broadcastState({ chatHistory: [...currentState.chatHistory, data.payload] });
        }
      });
    };

    const connectToHost = (peerInstance, hostId) => {
      const conn = peerInstance.connect(hostId);
      conn.on('open', () => {
        console.log('Connected to host!');
        connectionsRef.current['host'] = conn;
        conn.send({ type: 'JOIN', payload: { id: playerId, name: playerName } });
      });
      handleHostMessage(conn);
    };

    newPeer.on('open', (id) => {
      console.log('My peer ID is: ' + id);
      if (!isHost && roomCode) {
        connectToHost(newPeer, roomCode);
      }
    });

    newPeer.on('connection', (conn) => {
      if (isHost) {
        handleClientConnection(conn);
      } else {
        handleHostMessage(conn);
      }
    });

    return () => {
      newPeer.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId, isHost, roomCode]);
  
  const sendChat = (msgObj) => {
     if (isHost) {
        const currentState = useGameStore.getState();
        const updatedChat = [...currentState.chatHistory, msgObj];
        updateGameState({ chatHistory: updatedChat });
        broadcastState({ chatHistory: updatedChat });
     } else {
        if (connectionsRef.current['host']) {
           connectionsRef.current['host'].send({ type: 'CHAT', payload: msgObj });
        }
     }
  }

  return { broadcastState, sendChat };
};
