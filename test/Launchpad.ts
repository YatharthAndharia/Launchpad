import { time, loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import { ethers, network } from 'hardhat';
const helpers = require('@nomicfoundation/hardhat-network-helpers');

describe('Launchpad', function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployLaunchpad() {
    // Contracts are deployed using the first signer/account by default
    const [
      launchpadadmin,
      projectOwner,
      address2,
      address3,
      address4,
      address5,
      otherAccount,
    ] = await ethers.getSigners();

    const YamToken = await ethers.getContractFactory('YamToken');
    const yamtoken = await YamToken.deploy();

    const Launchpad = await ethers.getContractFactory('Launchpad');
    const launchpad = await Launchpad.deploy();

    return {
      yamtoken,
      launchpad,
      projectOwner,
      launchpadadmin,
      address2,
      address3,
      address4,
      address5,
      otherAccount,
    };
  }

  const currentTime = Math.ceil(Date.now() / 1000 + 15);

  describe('Launch Project Test Cases', async function () {
    it('Should revert if minimum investment is zero', async function () {
      const {
        yamtoken,
        launchpad,
        projectOwner,
        address2,
        address3,
        address4,
        address5,
      } = await loadFixture(deployLaunchpad);
      const TokenPrice = ethers.utils.parseEther('1');
      const minInvestment = 0;
      const maxInvestment = ethers.utils.parseEther('5');
      const maxCap = ethers.utils.parseEther('10000');
      const hardCap = ethers.utils.parseEther('10000');
      const softCap = ethers.utils.parseEther('1');
      const liquidityPercentToken = 7000;
      const liquidityPercentEth = 3000;

      const currentTimestampInSeconds = Math.floor(Date.now() / 1000);

      const endTime = currentTimestampInSeconds + 60;

      const whiteListedAddress = [
        address2.address,
        address3.address,
        address4.address,
        address5.address,
      ];

      await expect(
        launchpad
          .connect(projectOwner)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            currentTime,
            endTime,
            whiteListedAddress,
          ),
      ).to.be.revertedWithCustomError(
        launchpad,
        'MinimumInvestmentMustBeGreaterThanZero',
      );
    });

    it('Should revert if maximum investment is lesser than minimum investment', async function () {
      const {
        yamtoken,
        launchpad,
        projectOwner,
        address2,
        address3,
        address4,
        address5,
      } = await loadFixture(deployLaunchpad);
      const TokenPrice = ethers.utils.parseUnits('10');
      const minInvestment = ethers.utils.parseEther('50');
      const maxInvestment = ethers.utils.parseEther('40');
      const maxCap = ethers.utils.parseEther('1000');
      const hardCap = ethers.utils.parseEther('100000');
      const softCap = ethers.utils.parseEther('1');
      const liquidityPercentToken = 7000;
      const liquidityPercentEth = 3000;

      const currentTimestampInSeconds = Math.floor(Date.now() / 1000);

      const endTime = currentTimestampInSeconds + 60;

      const whiteListedAddress = [
        address2.address,
        address3.address,
        address4.address,
        address5.address,
      ];

      await expect(
        launchpad
          .connect(projectOwner)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            currentTime,
            endTime,
            whiteListedAddress,
          ),
      ).to.be.revertedWithCustomError(
        launchpad,
        'MaxInvestmentMustBeGreaterOrEqualToMinInvestment',
      );
    });

    it('Should revert if hardcap is lesser than the maximum investment', async function () {
      const {
        yamtoken,
        launchpad,
        address2,
        address3,
        address4,
        address5,
        projectOwner,
      } = await loadFixture(deployLaunchpad);
      const TokenPrice = ethers.utils.parseUnits('10');
      const minInvestment = ethers.utils.parseEther('1');
      const maxInvestment = ethers.utils.parseEther('15000');
      const maxCap = ethers.utils.parseEther('1000');
      const hardCap = ethers.utils.parseEther('10000');
      const softCap = ethers.utils.parseEther('1');
      const liquidityPercentToken = 7000;
      const liquidityPercentEth = 3000;

      const currentTimestampInSeconds = Math.floor(Date.now() / 1000);

      const endTime = currentTimestampInSeconds + 60;

      const whiteListedAddress = [
        address2.address,
        address3.address,
        address4.address,
        address5.address,
      ];

      const mintTxn = await yamtoken.mint(projectOwner.address, maxCap);
      await mintTxn.wait();

      const txn = await yamtoken
        .connect(projectOwner)
        .approve(launchpad.address, maxInvestment);
      await txn.wait();

      await expect(
        launchpad
          .connect(projectOwner)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            currentTime,
            endTime,
            whiteListedAddress,
          ),
      ).to.be.revertedWithCustomError(
        launchpad,
        'MaxInvestmentShouldBeLessThanOrEqualToHardcap',
      );
    });

    it('Should revert if the whitelist addresses array is empty', async function () {
      const { yamtoken, launchpad, projectOwner } = await loadFixture(
        deployLaunchpad,
      );
      const TokenPrice = ethers.utils.parseUnits('10');
      const minInvestment = ethers.utils.parseEther('1');
      const maxInvestment = ethers.utils.parseEther('500');
      const maxCap = ethers.utils.parseEther('10000');
      const hardCap = ethers.utils.parseEther('100000');
      const softCap = ethers.utils.parseEther('1');
      const liquidityPercentToken = 7000;
      const liquidityPercentEth = 3000;

      const currentTimestampInSeconds = Math.floor(Date.now() / 1000);

      const endTime = currentTimestampInSeconds + 60;

      const whiteListedAddress = new Array();

      await expect(
        launchpad
          .connect(projectOwner)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            currentTime,
            endTime,
            whiteListedAddress,
          ),
      ).to.be.revertedWithCustomError(launchpad, 'EmptyAddress');
    });

    it('Should revert if the whitelist addresses array contains a zero address', async function () {
      const {
        yamtoken,
        launchpad,
        address2,
        address3,
        address4,
        address5,
        projectOwner,
      } = await loadFixture(deployLaunchpad);
      const TokenPrice = ethers.utils.parseUnits('10');
      const minInvestment = ethers.utils.parseEther('1');
      const maxInvestment = ethers.utils.parseEther('500');
      const maxCap = ethers.utils.parseEther('10000');
      const hardCap = ethers.utils.parseEther('100000');
      const softCap = ethers.utils.parseEther('1');
      const liquidityPercentToken = 7000;
      const liquidityPercentEth = 3000;
      const endTime = Math.floor(Date.now() / 1000) + 3600;

      const whiteListedAddress = [
        address2.address,
        ethers.constants.AddressZero,
        address3.address,
        address4.address,
        address5.address,
      ];

      await expect(
        launchpad
          .connect(projectOwner)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            currentTime,
            endTime,
            whiteListedAddress,
          ),
      ).to.be.revertedWithCustomError(launchpad, 'AddressZero');
    });

    it('Should revert if token address has already been whitelisted', async function () {
      const {
        yamtoken,
        launchpad,
        address2,
        address3,
        address4,
        address5,
        projectOwner,
        launchpadadmin,
      } = await loadFixture(deployLaunchpad);
      const TokenPrice = ethers.utils.parseUnits('10');
      const minInvestment = ethers.utils.parseEther('1');
      const maxInvestment = ethers.utils.parseEther('500');
      const maxCap = ethers.utils.parseEther('10000');
      const hardCap = ethers.utils.parseEther('100000');
      const softCap = ethers.utils.parseEther('1');
      const liquidityPercentToken = 7000;
      const liquidityPercentEth = 3000;

      const endTime = Math.floor(Date.now() / 1000) + 3600;
      const whiteListedAddress = [
        address2.address,
        address3.address,
        address4.address,
        address5.address,
      ];

      const mintTxn = await yamtoken.mint(projectOwner.address, maxCap);
      await mintTxn.wait();

      const txn = await yamtoken
        .connect(projectOwner)
        .approve(launchpad.address, maxCap);
      await txn.wait();

      const LaunchProject = await launchpad
        .connect(projectOwner)
        .listProject(
          yamtoken.address,
          minInvestment,
          maxInvestment,
          maxCap,
          softCap,
          hardCap,
          liquidityPercentToken,
          liquidityPercentEth,
          currentTime,
          endTime,
          whiteListedAddress,
        );
      LaunchProject.wait();

      await expect(
        launchpad
          .connect(address2)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            currentTime,
            endTime,
            whiteListedAddress,
          ),
      ).to.be.revertedWithCustomError(launchpad, 'TokenAlreadyWhitelisted');
    });
  });

  describe('Invest Project Test Case', function () {
    // it('Should revert if caller is not a whitelisted user', async function () {
    //   const {
    //     launchpad,
    //     yamtoken,
    //     address2,
    //     projectOwner,
    //     address3,
    //     address4,
    //     address5,
    //     otherAccount,
    //   } = await loadFixture(deployLaunchpad);

    //   const TokenPrice = ethers.utils.parseUnits('10');
    //   const minInvestment = ethers.utils.parseEther('1');
    //   const maxInvestment = ethers.utils.parseEther('500');
    //   const maxCap = ethers.utils.parseEther('10000');
    //   const hardCap = ethers.utils.parseEther('100000');
    //   const softCap = ethers.utils.parseEther('1');
    //   const liquidityPercentToken=7000;
    //   const liquidityPercentEth=3000;

    //   const endTime = Math.floor(Date.now() / 1000) + 3600;
    //   const whiteListedAddress = [
    //     address2.address,
    //     address3.address,
    //     address4.address,
    //     address5.address,
    //   ];

    //   const mintTxn = await yamtoken.mint(projectOwner.address, maxCap);
    //   await mintTxn.wait();

    //   const txn = await yamtoken
    //     .connect(projectOwner)
    //     .approve(launchpad.address, maxCap);
    //   await txn.wait();

    //   const desiredTimestamp = Math.floor(Date.now() / 1000);
    //   await network.provider.send('evm_setNextBlockTimestamp', [
    //     desiredTimestamp,
    //   ]);

    //   const LaunchProject = await launchpad
    //     .connect(projectOwner)
    //     .listProject(
    //       yamtoken.address,
    //       minInvestment,
    //       maxInvestment,
    //       maxCap,
    //       softCap,
    //       hardCap,
    //       liquidityPercentToken,
    //       liquidityPercentEth,
    //       desiredTimestamp,
    //       endTime,
    //       whiteListedAddress,
    //     );
    //   LaunchProject.wait();

    //   await expect(
    //     launchpad.connect(otherAccount).invest(1),
    //   ).to.be.revertedWithCustomError(launchpad, 'NotWhiteListed');
    // });

    it("Should revert if project ID doesn't exist", async function () {
      const { yamtoken, projectOwner, address2, launchpad, otherAccount } =
        await loadFixture(deployLaunchpad);

      const TokenPrice = ethers.utils.parseUnits('10');
      const minInvestment = ethers.utils.parseEther('1');
      const maxInvestment = ethers.utils.parseEther('500');
      const maxCap = ethers.utils.parseEther('10000');
      const hardCap = ethers.utils.parseEther('100000');
      const softCap = ethers.utils.parseEther('1');
      const liquidityPercentToken = 7000;
      const liquidityPercentEth = 3000;

      const endTime = Math.floor(Date.now() / 1000) + 3600;
      const whiteListedAddress = [address2.address, otherAccount.address];

      const mintTxn = await yamtoken.mint(projectOwner.address, maxCap);
      await mintTxn.wait();

      const txn = await yamtoken
        .connect(projectOwner)
        .approve(launchpad.address, maxCap);
      await txn.wait();

      const desiredTimestamp = Math.floor(Date.now() / 1000);
      await network.provider.send('evm_setNextBlockTimestamp', [
        desiredTimestamp,
      ]);

      const LaunchProject = await launchpad
        .connect(projectOwner)
        .listProject(
          yamtoken.address,
          minInvestment,
          maxInvestment,
          maxCap,
          softCap,
          hardCap,
          liquidityPercentToken,
          liquidityPercentEth,
          desiredTimestamp,
          endTime,
          whiteListedAddress,
        );
      LaunchProject.wait();

      await expect(
        launchpad.connect(address2).invest(12),
      ).to.be.revertedWithCustomError(launchpad, 'InvalidProjectID');
    });

    // it('Should revert if contract has not been fully funded with the tokens for sale', async function () {
    //   const { launchpad, projectOwner, yamtoken, otherAccount, address2 } =
    //     await loadFixture(deployLaunchpad);

    //   const TokenPrice = ethers.utils.parseUnits('10');
    //   const minInvestment = ethers.utils.parseEther('1');
    //   const maxInvestment = ethers.utils.parseEther('500');
    //   const maxCap = ethers.utils.parseEther('10000');

    //   const endTime = Math.floor(Date.now() / 1000) + 3600;
    //   const whiteListedAddress = [address2.address, otherAccount.address];

    //   const mintTxn = await yamtoken.mint(projectOwner.address, maxCap);
    //   await mintTxn.wait();

    //   const txn = await yamtoken
    //     .connect(projectOwner)
    //     .approve(launchpad.address, maxCap);
    //   await txn.wait();

    //   const LaunchProject = await launchpad
    //     .connect(projectOwner)
    //     .listProject(
    //       yamtoken.address,
    //
    //       minInvestment,
    //       maxInvestment,
    //       maxCap,softCap,
    //       endTime,
    //       whiteListedAddress,
    //     );
    //   LaunchProject.wait();

    //   await expect(
    //     launchpad
    //       .connect(address2)
    //       .invest(1, { value: ethers.utils.parseEther('1') }),
    //   ).to.be.revertedWithCustomError(launchpad, 'ContractNotFullyFunded');
    // });

    it('Should revert if project has ended', async function () {
      const {
        launchpad,
        launchpadadmin,
        yamtoken,
        otherAccount,
        address2,
        projectOwner,
      } = await loadFixture(deployLaunchpad);

      const TokenPrice = ethers.utils.parseUnits('10');
      const minInvestment = ethers.utils.parseEther('1');
      const maxInvestment = ethers.utils.parseEther('500');
      const maxCap = ethers.utils.parseEther('10000');
      const hardCap = ethers.utils.parseEther('100000');
      const softCap = ethers.utils.parseEther('1');
      const liquidityPercentToken = 7000;
      const liquidityPercentEth = 3000;

      const amount = ethers.utils.parseEther('1');

      const endTime = Math.floor(Date.now() / 1000) + 1;
      const whiteListedAddress = [address2.address, otherAccount.address];

      //fund contract
      // const TransferTokens = await yamtoken
      //   .connect(launchpadadmin)
      //   .mint(launchpad.address, maxCap);
      // TransferTokens.wait();

      const mintTxn = await yamtoken.mint(launchpadadmin.address, maxCap);
      await mintTxn.wait();

      const txn = await yamtoken
        .connect(launchpadadmin)
        .approve(launchpad.address, maxCap);
      await txn.wait();

      const desiredTimestamp = Math.floor(Date.now() / 1000);
      await network.provider.send('evm_setNextBlockTimestamp', [
        desiredTimestamp,
      ]);

      const LaunchProject = await launchpad
        .connect(launchpadadmin)
        .listProject(
          yamtoken.address,
          minInvestment,
          maxInvestment,
          maxCap,
          softCap,
          hardCap,
          liquidityPercentToken,
          liquidityPercentEth,
          desiredTimestamp,
          0,
          whiteListedAddress,
        );
      LaunchProject.wait();

      await expect(
        launchpad.connect(address2).invest(1, { value: amount }),
      ).to.be.revertedWithCustomError(launchpad, 'ProjectEnded');
    });

    it('Should revert if investment amount is below the minimum investment amount for IDO project', async function () {
      const {
        launchpad,
        launchpadadmin,
        projectOwner,
        yamtoken,
        otherAccount,
        address2,
      } = await loadFixture(deployLaunchpad);

      const TokenPrice = ethers.utils.parseUnits('10');
      const minInvestment = ethers.utils.parseEther('5');
      const maxInvestment = ethers.utils.parseEther('500');
      const maxCap = ethers.utils.parseEther('10000');
      const hardCap = ethers.utils.parseEther('100000');
      const amount = ethers.utils.parseEther('1');
      const softCap = ethers.utils.parseEther('1');
      const liquidityPercentToken = 7000;
      const liquidityPercentEth = 3000;

      const endTime = Math.floor(Date.now() / 1000) + 100;
      const whiteListedAddress = [address2.address, otherAccount.address];

      //fund contract
      // const TransferTokens = await yamtoken
      //   .connect(launchpadadmin)
      //   .mint(launchpad.address, maxCap);
      // TransferTokens.wait();

      const mintTxn = await yamtoken.mint(projectOwner.address, maxCap);
      await mintTxn.wait();

      const txn = await yamtoken
        .connect(projectOwner)
        .approve(launchpad.address, maxCap);
      await txn.wait();

      const desiredTimestamp = Math.floor(Date.now() / 1000);
      await network.provider.send('evm_setNextBlockTimestamp', [
        desiredTimestamp,
      ]);

      const LaunchProject = await launchpad
        .connect(projectOwner)
        .listProject(
          yamtoken.address,
          minInvestment,
          maxInvestment,
          maxCap,
          softCap,
          hardCap,
          liquidityPercentToken,
          liquidityPercentEth,
          desiredTimestamp,
          endTime,
          whiteListedAddress,
        );
      LaunchProject.wait();

      await expect(
        launchpad.connect(address2).invest(1, { value: amount }),
      ).to.be.revertedWithCustomError(launchpad, 'InvestmentAmtBelowMinimum');
    });

    it('Should revert if total investment amount of a user exceeds maximum set investment amount per account', async function () {
      const {
        launchpad,
        launchpadadmin,
        projectOwner,
        yamtoken,
        otherAccount,
        address2,
      } = await loadFixture(deployLaunchpad);

      const TokenPrice = ethers.utils.parseUnits('10');
      const minInvestment = ethers.utils.parseEther('2');
      const maxInvestment = ethers.utils.parseEther('10');
      const maxCap = ethers.utils.parseEther('10000');
      const hardCap = ethers.utils.parseEther('100000');
      const softCap = ethers.utils.parseEther('1');
      const liquidityPercentToken = 7000;
      const liquidityPercentEth = 3000;

      const amount = ethers.utils.parseEther('12');

      const endTime = Math.floor(Date.now() / 1000) + 100;
      const whiteListedAddress = [address2.address, otherAccount.address];

      //fund contract
      // const TransferTokens = await yamtoken
      //   .connect(launchpadadmin)
      //   .mint(launchpad.address, maxCap);
      // TransferTokens.wait();

      const mintTxn = await yamtoken.mint(projectOwner.address, maxCap);
      await mintTxn.wait();

      const txn = await yamtoken
        .connect(projectOwner)
        .approve(launchpad.address, maxCap);
      await txn.wait();

      const desiredTimestamp = Math.floor(Date.now() / 1000);
      await network.provider.send('evm_setNextBlockTimestamp', [
        desiredTimestamp,
      ]);

      const LaunchProject = await launchpad
        .connect(projectOwner)
        .listProject(
          yamtoken.address,
          minInvestment,
          maxInvestment,
          maxCap,
          softCap,
          hardCap,
          liquidityPercentToken,
          liquidityPercentEth,
          desiredTimestamp,
          endTime,
          whiteListedAddress,
        );
      LaunchProject.wait();

      await expect(
        launchpad.connect(address2).invest(1, { value: amount }),
      ).to.be.revertedWithCustomError(launchpad, 'InvestmentAmtExceedsMaximum');
    });

    it('Should revert if total allocation is greater than project Maximum Cap', async function () {
      const {
        launchpad,
        launchpadadmin,
        projectOwner,
        yamtoken,
        otherAccount,
        address2,
        address3,
        address4,
        address5,
      } = await loadFixture(deployLaunchpad);

      const TokenPrice = ethers.utils.parseEther('0.5');
      const minInvestment = ethers.utils.parseEther('1');
      const maxInvestment = ethers.utils.parseEther('10');
      const maxCap = ethers.utils.parseEther('25');
      const hardCap = ethers.utils.parseEther('12.5');
      const softCap = ethers.utils.parseEther('1');
      const liquidityPercentToken = 7000;
      const liquidityPercentEth = 3000;

      const amount = ethers.utils.parseEther('10');

      const endTime = Math.floor(Date.now() / 1000) + 100;
      const whiteListedAddress = [
        address2.address,
        otherAccount.address,
        address5.address,
      ];

      //fund contract
      // const TransferTokens = await yamtoken
      //   .connect(launchpadadmin)
      //   .mint(launchpad.address, maxCap);
      // TransferTokens.wait();

      const mintTxn = await yamtoken.mint(projectOwner.address, maxCap);
      await mintTxn.wait();

      const txn = await yamtoken
        .connect(projectOwner)
        .approve(launchpad.address, maxCap);
      await txn.wait();

      const desiredTimestamp = Math.floor(Date.now() / 1000);
      await network.provider.send('evm_setNextBlockTimestamp', [
        desiredTimestamp,
      ]);

      const LaunchProject = await launchpad
        .connect(projectOwner)
        .listProject(
          yamtoken.address,
          minInvestment,
          maxInvestment,
          maxCap,
          softCap,
          hardCap,
          liquidityPercentToken,
          liquidityPercentEth,
          desiredTimestamp,
          endTime,
          whiteListedAddress,
        );
      LaunchProject.wait();

      const Invest = await launchpad
        .connect(address2)
        .invest(1, { value: amount });
      Invest.wait();

      const getUserInvestmentHere =
        await launchpad.getUserInvestmentForAnIDOInCELO(1, address2.address);

      await expect(launchpad.connect(address5).invest(1, { value: amount }))
        .to.be.revertedWithCustomError(
          launchpad,
          'InvestmentAmountExceedsHardcap',
        )
        .withArgs(ethers.utils.parseEther('2.5'));
    });

    it('Should invest successfully', async function () {
      const { launchpad, launchpadadmin, yamtoken, otherAccount, address2 } =
        await loadFixture(deployLaunchpad);

      const TokenPrice = ethers.utils.parseEther('1');
      const minInvestment = ethers.utils.parseEther('2');
      const maxInvestment = ethers.utils.parseEther('10');
      const maxCap = ethers.utils.parseEther('10000');
      const hardCap = ethers.utils.parseEther('10000');
      const softCap = ethers.utils.parseEther('1');
      const liquidityPercentToken = 7000;
      const liquidityPercentEth = 3000;

      const amount = ethers.utils.parseEther('2');

      const endTime = Math.floor(Date.now() / 1000) + 100;
      const whiteListedAddress = [address2.address, otherAccount.address];

      //fund contract
      // const TransferTokens = await yamtoken
      //   .connect(launchpadadmin)
      //   .mint(launchpad.address, maxCap);
      // TransferTokens.wait();

      const mintTxn = await yamtoken.mint(launchpadadmin.address, maxCap);
      await mintTxn.wait();

      const txn = await yamtoken
        .connect(launchpadadmin)
        .approve(launchpad.address, maxCap);
      await txn.wait();

      const desiredTimestamp = Math.floor(Date.now() / 1000);
      await network.provider.send('evm_setNextBlockTimestamp', [
        desiredTimestamp,
      ]);

      const LaunchProject = await launchpad
        .connect(launchpadadmin)
        .listProject(
          yamtoken.address,
          minInvestment,
          maxInvestment,
          maxCap,
          softCap,
          hardCap,
          liquidityPercentToken,
          liquidityPercentEth,
          desiredTimestamp,
          endTime,
          whiteListedAddress,
        );
      LaunchProject.wait();

      const Invest = await launchpad
        .connect(address2)
        .invest(1, { value: amount });
      Invest.wait();

      const userInvestment = await launchpad.getUserInvestmentForAnIDOInCELO(
        1,
        address2.address,
      );

      expect(userInvestment).to.be.equal(amount);
    });

    // it('Should invest successfullyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy', async function () {
    //   const { launchpad, launchpadadmin, yamtoken, otherAccount, address2 } =
    //     await loadFixture(deployLaunchpad);

    //   const TokenPrice = ethers.utils.parseEther('1');
    //   const minInvestment = ethers.utils.parseEther('2');
    //   const maxInvestment = ethers.utils.parseEther('100');
    //   const maxCap = ethers.utils.parseEther('100');
    //   const hardCap = ethers.utils.parseEther('100');
    //   const softCap = ethers.utils.parseEther('1');
    //   const liquidityPercentToken=7000;
    //   const liquidityPercentEth=3000;

    //   const amount = ethers.utils.parseEther('2');

    //   const endTime = Math.floor(Date.now() / 1000) + 100;
    //   const whiteListedAddress = [address2.address, otherAccount.address];

    //   //fund contract
    //   // const TransferTokens = await yamtoken
    //   //   .connect(launchpadadmin)
    //   //   .mint(launchpad.address, maxCap);
    //   // TransferTokens.wait();

    //   const mintTxn = await yamtoken.mint(launchpadadmin.address, maxCap);
    //   await mintTxn.wait();

    //   const txn = await yamtoken
    //     .connect(launchpadadmin)
    //     .approve(launchpad.address, maxCap);
    //   await txn.wait();

    //   const desiredTimestamp = Math.floor(Date.now() / 1000);
    //   await network.provider.send('evm_setNextBlockTimestamp', [
    //     desiredTimestamp,
    //   ]);

    //   const LaunchProject = await launchpad
    //     .connect(launchpadadmin)
    //     .listProject(
    //       yamtoken.address,
    //       minInvestment,
    //       maxInvestment,
    //       maxCap,
    //       softCap,
    //       hardCap,
    //       liquidityPercentToken,
    //       liquidityPercentEth,
    //       desiredTimestamp,
    //       endTime,
    //       whiteListedAddress,
    //     );
    //   LaunchProject.wait();

    //   const Invest = await launchpad
    //     .connect(address2)
    //     .invest(1, { value: hardCap });
    //   Invest.wait();

    //   console.log(await yamtoken.balanceOf(address2.address));

    //   await launchpad.connect(address2).claimTokens(1);

    //   console.log(await yamtoken.balanceOf(address2.address));

    //   const userInvestment = await launchpad.getUserInvestmentForAnIDOInCELO(
    //     1,
    //     address2.address,
    //   );

    //   expect(userInvestment).to.be.equal(hardCap);
    // });

    it('Should revert if project is not active', async function () {
      const {
        launchpad,
        launchpadadmin,
        yamtoken,
        otherAccount,
        address2,
        address3,
      } = await loadFixture(deployLaunchpad);

      const TokenPrice = ethers.utils.parseEther('0.2');
      const minInvestment = ethers.utils.parseEther('1');
      const maxInvestment = ethers.utils.parseEther('10');
      const maxCap = ethers.utils.parseEther('5000');
      const hardCap = ethers.utils.parseEther('1000');
      const softCap = ethers.utils.parseEther('1');
      const liquidityPercentToken = 7000;
      const liquidityPercentEth = 3000;

      const amount = ethers.utils.parseEther('5');

      const endTime = Math.floor(Date.now() / 1000) + 100;
      const whiteListedAddress = [
        address2.address,
        address3.address,
        otherAccount.address,
      ];

      //fund contract
      // const TransferTokens = await yamtoken
      //   .connect(launchpadadmin)
      //   .mint(launchpad.address, maxCap);
      // TransferTokens.wait();

      const mintTxn = await yamtoken.mint(launchpadadmin.address, maxCap);
      await mintTxn.wait();

      const txn = await yamtoken
        .connect(launchpadadmin)
        .approve(launchpad.address, maxCap);
      await txn.wait();

      const desiredTimestamp = Math.floor(Date.now() / 1000);
      await network.provider.send('evm_setNextBlockTimestamp', [
        desiredTimestamp,
      ]);

      const LaunchProject = await launchpad
        .connect(launchpadadmin)
        .listProject(
          yamtoken.address,
          minInvestment,
          maxInvestment,
          maxCap,
          softCap,
          hardCap,
          liquidityPercentToken,
          liquidityPercentEth,
          desiredTimestamp,
          endTime,
          whiteListedAddress,
        );
      LaunchProject.wait();

      const Invest = await launchpad
        .connect(address2)
        .invest(1, { value: amount });
      Invest.wait();

      const cancelProject = await launchpad
        .connect(launchpadadmin)
        .cancelIDOProject(1);
      cancelProject.wait();

      await expect(
        launchpad.connect(address2).invest(1, { value: amount }),
      ).to.be.revertedWithCustomError(launchpad, 'ProjectNotActive');
    });

    describe('ClaimToken Function Testcases', function () {
      it('Should revert if project ID is invalid', async function () {
        const {
          launchpad,
          launchpadadmin,
          yamtoken,
          otherAccount,
          address2,
          address3,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = ethers.utils.parseEther('0.2');
        const minInvestment = ethers.utils.parseEther('1');
        const maxInvestment = ethers.utils.parseEther('10');
        const maxCap = ethers.utils.parseEther('5000');
        const hardCap = ethers.utils.parseEther('1000');
        const softCap = ethers.utils.parseEther('1');
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;
        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await yamtoken
        //   .connect(launchpadadmin)
        //   .mint(launchpad.address, maxCap);
        // TransferTokens.wait();

        const mintTxn = await yamtoken.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await yamtoken
          .connect(address2)
          .approve(launchpad.address, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000);
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await expect(
          launchpad.connect(address2).claimTokens(0),
        ).to.be.revertedWithCustomError(launchpad, 'InvalidProjectID');
      });

      it('Should revert if caller is not an project investor', async function () {
        const {
          launchpad,
          launchpadadmin,
          yamtoken,
          otherAccount,
          address2,
          address3,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = ethers.utils.parseEther('0.2');
        const minInvestment = ethers.utils.parseEther('1');
        const maxInvestment = ethers.utils.parseEther('10');
        const maxCap = ethers.utils.parseEther('5000');
        const hardCap = ethers.utils.parseEther('1000');
        const amount = ethers.utils.parseEther('5');
        const softCap = ethers.utils.parseEther('1');
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [address2.address, otherAccount.address];

        //fund contract
        // const TransferTokens = await yamtoken
        //   .connect(launchpadadmin)
        //   .mint(launchpad.address, maxCap);
        // TransferTokens.wait();

        const mintTxn = await yamtoken.mint(launchpadadmin.address, maxCap);
        await mintTxn.wait();

        const txn = await yamtoken
          .connect(launchpadadmin)
          .approve(launchpad.address, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000);
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(launchpadadmin)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await launchpad.connect(address2).invest(1, { value: amount });
        await expect(
          launchpad.connect(address3).claimTokens(1),
        ).to.be.revertedWithCustomError(launchpad, 'YouAreNotAnInvestor');
      });

      it('Should revert if tokens are claimed already', async function () {
        const {
          launchpad,
          launchpadadmin,
          yamtoken,
          otherAccount,
          address2,
          address3,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = ethers.utils.parseEther('0.2');
        const minInvestment = ethers.utils.parseEther('1');
        const maxInvestment = ethers.utils.parseEther('10');
        const maxCap = ethers.utils.parseEther('5000');
        const hardCap = ethers.utils.parseEther('10');
        const softCap = ethers.utils.parseEther('1');
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;
        const amount = ethers.utils.parseEther('10');

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await yamtoken
        //   .connect(launchpadadmin)
        //   .mint(launchpad.address, maxCap);
        // TransferTokens.wait();

        const mintTxn = await yamtoken.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await yamtoken
          .connect(address2)
          .approve(launchpad.address, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000);
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await launchpad.connect(address2).invest(1, { value: amount });

        await launchpad.connect(address2).claimTokens(1);

        await expect(
          launchpad.connect(address2).claimTokens(1),
        ).to.be.revertedWithCustomError(launchpad, 'ClaimedAlready');
      });

      it('Should revert if investment amount not reached to softcap', async function () {
        const {
          launchpad,
          launchpadadmin,
          yamtoken,
          otherAccount,
          address2,
          address3,
          address4,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = ethers.utils.parseEther('0.1');
        const minInvestment = ethers.utils.parseEther('1');
        const maxInvestment = ethers.utils.parseEther('10');
        const maxCap = ethers.utils.parseEther('100');
        const hardCap = ethers.utils.parseEther('10');
        const softCap = ethers.utils.parseEther('2');
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;
        const amount = ethers.utils.parseEther('1');

        const endTime = Math.floor(Date.now() / 1000) + 10000;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          address4.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await yamtoken
        //   .connect(launchpadadmin)
        //   .mint(launchpad.address, maxCap);
        // TransferTokens.wait();

        const mintTxn = await yamtoken.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await yamtoken
          .connect(address2)
          .approve(launchpad.address, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000);
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);
        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await launchpad.connect(address4).invest(1, { value: amount });
        await expect(
          launchpad.connect(address4).claimTokens(1),
        ).to.be.revertedWithCustomError(
          launchpad,
          'InvestmentNotReachedSoftcap',
        );
      });
      it('Should revert if project is not ended yet', async function () {
        const {
          launchpad,
          launchpadadmin,
          yamtoken,
          otherAccount,
          address2,
          address3,
          address4,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = ethers.utils.parseEther('0.1');
        const minInvestment = ethers.utils.parseEther('1');
        const maxInvestment = ethers.utils.parseEther('10');
        const maxCap = ethers.utils.parseEther('100');
        const hardCap = ethers.utils.parseEther('10');
        const softCap = ethers.utils.parseEther('2');
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;
        const amount = ethers.utils.parseEther('3');

        const endTime = Math.floor(Date.now() / 1000) + 10000;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          address4.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await yamtoken
        //   .connect(launchpadadmin)
        //   .mint(launchpad.address, maxCap);
        // TransferTokens.wait();

        const mintTxn = await yamtoken.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await yamtoken
          .connect(address2)
          .approve(launchpad.address, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000);
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);
        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await launchpad.connect(address4).invest(1, { value: amount });
        await expect(
          launchpad.connect(address4).claimTokens(1),
        ).to.be.revertedWithCustomError(launchpad, 'ProjectIsNotEndedYet');
      });

      it('Should claim tokens', async function () {
        const {
          launchpad,
          launchpadadmin,
          yamtoken,
          otherAccount,
          address2,
          address3,
          address4,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = ethers.utils.parseEther('0.1');
        const minInvestment = ethers.utils.parseEther('1');
        const maxInvestment = ethers.utils.parseEther('10');
        const maxCap = ethers.utils.parseEther('100');
        const hardCap = ethers.utils.parseEther('10');
        const softCap = ethers.utils.parseEther('2');
        const liquidityPercentToken = 6000;
        const liquidityPercentEth = 4000;
        const amount = ethers.utils.parseEther('3');

        const endTime = Math.floor(Date.now() / 1000) + 10000;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          address4.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await yamtoken
        //   .connect(launchpadadmin)
        //   .mint(launchpad.address, maxCap);
        // TransferTokens.wait();

        const mintTxn = await yamtoken.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await yamtoken
          .connect(address2)
          .approve(launchpad.address, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000);
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);
        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        expect(await yamtoken.balanceOf(address4.address)).to.be.equal(0);
        await launchpad.connect(address4).invest(1, { value: hardCap });

        await launchpad.connect(address4).claimTokens(1),
          expect(await yamtoken.balanceOf(address4.address)).to.be.equal(
            ethers.utils.parseEther('40'),
          );
      });
    });

    describe('Refund Function Testcases', function () {
      it('Should revert if project ID is invalid', async function () {
        const {
          launchpad,
          launchpadadmin,
          yamtoken,
          otherAccount,
          address2,
          address3,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = ethers.utils.parseEther('0.2');
        const minInvestment = ethers.utils.parseEther('1');
        const maxInvestment = ethers.utils.parseEther('10');
        const maxCap = ethers.utils.parseEther('5000');
        const hardCap = ethers.utils.parseEther('1000');
        const softCap = ethers.utils.parseEther('1');
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;
        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await yamtoken
        //   .connect(launchpadadmin)
        //   .mint(launchpad.address, maxCap);
        // TransferTokens.wait();

        const mintTxn = await yamtoken.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await yamtoken
          .connect(address2)
          .approve(launchpad.address, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000);
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await expect(
          launchpad.connect(address2).refundTokens(0),
        ).to.be.revertedWithCustomError(launchpad, 'InvalidProjectID');
      });

      it('Should revert if tokens are claimed already', async function () {
        const {
          launchpad,
          launchpadadmin,
          yamtoken,
          otherAccount,
          address2,
          address3,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = ethers.utils.parseEther('0.2');
        const minInvestment = ethers.utils.parseEther('1');
        const maxInvestment = ethers.utils.parseEther('10');
        const maxCap = ethers.utils.parseEther('5000');
        const hardCap = ethers.utils.parseEther('10');
        const softCap = ethers.utils.parseEther('2');
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;
        const amount = ethers.utils.parseEther('1');

        const endTime = Math.floor(Date.now() / 1000) + 1000;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await yamtoken
        //   .connect(launchpadadmin)
        //   .mint(launchpad.address, maxCap);
        // TransferTokens.wait();

        const mintTxn = await yamtoken.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await yamtoken
          .connect(address2)
          .approve(launchpad.address, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000);
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await launchpad.connect(address3).invest(1, { value: amount });
        const refundTimestamp = Math.floor(Date.now() / 1000) + 1000;
        await network.provider.send('evm_setNextBlockTimestamp', [
          refundTimestamp,
        ]);

        await launchpad.connect(address2).refundTokens(1);

        await expect(
          launchpad.connect(address2).refundTokens(1),
        ).to.be.revertedWithCustomError(launchpad, 'ClaimedAlready');
      });

      it('Should revert if caller is not an project owner', async function () {
        const {
          launchpad,
          launchpadadmin,
          yamtoken,
          otherAccount,
          address2,
          address3,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = ethers.utils.parseEther('0.2');
        const minInvestment = ethers.utils.parseEther('1');
        const maxInvestment = ethers.utils.parseEther('10');
        const maxCap = ethers.utils.parseEther('5000');
        const hardCap = ethers.utils.parseEther('1000');
        const amount = ethers.utils.parseEther('5');
        const softCap = ethers.utils.parseEther('1');
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [address2.address, otherAccount.address];

        //fund contract
        // const TransferTokens = await yamtoken
        //   .connect(launchpadadmin)
        //   .mint(launchpad.address, maxCap);
        // TransferTokens.wait();

        const mintTxn = await yamtoken.mint(launchpadadmin.address, maxCap);
        await mintTxn.wait();

        const txn = await yamtoken
          .connect(launchpadadmin)
          .approve(launchpad.address, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000);
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(launchpadadmin)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await launchpad.connect(address2).invest(1, { value: amount });
        const refundTimestamp = Math.floor(Date.now() / 1000) + 1000;
        await network.provider.send('evm_setNextBlockTimestamp', [
          refundTimestamp,
        ]);

        await expect(
          launchpad.connect(address3).refundTokens(1),
        ).to.be.revertedWithCustomError(launchpad, 'NotProjectOwner');
      });

      it('Should revert if investment amount exceeds softcap', async function () {
        const {
          launchpad,
          launchpadadmin,
          yamtoken,
          otherAccount,
          address2,
          address3,
          address4,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = ethers.utils.parseEther('0.1');
        const minInvestment = ethers.utils.parseEther('1');
        const maxInvestment = ethers.utils.parseEther('10');
        const maxCap = ethers.utils.parseEther('100');
        const hardCap = ethers.utils.parseEther('10');
        const softCap = ethers.utils.parseEther('2');
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;
        const amount = ethers.utils.parseEther('3');

        const endTime = Math.floor(Date.now() / 1000) + 10000;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          address4.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await yamtoken
        //   .connect(launchpadadmin)
        //   .mint(launchpad.address, maxCap);
        // TransferTokens.wait();

        const mintTxn = await yamtoken.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await yamtoken
          .connect(address2)
          .approve(launchpad.address, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000);
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);
        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await launchpad.connect(address4).invest(1, { value: amount });

        const refundTimestamp = Math.floor(Date.now() / 1000) + 2000;
        await network.provider.send('evm_setNextBlockTimestamp', [
          refundTimestamp,
        ]);

        await expect(
          launchpad.connect(address2).refundTokens(1),
        ).to.be.revertedWithCustomError(launchpad, 'IneligibleForRefund');
      });
      it('Should revert if project is not ended yet', async function () {
        const {
          launchpad,
          launchpadadmin,
          yamtoken,
          otherAccount,
          address2,
          address3,
          address4,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = ethers.utils.parseEther('0.1');
        const minInvestment = ethers.utils.parseEther('1');
        const maxInvestment = ethers.utils.parseEther('10');
        const maxCap = ethers.utils.parseEther('100');
        const hardCap = ethers.utils.parseEther('10');
        const softCap = ethers.utils.parseEther('2');
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;
        const amount = ethers.utils.parseEther('1');

        const endTime = Math.floor(Date.now() / 1000) + 10000;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          address4.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await yamtoken
        //   .connect(launchpadadmin)
        //   .mint(launchpad.address, maxCap);
        // TransferTokens.wait();

        const mintTxn = await yamtoken.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await yamtoken
          .connect(address2)
          .approve(launchpad.address, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000);
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);
        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await launchpad.connect(address4).invest(1, { value: amount });
        await expect(
          launchpad.connect(address2).refundTokens(1),
        ).to.be.revertedWithCustomError(launchpad, 'ProjectIsNotEndedYet');
      });

      it('Should get refund of tokens', async function () {
        const {
          launchpad,
          launchpadadmin,
          yamtoken,
          otherAccount,
          address2,
          address3,
          address4,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = ethers.utils.parseEther('0.1');
        const minInvestment = ethers.utils.parseEther('1');
        const maxInvestment = ethers.utils.parseEther('10');
        const maxCap = ethers.utils.parseEther('100');
        const hardCap = ethers.utils.parseEther('10');
        const softCap = ethers.utils.parseEther('2');
        const liquidityPercentToken = 6000;
        const liquidityPercentEth = 4000;
        const amount = ethers.utils.parseEther('1');

        const endTime = Math.floor(Date.now() / 1000) + 1000;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          address4.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await yamtoken
        //   .connect(launchpadadmin)
        //   .mint(launchpad.address, maxCap);
        // TransferTokens.wait();

        const mintTxn = await yamtoken.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await yamtoken
          .connect(address2)
          .approve(launchpad.address, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000);
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);
        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        const userBalanceBeforeRefund = await yamtoken.balanceOf(
          address2.address,
        );

        await launchpad.connect(address4).invest(1, { value: amount });

        const refundTimestamp = Math.floor(Date.now() / 1000) + 1000;
        await network.provider.send('evm_setNextBlockTimestamp', [
          refundTimestamp,
        ]);

        await launchpad.connect(address2).refundTokens(1);
        expect(
          await yamtoken.connect(address2).balanceOf(address2.address),
        ).to.be.equal(maxCap);

        //   ethers.utils.parseEther('40'),
        // );
      });
    });

    describe('Add User For A Particular IDO Project Functionality', function () {
      it('Should revert if caller is not project owner', async function () {
        const {
          launchpad,
          launchpadadmin,
          projectOwner,
          yamtoken,
          otherAccount,
          address2,
          address3,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = ethers.utils.parseEther('0.2');
        const minInvestment = ethers.utils.parseEther('1');
        const maxInvestment = ethers.utils.parseEther('10');
        const maxCap = ethers.utils.parseEther('5000');
        const hardCap = ethers.utils.parseEther('1000');
        const softCap = ethers.utils.parseEther('1');
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;
        const amount = ethers.utils.parseEther('5');

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await yamtoken
        //   .connect(launchpadadmin)
        //   .mint(launchpad.address, maxCap);
        // TransferTokens.wait();

        const mintTxn = await yamtoken.mint(launchpadadmin.address, maxCap);
        await mintTxn.wait();

        const txn = await yamtoken
          .connect(launchpadadmin)
          .approve(launchpad.address, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000);
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(launchpadadmin)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await expect(
          launchpad
            .connect(address2)
            .AddUserForAParticularProject(1, projectOwner.address),
        ).to.be.revertedWithCustomError(launchpad, 'NotProjectOwner');
      });

      it('Should revert if the inputed address is an zero address', async function () {
        const {
          launchpad,
          launchpadadmin,
          projectOwner,
          yamtoken,
          otherAccount,
          address2,
          address3,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = ethers.utils.parseEther('0.2');
        const minInvestment = ethers.utils.parseEther('1');
        const maxInvestment = ethers.utils.parseEther('10');
        const maxCap = ethers.utils.parseEther('5000');
        const hardCap = ethers.utils.parseEther('1000');
        const softCap = ethers.utils.parseEther('1');
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await yamtoken
        //   .connect(launchpadadmin)
        //   .mint(launchpad.address, maxCap);
        // TransferTokens.wait();

        const mintTxn = await yamtoken.mint(projectOwner.address, maxCap);
        await mintTxn.wait();

        const txn = await yamtoken
          .connect(projectOwner)
          .approve(launchpad.address, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000);
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(projectOwner)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await expect(
          launchpad
            .connect(projectOwner)
            .AddUserForAParticularProject(1, ethers.constants.AddressZero),
        ).to.be.revertedWithCustomError(launchpad, 'AddressZero');
      });

      it('Should revert if the inputed address has already been whitelisted', async function () {
        const {
          launchpad,
          launchpadadmin,
          projectOwner,
          yamtoken,
          otherAccount,
          address2,
          address3,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = ethers.utils.parseEther('0.2');
        const minInvestment = ethers.utils.parseEther('1');
        const maxInvestment = ethers.utils.parseEther('10');
        const maxCap = ethers.utils.parseEther('5000');
        const hardCap = ethers.utils.parseEther('1000');
        const softCap = ethers.utils.parseEther('1');
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await yamtoken
        //   .connect(launchpadadmin)
        //   .mint(launchpad.address, maxCap);
        // TransferTokens.wait();

        const mintTxn = await yamtoken.mint(projectOwner.address, maxCap);
        await mintTxn.wait();

        const txn = await yamtoken
          .connect(projectOwner)
          .approve(launchpad.address, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000);
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(projectOwner)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await expect(
          launchpad
            .connect(projectOwner)
            .AddUserForAParticularProject(1, otherAccount.address),
        ).to.be.revertedWithCustomError(launchpad, 'UserAlreadyWhitelisted');
      });

      it("Should revert if the inputed projectID doesn't exist", async function () {
        const {
          launchpad,
          launchpadadmin,
          yamtoken,
          otherAccount,
          address2,
          address3,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = ethers.utils.parseEther('0.2');
        const minInvestment = ethers.utils.parseEther('1');
        const maxInvestment = ethers.utils.parseEther('10');
        const maxCap = ethers.utils.parseEther('5000');
        const hardCap = ethers.utils.parseEther('1000');
        const softCap = ethers.utils.parseEther('1');
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await yamtoken
        //   .connect(launchpadadmin)
        //   .mint(launchpad.address, maxCap);
        // TransferTokens.wait();

        const mintTxn = await yamtoken.mint(launchpadadmin.address, maxCap);
        await mintTxn.wait();

        const txn = await yamtoken
          .connect(launchpadadmin)
          .approve(launchpad.address, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000);
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(launchpadadmin)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await expect(
          launchpad
            .connect(launchpadadmin)
            .AddUserForAParticularProject(12, otherAccount.address),
        ).to.be.revertedWithCustomError(launchpad, 'InvalidProjectID');
      });
    });

    describe('Withdraw Amount Raised For An IDO project Test Case', function () {
      it('Should revert if caller is not IDO project owner', async function () {
        const {
          launchpad,
          launchpadadmin,
          yamtoken,
          otherAccount,
          address2,
          address3,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = ethers.utils.parseEther('0.2');
        const minInvestment = ethers.utils.parseEther('1');
        const maxInvestment = ethers.utils.parseEther('10');
        const maxCap = ethers.utils.parseEther('5000');
        const hardCap = ethers.utils.parseEther('1000');
        const amount = ethers.utils.parseEther('5');
        const softCap = ethers.utils.parseEther('1');
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await yamtoken
        //   .connect(launchpadadmin)
        //   .mint(launchpad.address, maxCap);
        // TransferTokens.wait();

        const mintTxn = await yamtoken.mint(launchpadadmin.address, maxCap);
        await mintTxn.wait();

        const txn = await yamtoken
          .connect(launchpadadmin)
          .approve(launchpad.address, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000);
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(launchpadadmin)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await launchpad.connect(address2).invest(1, { value: amount });
        await expect(
          launchpad.connect(address2).withdrawAmountRaised(1),
        ).to.be.revertedWithCustomError(launchpad, 'NotProjectOwner');
      });
      it('Should revert if project ID is invalid', async function () {
        const {
          launchpad,
          launchpadadmin,
          yamtoken,
          otherAccount,
          address2,
          address3,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = ethers.utils.parseEther('0.2');
        const minInvestment = ethers.utils.parseEther('1');
        const maxInvestment = ethers.utils.parseEther('10');
        const maxCap = ethers.utils.parseEther('5000');
        const hardCap = ethers.utils.parseEther('1000');
        const softCap = ethers.utils.parseEther('1');
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;
        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await yamtoken
        //   .connect(launchpadadmin)
        //   .mint(launchpad.address, maxCap);
        // TransferTokens.wait();

        const mintTxn = await yamtoken.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await yamtoken
          .connect(address2)
          .approve(launchpad.address, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000);
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await expect(
          launchpad.connect(address2).withdrawAmountRaised(10),
        ).to.be.revertedWithCustomError(launchpad, 'InvalidProjectID');
      });

      it('Should revert if project is still in progress', async function () {
        const {
          launchpad,
          launchpadadmin,
          yamtoken,
          otherAccount,
          address2,
          address3,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = ethers.utils.parseEther('0.2');
        const minInvestment = ethers.utils.parseEther('1');
        const maxInvestment = ethers.utils.parseEther('10');
        const maxCap = ethers.utils.parseEther('5000');
        const hardCap = ethers.utils.parseEther('1000');
        const softCap = ethers.utils.parseEther('1');
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;
        const amount = ethers.utils.parseEther('5');

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await yamtoken
        //   .connect(launchpadadmin)
        //   .mint(launchpad.address, maxCap);
        // TransferTokens.wait();

        const mintTxn = await yamtoken.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await yamtoken
          .connect(address2)
          .approve(launchpad.address, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000);
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await launchpad.connect(address2).invest(1, { value: amount });
        await expect(
          launchpad.connect(address2).withdrawAmountRaised(1),
        ).to.be.revertedWithCustomError(launchpad, 'ProjectStillInProgress');
      });

      it('Should not revert if duration is not over but hardcap is reached', async function () {
        const {
          launchpad,
          launchpadadmin,
          yamtoken,
          otherAccount,
          address2,
          address3,
          address4,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = ethers.utils.parseEther('0.1');
        const minInvestment = ethers.utils.parseEther('1');
        const maxInvestment = ethers.utils.parseEther('10');
        const maxCap = ethers.utils.parseEther('100');
        const hardCap = ethers.utils.parseEther('10');
        const softCap = ethers.utils.parseEther('2');
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;
        const amount = ethers.utils.parseEther('5');

        const endTime = Math.floor(Date.now() / 1000) + 10000;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          address4.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await yamtoken
        //   .connect(launchpadadmin)
        //   .mint(launchpad.address, maxCap);
        // TransferTokens.wait();

        const mintTxn = await yamtoken.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await yamtoken
          .connect(address2)
          .approve(launchpad.address, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000);
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);
        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await launchpad.connect(address4).invest(1, { value: softCap });
        await expect(
          launchpad.connect(address2).withdrawAmountRaised(1),
        ).to.be.revertedWithCustomError(launchpad, 'ProjectStillInProgress');
        await launchpad
          .connect(address3)
          .invest(1, { value: ethers.utils.parseEther('8') });

        await launchpad.connect(address2).withdrawAmountRaised(1);

        expect(await ethers.provider.getBalance(launchpad.address)).to.equal(
          ethers.utils.parseEther('3'),
        );
      });
    });

    describe('Project Cancellation Test Cases', function () {
      it('Should revert if caller is not launchpad admin', async function () {
        const {
          launchpad,
          launchpadadmin,
          yamtoken,
          otherAccount,
          address2,
          address3,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = ethers.utils.parseEther('0.2');
        const minInvestment = ethers.utils.parseEther('1');
        const maxInvestment = ethers.utils.parseEther('10');
        const maxCap = ethers.utils.parseEther('5000');
        const hardCap = ethers.utils.parseEther('1000');
        const softCap = ethers.utils.parseEther('1');
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await yamtoken
        //   .connect(launchpadadmin)
        //   .mint(launchpad.address, maxCap);
        // TransferTokens.wait();

        const mintTxn = await yamtoken.mint(launchpadadmin.address, maxCap);
        await mintTxn.wait();

        const txn = await yamtoken
          .connect(launchpadadmin)
          .approve(launchpad.address, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000);
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(launchpadadmin)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await expect(
          launchpad.connect(otherAccount).cancelIDOProject(1),
        ).to.be.revertedWithCustomError(launchpad, 'NotLaunchPadAdmin');
      });

      it('Should cancel and send the IDO tokens to the project owner successfully', async function () {
        const {
          launchpad,
          launchpadadmin,
          yamtoken,
          otherAccount,
          address2,
          address3,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = ethers.utils.parseEther('0.2');
        const minInvestment = ethers.utils.parseEther('1');
        const maxInvestment = ethers.utils.parseEther('10');
        const maxCap = ethers.utils.parseEther('5000');
        const hardCap = ethers.utils.parseEther('1000');
        const amount = ethers.utils.parseEther('5');
        const softCap = ethers.utils.parseEther('1');
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await yamtoken
        //   .connect(launchpadadmin)
        //   .mint(launchpad.address, maxCap);
        // TransferTokens.wait();

        const mintTxn = await yamtoken.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await yamtoken
          .connect(address2)
          .approve(launchpad.address, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000);
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        const Invest = await launchpad
          .connect(address2)
          .invest(1, { value: amount });
        Invest.wait();

        const OwnerBalanceBeforeCancellation = await yamtoken.balanceOf(
          address2.address,
        );

        const Cancel = await launchpad
          .connect(launchpadadmin)
          .cancelIDOProject(1);
        Cancel.wait();

        const OwnerBalanceAfterCancellation = await yamtoken.balanceOf(
          address2.address,
        );

        expect(OwnerBalanceAfterCancellation).to.be.equal(maxCap);

        const ProjectTotalRaisedFunds =
          await launchpad.getProjectTotalAmtRaised(1);

        const WithdrawAmountGottenSofar = await launchpad
          .connect(address2)
          .withdrawAmountRaised(1);
        WithdrawAmountGottenSofar.wait();
      });
    });

    describe('Launchpad Admin Change Test Case', function () {
      it('Should revert when contract is paused', async function () {
        const { launchpad, yamtoken, otherAccount, address2, address3 } =
          await loadFixture(deployLaunchpad);

        const TokenPrice = ethers.utils.parseEther('0.2');
        const minInvestment = ethers.utils.parseEther('1');
        const maxInvestment = ethers.utils.parseEther('10');
        const maxCap = ethers.utils.parseEther('5000');
        const hardCap = ethers.utils.parseEther('1000');
        const softCap = ethers.utils.parseEther('1');
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        const mintTxn = await yamtoken.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await yamtoken
          .connect(address2)
          .approve(launchpad.address, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000);
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await expect(
          launchpad.connect(address2).changeLaunchPadAdmin(address2.address),
        ).to.be.reverted;
      });
      it('Should revert if caller is not launchpad admin', async function () {
        const { launchpad, address3 } = await loadFixture(deployLaunchpad);

        await expect(
          launchpad.connect(address3).changeLaunchPadAdmin(address3.address),
        ).to.be.revertedWithCustomError(launchpad, 'NotLaunchPadAdmin');
      });

      it('Should revert if the inputed address is a zero address', async function () {
        const { launchpadadmin, launchpad } = await loadFixture(
          deployLaunchpad,
        );

        await expect(
          launchpad
            .connect(launchpadadmin)
            .changeLaunchPadAdmin(ethers.constants.AddressZero),
        ).to.be.revertedWithCustomError(launchpad, 'AddressZero');
      });

      it('Should revert if the inputed address is the same as the current launchpad admin address', async function () {
        const { launchpadadmin, launchpad } = await loadFixture(
          deployLaunchpad,
        );

        await expect(
          launchpad
            .connect(launchpadadmin)
            .changeLaunchPadAdmin(launchpadadmin.address),
        ).to.be.revertedWithCustomError(launchpad, 'OldAdmin');
      });

      it('Should set the new launchpad admin successfully', async function () {
        const { launchpadadmin, launchpad, address3 } = await loadFixture(
          deployLaunchpad,
        );

        const OldAdmin = await launchpad.launchPadadmin();

        const SetNewAdmin = await launchpad
          .connect(launchpadadmin)
          .changeLaunchPadAdmin(address3.address);
        SetNewAdmin.wait();

        expect(await launchpad.launchPadadmin()).to.be.equal(address3.address);
      });
    });

    describe('Sweep Function Test Case', function () {
      it('Should revert if caller is not project owner', async function () {
        const { launchpad, yamtoken, otherAccount, address2, address3 } =
          await loadFixture(deployLaunchpad);

        const TokenPrice = ethers.utils.parseEther('0.2');
        const minInvestment = ethers.utils.parseEther('1');
        const maxInvestment = ethers.utils.parseEther('10');
        const maxCap = ethers.utils.parseEther('5000');
        const hardCap = ethers.utils.parseEther('1000');
        const softCap = ethers.utils.parseEther('1');
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;

        const endTime = 10;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        const mintTxn = await yamtoken.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await yamtoken
          .connect(address2)
          .approve(launchpad.address, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000);
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await expect(
          launchpad.connect(address3).sweep(1, address3.address),
        ).to.be.revertedWithCustomError(launchpad, 'NotProjectOwner');
      });

      it('Should revert when contract is paused', async function () {
        const { launchpad, yamtoken, otherAccount, address2, address3 } =
          await loadFixture(deployLaunchpad);

        const TokenPrice = ethers.utils.parseEther('0.2');
        const minInvestment = ethers.utils.parseEther('1');
        const maxInvestment = ethers.utils.parseEther('10');
        const maxCap = ethers.utils.parseEther('5000');
        const hardCap = ethers.utils.parseEther('1000');
        const softCap = ethers.utils.parseEther('1');
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        const mintTxn = await yamtoken.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await yamtoken
          .connect(address2)
          .approve(launchpad.address, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000);
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);
        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await expect(launchpad.connect(address2).sweep(1, address2.address)).to
          .be.reverted;
      });

      it('Should revert if project ID is not valid', async function () {
        const { launchpad, yamtoken, otherAccount, address2, address3 } =
          await loadFixture(deployLaunchpad);

        const TokenPrice = ethers.utils.parseEther('0.2');
        const minInvestment = ethers.utils.parseEther('1');
        const maxInvestment = ethers.utils.parseEther('10');
        const maxCap = ethers.utils.parseEther('5000');
        const hardCap = ethers.utils.parseEther('1000');
        const softCap = ethers.utils.parseEther('1');
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        const mintTxn = await yamtoken.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await yamtoken
          .connect(address2)
          .approve(launchpad.address, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000);
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await expect(
          launchpad.connect(address2).sweep(10, address2.address),
        ).to.be.revertedWithCustomError(launchpad, 'InvalidProjectID');
      });

      it('Should revert if inputed address is an address zero', async function () {
        const { launchpad, yamtoken, otherAccount, address2, address3 } =
          await loadFixture(deployLaunchpad);

        const TokenPrice = ethers.utils.parseEther('0.2');
        const minInvestment = ethers.utils.parseEther('1');
        const maxInvestment = ethers.utils.parseEther('10');
        const maxCap = ethers.utils.parseEther('5000');
        const hardCap = ethers.utils.parseEther('1000');
        const softCap = ethers.utils.parseEther('1');
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        const mintTxn = await yamtoken.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await yamtoken
          .connect(address2)
          .approve(launchpad.address, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000);
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await expect(
          launchpad.connect(address2).sweep(1, ethers.constants.AddressZero),
        ).to.be.revertedWithCustomError(launchpad, 'AddressZero');
      });

      it('Should revert if project is still ongoing', async function () {
        const { launchpad, yamtoken, otherAccount, address2, address3 } =
          await loadFixture(deployLaunchpad);

        const TokenPrice = ethers.utils.parseEther('0.2');
        const minInvestment = ethers.utils.parseEther('1');
        const maxInvestment = ethers.utils.parseEther('10');
        const maxCap = ethers.utils.parseEther('5000');
        const hardCap = ethers.utils.parseEther('1000');
        const softCap = ethers.utils.parseEther('1');
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        const mintTxn = await yamtoken.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await yamtoken
          .connect(address2)
          .approve(launchpad.address, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000);
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await expect(
          launchpad.connect(address2).sweep(1, address2.address),
        ).to.be.revertedWithCustomError(launchpad, 'ProjectStillInProgress');
      });

      it('Should revert if hardcap is reached', async function () {
        const { launchpad, yamtoken, otherAccount, address2, address3 } =
          await loadFixture(deployLaunchpad);

        const TokenPrice = ethers.utils.parseEther('0.1');
        const minInvestment = ethers.utils.parseEther('1');
        const maxInvestment = ethers.utils.parseEther('10');
        const maxCap = ethers.utils.parseEther('100');
        const hardCap = ethers.utils.parseEther('10');
        const softCap = ethers.utils.parseEther('1');
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        const mintTxn = await yamtoken.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await yamtoken
          .connect(address2)
          .approve(launchpad.address, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000);
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await launchpad
          .connect(address3)
          .invest(1, { value: ethers.utils.parseEther('10') });

        await expect(
          launchpad.connect(address2).sweep(1, address2.address),
        ).to.be.revertedWithCustomError(
          launchpad,
          'HardCapReachedNoTokensToSweep',
        );
      });

      it('Should not revert if hardcap is not reached and project is over', async function () {
        const { launchpad, yamtoken, otherAccount, address2, address3 } =
          await loadFixture(deployLaunchpad);

        const TokenPrice = ethers.utils.parseEther('0.1');
        const minInvestment = ethers.utils.parseEther('1');
        const maxInvestment = ethers.utils.parseEther('10');
        const maxCap = ethers.utils.parseEther('100');
        const hardCap = ethers.utils.parseEther('10');
        const softCap = ethers.utils.parseEther('1');
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;

        const endTime = 0;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        const mintTxn = await yamtoken.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await yamtoken
          .connect(address2)
          .approve(launchpad.address, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000);
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            yamtoken.address,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();
        expect(await yamtoken.balanceOf(launchpad.address)).to.equal(
          ethers.utils.parseEther('100'),
        );
        expect(await yamtoken.balanceOf(address2.address)).to.equal(
          ethers.utils.parseEther('0'),
        );
        await launchpad.connect(address2).sweep(1, address2.address),
          expect(await yamtoken.balanceOf(address2.address)).to.equal(
            ethers.utils.parseEther('100'),
          );
        expect(await yamtoken.balanceOf(launchpad.address)).to.equal(
          ethers.utils.parseEther('0'),
        );
      });
    });

    describe('When launchpad is paused', function () {
      it('Should revert if caller is not launchpad admin', async function () {
        const { launchpad, address2, launchpadadmin } = await loadFixture(
          deployLaunchpad,
        );

        await expect(
          launchpad.connect(address2).pause(),
        ).to.be.revertedWithCustomError(launchpad, 'NotLaunchPadAdmin');
      });
    });
  });
});
