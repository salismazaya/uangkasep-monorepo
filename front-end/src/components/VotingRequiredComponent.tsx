import { useVotingRequired } from "../hooks";

export default () => {
    const { votingRequired } = useVotingRequired();
    return (
        <>
            <div className="stats shadow">
                <div className="stat">
                    <div className="stat-title">Voting Required</div>
                    <div className="stat-value">{votingRequired?.toString()}</div>
                </div>
            </div>
        </>
    );
}