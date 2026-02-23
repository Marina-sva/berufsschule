import { describe, it, expect, beforeEach, vi } from 'vitest';

const { JSDOM } = require('jsdom');
const dom = new JSDOM(`<!DOCTYPE html>
<html lang="de">
  <body>
    <div id="message"></div>
    <div class="color" data-index="0"></div>
    <div class="color" data-index="1"></div>
    <div class="color" data-index="2"></div>
    <div class="color" data-index="3"></div>
    <div class="color" data-index="4"></div>
    <div class="color" data-index="5"></div>
    <div class="color" data-index="6"></div>
    <div class="color" data-index="7"></div>
    <div class="color" data-index="8"></div>
    <button id="restart-btn"></button>
  </body>
</html>`);

global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Element = dom.window.Element;
global.Node = dom.window.Node;

const game = require('./tik-tak-toe.js');
const X = game.cross;
const O = game.circle;
const emptyBoard = Array(9).fill('');
const fullBoard = [X,O,X,O,X,O,X,O,X];
const playerWinBoard = [X,X,X,'','','','','',''];
const computerWinBoard = [X,X,O,'',O,X,O,'',''];
const drawBoard = [X,O,O,O,X,X,X,X,O];

describe('findEmptyCells', function () {
    it('returns indexes of empty cells', function () {
        const board = [X,'',O,'','',X,O,'',X];
        expect(game.findEmptyCells(board)).toEqual([1,3,4,7]);
    });

    it('returns empty array when board is full', function () {
        expect(game.findEmptyCells(fullBoard)).toEqual([]);
    });

    it('returns all indices when board is empty', function () {
        expect(game.findEmptyCells(emptyBoard))
            .toEqual([0,1,2,3,4,5,6,7,8]);
    });
});

describe('placeCross', function () {
    it('places cross on empty cell', function () {
        const result = game.placeCross(['','',O], 1);
        expect(result[1]).toBe(X);
    });

    it('returns new board when placing cross', function () {
        const result = game.placeCross(emptyBoard, 0);
        expect(result).not.toBe(emptyBoard);
    });

    it('returns same board if cell is not empty', function () {
        const board = [X,'','','','','','','',''];
        expect(game.placeCross(board, 0)).toBe(board);
    });
});

describe('findWinningMove', function () {
    it('returns index for winning move', function () {
        const board = [X,X,'',O,O,'','','',''];
        expect(game.findWinningMove(board, X)).toBe(2);
    });

    it('returns null when no winning move exists', function () {
        const boards = [
            emptyBoard,
            [X,O,X,X,O,O,O,X,''],
            [X,O,X,X,O,O,O,O,''],
            [X,X,O,O,X,O,X,O,X]
        ];
        boards.forEach(board => {
            expect(game.findWinningMove(board, X)).toBeNull();
        });
    });
});

describe('placeRandomCircle', function () {
    it('returns same board when no empty cells exist', function () {
        const spy = vi.spyOn(game, 'findEmptyCells').mockReturnValue([]);
        const result = game.placeRandomCircle(fullBoard);
        expect(result).toEqual(fullBoard);
        spy.mockRestore();
    });

    it('blocks cross winning move', function () {
        const spy1 = vi.spyOn(game, 'findEmptyCells').mockReturnValue([2, 3, 5]);
        const spy2 = vi.spyOn(game, 'findWinningMove').mockImplementation((board, player) => {
            return player === X ? 2 : null;
        });

        const board = [X,X,'','','','','','',''];
        const result = game.placeRandomCircle(board);
        expect(result[2]).toBe(O);

        spy1.mockRestore();
        spy2.mockRestore();
    });

    it('places circle on random empty cell', function () {
        const spy1 = vi.spyOn(game, 'findEmptyCells').mockReturnValue([0,1,2]);
        const spy2 = vi.spyOn(game, 'findWinningMove').mockReturnValue(null);
        vi.spyOn(Math, 'random').mockReturnValue(0);

        const result = game.placeRandomCircle(emptyBoard);
        expect(result[0]).toBe(O);

        spy1.mockRestore();
        spy2.mockRestore()
    });
});

describe('checkWin', function () {
    it('returns true for winning board', function () {
        expect(game.checkWin(playerWinBoard, X)).toBeTruthy();
    });

    it('returns false for non-winning board', function () {
        expect(game.checkWin(drawBoard, X)).toBeFalsy();
    });
});

describe('checkDraw', function () {
    it('returns false when board is not full', function () {
        expect(game.checkDraw(emptyBoard)).toBeFalsy();
    });

    it('returns true when board is full', function () {
        expect(game.checkDraw(drawBoard)).toBeTruthy();
    });
});

describe('evaluateGame', function () {
    it('returns player when player wins', function () {
        expect(game.evaluateGame(playerWinBoard)).toBe('player');
    });

    it('returns computer when computer wins', function () {
        expect(game.evaluateGame(computerWinBoard)).toBe('computer');
    });

    it('returns draw when game is draw', function () {
        expect(game.evaluateGame(drawBoard)).toBe('draw');
    });

    it('returns null when game is not finished', function () {
        expect(game.evaluateGame(emptyBoard)).toBeNull();
    });
});
describe('DOM Logic', () => {
    beforeEach(() => {
        game.board = Array(9).fill('');
        game.gameOver = false;
        document.getElementById('message').textContent = '';
    });

    describe('showMessage / clearMessage', () => {
        it('displays and clears messages correctly', () => {
            game.showMessage('Test');
            const msg = document.getElementById('message');
            expect(msg.textContent).toBe('Test');
            expect(msg.classList.contains('show')).toBeTruthy();

            game.clearMessage();
            expect(msg.textContent).toBe('');
            expect(msg.classList.contains('show')).toBeFalsy();
        });
    });

    describe('renderBoard', () => {
        it('renders images correctly', () => {
            const testBoard = ['x','0','','','','','','',''];
            game.renderBoard(testBoard);
            const cell0 = document.querySelector('.color[data-index="0"]');
            const cell1 = document.querySelector('.color[data-index="1"]');
            expect(cell0.querySelector('img').src).toContain('cross1.png');
            expect(cell1.querySelector('img').src).toContain('circle.png');
        });
    });

    describe('finishGame', () => {
        it('sets win state correctly', () => {
            game.finishGame('player');
            expect(document.body.classList.contains('win')).toBeTruthy();
            expect(game.board).toBeDefined();
        });

        it('sets lose state correctly', () => {
            game.finishGame('computer');
            expect(document.body.classList.contains('lose')).toBeTruthy();
        });

        it('sets draw state correctly', () => {
            game.finishGame('draw');
            expect(document.body.classList.contains('draw')).toBeTruthy();
        });
    });
});

