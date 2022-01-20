const hre = require("hardhat");
const fs = require('fs');

async function main() {
  const MichaelCoin = await hre.ethers.getContractFactory("MichaelCoin");
  const MichaelCoinDeployed = await MichaelCoin.deploy();
  await MichaelCoinDeployed.deployed();
  console.log("MichaelCoinDeployed deployed to:", MichaelCoinDeployed.address);

  const BankProtocol = await hre.ethers.getContractFactory("BankProtocol");
  const BankProtocolDeployed = await BankProtocol.deploy(MichaelCoinDeployed.address);
  await BankProtocolDeployed.deployed();
  console.log("BankProtocolDeployed deployed to:", BankProtocolDeployed.address);

  let config = `
  export const MichaelCoinAddr = "${MichaelCoinDeployed.address}"
  export const BankProtocolContractAddr = "${BankProtocolDeployed.address}"
  export const DeployedFrom = "${BankProtocolDeployed.deployTransaction.from}"
  `

  let data = JSON.stringify(config)
  fs.writeFileSync('./src/contractAssets/config.js', JSON.parse(data))
  const BankProtocolJSON = fs.readFileSync('./artifacts/contracts/BankProtocol.sol/BankProtocol.json', {encoding:'utf8', flag:'r'})
  const MichaelCoinJSON =  fs.readFileSync('./artifacts/contracts/MichaelCoin.sol/MichaelCoin.json', {encoding:'utf8', flag:'r'})
  fs.writeFileSync('./src/contractAssets/BankProtocol.json', BankProtocolJSON);
  fs.writeFileSync('./src/contractAssets/MichaelCoin.json', MichaelCoinJSON);
  console.log(BankProtocolJSON, MichaelCoinJSON)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
