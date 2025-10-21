/**
 * Unit tests for AI Worker
 * Tests the module structure and exports
 */

import type { EgaroucidWASMModule } from '../../lib/ai/types';

// Mock dependencies
jest.mock('../../lib/ai/wasm-loader');
jest.mock('../../lib/ai/wasm-bridge');

import { loadWASM } from '../../lib/ai/wasm-loader';
import {
  encodeBoard,
  decodeResponse,
  callAIFunction,
  freeMemory,
} from '../../lib/ai/wasm-bridge';

describe('AI Worker Module', () => {
  const mockWASMModule: Partial<EgaroucidWASMModule> = {
    _malloc: jest.fn(),
    _free: jest.fn(),
    HEAPU8: new Uint8Array(1024),
  };

  beforeAll(() => {
    // Mock Worker global scope
    (global as { self: { postMessage: jest.Mock } }).self = {
      postMessage: jest.fn(),
    };
  });

  beforeEach(() => {
    // Setup default mocks
    (loadWASM as jest.MockedFunction<typeof loadWASM>).mockResolvedValue({
      success: true,
      value: mockWASMModule as EgaroucidWASMModule,
    });

    (encodeBoard as jest.MockedFunction<typeof encodeBoard>).mockReturnValue({
      success: true,
      value: 12345 as unknown as number,
    });

    (
      callAIFunction as jest.MockedFunction<typeof callAIFunction>
    ).mockReturnValue({
      success: true,
      value: 19,
    });

    (
      decodeResponse as jest.MockedFunction<typeof decodeResponse>
    ).mockReturnValue({
      success: true,
      value: { row: 2, col: 3 },
    });

    (freeMemory as jest.MockedFunction<typeof freeMemory>).mockReturnValue({
      success: true,
      value: undefined,
    });
  });

  it('should be importable', async () => {
    await expect(import('../../workers/ai-worker')).resolves.toBeDefined();
  });

  it('should have dependencies available', () => {
    expect(loadWASM).toBeDefined();
    expect(encodeBoard).toBeDefined();
    expect(decodeResponse).toBeDefined();
    expect(callAIFunction).toBeDefined();
    expect(freeMemory).toBeDefined();
  });
});
