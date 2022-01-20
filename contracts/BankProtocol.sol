// SPDX-License-IDentifier: MIT OR Apache-2.0
pragma solidity ^0.8.4;

interface ERC20Standard {
    function totalSupply() external view returns (uint256);
    function balanceOf(address _owner) external view returns (uint256 balance);
    function transfer(address _to, uint256 value) external returns (bool success);
    function transferFrom(address _from, address _to, uint256 value) external returns (bool success);
    function approve(address _spender, uint256 value) external returns (bool success);
    function allowance(address _owner, address _spender) external view returns (uint256 remaining);
    event Transfer(address indexed _from, address indexed _to, uint256 value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
}

contract BankProtocol {
    string public name = "Bank Protocol";
    address public payoutToken;
    uint rewardRateBySecond = 285;
    uint rewardRateIntDivider = 100000000;

    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public isStaking;
    mapping(address => uint) public rewardBalance;
    mapping(address => uint) public lastCalc;

    constructor(address BankToken) {
        payoutToken = BankToken;
    }

    function contBalance() public view returns (uint) {
        return address(this).balance;
    }

    function payoutAddr() public view returns (address) {
        return payoutToken;
    }

    function getrewardRateBySecond() public view returns (uint) {
        return rewardRateBySecond;
    }
    function getTimestampTest() public view returns (uint) {
        return block.timestamp;
    }

    function calculateReward(address sender) public {
        uint differenceTime = block.timestamp - lastCalc[sender];
        uint accumulated = differenceTime * rewardRateBySecond * stakingBalance[sender];
        rewardBalance[sender] = rewardBalance[sender] + accumulated;
        lastCalc[sender] = block.timestamp;
    }

    function stakeTokens() external payable {
        if(!(rewardBalance[msg.sender] > 0)) {
            rewardBalance[msg.sender] = 1;
            lastCalc[msg.sender] = block.timestamp;
        } else if (isStaking[msg.sender]) {
            calculateReward(msg.sender);
        } else {
            lastCalc[msg.sender] = block.timestamp;
        }
        if(!isStaking[msg.sender]) {
            isStaking[msg.sender] = true;
        }
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + msg.value;
    }

    function unstakeTokens(uint _amount) public {
        require(stakingBalance[msg.sender] >= _amount, "The amount to unstake must be less than or equal to the current staked balance with this address");
        payable(address(msg.sender)).transfer(_amount);
        calculateReward(msg.sender);
        stakingBalance[msg.sender] = stakingBalance[msg.sender] - _amount;
        if (stakingBalance[msg.sender] == 0) {
            isStaking[msg.sender] = false;
        }
    }

    function withdrawRewardToken() public {
        uint reward = rewardBalance[msg.sender];
        bool transferSuccess = ERC20Standard(payoutToken).transfer(msg.sender, reward/rewardRateIntDivider/1000000000);
        if (reward > 0 && transferSuccess) {
            rewardBalance[msg.sender] = 1;
        }
    }
}