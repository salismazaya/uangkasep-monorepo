export default () => {
    return (
        <div className="shadow-md">
            <table className="table table-fixed">
                <thead>
                    <tr className="text-center">
                        <th>Date</th>
                        <th className="text-left">Inititial</th>
                        <th>Total Voting</th>
                        <th>
                            <span>Status</span>
                        </th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="text-center">
                            <span>15/10/24 12:28</span>
                        </td>
                        <td className="truncate">0xf26ae4bEA00ebd47eE01cCEC00220ac7bc4D4C80</td>
                        <td className="text-center">
                            <span className="text-error">3</span>
                            /
                            <span className="text-success">5</span>
                        </td>
                        <td>
                            <div className="text-error font-bold text-center">
                                <span>Rejected</span>
                            </div>
                        </td>
                        <td>
                            <button className="btn btn-info text-white btn-md font-bold mx-auto block">Detail</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}