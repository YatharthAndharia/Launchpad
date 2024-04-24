import { ethers, run } from 'hardhat';

async function main() {
  ///DEPLOYING A TOKEN SAMPLE FOR INTERACTION
  const YamToken = await ethers.getContractFactory('YamToken');
  const yam = await YamToken.deploy();

  await yam.deployed();

  console.log('Yamtoken Contract Address is', yam.address);

  ///DEPLOYING LAUNCHPAD CONTRACT
  const LaunchPad = await ethers.getContractFactory('Launchpad');
  const IDOPad = await LaunchPad.deploy();

  await IDOPad.deployed();

  console.log('LaunchPad Contract Address is', IDOPad.address);

  setTimeout(async () => {
    await run('verify:verify', {
      contract: 'contracts/Launchpad.sol:Launchpad',
      address: IDOPad.address,
    });

    await run('verify:verify', {
      contract: 'contracts/YamToken.sol:YamToken',
      address: yam.address,
    });
  }, 10000);

  console.log('Verified Successfully!');
}

const verify = async () => {
  await run('verify:verify', {
    contract: 'contracts/Launchpad.sol:Launchpad',
    address: '0xa3e4c9CDec7D139b726DeE457abA2E29E6803221',
  });
};

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
(async () => {
  // await main();
  await verify();
})();
// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });
