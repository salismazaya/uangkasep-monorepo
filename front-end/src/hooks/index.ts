import { useReadContract, useReadContracts } from "wagmi"
import { IsOwnerInteface, OwnersInterface, NumberInterface, ArrayBigIntInterface } from "../interfaces"
import { wbtcAddress, kasepAddress } from "../variables"
import erc20Abi from "../abis/erc20.abi"
import kasepAbi from "../abis/kasep.abi"
import { useEffect, useState } from "react"

export const useTransaction = (transactionId: bigint) => {
    const { data: transaction, refetch }: { data: any, refetch: any } = useReadContract({
        abi: kasepAbi,
        address: kasepAddress,
        functionName: 'transactions',
        args: [transactionId]
    })
    return { transaction, refetch }
}

export const useOwners = () => {
    const { data: owners, refetch }: OwnersInterface = useReadContract({
        abi: kasepAbi,
        address: kasepAddress,
        functionName: 'getOwners'
    })
    return { owners, refetch }
}

export const useIsOwner = (address: `0x${string}` | undefined) => {
    const { data: isOwner, refetch }: IsOwnerInteface = useReadContract({
        abi: kasepAbi,
        address: kasepAddress,
        functionName: 'isOwner',
        args: [address]
    })
    return { isOwner, refetch }
}

export const useVotingRequired = () => {
    const { data: votingRequired, refetch }: NumberInterface = useReadContract({
        abi: kasepAbi,
        address: kasepAddress,
        functionName: 'required',
    })

    return { votingRequired, refetch }
}

export const useSubmittedTransactionCount = () => {
    const { data: transactionCount, refetch }: NumberInterface = useReadContract({
        abi: kasepAbi,
        address: kasepAddress,
        functionName: 'transactionCount',
    })

    return { transactionCount, refetch }
}

export const usePendingTransactionCount = () => {
    const { data: pendingTransactionCount, refetch }: NumberInterface = useReadContract({
        abi: kasepAbi,
        address: kasepAddress,
        functionName: 'getTransactionCount',
        args: [true, false]
    })

    return { pendingTransactionCount, refetch }
}


export const useExecutedTransactionCount = () => {
    const { data: executedTransactionCount, refetch }: NumberInterface = useReadContract({
        abi: kasepAbi,
        address: kasepAddress,
        functionName: 'getTransactionCount',
        args: [false, true]
    })

    return { executedTransactionCount, refetch }
}

export const useWbtcBalance = (address: `0x${string}` | undefined) => {
    const { data: wbtcBalance, refetch }: NumberInterface = useReadContract({
        abi: erc20Abi,
        address: wbtcAddress,
        functionName: 'balanceOf',
        args: [address]
    })
    let value = Number(wbtcBalance as unknown)
    if (isNaN(value)) {
        value = 0
    }

    return { wbtcBalance: value / (10 ** 8), refetch }
}

export const useAmountPerMonth = () => {
    const { data: amountPerMonth, refetch }: NumberInterface = useReadContract({
        abi: kasepAbi,
        address: kasepAddress,
        functionName: 'amountPerMonth',
    })

    return { amountPerMonth: Number(amountPerMonth || 0) / (10 ** 8), refetch }

}

interface ContractsInterface {
    abi: any,
    address: `0x${string}`,
    functionName: string,
    args?: any[]
}

export const useBillingOwner = () => {
    const { owners, refetch: refetchOwners } = useOwners()

    const contracts: ContractsInterface[] = []

    for (const owner of owners || []) {
        contracts.push({
            abi: kasepAbi,
            address: kasepAddress,
            functionName: 'getBill',
            args: [owner]
        })
    }

    const { data, refetch: refetchBill }: ArrayBigIntInterface = useReadContracts({
        contracts,
        allowFailure: false,

    })

    function refetch() {
        return Promise.all([refetchOwners(), refetchBill()])
    }

    const billingsOwner: { address?: `0x${string}`, billing: number }[] = []
    let count = 0

    for (const billingOwner of data || []) {
        billingsOwner.push({
            address: contracts[count].args?.[0],
            billing: ((billingOwner / BigInt(10 ** 6)) as unknown) as number
        })
        count++
    }

    return { billingsOwner, refetch }
}

export const useGetBill = (address: `0x${string}` | undefined) => {
    const { data: bill, refetch }: NumberInterface = useReadContract({
        abi: kasepAbi,
        address: kasepAddress,
        functionName: 'getBill',
        args: [address]
    })
    let value = Number(bill as unknown)
    if (isNaN(value)) {
        value = 0
    }
    return { bill: value / (10 ** 8), refetch }
}

export const useClientOnceOnly = (callback: () => void) => {
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    useEffect(() => {
        if (isClient) {
            callback()
        }
    }, [isClient])
}