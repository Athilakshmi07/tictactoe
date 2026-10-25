import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideHttpClient } from '@angular/common/http';
import { TicTacToeService } from './services/tic-tac-toe.service';
import { of } from 'rxjs';
import { GameStateResponse } from './models/game.models';

describe('AppComponent', () => {
  const mockGameState: GameStateResponse = {
    id: '11111111-1111-1111-1111-111111111111',
    board: [
      ['', '', ''],
      ['', '', ''],
      ['', '', '']
    ],
    currentPlayer: 'X',
    mode: 'TwoPlayer',
    difficulty: 'Unbeatable',
    status: 'InProgress',
    winner: null,
    winningCells: [],
    moveHistory: [],
    scoreboard: { xWins: 0, oWins: 0, draws: 0, totalGames: 0 }
  };

  const mockWonGameState: GameStateResponse = {
    ...mockGameState,
    status: 'Won',
    winner: 'X',
    board: [
      ['X', 'X', 'X'],
      ['O', 'O', ''],
      ['', '', '']
    ],
    winningCells: [
      { row: 0, column: 0 },
      { row: 0, column: 1 },
      { row: 0, column: 2 }
    ],
    moveHistory: [
      { moveNumber: 1, player: 'X', row: 0, column: 0, position: 'Row 1, Column 1', timestamp: '2026-01-01T00:00:00Z' },
      { moveNumber: 2, player: 'O', row: 1, column: 0, position: 'Row 2, Column 1', timestamp: '2026-01-01T00:00:01Z' },
      { moveNumber: 3, player: 'X', row: 0, column: 1, position: 'Row 1, Column 2', timestamp: '2026-01-01T00:00:02Z' },
      { moveNumber: 4, player: 'O', row: 1, column: 1, position: 'Row 2, Column 2', timestamp: '2026-01-01T00:00:03Z' },
      { moveNumber: 5, player: 'X', row: 0, column: 2, position: 'Row 1, Column 3', timestamp: '2026-01-01T00:00:04Z' }
    ],
    scoreboard: { xWins: 1, oWins: 0, draws: 0, totalGames: 1 }
  };

  let mockService: jasmine.SpyObj<TicTacToeService>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('TicTacToeService', [
      'createGame',
      'getGame',
      'makeMove',
      'undoMove',
      'resetGame',
      'getScoreboard',
      'resetScoreboard'
    ]);

    mockService.createGame.and.returnValue(of(mockGameState));
    mockService.makeMove.and.returnValue(of(mockWonGameState));
    mockService.undoMove.and.returnValue(of(mockGameState));
    mockService.resetGame.and.returnValue(of(mockGameState));
    mockService.resetScoreboard.and.returnValue(of({ xWins: 0, oWins: 0, draws: 0, totalGames: 0 }));

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideHttpClient(),
        { provide: TicTacToeService, useValue: mockService }
      ]
    }).compileComponents();
  });

  // --- Component Rendering Tests ---

  it('should create the app component', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should initialize with a two-player game on startup', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.componentInstance;
    // createGame is called with mode='TwoPlayer' and difficulty='Unbeatable'
    expect(mockService.createGame).toHaveBeenCalledWith('TwoPlayer', 'Unbeatable');
    expect(app.game).toEqual(mockGameState);
    expect(app.selectedMode).toBe('TwoPlayer');
  });

  it('should render the brand title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand-title')?.textContent).toContain('TIC');
    expect(compiled.querySelector('.brand-title')?.textContent).toContain('TOE');
  });

  it('should render all 9 cells on the board', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const cells = compiled.querySelectorAll('.cyber-cell');
    expect(cells.length).toBe(9);
  });

  it('should render the scoreboard section', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.score-stack')).toBeTruthy();
  });

  it('should render the Move History panel', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.history-glass-box')).toBeTruthy();
  });

  it('should render the Undo Move button (initially disabled)', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const undoBtn = compiled.querySelector('#btn-undo-move') as HTMLButtonElement;
    expect(undoBtn).toBeTruthy();
    expect(undoBtn.disabled).toBeTrue(); // no moves yet
  });

  it('should render the Reset Game button', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const resetBtn = compiled.querySelector('#btn-reset-game') as HTMLButtonElement;
    expect(resetBtn).toBeTruthy();
  });

  it('should render the Reset Scoreboard button', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const resetScoreBtn = compiled.querySelector('#btn-reset-scoreboard') as HTMLButtonElement;
    expect(resetScoreBtn).toBeTruthy();
  });

  // --- Mode Selection Tests ---

  it('should switch to Computer mode when the Vs Computer button is clicked', () => {
    const computerModeState: GameStateResponse = { ...mockGameState, mode: 'Computer' };
    mockService.createGame.and.returnValue(of(computerModeState));

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.componentInstance;
    const compiled = fixture.nativeElement as HTMLElement;

    const computerBtn = compiled.querySelector('#mode-computer') as HTMLButtonElement;
    computerBtn.click();
    fixture.detectChanges();

    expect(mockService.createGame).toHaveBeenCalledWith('Computer', 'Unbeatable');
    expect(app.selectedMode).toBe('Computer');
  });

  // --- API Integration Tests ---

  it('should call makeMove API when a cell is clicked', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const cell = compiled.querySelector('#cell-0-0') as HTMLButtonElement;
    cell.click();
    fixture.detectChanges();

    expect(mockService.makeMove).toHaveBeenCalledWith(
      mockGameState.id, 'X', 0, 0
    );
  });

  it('should call resetGame API when Reset Game button is clicked on a started game', () => {
    const gameInProgress: GameStateResponse = {
      ...mockGameState,
      moveHistory: [
        { moveNumber: 1, player: 'X', row: 0, column: 0, position: 'Row 1, Column 1', timestamp: '2026-01-01T00:00:00Z' }
      ]
    };
    mockService.createGame.and.returnValue(of(gameInProgress));
    mockService.resetGame.and.returnValue(of(mockGameState));

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const resetBtn = compiled.querySelector('#btn-reset-game') as HTMLButtonElement;
    resetBtn.click();
    fixture.detectChanges();

    expect(mockService.resetGame).toHaveBeenCalledWith(gameInProgress.id);
  });

  it('should call resetScoreboard API when Reset Scoreboard button is clicked', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const resetScoreBtn = compiled.querySelector('#btn-reset-scoreboard') as HTMLButtonElement;
    resetScoreBtn.click();
    fixture.detectChanges();

    expect(mockService.resetScoreboard).toHaveBeenCalled();
  });

  // --- canUndo Logic Tests ---

  it('should have canUndo return false when no moves have been made', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.componentInstance;
    expect(app.canUndo()).toBeFalse();
  });

  // --- isWinningCell Tests ---

  it('should correctly identify winning cells', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.componentInstance;

    // Simulate a won game state
    app.game = mockWonGameState;
    fixture.detectChanges();

    expect(app.isWinningCell(0, 0)).toBeTrue();
    expect(app.isWinningCell(0, 1)).toBeTrue();
    expect(app.isWinningCell(0, 2)).toBeTrue();
    expect(app.isWinningCell(1, 0)).toBeFalse();
    expect(app.isWinningCell(2, 2)).toBeFalse();
  });

  // --- isLatestMove Tests ---

  it('should correctly identify the latest move in history', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.componentInstance;

    app.game = mockWonGameState;
    fixture.detectChanges();

    expect(app.isLatestMove(5)).toBeTrue();
    expect(app.isLatestMove(4)).toBeFalse();
    expect(app.isLatestMove(1)).toBeFalse();
  });
});
