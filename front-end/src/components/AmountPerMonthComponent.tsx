'use client'

import { useEffect, useState } from "react"
import { useAmountPerMonth, useClientOnceOnly } from "../hooks"
import ModalComponent from "./ModalComponent"
import { writeContract } from "@wagmi/core"
import config from "../wagmi"
import { contractExecutor, contractInterface } from "../helpers/ethers"
import { register, ContractType } from "../helpers/realtime"
import kasepAbi from "@/abis/kasep.abi"
import { kasepAddress } from "@/variables"
import { FormatRupiah } from "@arismun/format-rupiah"

export default () => {
    const { amountPerMonth, refetch } = useAmountPerMonth()
    const [openModal, setOpenModal] = useState(false)

    const [amountPerMonthValue, setAmountPerMonthValue] = useState<number | undefined>(parseInt(amountPerMonth?.toString() || 'kasep'))

    useEffect(() => {
        setAmountPerMonthValue(amountPerMonth)
    }, [amountPerMonth])

    useClientOnceOnly(() => {
        register({
            contract: ContractType.KASEP,
            abi: 'AmountPerMonthChanged(executor,oldAmount,newAmount)',
            callback: refetch
        })
    })

    const execute = () => {
        const calldata = contractInterface.encodeFunctionData("changeAmountPerMonth", [BigInt(amountPerMonthValue || 0) * BigInt(10 ** 6)])
        contractExecutor(async () => {
            const hash = await writeContract(config, {
                abi: kasepAbi,
                address: kasepAddress,
                functionName: 'submitTransaction',
                args: [kasepAddress, 0, calldata]
            })
            return hash
        })
    }

    return (
        <>
            <div className="stats shadow">
                <div className="stat">
                    <div className="stat-title">Amount Per Month</div>
                    <div className="stat-value">
                        <FormatRupiah value={amountPerMonth} />
                    </div>
                    <div className="stat-desc">
                        <div className='mt-2'>
                            <button className='text-sm hover:text-gray-400' onClick={() => setOpenModal(true)}>Change</button>
                        </div>
                    </div>
                </div>
            </div>

            <ModalComponent openModal={openModal} setOpenModal={setOpenModal}>
                <div className="modal-box">
                    <label className="form-control w-full">
                        <div className="label">
                            <span className="label-text">Amount Per Month</span>
                        </div>
                        <input type="text" placeholder="Amount Per Month" className="input input-bordered w-full" value={!isNaN(parseInt(amountPerMonthValue?.toString() || 'kasep')) ? amountPerMonthValue?.toString() : ''} onChange={(x) => setAmountPerMonthValue(parseInt(x.target.value))} />
                    </label>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn btn-primary mr-2" onClick={execute}>Submit</button>
                            <button className="btn">Close</button>
                        </form>
                    </div>
                </div>
            </ModalComponent>
        </>
    )
}