import { useEffect, useRef } from "react";

function ModalComponent({ openModal, children, setOpenModal, hook }: {
    openModal: boolean,
    children: JSX.Element,
    setOpenModal: any,
    hook?: any
}) {
    const ref: any = useRef();

    useEffect(() => {
        if (openModal) {
            ref.current?.showModal();
        } else {
            ref.current?.close();
        }
    }, [openModal]);

    return (
        <dialog ref={ref} className="modal" onClose={() => setOpenModal(false)}>
            {children}
        </dialog>
    );
}

export default ModalComponent;