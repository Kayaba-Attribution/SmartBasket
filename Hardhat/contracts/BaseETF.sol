// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract SmartBasket is Ownable {
    IUniswapV2Router02 public uniswapRouter;
    IERC20 public usdtToken;

    struct TokenAllocation {
        address tokenAddress;
        uint256 percentage;
    }

    struct Basket {
        TokenAllocation[5] allocations;
        uint256 tokenCount;
        uint256 totalValue;
    }

    mapping(address => Basket[]) public userBaskets;

    event BasketCreated(address indexed user, uint256 basketIndex, uint256 usdtAmount);
    event BasketSold(address indexed user, uint256 basketIndex, uint256 usdtReturned);

    constructor(address _uniswapRouter, address _usdtAddress) {
        uniswapRouter = IUniswapV2Router02(_uniswapRouter);
        usdtToken = IERC20(_usdtAddress);
    }

    function createBasket(TokenAllocation[] memory _allocations, uint256 _usdtAmount) external {
        require(_allocations.length > 0 && _allocations.length <= 5, "Invalid number of tokens");
        require(_usdtAmount > 0, "Must send USDT");

        uint256 totalPercentage = 0;
        Basket storage newBasket = userBaskets[msg.sender].push();

        for (uint i = 0; i < _allocations.length; i++) {
            newBasket.allocations[i] = _allocations[i];
            totalPercentage += _allocations[i].percentage;
        }

        require(totalPercentage == 100, "Total percentage must be 100");

        newBasket.tokenCount = _allocations.length;
        newBasket.totalValue = _usdtAmount;

        usdtToken.transferFrom(msg.sender, address(this), _usdtAmount);
        _investInBasket(newBasket, _usdtAmount);

        emit BasketCreated(msg.sender, userBaskets[msg.sender].length - 1, _usdtAmount);
    }

    function sellBasket(uint256 basketIndex) external {
        require(basketIndex < userBaskets[msg.sender].length, "Invalid basket index");

        Basket storage basket = userBaskets[msg.sender][basketIndex];
        uint256 usdtReturned = 0;

        for (uint i = 0; i < basket.tokenCount; i++) {
            address tokenAddress = basket.allocations[i].tokenAddress;
            uint256 tokenBalance = IERC20(tokenAddress).balanceOf(address(this));
            if (tokenBalance > 0) {
                usdtReturned += _swapTokensForUsdt(tokenAddress, tokenBalance);
            }
        }

        usdtToken.transfer(msg.sender, usdtReturned);

        // Remove the basket
        if (basketIndex < userBaskets[msg.sender].length - 1) {
            userBaskets[msg.sender][basketIndex] = userBaskets[msg.sender][userBaskets[msg.sender].length - 1];
        }
        userBaskets[msg.sender].pop();

        emit BasketSold(msg.sender, basketIndex, usdtReturned);
    }

    function _investInBasket(Basket storage basket, uint256 usdtAmount) internal {
        for (uint i = 0; i < basket.tokenCount; i++) {
            TokenAllocation memory allocation = basket.allocations[i];
            uint256 usdtForToken = (usdtAmount * allocation.percentage) / 100;
            _swapUsdtForTokens(allocation.tokenAddress, usdtForToken);
        }
    }

    function _swapUsdtForTokens(address tokenAddress, uint256 usdtAmount) internal {
        usdtToken.approve(address(uniswapRouter), usdtAmount);

        address[] memory path = new address[](2);
        path[0] = address(usdtToken);
        path[1] = tokenAddress;

        uniswapRouter.swapExactTokensForTokens(
            usdtAmount,
            0,
            path,
            address(this),
            block.timestamp
        );
    }

    function _swapTokensForUsdt(address tokenAddress, uint256 tokenAmount) internal returns (uint256) {
        IERC20(tokenAddress).approve(address(uniswapRouter), tokenAmount);

        address[] memory path = new address[](2);
        path[0] = tokenAddress;
        path[1] = address(usdtToken);

        uint[] memory amounts = uniswapRouter.swapExactTokensForTokens(
            tokenAmount,
            0,
            path,
            address(this),
            block.timestamp
        );

        return amounts[1]; // Return the amount of USDT received
    }

    function getUserBaskets(address user) external view returns (Basket[] memory) {
        return userBaskets[user];
    }
}