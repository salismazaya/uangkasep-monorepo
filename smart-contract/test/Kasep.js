const { expect } = require("chai");
const { Interface } = require("ethers");
const helpers = require("@nomicfoundation/hardhat-network-helpers");

describe("Kasep", function () {
    it("Visibility check", async () => {
        const KasepMultiSigWallet = await ethers.getContractFactory("KasepMultiSigWalletCore");
        const kasepMultiSigWallet = await KasepMultiSigWallet.deploy();

        expect(kasepMultiSigWallet._initialize, "_initialize must not-exposed").to.equal(undefined);
        ["changeAmountPerMonth", "changePayInterval", "checkpoint", "getBill", "payBill"].forEach(function_name => {
            expect(kasepMultiSigWallet[function_name], `${function_name.toString()} must exposed`).to.not.equal(undefined);
        })
    });

    it("Balance check", async () => {
        const [account1, account2, account3, account4] = await ethers.getSigners();

        const Idrt = await ethers.getContractFactory("ERC20");
        const idrt = await Idrt.deploy("IDRT", "IDRT", account1);

        let amount = 1000000;

        const KasepMultiSigWallet = await ethers.getContractFactory("KasepMultiSigWalletConstructor");
        const kasepMultiSigWallet = await KasepMultiSigWallet.deploy(
            [account1, account2, account3], 2, idrt, amount
        );

        expect(await kasepMultiSigWallet.getBill(account4)).to.equal(0, "unregister owner bill must 0");
        expect(await kasepMultiSigWallet.getBill(account1)).to.equal(amount, `registered owner bill must ${amount}`);
        expect(await kasepMultiSigWallet.getBill(account2)).to.equal(amount, `registered owner bill must ${amount}`);
        expect(await kasepMultiSigWallet.getBill(account3)).to.equal(amount, `registered owner bill must ${amount}`);

        await idrt.transfer(account2, amount);
        await idrt.transfer(account3, amount);

        await expect(kasepMultiSigWallet.payBill()).to.be.revertedWith("KasepMultiSigWallet: TRANSFER IDRT FAILED");
        await idrt.approve(kasepMultiSigWallet, amount);
        await kasepMultiSigWallet.payBill();

        expect(await kasepMultiSigWallet.getBill(account1)).to.equal(0, `${account1} bill must 0 because paid`);

        await idrt.connect(account2).approve(kasepMultiSigWallet, amount);
        await kasepMultiSigWallet.connect(account2).payBill();

        expect(await kasepMultiSigWallet.getBill(account2)).to.equal(0, `${account2} bill must 0 because paid`);

        expect(await kasepMultiSigWallet.getBill(account3)).to.equal(amount, `${account3} bill must ${amount} because not paid`);

        expect(await kasepMultiSigWallet.getBill(account4)).to.equal(0, "unregister owner bill must 0");

        await expect(kasepMultiSigWallet.connect(account4).payBill(account4)).to.be.revertedWith('KasepMultiSigWallet: ONLY WORK WITH MULTISIG OWNER');
    });

    it('Contract permission check', async () => {
        const [account1, account2, account3, account4, account5, account6] = await ethers.getSigners();

        // const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
        // const multiSigWallet = await MultiSigWallet.deploy([account1, account2, account3, account4], 2);

        const Idrt = await ethers.getContractFactory("ERC20");
        const idrt = await Idrt.deploy("IDRT", "IDRT", account1);

        let amount = 1000000;

        const KasepMultiSigWallet = await ethers.getContractFactory("KasepMultiSigWalletConstructor");
        const kasepMultiSigWallet = await KasepMultiSigWallet.deploy(
            [account1, account2, account3, account4], 2, idrt, amount
        );

        amount = amount * 4;

        const twenty_days = 20 * 24 * 60 * 60;

        await expect(kasepMultiSigWallet.changeAmountPerMonth(amount)).to.be.revertedWith("KasepMultiSigWallet: ONLY MYSELF CAN EXECUTE");
        await expect(kasepMultiSigWallet.changePayInterval(twenty_days)).to.be.revertedWith("KasepMultiSigWallet: ONLY MYSELF CAN EXECUTE");

        const kasepMultiSigInterface = new Interface([
            "function changeAmountPerMonth(uint256)",
            "function changePayInterval(uint256)",
            "function checkpoint(address[])",
            "function addOwner(address)",
        ])

        let calldata = kasepMultiSigInterface.encodeFunctionData("changeAmountPerMonth", [amount]);

        await kasepMultiSigWallet.submitTransaction(kasepMultiSigWallet, 0, calldata);
        await kasepMultiSigWallet.connect(account2).confirmTransaction(0);

        expect(await kasepMultiSigWallet.amountPerMonth()).to.equal(amount, `amount must ${amount} because has been changed via multisig contract`)

        calldata = kasepMultiSigInterface.encodeFunctionData("changePayInterval", [twenty_days]);

        await kasepMultiSigWallet.submitTransaction(kasepMultiSigWallet, 0, calldata);
        await kasepMultiSigWallet.connect(account3).confirmTransaction(1);

        expect(await kasepMultiSigWallet.payInterval()).to.equal(twenty_days, `pay interval must ${twenty_days} because has been changed via multisig contract`)

        calldata = kasepMultiSigInterface.encodeFunctionData('addOwner', [account5.address]);

        await kasepMultiSigWallet.submitTransaction(kasepMultiSigWallet, 0, calldata);
        await kasepMultiSigWallet.connect(account2).confirmTransaction(2);

        await idrt.connect(account5).approve(kasepMultiSigWallet, amount);

        await expect(kasepMultiSigWallet.connect(account5).payBill()).to.be.revertedWith("KasepMultiSigWallet: NOT TIME YET");

        await helpers.time.increase(twenty_days);
        await idrt.transfer(account5, amount * 2);

        await kasepMultiSigWallet.connect(account5).payBill();

        calldata = kasepMultiSigInterface.encodeFunctionData('addOwner', [account6.address]);

        await kasepMultiSigWallet.submitTransaction(kasepMultiSigWallet, 0, calldata);
        await kasepMultiSigWallet.connect(account2).confirmTransaction(3);

        expect(await kasepMultiSigWallet.lastUserPay(account6)).to.equal(0, "must 0 because early registered");

        calldata = kasepMultiSigInterface.encodeFunctionData('checkpoint', [[account6.address]]);

        await kasepMultiSigWallet.submitTransaction(kasepMultiSigWallet, 0, calldata);
        await kasepMultiSigWallet.connect(account2).confirmTransaction(4);

        expect(await kasepMultiSigWallet.lastUserPay(account6)).to.not.equal(0, "must dont 0 checkpoint executed");

    })
});