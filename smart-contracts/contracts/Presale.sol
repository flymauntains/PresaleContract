// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "hardhat/console.sol";

interface IERC20 {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

contract PresaleComplete {
    IERC20 public token;
    IERC20 public usdt;
    AggregatorV3Interface internal ethPriceFeed;
    uint256 public price_num;
    uint256 public price_denom;
    address public owner;
    uint256 public startSaleDate;
    uint256 public endSaleDate;
    uint256 public tokensSold;

    mapping(address => uint256) public tokensSoldPerUser;
    mapping(address => uint256) public tokensPurchased;


    constructor (
        address _token,
        address _usdt,
        address _ethPriceFeed,
        uint256 _price_num,
        uint256 _price_denom,
        uint256 _startSaleDate,
        uint256 _endSaleDate
    ) {
        token = IERC20(_token);
        usdt = IERC20(_usdt);
        ethPriceFeed = AggregatorV3Interface(_ethPriceFeed);
        price_num = _price_num;
        price_denom = _price_denom;
        startSaleDate = _startSaleDate;
        endSaleDate = _endSaleDate;
        owner = msg.sender;
    }

    function getLatestPrice(AggregatorV3Interface priceFeed) public view returns (uint256) {
        (
            /* uint80 roundID */,
            int price,
            /* uint startedAt */,
            /* uint timeStamp */,
            /* uint80 answeredInRound */
        ) = priceFeed.latestRoundData();
        return uint256(price);
    }

    function _getTokenBalance(address account) internal view returns (uint256) {
        return token.balanceOf(account);
    }

    function buyToken(uint256 buyTokenAmount, bool payWithEther) external payable {
    require(buyTokenAmount > 0, "At least 1 token");
    
    uint256 minTokens = 100 * (10 ** 18);
    uint256 maxTokens = 100000 * (10 ** 18);

    uint256 userTotalTokens = tokensSoldPerUser[msg.sender] + buyTokenAmount;

    // Check cumulative tokens purchased by the user
    require(userTotalTokens >= minTokens, "Token amount must be at least 100 tokens");
    require(userTotalTokens <= maxTokens, "Token amount must be less than or equal to 100000 tokens");
    
    require(block.timestamp >= startSaleDate, "Sale not started");
    require(block.timestamp <= endSaleDate, "Sale has ended");

    uint256 tokenPriceInUSD = (price_num * 1e18) / price_denom;
    uint256 requiredPayment;

    if (payWithEther) {
        uint256 ethPrice = getLatestPrice(ethPriceFeed); // Should return price with 8 decimals
        ethPrice = ethPrice * 1e10;                      // Convert ETH price from 8 decimals to 18 decimals
        requiredPayment = (buyTokenAmount * tokenPriceInUSD) / ethPrice;
        require(msg.value >= requiredPayment, "Insufficient Ether");
    } else {
        // For USDT, we assume 1 USDT = 1 USD
        requiredPayment = (buyTokenAmount * tokenPriceInUSD) / 1e18; // Ensure the units match
        // Transfer USDT from user's wallet to presale contract
        require(usdt.transferFrom(msg.sender, address(this), requiredPayment), "USDT transfer failed");
    }

    uint256 contractTokenBalance = token.balanceOf(address(this));
    require(contractTokenBalance >= buyTokenAmount, "Insufficient tokens in contract");
    // Instead of transferring tokens to the user immediately, we store the purchased tokens
    tokensPurchased[msg.sender] += buyTokenAmount;

    tokensSold += buyTokenAmount;
    tokensSoldPerUser[msg.sender] += buyTokenAmount;
}

    function claimTokens() external {
        require(block.timestamp > endSaleDate, "Sale not ended");
        uint256 amount = tokensPurchased[msg.sender];
        require(amount > 0, "No tokens to claim");
        tokensPurchased[msg.sender] = 0;
        token.transfer(msg.sender, amount);
    }

    function getTokenSold() external view returns (uint256) {
        return tokensSold;
    }

    function setPrice(uint256 _price_num, uint256 _price_denom) external {
        require(owner == msg.sender, "Not owner");
        price_num = _price_num;
        price_denom = _price_denom;
    }

    function getTokenPrice() external view returns (uint256) {
        uint256 tokenPrice = (price_num * 1e18) / price_denom;
        return tokenPrice;
    }

    function getTokenBalance() external view returns (uint256) {
        return _getTokenBalance(msg.sender);
    }

    function getUsdtBalance() external view returns (uint256) {
        return usdt.balanceOf(address(this));
    }

    function setSaleDate(uint256 _startSaleDate, uint256 _endSaleDate) external {
        require(owner == msg.sender, "Not owner");
        startSaleDate = _startSaleDate;
        endSaleDate = _endSaleDate;
    }

    function setToken(address _token) external {
        require(owner == msg.sender, "Not owner");
        token = IERC20(_token);
    }

    function setOwner(address _newOwner) external {
        require(owner == msg.sender, "Not owner");
        owner = _newOwner;
    }

    function withdrawEth(address to, uint256 amount) external {
        require(owner == msg.sender, "Not owner");
        uint256 balance = address(this).balance;
        require(balance >= amount, "Insufficient fund");
        payable(to).transfer(amount);
    }

    function withdrawToken(IERC20 _token, address to, uint256 amount) external {
        require(owner == msg.sender, "Not owner");
        uint256 balance = _token.balanceOf(address(this));
        require(balance >= amount, "Insufficient fund");
        _token.transfer(to, amount);
    }

}
