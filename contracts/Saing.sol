// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Saing is ERC20, ERC20Permit, ERC20Votes, Ownable {
    uint256 public nominalVolume;
    uint256 public minTokenPrice;
    uint256 public priceChangeStep;

    event TokenPurchased(address indexed buyer, uint256 count, uint256 price);
    event TokenSold(address indexed seller, uint256 count, uint256 price);
    event TokenWithDraft(address _owner, uint256 _count, uint256 _timestamp);
    event TokenFundContract(address _owner, uint256 _count, uint256 _timestamp);
    event TokenAdd(address _owner, uint256 _count, uint256 _timestamp);
    event TokenBurn(address _owner, uint256 _count, uint256 _timestamp);

    constructor(
        string memory _name,
        string memory _short,
        uint256 _nominalVolume,
        uint256 _initTokenPrice,
        uint256 _priceChangeStep
    ) ERC20(_name, _short) ERC20Permit(_name) Ownable(msg.sender) {
        _mint(msg.sender, _nominalVolume);
        nominalVolume = _nominalVolume;
        minTokenPrice = _initTokenPrice;
        priceChangeStep = _priceChangeStep;
    }

    // Купить токены
    function buyTokens(uint256 _count) external payable {
        uint256 totalPrice = getTokenPrice() * _count;
        require(msg.value >= totalPrice, "Insufficient funds sent");
        require(
            balanceOf(owner()) >= _count,
            "Not enough tokens available"
        );
        _update(owner(), msg.sender, _count);
        minTokenPrice += priceChangeStep;
        emit TokenPurchased(msg.sender, _count, getTokenPrice());
    }

    // Продать токены
    function sellTokens(uint256 _count) external {
        require(balanceOf(msg.sender) >= _count, "Insufficient token balance");
        uint256 totalPrice = getTokenPrice() * _count;
        require(
            address(this).balance >= totalPrice,
            "Insufficient contract balance"
        );
        _update(msg.sender, owner(), _count);
        if (minTokenPrice > priceChangeStep) {
            minTokenPrice -= priceChangeStep;
        }
        payable(msg.sender).transfer(totalPrice);
        emit TokenSold(msg.sender, _count, getTokenPrice());
    }

    // Вывести все
    function withdraftAll() public onlyOwner {
        address payable _to = payable(owner());
        uint256 _count = address(this).balance;
        _to.transfer(_count);
        emit TokenWithDraft(owner(), _count, block.timestamp);
    }

    // Вывести часть средств
    function withdrawPart(uint256 _count) external onlyOwner {
        require(
            address(this).balance >= _count,
            "Insufficient contract balance"
        );
        payable(owner()).transfer(_count);
        emit TokenWithDraft(owner(), _count, block.timestamp);
    }

    // Положить деньги на контракт
    function fundContract() external payable onlyOwner {
        emit TokenFundContract(msg.sender, msg.value, block.timestamp);
    }

    // Добавить токены
    function addToken(uint256 _count) public onlyOwner {
        _mint(owner(), _count);
        emit TokenAdd(owner(), _count, block.timestamp);
    }

    // Сжечь часть токенов
    function burn(uint256 _count) public onlyOwner {
        _burn(owner(), _count);
        emit TokenBurn(owner(), _count, block.timestamp);
    }

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Votes) {
        super._update(from, to, value);
    }

    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }

    function getTokenPrice() public view returns (uint256) {
        return minTokenPrice;
    }

    function getBalance() public view onlyOwner returns (uint256) {
    return address(this).balance;
}

}
