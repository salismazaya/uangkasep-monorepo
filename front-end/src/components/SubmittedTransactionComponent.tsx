import { useSubmittedTransactionCount } from "../hooks";

export default () => {
    const { transactionCount } = useSubmittedTransactionCount();
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