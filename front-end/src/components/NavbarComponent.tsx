import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'

const Navbar = () => {
    return (
        <div className="navbar bg-base-100 shadow-lg sticky z-50 top-0">
            <div className="flex-1">
                <Link className='btn btn-ghost text-xl' href='/'>UangKasep</Link>
            </div>
            <div className="flex-none">
                <ConnectButton />
            </div>
        </div>
    )
}

export default Navbar