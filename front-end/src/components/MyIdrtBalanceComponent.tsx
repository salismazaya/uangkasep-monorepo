'use client'

import { FormatRupiah } from "@arismun/format-rupiah"
import { useClientOnceOnly, useIdrtBalance } from "../hooks"
import { useAccount } from "wagmi"
import { ContractType, register } from "../helpers/realtime"

export default () => {
    const { address } = useAccount()
    const { idrtBalance: myIdrtBalance, refetch } = useIdrtBalance(address)

    useClientOnceOnly(() => {
        register({
            contract: ContractType.IDRT,
            abi: 'Transfer(from,to,value)',
            callback: (from) => {
                if (from == address) refetch()
            },
        })
    })

    return (
        <div className="stats shadow shadow-blue-300 w-full mt-3">
            <div className="stat">
                <div className="stat-title">Your IDRT Balance</div>
                <div className="stat-value">
                    <FormatRupiah value={myIdrtBalance}></FormatRupiah>
                </div>
            </div>
        </div>
    )
}