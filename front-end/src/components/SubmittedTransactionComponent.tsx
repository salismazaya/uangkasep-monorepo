import { publicChannel, register } from "../channels";
import { useSubmittedTransactionCount } from "../hooks";

export default () => {
    const { transactionCount, refetch } = useSubmittedTransactionCount();
    
    register({
        unique: 'totalTransaction',
        channel: publicChannel,
        eventName: 'Submission',
        callback: () => refetch()
    });

    return (
        <>
            <div className="stats shadow">
                <div className="stat">
                    <div className="stat-title">Total Transaction</div>
                    <div className="stat-value">{transactionCount?.toString()}</div>
                </div>
            </div>
        </>
    );
}