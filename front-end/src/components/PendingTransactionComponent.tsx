import { ContractType, register } from "../helpers/realtime";
import { useClientOnceOnly, usePendingTransactionCount } from "../hooks";

export default () => {
    const { pendingTransactionCount, refetch } = usePendingTransactionCount();

    useClientOnceOnly(() => {
        register({
            contract: ContractType.MULTISIG,
            abi: 'Submission(transactionId)',
            callback: refetch,
        });
    });

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