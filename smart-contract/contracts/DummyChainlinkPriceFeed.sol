// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract DummyChainlinkPriceFeed {
    int256 answerValue;

    constructor(int256 _answerValue) {
        answerValue = _answerValue;
    }

    function latestRoundData()
        external
        view
        returns (
            uint80 roundID,
            int256 answer,
            uint256 startedAt,
            uint256 timestamp,
            uint80 answeredInRound
        )
    {
        roundID = 0;
        answer = answerValue;
        startedAt = 0;
        timestamp = block.timestamp;
        answeredInRound = 0;
    }
}
