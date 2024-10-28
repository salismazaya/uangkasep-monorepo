import { Interface } from "ethers"
import { toast } from "react-toastify"
import { waitForTransactionReceipt } from "@wagmi/core"
import config from "../wagmi"

export const contractInterface = new Interface([
    "function changeRequirement(uint256)",
    "function addOwner(address)",
    "function removeOwner(address)",
    "function transfer(address,uint256)",
    "function changeAmountPerMonth(uint256)",
    "function checkpoint(address[])",
])

export const contractExecutor = (callback: () => Promise<string>) => {
    const toastId = toast.loading("Loading...")

    return new Promise<void>(async (resolve) => {
        try {
            const hash = await callback()
            await waitForTransactionReceipt(config, {
                hash: hash as `0x${string}`
            })

            toast.update(toastId, {
                render: 'Success',
                type: 'success',
                isLoading: false,
                autoClose: 2000
            })

        } catch (e: any) {
            toast.update(toastId, {
                render: e.message.toString().slice(0, 150),
                type: 'error',
                isLoading: false,
                autoClose: 2000
            })
        }


        resolve()
    })
}