import { Contract, ethers } from "ethers"
import { IdrtAddress, kasepAddress, wssRpcUrl } from "../variables"
import erc20Abi from "../abis/erc20.abi"
import kasepAbi from "../abis/kasep.abi"

const provider = new ethers.WebSocketProvider(wssRpcUrl)

export enum ContractType {
    KASEP,
    IDRT
}

const kasepContract = new Contract(kasepAddress, kasepAbi, provider)
const idrtContract = new Contract(IdrtAddress, erc20Abi, provider)

export const register = ({ contract, abi, callback }: { contract: ContractType, abi: `${string}(${any})`, callback: (...args: any[]) => void }) => {
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