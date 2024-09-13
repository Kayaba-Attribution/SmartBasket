// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract BaseETF is Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    struct TokenAllocation {
        address tokenAddress;
        uint256 percentage;
    }

    TokenAllocation[] public allocations;
    uint256 public constant PERCENTAGE_SCALE = 10000; // 100.00%

    mapping(address => uint256) public userShares;
    uint256 public totalShares;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event Rebalance();

    constructor(TokenAllocation[] memory _allocations) {
        uint256 totalPercentage = 0;
        for (uint i = 0; i < _allocations.length; i++) {
            allocations.push(_allocations[i]);
            totalPercentage = totalPercentage.add(_allocations[i].percentage);
        }
        require(totalPercentage == PERCENTAGE_SCALE, "Total percentage must be 100.00%");
    }

    function deposit(uint256 amount) external {
        require(amount > 0, "Deposit amount must be greater than 0");
        // Implementation for deposit
        // This should take USDT from the user, buy the underlying assets in correct proportions,
        // and mint shares to the user
        userShares[msg.sender] = userShares[msg.sender].add(amount);
        totalShares = totalShares.add(amount);
        emit Deposit(msg.sender, amount);
    }

    function withdraw(uint256 shareAmount) external {
        require(shareAmount > 0, "Withdraw amount must be greater than 0");
        require(userShares[msg.sender] >= shareAmount, "Insufficient shares");
        // Implementation for withdrawal
        // This should sell the underlying assets in correct proportions,
        // transfer USDT back to the user, and burn the shares
        userShares[msg.sender] = userShares[msg.sender].sub(shareAmount);
        totalShares = totalShares.sub(shareAmount);
        emit Withdraw(msg.sender, shareAmount);
    }

    function rebalance() external onlyOwner {
        // Implementation for rebalancing
        // This should adjust the underlying asset allocations to match the target percentages
        emit Rebalance();
    }

    // Additional helper functions as needed
}