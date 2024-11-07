const { expect } = require("chai");

describe("MultiSig", function () {
    it("Visibility check", async () => {
        const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
        const multiSigWallet = await MultiSigWallet.deploy();

        ["_addOwner", "_removeOwner", "_replaceOwner", "_changeRequirement", "_addTransaction", "_external_call"].forEach(function_name => {
            expect(multiSigWallet[function_name], `${function_name} must not-exposed`).to.equal(undefined);
        });

        ["transactions", "confirmations", "isOwner", "owners", "required", "transactionCount",
            "addOwner", "removeOwner", "replaceOwner", "changeRequirement", "markTransactionAsExecuted",
            "submitTransaction", "confirmTransaction", "revokeConfirmation", "executeTransaction", "executeTransactionReverted",
            "isConfirmed", "getConfirmationCount", "getTransactionCount", "getOwners", "getConfirmations",
            "getTransactionIds", "getTransaction"
        ].forEach(function_name => {
            expect(multiSigWallet[function_name], `${function_name} must exposed`).to.not.equal(undefined);
        });
    })
})