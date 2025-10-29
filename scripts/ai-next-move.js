#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs');
const path = require('path');

/**
 * AI次手計算スクリプト
 *
 * 手順文字列から盤面を再構築し、AIの次の手を計算する
 *
 * 使用例:
 *   node ai-next-move.js d3c3c4
 *   node ai-next-move.js f5d6c5f4e7c6g3c4 --level 15 --verbose
 */

// ============================================================================
// リバーシゲームロジック
// ============================================================================

/**
 * 初期盤面を作成
 */
function createInitialBoard() {
  const board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));
  // 中央4マスに石を配置
  board[3][3] = 'white'; // d4
  board[3][4] = 'black'; // e4
  board[4][3] = 'black'; // d5
  board[4][4] = 'white'; // e5
  return board;
}

/**
 * セルの値を取得
 */
function getCellAt(board, row, col) {
  if (row < 0 || row >= 8 || col < 0 || col >= 8) {
    return undefined;
  }
  return board[row][col];
}

/**
 * セルに値を設定（新しい盤面を返す）
 */
function setCellAt(board, row, col, value) {
  const newBoard = board.map((row) => [...row]);
  newBoard[row][col] = value;
  return newBoard;
}

/**
 * 相手プレイヤーを取得
 */
function getOpponent(player) {
  return player === 'black' ? 'white' : 'black';
}

/**
 * 8方向の定義
 */
const DIRECTIONS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

/**
 * 特定の方向に対して反転できる石を探す
 */
function findFlipsInDirection(board, row, col, player, dirRow, dirCol) {
  const opponent = getOpponent(player);
  const flips = [];
  let currentRow = row + dirRow;
  let currentCol = col + dirCol;

  // 隣接セルが相手の石かチェック
  if (getCellAt(board, currentRow, currentCol) !== opponent) {
    return [];
  }

  // 相手の石が続く限り進む
  while (getCellAt(board, currentRow, currentCol) === opponent) {
    flips.push({ row: currentRow, col: currentCol });
    currentRow += dirRow;
    currentCol += dirCol;
  }

  // 最後に自分の石があれば有効
  if (getCellAt(board, currentRow, currentCol) === player) {
    return flips;
  }

  return [];
}

/**
 * 全方向で反転できる石を探す
 */
function findAllFlips(board, row, col, player) {
  const allFlips = [];

  for (const [dirRow, dirCol] of DIRECTIONS) {
    const flips = findFlipsInDirection(board, row, col, player, dirRow, dirCol);
    allFlips.push(...flips);
  }

  return allFlips;
}

/**
 * 手が有効かどうかを検証
 */
function validateMove(board, row, col, player) {
  // 範囲外チェック
  if (row < 0 || row >= 8 || col < 0 || col >= 8) {
    return { success: false, error: 'Out of bounds' };
  }

  // 既に石がある
  if (getCellAt(board, row, col) !== null) {
    return { success: false, error: 'Cell already occupied' };
  }

  // 反転できる石があるかチェック
  const flips = findAllFlips(board, row, col, player);
  if (flips.length === 0) {
    return { success: false, error: 'No stones to flip' };
  }

  return { success: true };
}

/**
 * 手を適用（新しい盤面を返す）
 */
function applyMove(board, row, col, player) {
  // 有効性チェック
  const validation = validateMove(board, row, col, player);
  if (!validation.success) {
    return { success: false, error: validation.error };
  }

  // 石を置く
  let newBoard = setCellAt(board, row, col, player);

  // 反転する石を取得して反転
  const flips = findAllFlips(board, row, col, player);
  for (const flip of flips) {
    newBoard = setCellAt(newBoard, flip.row, flip.col, player);
  }

  return { success: true, board: newBoard };
}

/**
 * 有効な手を全て計算
 */
function calculateValidMoves(board, player) {
  const validMoves = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (getCellAt(board, row, col) === null) {
        const validation = validateMove(board, row, col, player);
        if (validation.success) {
          validMoves.push({ row, col });
        }
      }
    }
  }

  return validMoves;
}

// ============================================================================
// 手順文字列パース
// ============================================================================

/**
 * 座標記法（例: "d3"）を座標に変換
 * @param {string} move - 座標記法（例: "d3"）
 * @returns {{row: number, col: number}}
 */
function parseMove(move) {
  if (move.length !== 2) {
    throw new Error(`Invalid move format: ${move}`);
  }

  const col = move.charCodeAt(0) - 'a'.charCodeAt(0); // a=0, b=1, ...
  const row = parseInt(move[1], 10) - 1; // 1=0, 2=1, ...

  if (col < 0 || col >= 8 || row < 0 || row >= 8) {
    throw new Error(`Move out of bounds: ${move}`);
  }

  return { row, col };
}

/**
 * 手順文字列（例: "d3c3c4"）をパース
 * @param {string} movesString - 手順文字列
 * @returns {Array<{row: number, col: number}>}
 */
function parseMoves(movesString) {
  if (!movesString || movesString.length === 0) {
    return [];
  }

  if (movesString.length % 2 !== 0) {
    throw new Error(
      `Invalid moves string length: ${movesString.length} (must be even)`
    );
  }

  const moves = [];
  for (let i = 0; i < movesString.length; i += 2) {
    const moveStr = movesString.substring(i, i + 2);
    moves.push(parseMove(moveStr));
  }

  return moves;
}

/**
 * 手順を適用して盤面を再構築
 */
function reconstructBoard(movesString) {
  let board = createInitialBoard();
  const moves = parseMoves(movesString);

  // 黒から開始
  let currentPlayer = 'black';

  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    const result = applyMove(board, move.row, move.col, currentPlayer);

    if (!result.success) {
      throw new Error(
        `Invalid move at position ${i + 1} (${String.fromCharCode(97 + move.col)}${move.row + 1}): ${result.error}`
      );
    }

    board = result.board;

    // プレイヤー交代
    currentPlayer = getOpponent(currentPlayer);

    // パスのチェック（次のプレイヤーに有効手がない場合）
    let validMoves = calculateValidMoves(board, currentPlayer);
    if (validMoves.length === 0) {
      // パス: プレイヤーを戻す
      currentPlayer = getOpponent(currentPlayer);
      validMoves = calculateValidMoves(board, currentPlayer);
      if (validMoves.length === 0) {
        // 両者とも打てない（ゲーム終了）
        break;
      }
    }
  }

  return { board, nextPlayer: currentPlayer };
}

// ============================================================================
// 盤面表示
// ============================================================================

function displayBoard(board) {
  console.log('  a b c d e f g h');
  for (let r = 0; r < 8; r++) {
    let rowStr = `${r + 1} `;
    for (let c = 0; c < 8; c++) {
      const cell = board[r][c];
      rowStr += cell === 'black' ? '● ' : cell === 'white' ? '○ ' : '· ';
    }
    console.log(rowStr);
  }
}

// ============================================================================
// WASM AI計算
// ============================================================================

/**
 * 盤面をWASM形式に変換
 */
function boardToWasmArray(board) {
  const boardArray = new Int32Array(64);
  for (let i = 0; i < 64; i++) {
    const row = Math.floor(i / 8);
    const col = i % 8;
    const cell = board[row][col];
    boardArray[i] = cell === null ? -1 : cell === 'black' ? 0 : 1;
  }
  return boardArray;
}

/**
 * AI計算を実行
 */
async function calculateAIMove(board, aiPlayer, level, verbose) {
  const aiPlayerNum = aiPlayer === 'black' ? 0 : 1;

  // WASMリソースを読み込み（必ず public/ のものを使用）
  const resourcesDir = path.join(__dirname, '..', 'public');
  const wasmPath = path.join(resourcesDir, 'ai.wasm');
  const gluePath = path.join(resourcesDir, 'ai.js');

  if (verbose) {
    console.log('[WASM初期化]');
  }

  const wasmBinary = fs.readFileSync(wasmPath);
  const glueCode = fs.readFileSync(gluePath, 'utf8');

  const boardArray = boardToWasmArray(board);

  // Emscriptenモジュールを初期化
  const Module = await new Promise((resolve, reject) => {
    const moduleConfig = {
      wasmBinary: wasmBinary,
      thisProgram: path.join(resourcesDir, 'ai.js'),
      locateFile: (filename) => path.join(resourcesDir, filename),
      onRuntimeInitialized: function () {
        // vm コンテキストが HEAP 変数を Module に自動アタッチしている
        if (this.HEAP32) {
          if (verbose) {
            console.log(
              '✓ HEAP32 initialized:',
              this.HEAP32.constructor.name,
              'length:',
              this.HEAP32.length
            );
          }
          resolve(this);
        } else {
          console.error('✗ Failed to get HEAP32 from Module');
          console.error(
            'Available Module properties:',
            Object.keys(this).slice(0, 20)
          );
          reject(new Error('Failed to get HEAP32 from Module'));
        }
      },
      onAbort: (reason) => {
        reject(new Error(`WASM initialization aborted: ${reason}`));
      },
      print: (text) => {
        if (verbose) {
          console.log('[WASM stdout]', text);
        }
      },
      printErr: (text) => {
        if (verbose) {
          console.error('[WASM stderr]', text);
        }
      },
      noInitialRun: false,
      noExitRuntime: true,
    };

    try {
      // vm モジュールを使用して、HEAP 変数のキャプチャが可能なコンテキストで実行
      const vm = require('vm');

      // コンテキストオブジェクト: HEAP 変数が代入されたら Module に自動アタッチ
      const { performance } = require('perf_hooks');
      const context = {
        __dirname: resourcesDir,
        __filename: gluePath,
        Module: moduleConfig,
        process: process,
        require: require,
        console: console,
        global: global,
        Buffer: Buffer,
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        setInterval: setInterval,
        clearInterval: clearInterval,
        performance: performance,
        // WebAssembly API
        WebAssembly: WebAssembly,
      };

      // HEAP 変数用のセッター: 代入時に Module にアタッチ
      Object.defineProperty(context, 'HEAP32', {
        set: function (value) {
          this._HEAP32 = value;
          moduleConfig.HEAP32 = value;
        },
        get: function () {
          return this._HEAP32;
        },
        enumerable: true,
        configurable: true,
      });

      Object.defineProperty(context, 'HEAP8', {
        set: function (value) {
          this._HEAP8 = value;
          moduleConfig.HEAP8 = value;
        },
        get: function () {
          return this._HEAP8;
        },
        enumerable: true,
        configurable: true,
      });

      Object.defineProperty(context, 'HEAPU8', {
        set: function (value) {
          this._HEAPU8 = value;
          moduleConfig.HEAPU8 = value;
        },
        get: function () {
          return this._HEAPU8;
        },
        enumerable: true,
        configurable: true,
      });

      Object.defineProperty(context, 'HEAPU32', {
        set: function (value) {
          this._HEAPU32 = value;
          moduleConfig.HEAPU32 = value;
        },
        get: function () {
          return this._HEAPU32;
        },
        enumerable: true,
        configurable: true,
      });

      Object.defineProperty(context, 'HEAP16', {
        set: function (value) {
          this._HEAP16 = value;
          moduleConfig.HEAP16 = value;
        },
        get: function () {
          return this._HEAP16;
        },
        enumerable: true,
        configurable: true,
      });

      Object.defineProperty(context, 'HEAPU16', {
        set: function (value) {
          this._HEAPU16 = value;
          moduleConfig.HEAPU16 = value;
        },
        get: function () {
          return this._HEAPU16;
        },
        enumerable: true,
        configurable: true,
      });

      Object.defineProperty(context, 'HEAPF32', {
        set: function (value) {
          this._HEAPF32 = value;
          moduleConfig.HEAPF32 = value;
        },
        get: function () {
          return this._HEAPF32;
        },
        enumerable: true,
        configurable: true,
      });

      Object.defineProperty(context, 'HEAPF64', {
        set: function (value) {
          this._HEAPF64 = value;
          moduleConfig.HEAPF64 = value;
        },
        get: function () {
          return this._HEAPF64;
        },
        enumerable: true,
        configurable: true,
      });

      // グルーコードを実行
      vm.runInNewContext(glueCode, context, {
        filename: 'ai.js',
        timeout: 30000,
      });
    } catch (err) {
      console.error('✗ 初期化エラー:', err);
      reject(err);
    }

    const timeoutId = setTimeout(() => {
      console.error('✗ 初期化タイムアウト（30秒）');
      reject(new Error('Initialization timeout'));
    }, 30000);

    const originalResolve = resolve;
    resolve = function (value) {
      clearTimeout(timeoutId);
      originalResolve(value);
    };
  });

  if (verbose) {
    console.log('✓ 初期化完了\n');
  }

  try {
    const boardPtr = Module._malloc(256);
    const heap32 = new Int32Array(Module.HEAP32.buffer, boardPtr, 64);
    for (let i = 0; i < 64; i++) {
      heap32[i] = boardArray[i];
    }

    Module._init_ai();

    const startTime = Date.now();
    const result = Module._ai_js(boardPtr, level, aiPlayerNum);
    const calcTime = Date.now() - startTime;

    Module._free(boardPtr);
    delete global.Module;

    // 結果をデコード
    // C++側のエンコード: 1000 * (63 - policy) + 100 + value
    // 正しいデコード: policy = 63 - floor(result / 1000), value = (result % 1000) - 100
    const policy = 63 - Math.floor(result / 1000);
    const value = (result % 1000) - 100;
    const index = 63 - policy;
    const row = Math.floor(index / 8);
    const col = index % 8;
    const moveNotation = String.fromCharCode(97 + col) + (row + 1);

    return {
      move: moveNotation,
      value: value,
      time: calcTime,
      row: row,
      col: col,
    };
  } catch (error) {
    delete global.Module;
    throw error;
  }
}

// ============================================================================
// コマンドライン引数処理
// ============================================================================

function showHelp() {
  console.log(`
AI次手計算スクリプト

使用法:
  node ai-next-move.js <moves> [オプション]

引数:
  <moves>                 手順文字列（例: d3c3c4, f5d6c5f4e7c6g3c4）
                          各手は2文字（列+行）で表現
                          - 列: a-h
                          - 行: 1-8
                          黒から開始し、自動的にプレイヤーを交代

オプション:
  -l, --level <number>    AIのレベル (デフォルト: 15)
                          0-60の範囲

  -v, --verbose           詳細な出力を表示

  -h, --help              このヘルプを表示

使用例:
  node ai-next-move.js d3
  node ai-next-move.js d3c3c4 --verbose
  node ai-next-move.js f5d6c5f4e7c6g3c4 --level 10
  node ai-next-move.js ""  # 初期盤面から

出力形式:
  <move> [<value>] [<time>ms]
  例: c5 0 2ms
`);
  process.exit(0);
}

function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '-h' || args[0] === '--help') {
    showHelp();
  }

  const options = {
    moves: args[0],
    level: 15,
    verbose: false,
  };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    if (arg === '-h' || arg === '--help') {
      showHelp();
    } else if (arg === '-l' || arg === '--level') {
      options.level = parseInt(args[++i], 10);
    } else if (arg === '-v' || arg === '--verbose') {
      options.verbose = true;
    } else {
      console.error(`エラー: 不明なオプション: ${arg}`);
      console.error('ヘルプを表示: node ai-next-move.js --help');
      process.exit(1);
    }
  }

  return options;
}

// ============================================================================
// メイン処理
// ============================================================================

(async () => {
  try {
    const options = parseArgs();

    if (options.verbose) {
      console.log('[手順パース]');
      console.log(`入力: "${options.moves}"`);
      console.log();
    }

    // 盤面を再構築
    const { board, nextPlayer } = reconstructBoard(options.moves);

    if (options.verbose) {
      console.log('[盤面]');
      displayBoard(board);
      console.log();
      console.log(`次のプレイヤー: ${nextPlayer}`);
      console.log();
    }

    // 有効手を確認
    const validMoves = calculateValidMoves(board, nextPlayer);

    if (options.verbose) {
      console.log('[有効手]');
      const validMovesStr = validMoves
        .map((m) => String.fromCharCode(97 + m.col) + (m.row + 1))
        .join(', ');
      console.log(`${validMoves.length}手: ${validMovesStr}`);
      console.log();
    }

    if (validMoves.length === 0) {
      console.log(`${nextPlayer}に有効な手がありません（パス）`);

      // 相手に有効手があるか確認
      const opponent = getOpponent(nextPlayer);
      const opponentValidMoves = calculateValidMoves(board, opponent);
      if (opponentValidMoves.length === 0) {
        console.log('ゲーム終了');
      }
      process.exit(0);
    }

    if (options.verbose) {
      console.log(`[AI計算]`);
      console.log(`プレイヤー: ${nextPlayer}`);
      console.log(`レベル: ${options.level}`);
      console.log();
    }

    // AI計算
    const result = await calculateAIMove(
      board,
      nextPlayer,
      options.level,
      options.verbose
    );

    // AIの手が有効手リストに含まれているか確認
    const isValidMove = validMoves.some(
      (m) => m.row === result.row && m.col === result.col
    );

    // 結果を出力
    if (options.verbose) {
      console.log('[結果]');
      console.log(`手: ${result.move}`);
      console.log(`座標: (${result.row}, ${result.col})`);
      console.log(`評価値: ${result.value}`);
      console.log(`計算時間: ${result.time}ms`);

      if (!isValidMove) {
        console.log();
        console.log('⚠️  エラー: AIが無効手を返しました');
        const validation = validateMove(
          board,
          result.row,
          result.col,
          nextPlayer
        );
        console.log(
          `  検証結果: ${validation.success ? '有効' : `無効 (${validation.error})`}`
        );
        process.exit(1);
      }
    } else {
      console.log(`${result.move} ${result.value} ${result.time}ms`);
    }

    process.exit(0);
  } catch (error) {
    console.error('エラー:', error.message);
    process.exit(1);
  }
})();
