// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;
    uint256 public confirmedAmount;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event ConfirmAmount(uint256 amount);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function getConfirmedAmount() public view returns (uint256) {
        return confirmedAmount;
    }

    function confirmAmount(uint256 _amount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        confirmedAmount = _amount;
        emit ConfirmAmount(_amount); 
    }

    function deposit() public payable {
        uint _previousBalance = balance;

        require(msg.sender == owner, "You are not the owner of this account");
        require(confirmedAmount > 0, "No amount confirmed");

        balance += confirmedAmount;

        assert(balance == _previousBalance + confirmedAmount);

        confirmedAmount = 0;
        emit Deposit(confirmedAmount);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw() public {
        require(msg.sender == owner, "You are not the owner of this account");
        require(confirmedAmount > 0, "No amount confirmed");
        uint _previousBalance = balance;

        if (balance < confirmedAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: confirmedAmount
            });
        }

        balance -= confirmedAmount;

        assert(balance == (_previousBalance - confirmedAmount));

        confirmedAmount = 0;
        emit Withdraw(confirmedAmount);
    }
}
