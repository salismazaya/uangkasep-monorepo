require('dotenv').config()

const { WebSocketProvider, Contract } = require('ethers');
// const kasepAbi = require('../abis/kasep.abi');
const multisigAbi = require('../abis/multisig.abi');
const { TransactionConfirmed } = require('../models');
const pusher = require('../helpers/pusher');
const wsProvider = new WebSocketProvider(process.env.POLYGON_WSS_RPC);

// const kasepContract = new Contract(process.env.KASEP_ADDRESS, kasepAbi, wsProvider);
const multisigContract = new Contract(process.env.MULTISIG_ADDRESS, multisigAbi, wsProvider);

setTimeout(() => {
    console.log("WORKER RUNNING");

    multisigContract.on('Submission', async (transactionId) => {
        await Promise.all([
            pusher.trigger('public', 'Submission', {
                transactionId: Number(transactionId),
            })
        ]);
    });

    multisigContract.on('Confirmation', async (sender, transactionId) => {
        await Promise.all([
            TransactionConfirmed.create({
                transactionId,
                address: sender
            }),
            pusher.trigger('public', 'Confirmation', {
                transactionId: Number(transactionId),
                sender,
            })
        ]);
    });

    multisigContract.on('Revocation', async (sender, transactionId) => {
        await Promise.all([
            TransactionConfirmed.destroy({
                where: {
                    transactionId,
                    address: sender
                }
            }),
            pusher.trigger('public', 'Revocation', {
                transactionId: Number(transactionId),
                sender,
            })
        ]);
    });

    multisigContract.on('RequirementChange', async (required) => {
        await pusher.trigger('public', 'RequirementChange', {
            required: Number(required)
        });
    });

    multisigContract.on('OwnerAddition', async (owner) => {
        await pusher.trigger('public', 'OwnerAddition', {
            owner
        });
    });

    multisigContract.on('OwnerRemoval', async (owner) => {
        await pusher.trigger('public', 'OwnerRemoval', {
            owner
        });
    });

    multisigContract.on('Execution', async (transactionId) => {
        await pusher.trigger('public', 'Execution', {
            transactionId: Number(transactionId)
        });
    });

    multisigContract.on('ExecutionFailure', async (transactionId) => {
        await pusher.trigger('public', 'ExecutionFailure', {
            transactionId: Number(transactionId)
        });
    });

}, 3000);


