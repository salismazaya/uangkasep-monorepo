import { FormatRupiah } from "@arismun/format-rupiah";
import { useIdrtBalance } from "../hooks";
import { kasepAddress } from "../variables";

export default () => {
    const { idrtBalance } = useIdrtBalance(kasepAddress);

    return (
        <>
            <div className="stats shadow">
                <div className="stat">
                    <div className="stat-title">IDRT Balance</div>
                    <div className="stat-value">
                        <FormatRupiah value={idrtBalance}></FormatRupiah>
                    </div>
                </div>
            </div>
        </>
    );
}