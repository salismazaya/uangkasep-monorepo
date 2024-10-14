import { useEffect, useState } from "react";
import { useVotingRequired } from "../hooks";
import ModalComponent from "./ModalComponent";
import { writeContract, waitForTransactionReceipt } from "@wagmi/core";
import { config } from "../wagmi";
import multisigAbi from "../abis/multisig.abi";
import { multiSigAddress } from "../variables";
import { contractInterface } from "../helpers/ethers";
import { toast } from "react-toastify";
import { publicChannel, register } from "../channels";

export default () => {
    const { votingRequired, refetch } = useVotingRequired();
    const [openModal, setOpenModal] = useState(false);

    const [votingRequiredValue, setVotingRequiredValue] = useState<number | undefined>(parseInt(votingRequired?.toString() || 'kasep'));

    useEffect(() => {
        setVotingRequiredValue(votingRequired)
    }, [votingRequired]);

    // register({
    //     unique: 'voting',
    //     channel: publicChannel,
    //     eventName: 'RequirementChange',
    //     callback: () => refetch()
    // })

    const execute = async () => {
        const calldata = contractInterface.encodeFunctionData("changeRequirement", [votingRequiredValue])
        const toastId = toast.loading("Loading...");

        try {
            const hash = await writeContract(config, {
                abi: multisigAbi,
                address: multiSigAddress,
                functionName: 'submitTransaction',
                args: [multiSigAddress, 0, calldata]
            });
            await waitForTransactionReceipt(config, {
                hash
            });
            await refetch();

            toast.update(toastId, {
                render: 'Success',
                type: 'success',
                isLoading: false,
                autoClose: 2000
            })
        } catch (e: any) {
            toast.update(toastId, {
                render: e.message.toString().slice(0, 150),
                type: 'error',
                isLoading: false,
                autoClose: 2000
            })
        }

    }

    return (
        <>
            <div className="stats shadow">
                <div className="stat">
                    <div className="stat-title">Voting Required</div>
                    <div className="stat-value">{votingRequired?.toString()}</div>
                    <div className="stat-desc">
                        <div className='mt-2'>
                            <button className='text-sm hover:text-gray-400' onClick={() => setOpenModal(true)}>Change</button>
                        </div>
                    </div>
                </div>
            </div>

            <ModalComponent openModal={openModal} setOpenModal={setOpenModal}>
                <div className="modal-box">
                    <label className="form-control w-full">
                        <div className="label">
                            <span className="label-text">Voting Required</span>
                        </div>
                        <input type="text" placeholder="Voting Required" className="input input-bordered w-full" value={!isNaN(parseInt(votingRequiredValue?.toString() || 'kasep')) ? votingRequiredValue?.toString() : ''} onChange={(x) => setVotingRequiredValue(parseInt(x.target.value))} />
                    </label>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn btn-primary mr-2" onClick={execute}>Submit</button>
                            <button className="btn">Close</button>
                        </form>
                    </div>
                </div>
            </ModalComponent>
        </>
    );
}