'use client'

import kasepAbi from "@/abis/kasep.abi"
import { contractExecutor } from "@/helpers/ethers"
import { ContractType, register } from "@/helpers/realtime"
import { useClientOnceOnly, useIsOwner } from "@/hooks"
import { TransactionInterface } from "@/interfaces"
import { backendUrl, kasepAddress } from "@/variables"
import config from "@/wagmi"
import axios from "axios"
import { useState } from "react"
import { toast } from "react-toastify"
import { useAccount, useReadContract } from "wagmi"
import { signMessage, writeContract } from "wagmi/actions"

export default function ActionComponent({ transaction, transactionId, refetchParrent }: { transaction: TransactionInterface | undefined, transactionId: bigint, refetchParrent: () => void }) {
    const { address } = useAccount()

    const { data: confirmed, refetch }: { data: boolean | undefined, refetch: any } = useReadContract({
        abi: kasepAbi,
        address: kasepAddress,
        functionName: 'confirmations',
        args: [transactionId, address]
    })

    const [status, setStatus] = useState<string | null>(null)

    const execute = () => {
        if (address !== undefined) {
            axios.get(`${backendUrl}transactions/${transactionId}/${address}`).then(res => {
                setStatus(res.data.data.status)
            })
        }
    }

    useClientOnceOnly(() => {
        execute()

        register({
            contract: ContractType.KASEP,
            abi: 'Confirmation(address,uint256)',
            callback: (_, _transactionId) => {
                if (_transactionId == transactionId) {
                    refetch()
                    execute()
                }
            },
        })

        register({
            contract: ContractType.KASEP,
            abi: 'Revocation(address,uint256)',
            callback: (_, _transactionId) => {
                if (_transactionId == transactionId) {
                    refetch()
                    execute()
                }
            },
        })
    })

    const accept = () => {
        contractExecutor(async () => {
            const hash = await writeContract(config, {
                abi: kasepAbi,
                address: kasepAddress,
                functionName: 'confirmTransaction',
                args: [transactionId]
            })
            return hash
        })
    }

    const revoke = () => {
        contractExecutor(async () => {
            const hash = await writeContract(config, {
                abi: kasepAbi,
                address: kasepAddress,
                functionName: 'revokeConfirmation',
                args: [transactionId]
            })
            return hash
        })
    }

    const reexecute = () => {
        contractExecutor(async () => {
            const hash = await writeContract(config, {
                abi: kasepAbi,
                address: kasepAddress,
                functionName: 'executeTransaction',
                args: [transactionId]
            })
            return hash
        })
    }

    const reject = async () => {
        const toastId = toast.loading("Loading...")
        const expired = Math.floor(new Date().getTime() / 1000) + 60

        try {
            const signature = await signMessage(config, {
                message: `Reject transaction for id ${transactionId}. this message expire at ${expired}`
            })

            try {
                await axios.put(`${backendUrl}transactions/${transactionId}/reject`, {}, {
                    headers: {
                        'x-signature': signature,
                        'x-expired': expired
                    }
                })
            } catch (e: any) {
                throw Error(e.response.data.detail)
            }

            refetchParrent()
            execute()
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
    }

    const { isOwner } = useIsOwner(address)
    if (!isOwner || confirmed === undefined) {
        return <></>
    }

    return (
        <>
            <div className="flex gap-2">
                {status !== "reject" && !confirmed && transaction?.status === "waiting" && <button className="btn btn-success" onClick={accept}>Accept</button>}
                {status !== "reject" && !confirmed && transaction?.status === "waiting" && <button className="btn btn-error" onClick={reject}>Reject</button>}
                {status !== "reject" && confirmed && transaction?.status === "failure" && <button className="btn btn-warning" onClick={reexecute}>Re-execute</button>}
                {confirmed && transaction?.status === "waiting" || transaction?.status === "failure" && <button className="btn btn-error" onClick={revoke}>Revoke</button>}
            </div>
        </>
    )

}