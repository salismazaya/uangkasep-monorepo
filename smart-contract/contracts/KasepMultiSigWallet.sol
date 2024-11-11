// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "./MultiSigWallet.sol";
import "hardhat/console.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract KasepMultiSigWallet is MultiSigWallet, Initializable {
    uint256 public amountPerMonth;
    uint256 public payInterval;
    uint256 public created;
    address public wbtc;
    AggregatorV3Interface public dataFeed;

    modifier onlyWallet() override {
        require(
            msg.sender == address(this),
            "KasepMultiSigWallet: ONLY MYSELF CAN EXECUTE"
        );
        _;
    }

    modifier onlyMultiSigOwner() {
        require(
            isOwner[msg.sender] == true,
            "KasepMultiSigWallet: ONLY WORK WITH MULTISIG OWNER"
        );
        _;
    }

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
    event DataFeedChanged(
        address indexed executor,
        address oldDataFeed,
        address newDataFeed
    );
    event BillPaid(address indexed owner, uint256 amount);
    event Checkpoint(address[] addressed);

    function initialize(
        address _dataFeed,
        address[] memory _owners,
        uint256 _required,
        address _wbtc,
        uint256 _amountPerMonth
    ) public initializer {
        _initialize(_dataFeed, _owners, _required, _wbtc, _amountPerMonth);
    }

    function _initialize(
        address _dataFeed,
        address[] memory _owners,
        uint256 _required,
        address _wbtc,
        uint256 _amountPerMonth
    ) internal {
        dataFeed = AggregatorV3Interface(_dataFeed);
        amountPerMonth = _amountPerMonth;
        wbtc = _wbtc;
        created = block.timestamp;
        payInterval = 30 days;

        // all owners in multisig wallet set to currentTimestamp - payInterval
        // As a result, the owners have to pay the bill (in this case the owners have 1 month's bill)
        address[] memory owners = _owners;
        for (uint8 i = 0; i < owners.length; i++) {
            address owner = owners[i];
            _addOwner(owner);
            lastUserPay[owner] = block.timestamp - payInterval;
        }

        _changeRequirement(_required);
    }

    // serves to cover monthly installment fees
    // This must be executed with a multisig contract and
    // of course must go through a voting process
    function changeAmountPerMonth(
        uint256 _newAmountPerMonth
    ) external onlyWallet {
        uint256 previousAmountPerMonth = amountPerMonth;
        amountPerMonth = _newAmountPerMonth;
        emit AmountPerMonthChanged(
            msg.sender,
            previousAmountPerMonth,
            amountPerMonth
        );
    }

    function _changeDataFeed(address _newDataFeed) internal {
        address previousDataFeed = address(dataFeed);
        dataFeed = AggregatorV3Interface(_newDataFeed);
        emit DataFeedChanged(msg.sender, previousDataFeed, address(dataFeed));
    }

    function changeDataFeed(address _newDataFeed) external onlyWallet {
        _changeDataFeed(_newDataFeed);
    }

    // how long does it take the owner to pay the monthly fee
    // This must be executed with a multisig contract and
    // of course must go through a voting process
    function changePayInterval(uint256 _newPayInterval) external onlyWallet {
        uint256 previousPayInterval = payInterval;
        payInterval = _newPayInterval;
        emit AmountPerMonthChanged(
            msg.sender,
            previousPayInterval,
            payInterval
        );
    }

    // If you add a new user, that user must pay the fee from the contract first created
    // if you don't want, use this function
    // This must be executed with a multisig contract and
    // of course must go through a voting process
    function checkpoint(address[] memory _addresses) external onlyWallet {
        for (uint i = 0; i < _addresses.length; i++) {
            address _address = _addresses[i];
            lastUserPay[_address] = block.timestamp;
        }
        emit Checkpoint(_addresses);
    }

    function getChainlinkDataFeedLatestAnswer() public view returns (uint256) {
        (, int answer, , , ) = dataFeed.latestRoundData();
        return uint256(answer);
    }

    // if owner not registered in multisig contract: return 0
    // if pay interval not reached: return 0
    // if new owner registered: lastUserPay = created 😱
    function getBill(address _address) public view returns (uint256) {
        uint256 timestamp = block.timestamp;
        uint256 _lastUserPay = lastUserPay[_address];

        if (isOwner[_address] != true) {
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
        result = result * (10 ** 10);
        return result / getChainlinkDataFeedLatestAnswer();
        // output is decimals 8
    }

    // only registered owner can execute this function
    // this function call _getBill for billing information
    // owner must approve wbtc for this contract
    // error if time not reached
    function payBill() external onlyMultiSigOwner {
        uint256 amount = getBill(msg.sender);
        require(amount > 0, "KasepMultiSigWallet: NOT TIME YET");

        bytes memory data = abi.encodeWithSignature(
            "transferFrom(address,address,uint256)",
            msg.sender,
            address(this),
            amount
        );

        bool success = _external_call(wbtc, 0, data);

        require(success, "KasepMultiSigWallet: TRANSFER WBTC FAILED");

        lastUserPay[msg.sender] = block.timestamp;
        emit BillPaid(msg.sender, amount);
    }
}
