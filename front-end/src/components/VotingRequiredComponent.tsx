'use client'

import { useEffect, useState } from "react"
import { useClientOnceOnly, useVotingRequired } from "../hooks"
import ModalComponent from "./ModalComponent"
import { writeContract } from "@wagmi/core"
import config from "../wagmi"
import { contractExecutor, contractInterface } from "../helpers/ethers"
import { register, ContractType } from "../helpers/realtime"
import kasepAbi from "@/abis/kasep.abi"
import { kasepAddress } from "@/variables"

export default () => {
    const { votingRequired, refetch } = useVotingRequired()
    const [openModal, setOpenModal] = useState(false)

    const [votingRequiredValue, setVotingRequiredValue] = useState<number | undefined>(parseInt(votingRequired?.toString() || 'kasep'))

    useEffect(() => {
        setVotingRequiredValue(votingRequired)
    }, [votingRequired])

    useClientOnceOnly(() => {
        register({
            contract: ContractType.KASEP,
            abi: 'RequirementChange(destination,value,data)',
            callback: () => refetch()
        })
    })

    const execute = () => {
        const calldata = contractInterface.encodeFunctionData("changeRequirement", [votingRequiredValue])
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
                    <div className="stat-title">Voting Required</div>
                    <div className="stat-value">{votingRequired?.toString()}</div>
                    <div className="stat-desc">
                        <div className='mt-2'>
                            <button className='text-sm text-yellow-500 hover:text-yellow-400' onClick={() => setOpenModal(true)}>Change</button>
                        </div>
                    </div>
                </div>
            </div>

            <ModalComponent openModal={openModal} setOpenModal={setOpenModal}>
                <div className="modal-box">
                    <label className="form-control w-full">
                        <div className="label">
                            <span className="label-text">Voting Required</span>
                        </div>
                        <input type="text" placeholder="Voting Required" className="input input-bordered w-full" value={!isNaN(parseInt(votingRequiredValue?.toString() || 'kasep')) ? votingRequiredValue?.toString() : ''} onChange={(x) => setVotingRequiredValue(parseInt(x.target.value))} />
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