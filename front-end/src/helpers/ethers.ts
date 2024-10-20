import { Interface } from "ethers";
import { toast } from "react-toastify";
import { waitForTransactionReceipt } from "@wagmi/core";
import config from "../wagmi";

export const contractInterface = new Interface([
    "function changeRequirement(uint)",
    "function addOwner(address)"
]);

export const contractExecutor = async (callback: () => Promise<string>) => {
    const toastId = toast.loading("Loading...");

    try {
        const hash = await callback();
        await waitForTransactionReceipt(config, {
            hash: hash as `0x${string}`
        });

        toast.update(toastId, {
            render: 'Success',
            type: 'success',
            isLoading: false,
            autoClose: 2000
        });

    } catch (e: any) {
        toast.update(toastId, {
            render: e.message.toString().slice(0, 150),
            type: 'error',
            isLoading: false,
            autoClose: 2000
        })
    }
}