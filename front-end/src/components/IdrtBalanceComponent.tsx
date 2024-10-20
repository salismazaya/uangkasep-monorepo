'use client'

import { FormatRupiah } from "@arismun/format-rupiah"
import { useClientOnceOnly, useIdrtBalance } from "../hooks"
import { multiSigAddress } from "../variables"
import { ContractType, register } from "../helpers/realtime"

export default () => {
    const { idrtBalance, refetch } = useIdrtBalance(multiSigAddress)

    useClientOnceOnly(() => {
        register({
            contract: ContractType.IDRT,
            abi: 'Transfer(from,to,value)',
            callback: (from) => {
                if (from == multiSigAddress) refetch()
            },
        })
    })

    return (
        <>
            <div className="stats shadow">
                <div className="stat">
                    <div className="stat-title">IDRT Balance</div>
                    <div className="stat-value">
                        <FormatRupiah value={idrtBalance}></FormatRupiah>
                    </div>
                </div>
            </div>
        </>
    )
}