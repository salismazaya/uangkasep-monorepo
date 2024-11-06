const { expect } = require("chai")
const { Interface } = require("ethers")
const helpers = require("@nomicfoundation/hardhat-network-helpers")

describe("KasepProxy", function () {
    it("Functional test", async () => {
        const [account1, account2, account3] = await ethers.getSigners()

        const Idrt = await ethers.getContractFactory("ERC20")
        const idrt = await Idrt.deploy("IDRT", "IDRT", account1)

        let amount = 1000000

        const KasepMultiSigWallet = await ethers.getContractFactory("KasepMultiSigWallet")

        const kasepMultiSigWallet = await KasepMultiSigWallet.deploy()
        const kasepMultiSigWallet2 = await KasepMultiSigWallet.deploy()

        const KasepProxy = await ethers.getContractFactory("KasepProxy")
        const kasepProxy = await KasepProxy.deploy(
            kasepMultiSigWallet, "0x"
        )
        const proxyKasepMultiSigWallet = await ethers.getContractAt("KasepMultiSigWallet", kasepProxy)
        await proxyKasepMultiSigWallet.connect(account2).initialize([account1, account2, account3], 2, idrt, amount)

        let implementation_address = await kasepProxy.getImplementation()
        await kasepProxy.connect(account2).upgrade(kasepMultiSigWallet2)
        expect(await kasepProxy.getImplementation()).equal(implementation_address)

        await kasepProxy.connect(account1).upgrade(kasepMultiSigWallet2)
        expect(await kasepProxy.getImplementation()).equal(kasepMultiSigWallet2)

        const ProxyAdmin = await ethers.getContractFactory("KasepProxyAdmin")
        const proxyAdmin = await ProxyAdmin.deploy()

        await kasepProxy.connect(account1).changeAdmin(proxyAdmin)
        expect(await kasepProxy.getAdmin()).equal(proxyAdmin)

        const proxyKasepMultiSigInterface = new Interface([
            "function upgradeUsingProxyAdmin(address,uint256)",
            "function typooo(address,uint256)",
        ])

        let calldata = proxyKasepMultiSigInterface.encodeFunctionData("typooo", [kasepMultiSigWallet.target, 0])
        await proxyKasepMultiSigWallet.connect(account2).submitTransaction(proxyAdmin.target, 0, calldata)
        await expect(proxyAdmin.upgrade(kasepProxy, 0)).to.be.revertedWith("KasepProxyAdmin: not confirmed yet")

        await proxyKasepMultiSigWallet.connect(account3).confirmTransaction(0)
        await expect(proxyAdmin.upgrade(kasepProxy, 0)).to.be.revertedWith("KasepProxyAdmin: invalid selector")

        calldata = proxyKasepMultiSigInterface.encodeFunctionData("upgradeUsingProxyAdmin", [kasepMultiSigWallet.target, 0])
        await proxyKasepMultiSigWallet.connect(account2).submitTransaction(proxyAdmin.target, 0, calldata)
       
        await expect(proxyAdmin.upgrade(kasepProxy, 1)).to.be.revertedWith("KasepProxyAdmin: not confirmed yet")
        await proxyKasepMultiSigWallet.connect(account3).confirmTransaction(1)
        
        await proxyAdmin.upgrade(kasepProxy, 1)

        expect(await kasepProxy.getImplementation()).equal(kasepMultiSigWallet.target)
    })
})