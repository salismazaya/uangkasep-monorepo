import { ContractType, register } from "../helpers/realtime";
import { useClientOnceOnly, useSubmittedTransactionCount } from "../hooks";

export default () => {
    const { transactionCount, refetch } = useSubmittedTransactionCount();

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
                    <div className="stat-title">Total Transaction</div>
                    <div className="stat-value">{transactionCount?.toString()}</div>
                </div>
            </div>
        </>
    );
}