const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('DOS', () => {
  let DOS;
  let dos;
  let Attack;
  let attack;
  let owner;
  let attacker;

  beforeEach(async function () {
    DOS = await ethers.getContractFactory('DOS');
    dos = await DOS.deploy();
    await dos.deployed();

    Attack = await ethers.getContractFactory('Attack');
    attack = await Attack.deploy();
    await attack.deployed();

    const accounts = await ethers.getSigners();
    owner = accounts[0];
    attacker = accounts[1];
  });

  it('should allow deposit and withdrawal of ether', async function () {
    const depositAmount = ethers.utils.parseEther('1');
    await dos.connect(owner).deposit({ value: depositAmount });
    expect(await dos.balances(owner.address)).to.equal(depositAmount);

    const withdrawAmount = ethers.utils.parseEther('0.5');
    await dos.withdraw(withdrawAmount);
    expect(await dos.balances(owner.address)).to.equal(depositAmount.sub(withdrawAmount));
  });

  it('Contract taking too long to respond: Transaction reverted: function call failed to execute', async function () {
    console.log('\n----> This test may take a long time to complete <----\n');
    const value = ethers.utils.parseEther('10');   
    await attacker.sendTransaction({ to: attack.address, value });
    await attack.attack(dos.address);
    // Note: This test may take a long time to complete
  });
});
