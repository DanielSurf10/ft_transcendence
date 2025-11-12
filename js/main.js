import PongGame from './PongGame.js';

window.addEventListener('DOMContentLoaded', () => {
	const uiElements = {
		canvas: document.getElementById('pongCanvas'),
		player1ScoreElement: document.getElementById('player1Score'),
		player2ScoreElement: document.getElementById('player2Score'),
		gameMenu: document.getElementById('gameMenu'),
		startButton: document.getElementById('startGame'),
		player1Input: document.getElementById('player1Name'),
		player2Input: document.getElementById('player2Name'),
		twoPlayersBtn: document.getElementById('twoPlayersBtn'),
		aiModeBtn: document.getElementById('aiModeBtn'),
		playerInputsSection: document.getElementById('playerInputsSection'),
	};

	const game = new PongGame(uiElements);
});
