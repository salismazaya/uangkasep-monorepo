'use client'

import { FormatRupiah } from "@arismun/format-rupiah"
import { useClientOnceOnly, useIdrtBalance } from "../hooks"
import { IdrtAddress, kasepAddress } from "../variables"
import { ContractType, register } from "../helpers/realtime"
import ModalComponent from "./ModalComponent"
import { useState } from "react"
import { contractExecutor, contractInterface } from "@/helpers/ethers"
import { readContract, writeContract } from "wagmi/actions"
import config from "@/wagmi"
import kasepAbi from "@/abis/kasep.abi"
import { toast } from "react-toastify"
import { ethers } from "ethers"
import erc20Abi from "@/abis/erc20.abi"

export default () => {
    const { idrtBalance, refetch } = useIdrtBalance(kasepAddress)
    const [openModal, setOpenModal] = useState(false)
    const [amount, setAmount] = useState<number | undefined>()
    const [showAddressInvalid, setShowAddressInvalid] = useState(false)
    const [recipient, setRecipient] = useState("");

    const changedRecipient = (address: string) => {
        if (!ethers.isAddress(address) && address !== "") {
            setShowAddressInvalid(true)
        } else {
            setShowAddressInvalid(false)
            setRecipient(address)
        }
    }

    useClientOnceOnly(() => {
        register({
            contract: ContractType.IDRT,
            abi: 'Transfer(from,to,value)',
            callback: (from, to) => {
                if (from == kasepAddress || to == kasepAddress) refetch()
            },
        })
    })

    const submit = async () => {
        if (amount === undefined || amount <= 0 || isNaN(amount)) {
            toast.error("Invalid amount")
            return
        }

        contractExecutor(async () => {
            const calldata = contractInterface.encodeFunctionData("transfer", [
                recipient,
                Math.floor((amount || 0) * (10 ** 6))
            ])
            const hash = await writeContract(config, {
                abi: kasepAbi,
                address: kasepAddress,
                functionName: 'submitTransaction',
                args: [IdrtAddress, 0, calldata]
            })
            return hash
        })
    }

    return (
        <>
            <ModalComponent openModal={openModal} setOpenModal={setOpenModal}>
                <div className="modal-box">
                    {showAddressInvalid && <div role="alert" className="alert alert-error">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 shrink-0 stroke-current"
                            fill="none"
                            viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Invalid recipient address</span>
                    </div>}
                    <label className="form-control w-full">
                        <div className="label">
                            <span className="label-text">Recipient Address</span>
                        </div>
                        <input type="text" placeholder="Recipient Address" className="input input-bordered w-full" onChange={(x) => changedRecipient(x.target.value)} />
                    </label>
                    <label className="form-control w-full">
                        <div className="label">
                            <span className="label-text">Amount to Transfer</span>
                        </div>
                        <input type="text" placeholder="Amount" className="input input-bordered w-full" value={!isNaN(parseInt(amount?.toString() || 'kasep')) ? amount?.toString() : ''} onChange={(x) => setAmount(parseInt(x.target.value))} />
                    </label>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn btn-primary mr-2" onClick={submit}>Submit</button>
                            <button className="btn">Close</button>
                        </form>
                    </div>
                </div>
            </ModalComponent>

            <div className="stats shadow">
                <div className="stat">
                    <div className="stat-title">IDRT Balance</div>
                    <div className="stat-value">
                        <FormatRupiah value={idrtBalance}></FormatRupiah>
                    </div>
                    <div className="stat-desc">
                        <div className='mt-2'>
                            <button className='text-sm hover:text-gray-400' onClick={() => setOpenModal(true)}>Transfer</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}