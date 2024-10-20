'use client'

import { useReadContract, useReadContracts } from "wagmi"
import { IsOwnerInteface, OwnersInterface, NumberInterface, ArrayBigIntInterface } from "../interfaces"
import multisigAbi from "../abis/multisig.abi"
import { IdrtAddress, kasepAddress, multiSigAddress } from "../variables"
import erc20Abi from "../abis/erc20.abi"
import kasepAbi from "../abis/kasep.abi"
import { useEffect, useState } from "react"

export const useMultiSigPendingTransaction = () => {
    const { data: transactionCount }: NumberInterface = useReadContract({
        abi: multisigAbi,
        address: multiSigAddress,
        functionName: 'transactionCount'
    })

    const { data: ids, refetch }: ArrayBigIntInterface = useReadContract({
        abi: multisigAbi,
        address: multiSigAddress,
        functionName: 'getTransactionIds',
        args: [0, transactionCount, true, false]
    })

    return {
        ids, refetch
    }
}

export const useOwners = () => {
    const { data: owners, refetch }: OwnersInterface = useReadContract({
        abi: multisigAbi,
        address: multiSigAddress,
        functionName: 'getOwners'
    })
    return { owners, refetch }
}

export const useIsOwner = (address: `0x${string}` | undefined) => {
    const { data: isOwner, refetch }: IsOwnerInteface = useReadContract({
        abi: multisigAbi,
        address: multiSigAddress,
        functionName: 'isOwner',
        args: [address]
    })

    return { isOwner, refetch }
}

export const useVotingRequired = () => {
    const { data: votingRequired, refetch }: NumberInterface = useReadContract({
        abi: multisigAbi,
        address: multiSigAddress,
        functionName: 'required',
    })

    return { votingRequired, refetch }
}

export const useSubmittedTransactionCount = () => {
    const { data: transactionCount, refetch }: NumberInterface = useReadContract({
        abi: multisigAbi,
        address: multiSigAddress,
        functionName: 'transactionCount',
    })

    return { transactionCount, refetch }
}

export const usePendingTransactionCount = () => {
    const { data: pendingTransactionCount, refetch }: NumberInterface = useReadContract({
        abi: multisigAbi,
        address: multiSigAddress,
        functionName: 'getTransactionCount',
        args: [true, false]
    })

    return { pendingTransactionCount, refetch }
}


export const useExecutedTransactionCount = () => {
    const { data: executedTransactionCount, refetch }: NumberInterface = useReadContract({
        abi: multisigAbi,
        address: multiSigAddress,
        functionName: 'getTransactionCount',
        args: [false, true]
    })

    return { executedTransactionCount, refetch }
}

export const useIdrtBalance = (address: `0x${string}` | undefined) => {
    const { data: idrtBalance, refetch }: NumberInterface = useReadContract({
        abi: erc20Abi,
        address: IdrtAddress,
        functionName: 'balanceOf',
        args: [address]
    })

    return { idrtBalance: ((BigInt(idrtBalance || 0) / BigInt(10 ** 6)) as unknown) as number || 0 / (10 ** 6), refetch }
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
    return { bill: ((BigInt(bill || 0) / BigInt(10 ** 6)) as unknown) as number, refetch }
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