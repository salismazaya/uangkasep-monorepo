import Link from "next/link"
import { ContractType, register } from "../helpers/realtime"
import { useClientOnceOnly, useSubmittedTransactionCount } from "../hooks"

export default () => {
    const { transactionCount, refetch } = useSubmittedTransactionCount()

    useClientOnceOnly(() => {
        register({
            contract: ContractType.KASEP,
            abi: 'Submission(transactionId)',
            callback: refetch,
        })
    })

    return (
        <>
            <div className="stats shadow">
                <div className="stat">
                    <div className="stat-title">Total Transaction</div>
                    <div className="stat-value">{transactionCount?.toString()}</div>
                    <div className="stat-desc">
                        <div className='mt-2'>
                            <Link className='text-sm hover:text-gray-400' href={'/transactions'}>View All</Link>
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}