import { ContractType, register } from "../helpers/realtime";
import { useClientOnceOnly, useExecutedTransactionCount } from "../hooks";

export default () => {
    const { executedTransactionCount, refetch } = useExecutedTransactionCount();
    
    useClientOnceOnly(() => {
        register({
            contract: ContractType.MULTISIG,
            abi: 'Execution(transactionId)',
            callback: refetch,
        });
    });

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