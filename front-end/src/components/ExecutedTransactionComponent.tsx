import { useExecutedTransactionCount } from "../hooks";

export default () => {
    const { executedTransactionCount } = useExecutedTransactionCount();
    
    return (
        <>
            <div className="stats shadow">
                <div className="stat">
                    <div className="stat-title">Transaction Executed</div>
                    <div className="stat-value">{executedTransactionCount?.toString()}</div>
                </div>
            </div>
        </>
    );
}