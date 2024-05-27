import {expect} from "chai";
import {ethers} from "hardhat";
import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import {extendEnvironment} from "hardhat/config";

describe("Saing", function () {
    async function deployTokenFixture() {
        const ContractFactory = await ethers.getContractFactory("Saing");
        const [owner, user1, user2, user3] = await ethers.getSigners();
        const instance = await ContractFactory.deploy("Saing", "SAI", 1000000, 100, 1);
        await instance.waitForDeployment();
        return {instance, owner, user1, user2, user3};
    }

    it("Test deploy", async function () {
        const {instance, owner, user1, user2, user3} = await loadFixture(deployTokenFixture);
        expect(await instance.name()).to.equal("Saing");
        expect(await instance.symbol()).to.equal("SAI");
        expect(await instance.totalSupply()).to.equal(1000000);
        expect(await instance.balanceOf(owner.address)).to.equal(1000000);
        expect(await instance.balanceOf(user1.address)).to.equal(0);
        expect(await instance.balanceOf(user2.address)).to.equal(0);
        expect(await instance.balanceOf(user3.address)).to.equal(0);
        expect(await instance.owner()).to.equal(owner.address);
    });
    it("Test buyTokens", async function () {
        const {instance, owner, user1, user2, user3} = await loadFixture(deployTokenFixture);
        await instance.connect(user1).buyTokens(10, {value: 1000});
        expect(await instance.balanceOf(user1.address)).to.equal(10);
        expect(await instance.balanceOf(owner.address)).to.equal(999990);
        expect(await ethers.provider.getBalance(instance.getAddress())).to.equal(1000);
        // Проверка события
        const filter = instance.filters.TokenPurchased();
        const events = await instance.queryFilter(filter);
        expect(events.length).to.be.greaterThan(0);
        expect(await instance.getTokenPrice()).to.equal(101);
        await expect(instance.connect(user2).buyTokens(10, {value: 101})).to.be.revertedWith("Insufficient funds sent");
        await expect(instance.connect(user2).buyTokens(10000000, {value: 10000000001})).to.be.revertedWith("Not enough tokens available");
    });
    it("Test sellTokens", async function () {
        // Загружаем фикстуру
        const {instance, owner, user1, user2, user3} = await loadFixture(deployTokenFixture);
        // Покупаем токены
        await instance.connect(user1).buyTokens(10, {value: 1000});
        expect(await instance.balanceOf(user1.address)).to.equal(10);
        // Продаем токены больше чем есть
        await expect(instance.connect(user1).sellTokens(11)).to.be.revertedWith("Insufficient token balance");
        // Обнуляем контракт
        await instance.withdraftAll()
        expect(await ethers.provider.getBalance(instance.getAddress())).to.equal(0);
        // Продаем токены при балансе больше чем в контракте
        await expect(instance.connect(user1).sellTokens(10)).to.be.revertedWith("Insufficient contract balance");
        // Проверяем как изменилась цена
        expect(await instance.getTokenPrice()).to.equal(101);
        // Покупаем токены
        await instance.connect(user2).buyTokens(10, {value: 1010});
        expect(await instance.balanceOf(user2.address)).to.equal(10);
        // Проверяем как изменилась цена
        expect(await instance.getTokenPrice()).to.equal(102);
        let before = await ethers.provider.getBalance(user2.address);
        // Продаем токены
        await instance.connect(user2).sellTokens(9);
        expect(await instance.balanceOf(user2.address)).to.equal(1);
        // Проверяем как изменилась цена
        expect(await instance.getTokenPrice()).to.equal(101);
        // Проверяем события
        const filter = instance.filters.TokenSold();
        const event = await instance.queryFilter(filter);
        expect(event.length).to.be.greaterThan(0);
        expect(await instance.balanceOf(owner.address)).to.equal(999989);
        expect(await ethers.provider.getBalance(instance.getAddress())).to.equal(1010 - 9 * 102);
        expect(await instance.getTokenPrice()).to.equal(101);
        let after = await ethers.provider.getBalance(user2.address);
        expect(before).to.be.greaterThan(after);
    });
    it("Test with draft", async function () {
        const {instance, owner, user1, user2, user3} = await loadFixture(deployTokenFixture);
        // Покупаем токены
        await instance.connect(user1).buyTokens(100, {value: 10000});
        expect(await ethers.provider.getBalance(instance.getAddress())).to.equal(10000);
        // Снимаем токены
        await instance.withdrawPart(100);
        expect(await ethers.provider.getBalance(instance.getAddress())).to.equal(9900);
        // Снимаем все
        await instance.withdraftAll();
        expect(await ethers.provider.getBalance(instance.getAddress())).to.equal(0);
        // Снимаем больше чем есть
        await expect(instance.withdrawPart(100)).to.be.revertedWith("Insufficient contract balance");
        // Проверяем события
        const filter = instance.filters.TokenWithDraft();
        const event = await instance.queryFilter(filter);
        expect(event.length).to.be.greaterThan(0);
    });

    it("Test fund contract", async function () {
        const {instance, owner, user1, user2, user3} = await loadFixture(deployTokenFixture);
        // Проверяем что контракт пустой
        expect(await ethers.provider.getBalance(instance.getAddress())).to.equal(0);
        // Пополняем счет пользователями
        await expect(instance.connect(user2).fundContract({value: 10000})).to.be.revertedWithCustomError(instance, "OwnableUnauthorizedAccount");
        // Пополняем контракт
        await instance.connect(owner).fundContract({value: 10000});
        expect(await ethers.provider.getBalance(instance.getAddress())).to.equal(10000);
        // Проверяем события
        const filter = instance.filters.TokenFundContract();
        const event = await instance.queryFilter(filter);
        expect(event.length).to.be.greaterThan(0);
    });
    it("Test add token", async function () {
        const {instance, owner, user1, user2, user3} = await loadFixture(deployTokenFixture);
        // Проверяем сколько токенов в контракте
        expect(await instance.balanceOf(owner.address)).to.equal(1000000);
        // Пополняем токены пользователями
        await expect(instance.connect(user2).addToken(500000)).to.be.revertedWithCustomError(instance, "OwnableUnauthorizedAccount");
        // Пополняем контракт
        await instance.connect(owner).addToken(500000);
        expect(await instance.balanceOf(owner.address)).to.equal(1500000);
        expect(await instance.balanceOf(instance.getAddress())).to.equal(0);
        // Проверяем события
        const filter = instance.filters.TokenAdd();
        const event = await instance.queryFilter(filter);
        expect(event.length).to.be.greaterThan(0);
    });
    it("Test burn token", async function () {
        const {instance, owner, user1, user2, user3} = await loadFixture(deployTokenFixture);
        // Проверяем сколько токенов в контракте
        expect(await instance.balanceOf(owner.address)).to.equal(1000000);
        // Сжигаем токены пользователями
        await expect(instance.connect(user2).burn(500000)).to.be.revertedWithCustomError(instance, "OwnableUnauthorizedAccount");
        // Пополняем контракт
        await instance.connect(owner).burn(500000);
        expect(await instance.balanceOf(owner.address)).to.equal(500000);
        expect(await instance.balanceOf(instance.getAddress())).to.equal(0);
        // Проверяем события
        const filter = instance.filters.TokenBurn();
        const event = await instance.queryFilter(filter);
        expect(event.length).to.be.greaterThan(0);
    });
    it("Test from token", async function () {
        const {instance, owner, user1, user2, user3} = await loadFixture(deployTokenFixture);
        expect(await instance.balanceOf(owner.address)).to.equal(1000000);
        expect(await instance.balanceOf(user2.address)).to.equal(0);
        await instance.connect(owner).transfer(user2.address, 500000);
        expect(await instance.balanceOf(owner.address)).to.equal(500000);
        expect(await instance.balanceOf(user2.address)).to.equal(500000);
    });
});
