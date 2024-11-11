const { expect } = require("chai")
const { Interface } = require("ethers")
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("KasepProxy", function () {
    const deployChainlinkPriceFeed = async () => {
        const ChainlinkFeed = await ethers.getContractFactory("DummyChainlinkPriceFeed");
        const chainlinkFeed = await ChainlinkFeed.deploy(1);
        return chainlinkFeed;
    }

    it("Functional test", async () => {
        const [account1, account2, account3] = await ethers.getSigners()

        const Idrt = await ethers.getContractFactory("ERC20")
        const idrt = await Idrt.deploy("IDRT", "IDRT", account1)

        let amount = 1000000
        const chainlinkFeed = await loadFixture(deployChainlinkPriceFeed);

        const KasepMultiSigWallet = await ethers.getContractFactory("KasepMultiSigWallet")

        const kasepMultiSigWallet = await KasepMultiSigWallet.deploy()
        const kasepMultiSigWallet2 = await KasepMultiSigWallet.deploy()

        const KasepProxy = await ethers.getContractFactory("KasepProxy")
        const kasepProxy = await KasepProxy.deploy(
            kasepMultiSigWallet, "0x"
        )
        const proxyKasepMultiSigWallet = await ethers.getContractAt("KasepMultiSigWallet", kasepProxy)
        await proxyKasepMultiSigWallet.connect(account2).initialize(chainlinkFeed, [account1, account2, account3], 2, idrt, amount)

        let implementation_address = await kasepProxy.getImplementation()
        await kasepProxy.connect(account2).upgradeTo(kasepMultiSigWallet2)
        expect(await kasepProxy.getImplementation()).equal(implementation_address)

        await kasepProxy.connect(account1).upgradeTo(kasepMultiSigWallet2)
        expect(await kasepProxy.getImplementation()).equal(kasepMultiSigWallet2)

        const ProxyAdmin = await ethers.getContractFactory("KasepProxyAdmin")
        const proxyAdmin = await ProxyAdmin.deploy()

        await kasepProxy.connect(account1).changeAdmin(proxyAdmin)
        expect(await kasepProxy.getAdmin()).equal(proxyAdmin)

        await proxyAdmin.changeToRealAdmin(kasepProxy)
        expect(await kasepProxy.getAdmin()).equal(await proxyAdmin.realAdmin())

        const proxyKasepMultiSigInterface = new Interface([
            "function upgradeTo(address)",
            "function typooo(address,uint256)",
        ])

        let calldata = proxyKasepMultiSigInterface.encodeFunctionData("typooo", [kasepMultiSigWallet.target, 0])
        await proxyKasepMultiSigWallet.connect(account2).submitTransaction(proxyAdmin.target, 0, calldata)
        await expect(proxyAdmin.confirmUpgrade(kasepProxy, 0)).to.be.revertedWith("KasepProxyAdmin: not confirmed yet")

        await proxyKasepMultiSigWallet.connect(account3).confirmTransaction(0)
        await expect(proxyAdmin.confirmUpgrade(kasepProxy, 0)).to.be.revertedWith("KasepProxyAdmin: invalid selector")

        calldata = proxyKasepMultiSigInterface.encodeFunctionData("upgradeTo", [kasepMultiSigWallet.target])
        await proxyKasepMultiSigWallet.connect(account2).submitTransaction(proxyAdmin.target, 0, calldata)

        await expect(proxyAdmin.confirmUpgrade(kasepProxy, 1)).to.be.revertedWith("KasepProxyAdmin: not confirmed yet")
        await proxyKasepMultiSigWallet.connect(account3).confirmTransaction(1)

        await proxyAdmin.confirmUpgrade(kasepProxy, 1)

        expect(await kasepProxy.getImplementation()).equal(kasepMultiSigWallet.target)
    })
})