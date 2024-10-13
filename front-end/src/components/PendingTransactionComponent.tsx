import { usePendingTransactionCount } from "../hooks";

export default () => {
    const { pendingTransactionCount } = usePendingTransactionCount();
    return (
        <>
            <div className="stats shadow">
                <div className="stat">
                    <div className="stat-title">Transaction Pending</div>
                    <div className="stat-value">{pendingTransactionCount?.toString()}</div>
                </div>
            </div>
        </>
    );
}