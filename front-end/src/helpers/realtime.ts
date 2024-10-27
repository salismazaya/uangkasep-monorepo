'use client'

import { Contract, ethers } from "ethers"
import { IdrtAddress, kasepAddress, wssRpcUrl } from "../variables"
import erc20Abi from "../abis/erc20.abi"
import kasepAbi from "../abis/kasep.abi"

let provider: ethers.WebSocketProvider | undefined;

export enum ContractType {
    KASEP,
    IDRT
}

let kasepContract: Contract | undefined;
let idrtContract: Contract | undefined;

export const register = ({ contract, abi, callback }: { contract: ContractType, abi: `${string}(${any})`, callback: (...args: any[]) => void }) => {
    if (provider === undefined) {
        provider = new ethers.WebSocketProvider(wssRpcUrl)
    }

    if (kasepContract === undefined) {
        kasepContract = new Contract(kasepAddress, kasepAbi, provider)
    }

    if (idrtContract === undefined) {
        idrtContract = new Contract(IdrtAddress, erc20Abi, provider)
    }
    
    const [functionName, rawArgs] = abi.split("(", 2)
    const args = rawArgs.replace(")", "")

    callback // useless. only for marked as use

    const postCallback = eval(`(${args}) => callback(${args})`)

    switch (contract) {
        case ContractType.IDRT:
            idrtContract.on(functionName, postCallback)
            break
        case ContractType.KASEP:
            kasepContract.on(functionName, postCallback)
            break
    }
}