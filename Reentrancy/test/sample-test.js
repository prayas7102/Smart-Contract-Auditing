const { expect } = require("chai");

describe("Vulnerable", function () {
  let vulnerable;

  beforeEach(async function () {
    const Vulnerable = await ethers.getContractFactory("Vulnerable");
    vulnerable = await Vulnerable.deploy();
    await vulnerable.deployed();
  });

  it("should deposit funds", async function () {
    const depositAmount = ethers.utils.parseEther("1");
    const depositTx = await vulnerable.deposit({ value: depositAmount });
    await depositTx.wait();
    const balance = await vulnerable.balances(await ethers.getSigner(0).getAddress());
    expect(balance).to.equal(depositAmount);
  });

  it("should withdraw funds", async function () {
    const depositAmount = ethers.utils.parseEther("1");
    const depositTx = await vulnerable.deposit({ value: depositAmount });
    await depositTx.wait();
    const withdrawTx = await vulnerable.withdraw();
    await withdrawTx.wait();
    const balance = await vulnerable.balances(await ethers.getSigner(0).getAddress());
    expect(balance).to.equal(0);
  });

  it("should not allow reentrancy attacks", async function () {
    const depositAmount = ethers.utils.parseEther("1");
    const attacker = await ethers.getSigner(1);
    const attackerAddress = await attacker.getAddress();
    const Vulnerable = await ethers.getContractFactory("Vulnerable");
    const vulnerableAttacker = await Vulnerable.connect(attacker).deploy();
    const attack = await ethers.getContractFactory("Attack");
    const attackContract = await attack.deploy(vulnerableAttacker.address);

    // The attacker deposits some funds into the vulnerable contract
    const depositTx = await attackContract.attack({ value: depositAmount });
    await depositTx.wait();

    // The attacker tries to withdraw their funds multiple times, triggering a reentrancy attack
    await expect(attackContract.attack()).to.be.revertedWith("reentrant call");

    // The attacker's balance should still be zero after the failed reentrancy attack
    const attackerBalance = await ethers.provider.getBalance(attackerAddress);
    expect(attackerBalance).to.equal(0);

    // The vulnerable contract's balance should still be equal to the deposit amount
    const vulnerableBalance = await ethers.provider.getBalance(vulnerableAttacker.address);
    expect(vulnerableBalance).to.equal(depositAmount);
  });
});
