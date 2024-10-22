import axios from "axios"
import Link from "next/link"
import TransactionPageClient from "./page_client";

export default async ({ params: { transactionId } }: { params: { transactionId: bigint } }) => {
    const response = await axios.get(`${process.env.BACKEND_URL}transactions/${transactionId}`)
    const transaction = response.data;

    let textClass = ""

    if (transaction.status === "failure" || transaction.status === "rejected") {
        textClass = "text-error"
    } else if (transaction.status === "executed") {
        textClass = "text-success"
    } else if (transaction.status === "waiting") {
        textClass = "text-warning"
    }

    return (
        <>
            <div className="w-full rounded p-2 relative mt-3 text-xl">
                <div className="flex items-center">
                    <Link href="/">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-12">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    </Link>
                    <p className="ml-3">{new Date(transaction.created).toLocaleString()}</p>
                </div>

                <div className="mt-2">
                    <table className="table table-fixed text-xl">
                        <tbody>
                            <tr>
                                <td>Transaction ID</td>
                                <td>{transaction.transactionId}</td>
                            </tr>
                            <tr>
                                <td>Destination</td>
                                <td className="text-blue-500 hover:text-blue-600 break-all">
                                    <Link target="_blank" href={'https://polygonscan.com/address/' + transaction.destination}>{transaction.destination}</Link>
                                </td>
                            </tr>
                            <TransactionPageClient transactionId={transactionId} />
                            <tr>
                                <td>Status</td>
                                <td className="capitalize">
                                    <p className={textClass}>{transaction.status}</p>
                                </td>
                            </tr>
                            <tr>
                                <td>Total Accept</td>
                                <td className="text-success">{transaction.total_accept}</td>
                            </tr>
                            <tr>
                                <td>Total Reject</td>
                                <td className="text-error">{transaction.total_reject}</td>
                            </tr>
                            <tr>
                                <td>Total Pending</td>
                                <td className="text-warning">{transaction.total_pending}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}