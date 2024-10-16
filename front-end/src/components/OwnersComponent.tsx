import { lazy, Suspense, useState } from "react";
import { useClientOnceOnly, useOwners } from "../hooks";
import ModalComponent from "./ModalComponent";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { contractExecutor, contractInterface } from "../helpers/ethers";
import { writeContract } from "@wagmi/core";
import multisigAbi from "../abis/multisig.abi";
import { multiSigAddress } from "../variables";
import { config } from "../wagmi";
import { register, ContractType } from "../helpers/realtime";

const Content: any = lazy(() => import('./lazy/OwnersLazyComponent'));

const OwnersComponent = () => {
    const { owners, refetch } = useOwners();
    const [openModal, setOpenModal] = useState(false);
    const [openAddOwnerModal, setOpenAddOwnerModal] = useState(false);
    const [newOwnerAddress, setNewOwnerAddress] = useState<string | undefined>();
    const [showAddressInvalid, setShowAddressInvalid] = useState(false);

    useClientOnceOnly(() => {
        register({
            contract: ContractType.MULTISIG,
            abi: 'OwnerAddition(owner)',
            callback: refetch
        });
        register({
            contract: ContractType.MULTISIG,
            abi: 'OwnerRemoval(owner)',
            callback: refetch
        });
    });

    const executeAddOwner = () => {
        if (newOwnerAddress === "" || newOwnerAddress === undefined) {
            toast.error('Address invalid');
            return;
        }

        contractExecutor(async () => {
            const calldata = contractInterface.encodeFunctionData("addOwner", [newOwnerAddress]);

            const hash = await writeContract(config, {
                abi: multisigAbi,
                address: multiSigAddress,
                functionName: 'submitTransaction',
                args: [multiSigAddress, 0, calldata],
            });

            return hash;
        })
    }

    const changedNewOwner = (address: string) => {
        if (!ethers.isAddress(address) && address !== "") {
            setShowAddressInvalid(true);
        } else {
            setShowAddressInvalid(false);
            setNewOwnerAddress(address);
        }
    }

    return (
        <>
            <div className="stats shadow">
                <div className="stat">
                    <div className="stat-title">Total Owner</div>
                    <div className="stat-value">{owners?.length}</div>
                    <div className="stat-desc">
                        <div className='mt-2'>
                            <button className='text-sm hover:text-gray-400' onClick={() => setOpenModal(true)}>View</button>
                        </div>
                    </div>
                </div>
            </div>

            <ModalComponent openModal={openModal} setOpenModal={setOpenModal}>
                <div className="modal-box">
                    {openModal && <Suspense>
                        <Content hook={setOpenAddOwnerModal}></Content>
                    </Suspense>}
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Close</button>
                        </form>
                    </div>
                </div>
            </ModalComponent>

            <ModalComponent openModal={openAddOwnerModal} setOpenModal={setOpenAddOwnerModal}>
                <div className="modal-box">
                    {showAddressInvalid && <div role="alert" className="alert alert-error">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 shrink-0 stroke-current"
                            fill="none"
                            viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Invalid owner address</span>
                    </div>}
                    <label className="form-control w-full">
                        <div className="label">
                            <span className="label-text">Enter New Owner Address</span>
                        </div>
                        <input type="text" placeholder="Owner Address" className="input input-bordered w-full" onChange={(x) => changedNewOwner(x.target.value)} />
                    </label>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn btn-primary mr-2" onClick={executeAddOwner}>Submit</button>
                            <button className="btn">Close</button>
                        </form>
                    </div>
                </div>
            </ModalComponent>
        </>
    );
}

export default OwnersComponent;