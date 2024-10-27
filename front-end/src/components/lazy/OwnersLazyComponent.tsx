'use client'

import Link from "next/link"
import { useBillingOwner } from "../../hooks"
import { FormatRupiah } from "@arismun/format-rupiah"

export default ({ hook }: { hook: (active: boolean) => void}) => {
    const { billingsOwner } = useBillingOwner()

    return (
        <>
            <div className='mt-4'>
                <div>
                    <button className="btn btn-success mb-3" onClick={() => hook(true) } >Add Owner</button>
                    <table className="table table-fixed">
                        <thead>
                            <tr>
                                <th className='w-1/12'></th>
                                <th className='w-4/12'>Owner</th>
                                <th className='w-3/12'>Billing</th>
                                <th className='w-3/2'>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {billingsOwner?.map((billingOwner, i) => {
                                return (
                                    <tr key={billingOwner.address}>
                                        <th>{i + 1}</th>
                                        <td>
                                            <p className='truncate'>
                                                <Link className='text-blue-500 hover:text-blue-400' href={'https://polygonscan.com/address/' + billingOwner.address} target='_blank'>
                                                    {billingOwner.address}
                                                </Link>
                                            </p>
                                        </td>
                                        <td>
                                            <FormatRupiah value={billingOwner.billing}></FormatRupiah>
                                        </td>
                                        <td >
                                            <button className="btn btn-error btn-xs text-error-content">Delete</button>
                                            <button className="btn btn-warning btn-xs mt-1 text-warning-content">Checkpoint</button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}