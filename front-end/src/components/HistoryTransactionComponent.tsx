'use client'

import { ContractType, register } from "@/helpers/realtime"
import { useClientOnceOnly } from "@/hooks"
import axios from "axios"
import Link from "next/link"
import { useState } from "react"

export default () => {
    const [transactions, setTransactions] = useState<any[]>()

    const execute = () => {
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}transactions`).then(response => {
            setTransactions(response.data)
        })
    }

    useClientOnceOnly(() => {
        execute()

        register({
            abi: 'Submission(transactionId)',
            contract: ContractType.KASEP,
            callback: () => setTimeout(execute, 2000)
        })

        register({
            abi: 'Confirmation(sender,transactionId)',
            contract: ContractType.KASEP,
            callback: () => setTimeout(execute, 2000)
        })

        register({
            abi: 'Revocation(sender,transactionId)',
            contract: ContractType.KASEP,
            callback: () => setTimeout(execute, 2000)
        })
    })

    return (
        <div className="shadow-md">
            <table className="table table-fixed">
                <thead>
                    <tr className="text-center">
                        <th>Date</th>
                        <th className="text-left">Destination</th>
                        <th>Total Voting</th>
                        <th>
                            <span>Status</span>
                        </th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {(transactions || []).map((transaction) => {
                        let textClass = ""

                        if (transaction.status === "failure" || transaction.status === "rejected") {
                            textClass = "text-error"
                        } else if (transaction.status === "executed") {
                            textClass = "text-success"
                        } else if (transaction.status === "waiting") {
                            textClass = "text-warning"
                        }

                        const date = new Date(transaction.created)
                        const formattedDateTime = date.getDate().toString().padStart(2, '0') + '/' +
                            (date.getMonth() + 1).toString().padStart(2, '0') + '/' +
                            date.getFullYear().toString().slice(-2) + ' ' +
                            date.getHours().toString().padStart(2, '0') + ':' +
                            date.getMinutes().toString().padStart(2, '0')

                        return (
                            <tr key={transaction.transactionId}>
                                <td className="text-center">
                                    <span>{formattedDateTime}</span>
                                </td>
                                <td className="truncate">{transaction.destination}</td>
                                <td className="text-center">
                                    <span className="text-error">{transaction.total_accept}</span>
                                    /
                                    <span className="text-success">{transaction.total_accept_required}</span>
                                </td>
                                <td>
                                    <div className={`font-bold text-center ${textClass}`}>
                                        <span className="capitalize">{transaction.status}</span>
                                    </div>
                                </td>
                                <td>
                                    <center>
                                        <Link className="btn btn-info text-white font-bold" href={"/transaction/" + transaction.transactionId}>Detail</Link>
                                    </center>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}