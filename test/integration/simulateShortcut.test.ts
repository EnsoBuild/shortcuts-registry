import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { main_ } from '../../scripts/simulateShortcut';

const MOCKED_PATH_TO_NODE = '/path/to/node';
const MOCKED_PATH_TO_SCRIPT = '/path/to/script';

describe('Successfully simulates cArtio shortcuts for', () => {
  const DEFAULT_ARGS = [MOCKED_PATH_TO_NODE, MOCKED_PATH_TO_SCRIPT, 'cartio'];

  beforeAll(() => {
    // Disable console methods during tests
    console.log = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
  });

  describe('beraborrow', () => {
    it.skip('nect-honey', async () => {});

    it.skip('nect-honey (with slippage)', async () => {});

    it('sbtc', async () => {
      // Arrange
      const args = ['beraborrow', 'sbtc', '10000000', '--mode=forge', '--block=5107618'];

      // Act
      const report = await main_([...DEFAULT_ARGS, ...args]);

      // Assert
      expect(report).toMatchObject({
        weirollWallet: '0x79141B00251E4E08D5463e4e0622E4065692fB3B',
        minAmountOut: '1',
        minAmountOutHex: '0x01',
        quote: { '0x2A280f6769Ba2a254C3D1FeCef0280F87DB0a265': '10000000' },
        dust: { '0x5d417e7798208E9285b5157498bBF23A23E421E7': '0' },
        gas: '521435',
      });
    });

    it('beraEth', async () => {
      // Arrange
      const args = ['beraborrow', 'beraEth', '50000000000000', '--mode=forge', '--block=4485170'];

      // Act
      const report = await main_([...DEFAULT_ARGS, ...args]);

      // Assert
      expect(report).toMatchObject({
        weirollWallet: '0x79141B00251E4E08D5463e4e0622E4065692fB3B',
        minAmountOut: '1',
        minAmountOutHex: '0x01',
        quote: { '0x25189a55463d2974F6b55268A09ccEe92f8aa043': '49000000000000' },
        dust: { '0x2d93FbcE4CffC15DD385A80B3f4CC1D4E76C38b3': '0' },
        gas: '858569',
      });
    });

    it('beraEth (with slippage)', async () => {
      // Arrange
      const args = ['beraborrow', 'beraEth', '50000000000000', '--mode=forge', '--slippage=3', '--block=4485170'];

      // Act
      const report = await main_([...DEFAULT_ARGS, ...args]);

      // Assert
      expect(report).toMatchObject({
        weirollWallet: '0x79141B00251E4E08D5463e4e0622E4065692fB3B',
        minAmountOut: '48985300000000',
        minAmountOutHex: '0x2c8d4767dd00',
        quote: {
          '0x25189a55463d2974F6b55268A09ccEe92f8aa043': '49000000000000',
        },
        dust: { '0x2d93FbcE4CffC15DD385A80B3f4CC1D4E76C38b3': '0' },
        gas: '858569',
      });
    });

    it('weth', async () => {
      // Arrange
      const args = ['beraborrow', 'weth', '100000000000', '--mode=forge', '--block=5107618'];

      // Act
      const report = await main_([...DEFAULT_ARGS, ...args]);

      // Assert
      expect(report).toMatchObject({
        weirollWallet: '0x79141B00251E4E08D5463e4e0622E4065692fB3B',
        minAmountOut: '1',
        minAmountOutHex: '0x01',
        quote: { '0xEdB3CD4f17b20b69Cd7bf8c1126E2759e4A710Be': '100000000000' },
        dust: { '0x2d93FbcE4CffC15DD385A80B3f4CC1D4E76C38b3': '0' },
        gas: '486902',
      });
    });
  });

  describe('burrbear', () => {
    it('usdc', async () => {
      // Arrange
      const args = ['burrbear', 'usdc', '100000000', '--mode=forge', '--block=3804853'];

      // Act
      const report = await main_([...DEFAULT_ARGS, ...args]);

      // Assert
      expect(report).toMatchObject({
        weirollWallet: '0x79141B00251E4E08D5463e4e0622E4065692fB3B',
        minAmountOut: '1',
        minAmountOutHex: '0x01',
        quote: {
          '0xFbb99BAD8eca0736A9ab2a7f566dEbC9acb607f0': '99933244325720999959',
        },
        dust: { '0x015fd589F4f1A33ce4487E12714e1B15129c9329': '0' },
        gas: '1080293',
      });
    });

    it('usdc (with slippage)', async () => {
      // Arrange
      const args = ['burrbear', 'usdc', '100000000', '--mode=forge', '--slippage=3', '--block=3804853'];

      // Act
      const report = await main_([...DEFAULT_ARGS, ...args]);

      // Assert
      expect(report).toMatchObject({
        weirollWallet: '0x79141B00251E4E08D5463e4e0622E4065692fB3B',
        minAmountOut: '99903264352423283659',
        minAmountOutHex: '0x056a6fb19e4c228bcb',
        quote: {
          '0xFbb99BAD8eca0736A9ab2a7f566dEbC9acb607f0': '99933244325720999959',
        },
        dust: { '0x015fd589F4f1A33ce4487E12714e1B15129c9329': '0' },
        gas: '1080293',
      });
    });
  });

  describe('concrete', () => {
    it('usdc', async () => {
      // Arrange
      const args = ['concrete', 'usdc', '100000000', '--mode=forge', '--block=3445321'];

      // Act
      const report = await main_([...DEFAULT_ARGS, ...args]);

      // Assert
      expect(report).toMatchObject({
        weirollWallet: '0x79141B00251E4E08D5463e4e0622E4065692fB3B',
        minAmountOut: '1',
        minAmountOutHex: '0x01',
        quote: {
          '0x9c5285F076C6c1D8471E2625aB5c2257547bCe86': '100000000000000000',
        },
        dust: { '0x015fd589F4f1A33ce4487E12714e1B15129c9329': '0' },
        gas: '604819',
      });
    });

    it('wbtc', async () => {
      // Arrange
      const args = ['concrete', 'wbtc', '100000000', '--mode=forge', '--block=3445478'];

      // Act
      const report = await main_([...DEFAULT_ARGS, ...args]);

      // Assert
      expect(report).toMatchObject({
        weirollWallet: '0x79141B00251E4E08D5463e4e0622E4065692fB3B',
        minAmountOut: '1',
        minAmountOutHex: '0x01',
        quote: {
          '0x18AA409860b89353172C5A7fF4f5fd28a19f3c5a': '100000000000000000',
        },
        dust: { '0x2d93FbcE4CffC15DD385A80B3f4CC1D4E76C38b3': '0' },
        gas: '600946',
      });
    });

    it('weth', async () => {
      // Arrange
      const args = ['concrete', 'weth', '100000000', '--mode=forge', '--block=3445524'];

      // Act
      const report = await main_([...DEFAULT_ARGS, ...args]);

      // Assert
      expect(report).toMatchObject({
        weirollWallet: '0x79141B00251E4E08D5463e4e0622E4065692fB3B',
        minAmountOut: '1',
        minAmountOutHex: '0x01',
        quote: {
          '0x18AA409860b89353172C5A7fF4f5fd28a19f3c5a': '100000000000000000',
        },
        dust: { '0x2d93FbcE4CffC15DD385A80B3f4CC1D4E76C38b3': '0' },
        gas: '600946',
      });
    });
  });

  describe('dahlia', () => {
    it('usdc', async () => {
      // Arrange
      const args = ['dahlia', 'usdc', '100000000', '--mode=forge', '--block=3445762'];

      // Act
      const report = await main_([...DEFAULT_ARGS, ...args]);

      // Assert
      expect(report).toMatchObject({
        weirollWallet: '0x79141B00251E4E08D5463e4e0622E4065692fB3B',
        minAmountOut: '1',
        minAmountOutHex: '0x01',
        quote: { '0x95B0de63dbbe5D92BD05B7c0C12A32673f490A42': '100000000000000' },
        dust: { '0x015fd589F4f1A33ce4487E12714e1B15129c9329': '0' },
        gas: '589413',
      });
    });

    it('weth', async () => {
      // Arrange
      const args = ['dahlia', 'weth', '100000000000000', '--mode=forge', '--block=3445824'];

      // Act
      const report = await main_([...DEFAULT_ARGS, ...args]);

      // Assert
      expect(report).toMatchObject({
        weirollWallet: '0x79141B00251E4E08D5463e4e0622E4065692fB3B',
        minAmountOut: '1',
        minAmountOutHex: '0x01',
        quote: {
          '0x479Df3548C4261Cb101BE33536B3D90CCA6eb327': '100000000000000000000',
        },
        dust: { '0x2d93FbcE4CffC15DD385A80B3f4CC1D4E76C38b3': '0' },
        gas: '586788',
      });
    });
  });

  describe('dolomite', () => {
    it('deth', async () => {
      // Arrange
      const args = ['dolomite', 'deth', '100000000000000', '--mode=forge', '--block=3490796'];

      // Act
      const report = await main_([...DEFAULT_ARGS, ...args]);

      // Assert
      expect(report).toMatchObject({
        weirollWallet: '0x79141B00251E4E08D5463e4e0622E4065692fB3B',
        minAmountOut: '1',
        minAmountOutHex: '0x01',
        quote: { '0xf7b5127B510E568fdC39e6Bb54e2081BFaD489AF': '100000000000000' },
        dust: { '0x2d93FbcE4CffC15DD385A80B3f4CC1D4E76C38b3': '0' },
        gas: '814618',
      });
    });

    it('dhoney', async () => {
      // Arrange
      const args = ['dolomite', 'dhoney', '10000000', '--mode=forge', '--block=4380145'];

      // Act
      const report = await main_([...DEFAULT_ARGS, ...args]);

      // Assert
      expect(report).toMatchObject({
        weirollWallet: '0x79141B00251E4E08D5463e4e0622E4065692fB3B',
        minAmountOut: '1',
        minAmountOutHex: '0x01',
        quote: {
          '0x53fACeCc391021a69Ba79351007079536AA64C6d': '9980000000000000000',
        },
        dust: {
          '0x015fd589F4f1A33ce4487E12714e1B15129c9329': '0',
        },
        gas: '1954769',
      });
    });

    it('dusdc', async () => {
      // Arrange
      const args = ['dolomite', 'dusdc', '100000000000000', '--mode=forge', '--block=3490975'];

      // Act
      const report = await main_([...DEFAULT_ARGS, ...args]);

      // Assert
      expect(report).toMatchObject({
        weirollWallet: '0x79141B00251E4E08D5463e4e0622E4065692fB3B',
        minAmountOut: '1',
        minAmountOutHex: '0x01',
        quote: { '0x444868B6e8079ac2c55eea115250f92C2b2c4D14': '100000000000000' },
        dust: { '0x015fd589F4f1A33ce4487E12714e1B15129c9329': '0' },
        gas: '807608',
      });
    });

    it('dusdt', async () => {
      // Arrange
      const args = ['dolomite', 'dusdt', '100000000000000', '--mode=forge', '--block=3491008'];

      // Act
      const report = await main_([...DEFAULT_ARGS, ...args]);

      // Assert
      expect(report).toMatchObject({
        weirollWallet: '0x79141B00251E4E08D5463e4e0622E4065692fB3B',
        minAmountOut: '1',
        minAmountOutHex: '0x01',
        quote: { '0xF2d2d55Daf93b0660297eaA10969eBe90ead5CE8': '100000000000000' },
        dust: { '0x164A2dE1bc5dc56F329909F7c97Bae929CaE557B': '0' },
        gas: '845939',
      });
    });

    it('dwbtc', async () => {
      // Arrange
      const args = ['dolomite', 'dwbtc', '100000000000000', '--mode=forge', '--block=3491079'];

      // Act
      const report = await main_([...DEFAULT_ARGS, ...args]);

      // Assert
      expect(report).toMatchObject({
        weirollWallet: '0x79141B00251E4E08D5463e4e0622E4065692fB3B',
        minAmountOut: '1',
        minAmountOutHex: '0x01',
        quote: { '0x29cF6e8eCeFb8d3c9dd2b727C1b7d1df1a754F6f': '100000000000000' },
        dust: { '0xFa5bf670A92AfF186E5176aA55690E0277010040': '0' },
        gas: '831733',
      });
    });
  });

  describe('goldilocks', () => {
    it.skip('ebtc', async () => {});

    it.skip('unibtc', async () => {});

    it.skip('weeth', async () => {});
  });

  describe('kodiak', () => {
    it('honey-usdc', async () => {
      // Arrange
      const args = ['kodiak', 'honey-usdc', '100000000', '--mode=forge', '--block=4465664'];

      // Act
      const report = await main_([...DEFAULT_ARGS, ...args]);

      // Assert
      expect(report).toMatchObject({
        weirollWallet: '0x79141B00251E4E08D5463e4e0622E4065692fB3B',
        minAmountOut: '1',
        minAmountOutHex: '0x01',
        quote: { '0x7b26b6C57014eAaA4042FfCF7c701E38F4bc2c5C': '49972071356310' },
        dust: {
          '0x015fd589F4f1A33ce4487E12714e1B15129c9329': '1',
          '0xd137593CDB341CcC78426c54Fb98435C60Da193c': '0',
        },
        gas: '1572777',
      });
    });

    it('honey-usdc (with slippage)', async () => {
      // Arrange
      const args = ['kodiak', 'honey-usdc', '100000000', '--mode=forge', '--slippage=3', '--block=4465664'];

      // Act
      const report = await main_([...DEFAULT_ARGS, ...args]);

      // Assert
      expect(report).toMatchObject({
        weirollWallet: '0x79141B00251E4E08D5463e4e0622E4065692fB3B',
        minAmountOut: '49957079734903',
        minAmountOutHex: '0x2d6f89fdda77',
        quote: { '0x7b26b6C57014eAaA4042FfCF7c701E38F4bc2c5C': '49972071356310' },
        dust: {
          '0x015fd589F4f1A33ce4487E12714e1B15129c9329': '1',
          '0xd137593CDB341CcC78426c54Fb98435C60Da193c': '0',
        },
        gas: '1572777',
      });
    });

    it('weth-honey', async () => {
      // Arrange
      const args = ['kodiak', 'weth-honey', '100000000,1000000', '--mode=forge', '--block=4465664'];

      // Act
      const report = await main_([...DEFAULT_ARGS, ...args]);

      // Assert
      expect(report).toMatchObject({
        weirollWallet: '0x79141B00251E4E08D5463e4e0622E4065692fB3B',
        minAmountOut: '1',
        minAmountOutHex: '0x01',
        quote: { '0xD4570a738675fB2c31e7b7b88998EE73E9E17d49': '5951202271' },
        dust: {
          '0x2d93FbcE4CffC15DD385A80B3f4CC1D4E76C38b3': '0',
          '0x015fd589F4f1A33ce4487E12714e1B15129c9329': '996003',
          '0xd137593CDB341CcC78426c54Fb98435C60Da193c': '0',
        },
        gas: '1491407',
      });
    });

    it('weth-honey (with slippage)', async () => {
      // Arrange
      const args = ['kodiak', 'weth-honey', '100000000,1000000', '--mode=forge', '--slippage=3', '--block=4465664'];

      // Act
      const report = await main_([...DEFAULT_ARGS, ...args]);

      // Assert
      expect(report).toMatchObject({
        weirollWallet: '0x79141B00251E4E08D5463e4e0622E4065692fB3B',
        minAmountOut: '5949416910',
        minAmountOutHex: '0x01629ce5ce',
        quote: { '0xD4570a738675fB2c31e7b7b88998EE73E9E17d49': '5951202271' },
        dust: {
          '0x2d93FbcE4CffC15DD385A80B3f4CC1D4E76C38b3': '0',
          '0x015fd589F4f1A33ce4487E12714e1B15129c9329': '996003',
          '0xd137593CDB341CcC78426c54Fb98435C60Da193c': '0',
        },
        gas: '1491407',
      });
    });

    it('wbtc-weth', async () => {
      // Arrange
      const args = ['kodiak', 'wbtc-weth', '1000000000,100000', '--mode=forge', '--block=4465664'];

      // Act
      const report = await main_([...DEFAULT_ARGS, ...args]);

      // Assert
      expect(report).toMatchObject({
        weirollWallet: '0x79141B00251E4E08D5463e4e0622E4065692fB3B',
        minAmountOut: '1',
        minAmountOutHex: '0x01',
        quote: { '0x1E5FFDC9B4D69398c782608105d6e2B724063E13': '2798' },
        dust: {
          '0x2d93FbcE4CffC15DD385A80B3f4CC1D4E76C38b3': '206540',
          '0xFa5bf670A92AfF186E5176aA55690E0277010040': '99999',
        },
        gas: '1101987',
      });
    });

    it('wbtc-weth (with slippage)', async () => {
      // Arrange
      const args = ['kodiak', 'wbtc-weth', '1000000000,100000', '--mode=forge', '--slippage=3', '--block=4465664'];

      // Act
      const report = await main_([...DEFAULT_ARGS, ...args]);

      // Assert
      expect(report).toMatchObject({
        weirollWallet: '0x79141B00251E4E08D5463e4e0622E4065692fB3B',
        minAmountOut: '2797',
        minAmountOutHex: '0x0aed',
        quote: { '0x1E5FFDC9B4D69398c782608105d6e2B724063E13': '2798' },
        dust: {
          '0x2d93FbcE4CffC15DD385A80B3f4CC1D4E76C38b3': '206540',
          '0xFa5bf670A92AfF186E5176aA55690E0277010040': '99999',
        },
        gas: '1101987',
      });
    });
  });

  describe('origami', () => {
    it('oboy-honey', async () => {
      // Arrange
      const args = ['origami', 'oboy-honey', '1000000', '--mode=forge', '--block=4694128'];

      // Act
      const report = await main_([...DEFAULT_ARGS, ...args]);

      // Assert
      expect(report).toMatchObject({
        weirollWallet: '0x79141B00251E4E08D5463e4e0622E4065692fB3B',
        minAmountOut: '1',
        minAmountOutHex: '0x01',
        quote: {
          '0xcCF6AEC56d368DE2C04686C2bDbB5E8B6557c714': '1000000000000000000',
        },
        dust: { '0x015fd589F4f1A33ce4487E12714e1B15129c9329': '0' },
        gas: '503708',
      });
    });
  });

  describe('satlayer', () => {
    it('pumpbtc', async () => {
      // Arrange
      const args = ['satlayer', 'pumpbtc', '10000000', '--mode=forge', '--block=3493063'];

      // Act
      const report = await main_([...DEFAULT_ARGS, ...args]);

      // Assert
      expect(report).toMatchObject({
        weirollWallet: '0x79141B00251E4E08D5463e4e0622E4065692fB3B',
        minAmountOut: '1',
        minAmountOutHex: '0x01',
        quote: { '0x052335D631356f4b63457c1796f5a3786e8160ad': '10000000' },
        dust: { '0x49a49AB0A048bCADB8b4E51c5c970C46bF889CCD': '0' },
        gas: '579890',
      });
    });
  });

  describe('thj', () => {
    it('usdc', async () => {
      // Arrange
      const args = ['thj', 'usdc', '10000000', '--mode=forge', '--block=4485988'];

      // Act
      const report = await main_([...DEFAULT_ARGS, ...args]);

      // Assert
      expect(report).toMatchObject({
        weirollWallet: '0x79141B00251E4E08D5463e4e0622E4065692fB3B',
        minAmountOut: '1',
        minAmountOutHex: '0x01',
        quote: { '0x46BA968312ab17A9cD667771bB2D14D8d3Ce00B9': '10000000' },
        dust: { '0x015fd589F4f1A33ce4487E12714e1B15129c9329': '0' },
        gas: '563520',
      });
    });
  });

  afterAll(() => {
    // Restore original methods after tests
    vi.restoreAllMocks();
  });
});
