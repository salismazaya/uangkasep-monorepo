'use client'

import { contractInterface } from "@/helpers/ethers"
import { useTransaction } from "@/hooks"

export default function FunctionComponent({ transactionId }: { transactionId: bigint }) {
    const { transaction } = useTransaction(transactionId)
    let function_: string | undefined;

    if (transaction !== undefined) {
        try {
            const iface = contractInterface.parseTransaction({
                data: transaction[2]
            })
            function_ = `${iface?.fragment.name}(${iface?.args.join(',')})`
        } catch (e) {
            function_ = 'Unknown'
        }
    }

    return (
        <>
            <tr>
                <td>Function</td>
                <td className="break-all">{function_}</td>
            </tr>
            <tr>
                <td>Value</td>
                <td>{transaction && parseFloat((transaction[1] / BigInt(10 ** 18)).toString()).toFixed(2)} MATIC</td>
            </tr>
        </>
    )
}