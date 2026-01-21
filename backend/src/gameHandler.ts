import { Server, Socket } from 'socket.io';
import { isPrime } from './utils/prime';

interface Player {
    id: string;
    name: string;
    score: number;
    lives: number;
    isDead: boolean;
    attemptsOnCurrentNumber: number; // 0 to max
}

interface GameState {
    currentNumber: number;
    players: Player[];
    status: 'setup' | 'lobby' | 'playing' | 'ended';
    hostId: string;
    difficulty: 'relax' | 'medium' | 'hard';
    allowException?: boolean;
    exceptionCount?: number;
}

const rooms: Record<string, GameState> = {};

export const setupGameHandlers = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log('User connected:', socket.id);

        // Host creates a room
        socket.on('create_room', ({ difficulty = 'medium' }: { difficulty?: 'relax' | 'medium' | 'hard' } = {}) => {
            const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
            rooms[roomId] = {
                currentNumber: 0,
                players: [],
                status: 'lobby',
                hostId: socket.id,
                difficulty,
                allowException: false,
                exceptionCount: 0
            };
            socket.join(roomId);
            socket.emit('room_created', roomId);
            console.log(`Room ${roomId} created by ${socket.id} with difficulty ${difficulty}`);
        });

        // Player joins a room
        socket.on('join_room', ({ roomId, name }: { roomId: string; name: string }) => {
            roomId = roomId.toUpperCase();
            const room = rooms[roomId];

            if (!room) {
                socket.emit('error', 'Room not found');
                return;
            }
            if (room.status !== 'lobby') {
                socket.emit('error', 'Game already started');
                return;
            }

            // Initial lives
            let initialLives = 10;
            if (room.difficulty === 'hard') initialLives = 5;
            if (room.difficulty === 'relax') initialLives = 20;

            const newPlayer: Player = {
                id: socket.id,
                name,
                score: 0,
                lives: initialLives,
                isDead: false,
                attemptsOnCurrentNumber: 0
            };
            room.players.push(newPlayer);
            socket.join(roomId);

            io.to(roomId).emit('player_joined', room.players);

            socket.emit('joined_success', {
                roomId,
                difficulty: room.difficulty,
                initialLives
            });
        });

        // Start Game
        socket.on('start_game', ({ roomId }: { roomId: string }) => {
            const room = rooms[roomId];
            if (!room || room.hostId !== socket.id) return;

            room.status = 'playing';
            const primes = [2, 3, 5, 7];
            room.currentNumber = primes[Math.floor(Math.random() * primes.length)];

            room.players.forEach(p => {
                p.attemptsOnCurrentNumber = 0;
            });

            io.to(roomId).emit('game_started', { currentNumber: room.currentNumber });
        });

        // Force New Number (New Chain)
        socket.on('force_new_number', ({ roomId }: { roomId: string }) => {
            const room = rooms[roomId];
            if (!room || room.hostId !== socket.id || room.status !== 'playing') return;

            const primes = [2, 3, 5, 7];
            room.currentNumber = primes[Math.floor(Math.random() * primes.length)];

            room.players.forEach(p => {
                p.attemptsOnCurrentNumber = 0;
            });
            room.allowException = false;

            io.to(roomId).emit('number_updated', {
                currentNumber: room.currentNumber,
                lastWinner: null,
                skipped: true
            });
        });

        // Enable Exception
        socket.on('enable_exception', ({ roomId }: { roomId: string }) => {
            const room = rooms[roomId];
            if (!room || room.hostId !== socket.id || room.status !== 'playing') return;

            if ((room.exceptionCount || 0) >= 5) return;

            room.allowException = true;
            room.exceptionCount = (room.exceptionCount || 0) + 1;

            room.players.forEach(p => {
                p.attemptsOnCurrentNumber = 0;
            });

            io.to(roomId).emit('number_updated', {
                currentNumber: room.currentNumber,
                lastWinner: null,
                skipped: true,
                exceptionActive: true
            });
        });

        // Unlock / Retry
        socket.on('skip_number', ({ roomId }: { roomId: string }) => {
            const room = rooms[roomId];
            if (!room || room.hostId !== socket.id || room.status !== 'playing') return;

            room.players.forEach(p => {
                p.attemptsOnCurrentNumber = 0;
            });

            io.to(roomId).emit('number_updated', {
                currentNumber: room.currentNumber,
                lastWinner: null,
                skipped: true
            });
        });

        // Player submit digit
        socket.on('submit_move', ({ roomId, digit }: { roomId: string; digit: number }) => {
            const room = rooms[roomId];
            if (!room || room.status !== 'playing') return;

            const player = room.players.find(p => p.id === socket.id);
            if (!player || player.isDead) return;

            const maxAttempts = room.difficulty === 'hard' ? 1 : 3;
            if (player.attemptsOnCurrentNumber >= maxAttempts) return;

            const nextVal = parseInt(`${room.currentNumber}${digit}`);
            const isValid = isPrime(nextVal) || room.allowException;

            if (isValid) {
                const points = 100;
                player.score += points;

                room.currentNumber = nextVal;
                room.allowException = false;

                room.players.forEach(p => {
                    p.attemptsOnCurrentNumber = 0;
                });

                io.to(roomId).emit('number_updated', {
                    currentNumber: room.currentNumber,
                    lastWinner: player
                });
                io.to(roomId).emit('leaderboard_update', room.players.sort((a, b) => b.score - a.score));

                socket.emit('move_feedback', { correct: true, score: points });

            } else {
                player.lives -= 1;
                player.attemptsOnCurrentNumber += 1;

                if (player.lives <= 0) {
                    player.isDead = true;
                    player.lives = 0;
                    socket.emit('game_over_personal');
                }

                const isLocked = player.attemptsOnCurrentNumber >= maxAttempts;

                socket.emit('move_feedback', {
                    correct: false,
                    lives: player.lives,
                    attempts: player.attemptsOnCurrentNumber,
                    locked: isLocked,
                    maxAttempts
                });
                io.to(roomId).emit('leaderboard_update', room.players);
            }
        });

        // End Game
        socket.on('end_game', ({ roomId }: { roomId: string }) => {
            const room = rooms[roomId];
            if (!room || room.hostId !== socket.id) return;
            room.status = 'ended';
            const leaderboard = room.players.sort((a, b) => b.score - a.score);
            io.to(roomId).emit('game_ended', { leaderboard });
        });

        socket.on('disconnect', () => { });
    });
};
