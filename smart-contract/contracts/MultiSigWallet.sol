// SPDX-License-Identifier: GNU GPL
pragma solidity ^0.8.20;

// Fork from https://github.com/gnosis/MultiSigWallet/blob/master/contracts/MultiSigWallet.sol
// This contract has not been fully tested

/// @title Multisignature wallet - Allows multiple parties to agree on transactions before execution.
/// @author Stefan George - <stefan.george@consensys.net>

import "./KasepLibrary.sol";

contract MultiSigWallet {
    /*
     *  Events
     */
    event Confirmation(address indexed sender, uint256 indexed transactionId);
    event Revocation(address indexed sender, uint256 indexed transactionId);
    event Submission(uint256 indexed transactionId);
    event Execution(uint256 indexed transactionId);
    event ExecutionFailure(uint256 indexed transactionId);
    event Deposit(address indexed sender, uint256 value);
    event OwnerAddition(address indexed owner);
    event OwnerRemoval(address indexed owner);
    event RequirementChange(uint256 required);

    /*
     *  Storage
     */
    mapping(uint256 => KasepLibrary.Transaction) public transactions;
    mapping(uint256 => mapping(address => bool)) public confirmations;
    mapping(address => bool) public isOwner;
    mapping(string => mapping(uint256 => bool)) lock;

    address[] public owners;
    uint256 public required;
    uint256 public transactionCount;

    struct ExternalCall {
        bool success;
        bytes output;
    }

    /*
     *  Modifiers
     */
    modifier onlyWallet() virtual {
        require(msg.sender == address(this));
        _;
    }

    modifier ownerDoesNotExist(address owner) {
        require(!isOwner[owner]);
        _;
    }

    modifier ownerExists(address owner) {
        require(isOwner[owner]);
        _;
    }

    modifier transactionExists(uint transactionId) {
        require(transactions[transactionId].destination != address(0));
        _;
    }

    modifier confirmed(uint transactionId, address owner) {
        require(confirmations[transactionId][owner]);
        _;
    }

    modifier notConfirmed(uint transactionId, address owner) {
        require(!confirmations[transactionId][owner]);
        _;
    }

    modifier notExecuted(uint transactionId) {
        require(!transactions[transactionId].executed);
        _;
    }

    modifier notNull(address _address) {
        require(_address != address(0));
        _;
    }

    modifier validRequirement(uint ownerCount, uint _required) {
        require(_required <= ownerCount && _required != 0 && ownerCount != 0);
        _;
    }

    modifier noReentrancy(string memory key, uint256 value) {
        require(lock[key][value] != true);
        lock[key][value] = true;
        _;
        lock[key][value] = false;
    }

    /// @dev Fallback function allows to deposit ether.
    fallback() external payable {}

    receive() external payable {
        if (msg.value > 0) emit Deposit(msg.sender, msg.value);
    }

    function _addOwner(
        address owner
    ) internal ownerDoesNotExist(owner) notNull(owner) {
        isOwner[owner] = true;
        owners.push(owner);
        emit OwnerAddition(owner);
    }

    /// @dev Allows to add a new owner. Transaction has to be sent by wallet.
    /// @param owner Address of new owner.
    function addOwner(
        address owner
    ) external onlyWallet validRequirement(owners.length + 1, required) {
        _addOwner(owner);
    }

    function _removeOwner(address owner) internal ownerExists(owner) {
        isOwner[owner] = false;
        for (uint i = 0; i < owners.length - 1; i++)
            if (owners[i] == owner) {
                owners[i] = owners[owners.length - 1];
                break;
            }
        // owners.length -= 1;
        if (required > owners.length) _changeRequirement(owners.length);
        emit OwnerRemoval(owner);
    }

    /// @dev Allows to remove an owner. Transaction has to be sent by wallet.
    /// @param owner Address of owner.
    function removeOwner(address owner) external onlyWallet {
        _removeOwner(owner);
    }

    function _replaceOwner(
        address owner,
        address newOwner
    ) internal ownerExists(owner) ownerDoesNotExist(newOwner) {
        for (uint i = 0; i < owners.length; i++)
            if (owners[i] == owner) {
                owners[i] = newOwner;
                break;
            }
        isOwner[owner] = false;
        isOwner[newOwner] = true;
        emit OwnerRemoval(owner);
        emit OwnerAddition(newOwner);
    }

    /// @dev Allows to replace an owner with a new owner. Transaction has to be sent by wallet.
    /// @param owner Address of owner to be replaced.
    /// @param newOwner Address of new owner.
    function replaceOwner(address owner, address newOwner) external onlyWallet {
        _replaceOwner(owner, newOwner);
    }

    function _changeRequirement(
        uint256 _required
    ) internal validRequirement(owners.length, _required) {
        required = _required;
        emit RequirementChange(_required);
    }

    /// @dev Allows to change the number of required confirmations. Transaction has to be sent by wallet.
    /// @param _required Number of required confirmations.
    function changeRequirement(uint256 _required) external onlyWallet {
        _changeRequirement(_required);
    }

    function markTransactionAsExecuted(
        uint256 transactionId
    ) public onlyWallet notExecuted(transactionId) {
        KasepLibrary.Transaction storage txn = transactions[transactionId];
        txn.executed = true;
        emit Execution(transactionId);
    }

    /// @dev Allows an owner to submit and confirm a transaction.
    /// @param destination Transaction target address.
    /// @param value Transaction ether value.
    /// @param data Transaction data payload.
    /// @return Returns transaction ID.
    function submitTransaction(
        address destination,
        uint256 value,
        bytes memory data
    ) public returns (uint256) {
        uint256 transactionId = _addTransaction(destination, value, data);
        confirmTransaction(transactionId);
        return transactionId;
    }

    /// @dev Allows an owner to confirm a transaction.
    /// @param transactionId Transaction ID.
    function confirmTransaction(
        uint256 transactionId
    )
        public
        ownerExists(msg.sender)
        transactionExists(transactionId)
        notConfirmed(transactionId, msg.sender)
    {
        confirmations[transactionId][msg.sender] = true;
        emit Confirmation(msg.sender, transactionId);
        executeTransaction(transactionId);
    }

    /// @dev Allows an owner to revoke a confirmation for a transaction.
    /// @param transactionId Transaction ID.
    function revokeConfirmation(
        uint256 transactionId
    )
        public
        ownerExists(msg.sender)
        confirmed(transactionId, msg.sender)
        notExecuted(transactionId)
    {
        confirmations[transactionId][msg.sender] = false;
        emit Revocation(msg.sender, transactionId);
    }

    /// @dev Allows anyone to execute a confirmed transaction.
    /// @param transactionId Transaction ID.
    function executeTransaction(
        uint256 transactionId
    )
        public
        ownerExists(msg.sender)
        confirmed(transactionId, msg.sender)
        notExecuted(transactionId)
        noReentrancy("execute", transactionId)
    {
        if (isConfirmed(transactionId)) {
            KasepLibrary.Transaction storage txn = transactions[transactionId];
            if (_external_call(txn.destination, txn.value, txn.data)) {
                txn.executed = true;
                emit Execution(transactionId);
            } else {
                emit ExecutionFailure(transactionId);
                txn.executed = false;
            }
        }
    }

    /// @dev Allows public to execute a confirmed transaction.
    function executeTransactionReverted(
        uint256 transactionId
    ) public notExecuted(transactionId) noReentrancy("execute", transactionId) {
        require(isConfirmed(transactionId));
        KasepLibrary.Transaction storage txn = transactions[transactionId];
        require(_external_call(txn.destination, txn.value, txn.data));
        txn.executed = true;
        emit Execution(transactionId);
    }

    /// @dev Returns the confirmation status of a transaction.
    /// @param transactionId Transaction ID.
    /// @return Confirmation status.
    function isConfirmed(uint256 transactionId) public view returns (bool) {
        uint256 count = 0;
        for (uint256 i = 0; i < owners.length; i++) {
            if (confirmations[transactionId][owners[i]]) count += 1;
            if (count == required) return true;
        }

        return false;
    }

    /*
     * Internal functions
     */
    /// @dev Adds a new transaction to the transaction mapping, if transaction does not exist yet.
    /// @param destination Transaction target address.
    /// @param value Transaction ether value.
    /// @param data Transaction data payload.
    /// @return Returns transaction ID.
    function _addTransaction(
        address destination,
        uint256 value,
        bytes memory data
    ) internal notNull(destination) returns (uint256) {
        uint256 transactionId = transactionCount;
        transactions[transactionId] = KasepLibrary.Transaction({
            destination: destination,
            value: value,
            data: data,
            executed: false
        });
        transactionCount += 1;
        emit Submission(transactionId);
        return transactionId;
    }

    function _external_call(
        address destination,
        uint256 value,
        bytes memory data
    ) internal returns (bool) {
        (bool success, ) = destination.call{value: value}(data);
        return success;
    }

    /*
     * Web3 call functions
     */
    /// @dev Returns number of confirmations of a transaction.
    /// @param transactionId Transaction ID.
    /// @return Number of confirmations.
    function getConfirmationCount(
        uint256 transactionId
    ) public view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < owners.length; i++)
            if (confirmations[transactionId][owners[i]]) count += 1;
        return count;
    }

    /// @dev Returns total number of transactions after filers are applied.
    /// @param pending Include pending transactions.
    /// @param executed Include executed transactions.
    /// @return Total number of transactions after filters are applied.
    function getTransactionCount(
        bool pending,
        bool executed
    ) public view returns (uint) {
        uint256 count = 0;
        for (uint256 i = 0; i < transactionCount; i++)
            if (
                (pending && !transactions[i].executed) ||
                (executed && transactions[i].executed)
            ) count += 1;
        return count;
    }

    /// @dev Returns list of owners.
    /// @return List of owner addresses.
    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    /// @dev Returns array with owner addresses, which confirmed transaction.
    /// @param transactionId Transaction ID.
    /// @return Returns array of owner addresses.
    function getConfirmations(
        uint transactionId
    ) public view returns (address[] memory) {
        address[] memory _confirmations;
        address[] memory confirmationsTemp = new address[](owners.length);
        uint256 count = 0;
        uint256 i;
        for (i = 0; i < owners.length; i++)
            if (confirmations[transactionId][owners[i]]) {
                confirmationsTemp[count] = owners[i];
                count += 1;
            }
        _confirmations = new address[](count);
        for (i = 0; i < count; i++) _confirmations[i] = confirmationsTemp[i];
        return _confirmations;
    }

    /// @dev Returns list of transaction IDs in defined range.
    /// @param from Index start position of transaction array.
    /// @param to Index end position of transaction array.
    /// @param pending Include pending transactions.
    /// @param executed Include executed transactions.
    /// @return Returns array of transaction IDs.
    function getTransactionIds(
        uint from,
        uint to,
        bool pending,
        bool executed
    ) public view returns (uint[] memory) {
        uint256[] memory transactionIdsTemp = new uint[](transactionCount);
        uint256 count = 0;
        uint256 i;
        for (i = 0; i < transactionCount; i++)
            if (
                (pending && !transactions[i].executed) ||
                (executed && transactions[i].executed)
            ) {
                transactionIdsTemp[count] = i;
                count += 1;
            }
        uint[] memory _transactionIds = new uint[](to - from);
        for (i = from; i < to; i++)
            _transactionIds[i - from] = transactionIdsTemp[i];
        return _transactionIds;
    }

    function getTransaction(
        uint256 transactionId
    ) public view returns (KasepLibrary.Transaction memory) {
        return transactions[transactionId];
    }
}
