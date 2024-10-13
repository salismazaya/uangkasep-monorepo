import { lazy, Suspense, useState } from "react";
import { useOwners } from "../hooks";
import ModalComponent from "./ModalComponent";

const Content: any = lazy(() => import('./lazy/OwnersLazyComponent'));

const OwnersComponent = () => {
    const { owners } = useOwners();
    const [openModal, setOpenModal] = useState(false);

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
                        <Content></Content>
                    </Suspense>}
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Close</button>
                        </form>
                    </div>
                </div>
            </ModalComponent>
        </>
    );
}

export default OwnersComponent;