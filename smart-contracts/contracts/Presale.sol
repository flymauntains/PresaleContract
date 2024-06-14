/**
 *Submitted for verification at Etherscan.io on 2024-06-13
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external returns (bool);
}

contract PresaleComplete {
    IERC20 public token;
    uint256 public price_num;
    uint256 public price_denom;
    address public owner;
    uint256 public startSaleDate;
    uint256 public endSaleDate;
    uint256 public tokensSold;
    uint256 public tokenBalance;

    constructor (address _token, uint256 _price_num, uint256 _price_denom, uint256 _startSaleDate, uint256 _endSaleDate ) {
        token = IERC20(_token);
        price_num = _price_num;
        price_denom = _price_denom;
        startSaleDate = _startSaleDate;
        endSaleDate = _endSaleDate;
    }


    function buyToken(uint256 buyTokenAmount) external payable {
        require( buyTokenAmount > 0, "At least 1 token");
        uint256 ethAmount = (buyTokenAmount * price_num) / price_denom;
        require( block.timestamp >= startSaleDate, "Sale not started" );
        require( block.timestamp <= endSaleDate, "Sale has been ended" );
        require( msg.value >= ethAmount, "Insufficient fund" );
        token.transfer(msg.sender, buyTokenAmount);
        // Update tokens sold
        tokensSold += buyTokenAmount;
        tokenBalance = token.balanceOf(msg.sender);
    }

    function getTokenSold() external view returns( uint256 ) {
        return tokensSold;
    }
    // Get tokensSold
    function getTokenBalance() external view returns(uint256) {
        return tokenBalance;
    }
    // Get token balance of the conneted account
    function setPrice( uint256 _price_num, uint256 _price_denom ) external {
        require( owner == msg.sender, "Not owner");
        price_num = _price_num;
        price_denom = _price_denom;
    }
    // Get tokenprice
   function getTokenPrice() external view returns (uint256) {
    uint256 tokenPrice = (price_num * 1e18) / price_denom;
    return tokenPrice;
}

    function setSaleDate( uint256 _startSaleDate, uint256 _endSaleDate ) external {
        require( owner == msg.sender, "Not owner");
        startSaleDate = _startSaleDate;
        endSaleDate = _endSaleDate;
    }

    function setToken( address _token ) external {
        require( owner == msg.sender, "Not owner");
        token = IERC20(_token);
    }

    function setOwner( address _newOwner ) external  {
        require( owner == msg.sender, "Not owner");
        owner = _newOwner;
    }

    function withdrawEth( address to, uint256 amount) external {
        require( owner == msg.sender, "Not owner" ); 
        uint256 balance = address(this).balance;
        require( balance >= amount, "Insufficient fund" );
        payable (to).transfer(amount);
    }

    function withdrawToken ( IERC20 _token, address to, uint256 amount ) external {
        require( owner == msg.sender, "Not owner" );
        uint256 balance = _token.balanceOf(address(this));
        require( balance >= amount, "Insufficient fund");
        _token.transfer(to, amount);
    } 
}