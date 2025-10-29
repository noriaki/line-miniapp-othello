# WebAssembly HEAP メモリビューへのアクセス問題と解決策

## 概要

Emscripten でコンパイルされた WebAssembly (WASM) モジュールの HEAP メモリビュー（HEAP32, HEAP8 など）に Node.js から外部アクセスする際に遭遇した問題と、その解決策をまとめたドキュメント。

## 問題の背景

### 状況

- Egaroucid AI エンジン（C++）を Emscripten で WASM にコンパイル
- 生成物: `public/ai.js` (glue code) + `public/ai.wasm` (binary)
- Node.js スクリプト (`scripts/ai-next-move.js`) から AI を呼び出す必要がある
- AI 関数は HEAP32 経由でデータをやり取りする

### 制約条件

- `public/ai.js` と `public/ai.wasm` は変更禁止（既存の成果物）
- `scripts/ai-next-move.js` 単一ファイルで完結させる
- 他のプロジェクトファイルからの import 禁止

## 根本原因

### Emscripten が生成する HEAP 変数のスコープ問題

`public/ai.js` の内部構造：

```javascript
// ai.js の簡略化した構造
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

function updateMemoryViews() {
  var b = wasmMemory.buffer;
  HEAP8 = new Int8Array(b);
  HEAP16 = new Int16Array(b);
  HEAP32 = new Int32Array(b);
  HEAPU8 = new Uint8Array(b);
  HEAPU16 = new Uint16Array(b);
  HEAPU32 = new Uint32Array(b);
  HEAPF32 = new Float32Array(b);
  HEAPF64 = new Float64Array(b);
}

// WASM 初期化時に updateMemoryViews() が呼ばれる
async function createWasm() {
  // ... WASM instantiation
  updateMemoryViews(); // ← ここで HEAP 変数が作成される
  // ...
}
```

**問題点**:

- HEAP32 などは glue code 内のローカル変数として定義される
- `updateMemoryViews()` は WASM runtime 初期化中に呼ばれる
- 外部スコープ（Node.js スクリプト）からは直接アクセスできない

## 試行錯誤の過程

### 失敗した方法 1: Function constructor での実行

```javascript
// ❌ 失敗
const executeGlue = new Function('Module', 'require', '__dirname', glueCode);
executeGlue(moduleConfig, require, resourcesDir);

// Module.HEAP32 は undefined のまま
```

**失敗理由**: HEAP32 が Function のローカルスコープに閉じ込められて外部からアクセス不可。

### 失敗した方法 2: グルーコードにエクスポートコードを追加

```javascript
// ❌ 失敗
const modifiedGlueCode =
  glueCode +
  `
;(function(){
  if (typeof HEAP32 !== 'undefined') {
    global.HEAP32 = HEAP32;
  }
})();
`;
```

**失敗理由**: 追加コードの実行時点で HEAP32 がまだ定義されていない（`updateMemoryViews()` は後で実行される）。

### 失敗した方法 3: Module からの直接取得

```javascript
// ❌ 失敗
onRuntimeInitialized: function() {
  this.HEAP32 = ???  // どこから取得する？
}
```

**失敗理由**: MODULARIZE=1 オプションなしでコンパイルされた場合、Module オブジェクトに HEAP ビューは自動アタッチされない。

## 解決策: Node.js vm モジュール + プロパティディスクリプタ

### アプローチ

1. **vm.runInNewContext()** で実行コンテキストを制御
2. **Object.defineProperty** で HEAP 変数への setter を定義
3. Emscripten が HEAP 変数に代入した瞬間に Module オブジェクトにアタッチ

### 実装コード

```javascript
const vm = require('vm');
const { performance } = require('perf_hooks');

// 1. コンテキストオブジェクトの準備
const context = {
  __dirname: resourcesDir,
  __filename: gluePath,
  Module: moduleConfig,
  process: process,
  require: require,
  console: console,
  global: global,
  Buffer: Buffer,
  performance: performance, // Emscripten が必要とする
  WebAssembly: WebAssembly,
  // ... その他必要な globals
};

// 2. HEAP 変数用のセッター定義（自動キャプチャ）
Object.defineProperty(context, 'HEAP32', {
  set: function (value) {
    this._HEAP32 = value;
    moduleConfig.HEAP32 = value; // ← Module にアタッチ
  },
  get: function () {
    return this._HEAP32;
  },
  enumerable: true,
  configurable: true,
});

// HEAP8, HEAPU8, HEAPU32 なども同様に定義...

// 3. グルーコードを実行
vm.runInNewContext(glueCode, context, {
  filename: 'ai.js',
  timeout: 30000,
});

// 4. onRuntimeInitialized で確認
const moduleConfig = {
  onRuntimeInitialized: function () {
    // この時点で this.HEAP32 が利用可能
    if (this.HEAP32) {
      console.log('✓ HEAP32 initialized');
      resolve(this);
    } else {
      reject(new Error('Failed to get HEAP32'));
    }
  },
};
```

### 動作原理

```
1. vm.runInNewContext() が glue code を実行開始
   ↓
2. Emscripten が WASM を初期化
   ↓
3. updateMemoryViews() が呼ばれる
   ↓
4. HEAP32 = new Int32Array(...) が実行される
   ↓
5. context の setter が発火
   ↓
6. moduleConfig.HEAP32 に値が自動アタッチ
   ↓
7. onRuntimeInitialized() で Module.HEAP32 が利用可能
```

### 注意点: performance オブジェクト

Emscripten は `performance.now()` を使用するため、Node.js の `perf_hooks` から提供する必要がある：

```javascript
const { performance } = require('perf_hooks');
context.performance = performance;
```

これがないと以下のエラーが発生：

```
ReferenceError: performance is not defined
```

## 代替案: Emscripten コンパイルオプションによる解決

### MODULARIZE=1 オプション

もし `public/ai.js` を再コンパイルできる場合、以下のオプションで根本的に解決可能：

```bash
em++ Egaroucid_for_Web.cpp -o ai.js \
  -s WASM=1 \
  -s "EXPORTED_FUNCTIONS=['_init_ai', '_ai_js', '_calc_value', '_stop', '_resume', '_malloc', '_free']" \
  -s MODULARIZE=1 \
  -s EXPORT_NAME='createAIModule' \
  -s ENVIRONMENT='node' \
  -O3 \
  -s TOTAL_MEMORY=629145600 \
  -s ALLOW_MEMORY_GROWTH=1
```

**効果**:

- glue code が factory function として export される
- `createAIModule()` を呼ぶと Promise&lt;Module&gt; が返る
- Module オブジェクトに HEAP32 などが直接アタッチされる
- Node.js 側の実装がシンプルになる

```javascript
// MODULARIZE=1 を使った場合の簡潔な実装例
const createAIModule = require('./public/ai.js');

const Module = await createAIModule({
  wasmBinary: fs.readFileSync('./public/ai.wasm'),
  onRuntimeInitialized: function () {
    console.log(this.HEAP32); // ← 直接アクセス可能
  },
});
```

### オプション比較

| 方法                  | メリット                                                                 | デメリット                                                          |
| --------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| **vm モジュール方式** | ・既存 WASM を変更不要<br>・単一ファイルで完結<br>・Node.js 標準機能のみ | ・実装がやや複雑<br>・vm コンテキストのオーバーヘッド               |
| **MODULARIZE=1**      | ・実装が簡潔<br>・Emscripten の推奨方式<br>・型安全                      | ・再コンパイルが必要<br>・Emscripten 環境が必要<br>・動作検証が必要 |

## 教訓

### 1. Emscripten のコンパイルオプションは重要

- `MODULARIZE=1` を使うと外部統合が簡単になる
- プロジェクト開始時にコンパイルオプションを慎重に選ぶべき
- 後から変更すると既存コードへの影響が大きい

### 2. スコープとクロージャの理解

- Emscripten が生成するコードは複雑なクロージャ構造を持つ
- ローカル変数へのアクセスには実行コンテキストの制御が必要
- `Function` constructor と `vm.runInNewContext` は異なる挙動を持つ

### 3. Node.js の実行環境差異

- ブラウザ用 WASM コードを Node.js で動かす際の注意点：
  - `performance` オブジェクトは `perf_hooks` から提供
  - `WebAssembly` API は Node.js にも存在するが挙動が異なる場合がある
  - グローバルオブジェクトの構造が異なる

### 4. デバッグの進め方

問題解決の流れ：

1. **エラーメッセージの正確な把握** → `Cannot read properties of undefined (reading 'buffer')`
2. **生成コードの構造理解** → `updateMemoryViews()` の役割を特定
3. **実行タイミングの確認** → HEAP32 がいつ作られるか
4. **段階的な試行** → Function constructor → global export → vm module
5. **付随する問題の発見** → `performance` 不足エラー

## 関連ファイル

- `scripts/ai-next-move.js` - 本ドキュメントで説明した vm モジュール方式の実装
- `public/ai.js` - Emscripten が生成した glue code
- `public/ai.wasm` - Egaroucid AI の WASM バイナリ
- `.analysis/egaroucid/src/Egaroucid_for_Web.cpp` - 元の C++ ソースコード
- `.analysis/egaroucid/src/Egaroucid_for_Web_compile_cmd.txt` - コンパイルコマンド

## 参考資料

- [Emscripten Documentation - MODULARIZE](https://emscripten.org/docs/getting_started/FAQ.html#how-can-i-tell-when-the-page-is-fully-loaded-and-it-is-safe-to-call-compiled-functions)
- [Node.js vm Module](https://nodejs.org/api/vm.html)
- [WebAssembly Memory Management](https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/Memory)
