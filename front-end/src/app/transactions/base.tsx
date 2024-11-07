'use client'

import { ContractType, register } from "@/helpers/realtime"
import { useClientOnceOnly } from "@/hooks"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const TransactionList = ({ cursor }: { cursor: number }) => {
    const router = useRouter()
    const [transactions, setTransactions] = useState<any[]>()
    const [totalTransaction, setTotalTransaction] = useState<number>()
    const [isLoading, setIsLoading] = useState(false)

    if (isNaN(cursor)) {
        return <p className="text-center text-3xl text-error mt-3">400: BAD HEART</p>
    }

    const execute = () => {
        setIsLoading(true)
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}transactions?cursor=${cursor - 1}`).then(response => {
            response.json().then(transactions => {
                setTransactions(transactions.data)
                setTotalTransaction(transactions.total_transaction)
                setIsLoading(false)
            })
        })
    }

    useEffect(execute, [cursor])

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
        <>
            <div className="shadow-md min-h-[620px] mt-5">
                {/* <Link href="/"> */}
                <button onClick={() => router.back()}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-12">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </button>
                {/* </Link> */}
                <table className="table table-fixed">
                    <thead>
                        <tr className="text-center">
                            <th>Date</th>
                            <th className="text-left">
                                <span className="hidden lg:inline">Destination</span>
                                <span className="inline lg:hidden">Dst</span>
                            </th>
                            <th>
                                <span className="hidden lg:inline">Total Voting</span>
                                <span className="inline lg:hidden">Voting</span>
                            </th>
                            <th>
                                <span>Status</span>
                            </th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!isLoading && (transactions || []).map((transaction) => {
                            let textClass = ""

                            if (transaction.status === "failure" || transaction.status === "rejected") {
                                textClass = "text-error"
                            } else if (transaction.status === "executed") {
                                textClass = "text-success"
                            } else if (transaction.status === "waiting") {
                                textClass = "text-warning"
                            }

                            const date = new Date(transaction.created + '+00:00')
                            const formattedDateTime = date.getDate().toString().padStart(2, '0') + '/' +
                                (date.getMonth() + 1).toString().padStart(2, '0') + '/' +
                                date.getFullYear().toString().slice(-2) + ' ' +
                                date.getHours().toString().padStart(2, '0') + ':' +
                                date.getMinutes().toString().padStart(2, '0')
                            return (
                                <tr key={transaction.transactionId}>
                                    <td className="text-center text-sm lg:text-base">
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
                                            <Link className="btn btn-sm lg:btn-md btn-info font-bold" href={"/transaction/" + transaction.transactionId}>Detail</Link>
                                        </center>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            <center>
                <div className="join mt-3">
                    <button onClick={() => router.back()} className={`join-item btn btn-neutral ${cursor == 1 && 'btn-disabled'}`}>«</button>
                    <button className="join-item btn btn-neutral hover:bg-neutral">Page {cursor}</button>
                    <button onClick={() => router.push(`/transactions/${cursor + 1}`)} className={`join-item btn btn-neutral ${cursor * 8 >= (totalTransaction || 0) && 'btn-disabled'}`}>»</button>
                </div>
            </center>
        </>
    )
}

export default TransactionList