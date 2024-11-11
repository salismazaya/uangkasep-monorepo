'use client'

import { useClientOnceOnly, useWbtcBalance } from "../hooks"
import { useAccount } from "wagmi"
import { ContractType, register } from "../helpers/realtime"
import BitcoinValueComponent from "./BitcoinValueComponent"

export default () => {
    const { address } = useAccount()
    const { wbtcBalance: myWbtcBalance, refetch } = useWbtcBalance(address)

    useClientOnceOnly(() => {
        register({
            contract: ContractType.IDRT,
            abi: 'Transfer(from,to,value)',
            callback: (from, to) => {
                if (from == address || to == address) refetch()
            },
        })
    })

    return (
        <div className="stats shadow shadow-blue-300 w-full mt-3">
            <div className="stat">
                <div className="stat-title">Your Bitcoin Balance</div>
                <div className="stat-value">
                    <BitcoinValueComponent value={myWbtcBalance}></BitcoinValueComponent>
                </div>
            </div>
        </div>
    )
}