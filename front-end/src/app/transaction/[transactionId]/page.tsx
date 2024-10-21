'use client'

import Link from "next/link"

export default ({ params: { transactionId } }: { params: { transactionId: number } }) => {
    return (
        <>
            <div className="w-full bg-neutral-content rounded p-2 relative">
                <div className="absolute">
                    <Link href="/">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-12">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    </Link>
                </div>
            </div>
        </>
    )
}