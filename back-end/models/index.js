const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('sqlite://database.db');

const TransactionConfirmed = sequelize.define(
    'TransactionConfirmed',
    {
        transactionId: {
            type: DataTypes.BIGINT,
        },
        address: {
            type: DataTypes.STRING,
        }
    },
    {
        createdAt: false,
        updatedAt: false,
        indexes: [
            {
                fields: ['transactionId', 'address'],
                unique: true
            }
        ]
    }
);

const TransactionRejected = sequelize.define(
    'TransactionRejected',
    {
        transactionId: {
            type: DataTypes.BIGINT,
        },
        address: {
            type: DataTypes.STRING,
        }
    },
    {
        createdAt: false,
        updatedAt: false,
        indexes: [
            {
                fields: ['transactionId', 'address'],
                unique: true
            }
        ]
    }
);


const Address = sequelize.define(
    'Address',
    {
        owner: {
            type: DataTypes.STRING,
        },
        address: {
            type: DataTypes.STRING,
        },
        name: {
            type: DataTypes.STRING,
        },
    },
    {
        createdAt: false,
        updatedAt: false,
        indexes: [
            {
                fields: ['owner', 'address'],
                unique: true
            }
        ]
    }
);


sequelize.sync();

module.exports = {
    TransactionConfirmed,
    TransactionRejected,
    Address
}