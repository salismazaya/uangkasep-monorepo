import { ConnectButton } from '@rainbow-me/rainbowkit'

const Navbar = () => {
    return (
        <div className="navbar bg-base-100 shadow-lg">
            <div className="flex-1">
                <a className="btn btn-ghost text-xl">UangKasep</a>
            </div>
            <div className="flex-none">
                <ConnectButton />
            </div>
        </div>
    )
}

export default Navbar