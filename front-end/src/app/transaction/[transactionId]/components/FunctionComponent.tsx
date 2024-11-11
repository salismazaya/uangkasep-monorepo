'use client'

import { contractInterface } from "@/helpers/ethers"
import { useTransaction } from "@/hooks"
import { wbtcAddress } from "@/variables"
import { TransactionDescription } from "ethers"
import Image from "next/image"
import Link from "next/link"

export default function FunctionComponent({ transactionId }: { transactionId: bigint }) {
    const { transaction } = useTransaction(transactionId)
    let function_: string | undefined
    let caption: JSX.Element | undefined
    let iface: TransactionDescription | undefined

    if (transaction !== undefined) {
        try {
            iface = contractInterface.parseTransaction({
                data: transaction[2]
            }) as TransactionDescription
            function_ = `${iface?.fragment.name}(${iface?.args.join(',')})`
        } catch (e) {
            function_ = 'Unknown'
        }

        if (function_.startsWith('transfer(')) {
            const amount = BigInt(iface?.args[1] || 0) / BigInt(10 ** 6)
            const recipient = iface?.args[0]
            caption = (
                <tr>
                    <td>Caption</td>
                    <td className="break-all">
                        <span>Transfer {amount.toString()} </span>
                        <Link target="_blank" href={'https://polygonscan.com/token/' + wbtcAddress} className="text-blue-500 hover:text-blue-600 font-semibold">
                            <Image className="inline" width={20} height={20} src={"/idrt.png"} alt={"IDRT Logo"}></Image>
                            <span> IDRT</span>
                        </Link>
                        <span> to </span>
                        <Link target="_blank" href={'https://polygonscan.com/address/' + recipient} className="text-blue-500 hover:text-blue-600 font-semibold">{recipient}</Link>
                    </td>
                </tr>
            )
        }
    }

    return (
        <>
            <tr>
                <td>Function</td>
                <td className="break-all">{function_}</td>
            </tr>
            {caption}
            <tr>
                <td>Value</td>
                <td>{transaction && parseFloat((transaction[1] / BigInt(10 ** 18)).toString()).toFixed(2)} MATIC</td>
            </tr>
        </>
    )
}