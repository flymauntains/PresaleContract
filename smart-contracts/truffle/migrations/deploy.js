const TokenSale = artifacts.require("TokenSale");

module.exports = async function(deployer, network, accounts) {
  const tokenAddress = "0xYourTokenAddressHere"; // Replace with the actual token contract address
  const priceNum = 1; // Replace with your desired numerator for price
  const priceDenom = 100; // Replace with your desired denominator for price
  const startSaleDate = Math.floor(Date.now() / 1000); // Current time in seconds
  const endSaleDate = startSaleDate + (86400 * 30); // Sale ends 30 days from start

  await deployer.deploy(TokenSale, tokenAddress, priceNum, priceDenom, startSaleDate, endSaleDate);
};
