// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "./IERC20.sol";
import "./IMultiSigWallet.sol";

contract KasepMultiSigWallet {
    address public multisig;
    IMultiSigWallet multisigContract;
    uint256 public amountPerMonth;
    IERC20 public idrt;
    uint256 public payInterval = 30 days;
    uint256 public created;
    
    mapping(address => uint256) public lastUserPay;

    event AmountPerMonthChanged(
        address indexed executor,
        uint256 oldAmount,
        uint256 newAmount
    );
    event AmountPayIntervalChanged(
        address indexed executor,
        uint256 oldPayInterval,
        uint256 newPayInterval
    );
    event BillPaid(address indexed owner, address to, uint256 amount);
    event Checkpoint(address[] addressed);

    constructor(address _multisig, address _idrt, uint256 _amountPerMonth) {
        multisig = _multisig;
        multisigContract = IMultiSigWallet(_multisig);
        amountPerMonth = _amountPerMonth;
        idrt = IERC20(_idrt);
        created = block.timestamp;

        // all owners in multisig wallet set to currentTimestamp - payInterval
        // As a result, the owners have to pay the bill (in this case the owners have 1 month's bill)
        address[] memory owners = multisigContract.getOwners();
        for (uint8 i = 0; i < owners.length; i++) {
            address owner = owners[i];
            lastUserPay[owner] = block.timestamp - payInterval;
        }
    }

    modifier onlyMultiSig() {
        require(
            msg.sender == multisig,
            "KasepMultiSigWallet: ONLY WORK WITH MULTISIG CONTRACT"
        );
        _;
    }

    modifier onlyMultiSigOwner() {
        require(
            multisigContract.isOwner(msg.sender),
            "KasepMultiSigWallet: ONLY WORK WITH MULTISIG OWNER"
        );
        _;
    }


    // serves to cover monthly installment fees
    // This must be executed with a multisig contract and 
    // of course must go through a voting process
    function changeAmountPerMonth(
        uint256 _new_amountPerMonth
    ) external onlyMultiSig {
        uint256 previous_amountPerMonth = amountPerMonth;
        amountPerMonth = _new_amountPerMonth;
        emit AmountPerMonthChanged(
            msg.sender,
            previous_amountPerMonth,
            amountPerMonth
        );
    }

    // how long does it take the owner to pay the monthly fee
    // This must be executed with a multisig contract and 
    // of course must go through a voting process
    function changePayInterval(
        uint256 _new_payInterval
    ) external onlyMultiSig {
        uint256 previous_payInterval = payInterval;
        payInterval = _new_payInterval;
        emit AmountPerMonthChanged(
            msg.sender,
            previous_payInterval,
            payInterval
        );
    }

    // If you add a new user, that user must pay the fee from the contract first created
    // if you don't want, use this function
    // This must be executed with a multisig contract and 
    // of course must go through a voting process
    function checkpoint(
        address[] memory _addresses
    ) external onlyMultiSig {
        for (uint i = 0; i < _addresses.length; i++) {
            address _address = _addresses[i];
            lastUserPay[_address] = block.timestamp;
        }
        emit Checkpoint(_addresses);
    }

    // if owner not registered in multisig contract: return 0
    // if pay interval not reached: return 0
    // if new owner registered: lastUserPay = created 😱
    function _getBill(address _address) internal view returns (uint256) {
        uint256 timestamp = block.timestamp;
        uint256 _lastUserPay = lastUserPay[_address];

        if (!multisigContract.isOwner(_address)) {
            return 0;
        }

        if (_lastUserPay == 0) {
            _lastUserPay = created;
        }

        if (timestamp - _lastUserPay < payInterval) {
            return 0;
        }

        uint256 result = ((timestamp - _lastUserPay) / payInterval) *
            amountPerMonth;
        return result;
    }

    function getBill(address _address) external view returns (uint256) {
        return _getBill(_address);
    }

    // only registered owner can execute this function
    // this function call _getBill for billing information
    // owner must approve idrt for this contract
    // error if time not reached
    function payBill() external onlyMultiSigOwner {
        uint256 amount = _getBill(msg.sender);
        require(amount > 0, "KasepMultiSigWallet: NOT TIME YET");

        require(
            idrt.transferFrom(msg.sender, multisig, amount),
            "KasepMultiSigWallet: TRANSFER IDRT FAILED"
        );

        lastUserPay[msg.sender] = block.timestamp;
        emit BillPaid(msg.sender, multisig, amount);
    }
}
