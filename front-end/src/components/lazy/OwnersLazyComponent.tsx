'use client'

import Link from "next/link"
import { useBillingOwner, useClientOnceOnly } from "../../hooks"
import { FormatRupiah } from "@arismun/format-rupiah"
import { contractExecutor, contractInterface } from "@/helpers/ethers"
import { writeContract } from "wagmi/actions"
import config from "@/wagmi"
import kasepAbi from "@/abis/kasep.abi"
import { kasepAddress } from "@/variables"
import { ContractType, register } from "@/helpers/realtime"

export default ({ hook }: { hook: (active: boolean) => void }) => {
    const { billingsOwner, refetch } = useBillingOwner()

    const delete_ = (address: `0x${string}`) => {
        contractExecutor(async () => {
            const calldata = contractInterface.encodeFunctionData("removeOwner", [address])
            const hash = writeContract(config, {
                abi: kasepAbi,
                address: kasepAddress,
                functionName: 'submitTransaction',
                args: [kasepAddress, 0, calldata]
            })
            return hash
        })
    }

    const checkpoint = (address: `0x${string}`) => {
        contractExecutor(async () => {
            const calldata = contractInterface.encodeFunctionData("checkpoint", [[address]])
            const hash = writeContract(config, {
                abi: kasepAbi,
                address: kasepAddress,
                functionName: 'submitTransaction',
                args: [kasepAddress, 0, calldata]
            })
            return hash
        })
    }

    useClientOnceOnly(() => {
        register({
            abi: 'OwnerAddition(owner)',
            contract: ContractType.KASEP,
            callback: refetch
        })

        register({
            abi: 'OwnerRemoval(owner)',
            contract: ContractType.KASEP,
            callback: refetch
        })

        register({
            abi: 'OwnerRemoval(owner)',
            contract: ContractType.KASEP,
            callback: refetch
        })

        register({
            abi: 'BillPaid(owner,amount)',
            contract: ContractType.KASEP,
            callback: refetch
        })

        register({
            abi: 'Checkpoint(addressed)',
            contract: ContractType.KASEP,
            callback: refetch
        })
    })

    return (
        <>
            <div className='mt-4'>
                <div>
                    <button className="btn btn-success mb-3" onClick={() => hook(true)} >Add Owner</button>
                    <table className="table table-fixed">
                        <thead>
                            <tr>
                                <th className='w-1/12'></th>
                                <th className='w-4/12'>Owner</th>
                                <th className='w-3/12'>Billing</th>
                                <th className='w-3/2'>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {billingsOwner?.map((billingOwner, i) => {
                                return (
                                    <tr key={billingOwner.address}>
                                        <th>{i + 1}</th>
                                        <td>
                                            <p className='truncate'>
                                                <Link className='text-blue-500 hover:text-blue-400' href={'https://polygonscan.com/address/' + billingOwner.address} target='_blank'>
                                                    {billingOwner.address}
                                                </Link>
                                            </p>
                                        </td>
                                        <td>
                                            <FormatRupiah value={billingOwner.billing}></FormatRupiah>
                                        </td>
                                        <td >
                                            <button onClick={() => delete_(billingOwner.address as `0x${string}`)} className="btn btn-error btn-xs text-error-content">Delete</button>
                                            <button onClick={() => checkpoint(billingOwner.address as `0x${string}`)} className="btn btn-warning btn-xs mt-1 text-warning-content">Checkpoint</button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}