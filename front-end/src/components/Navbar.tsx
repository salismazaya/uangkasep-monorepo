import { ConnectButton } from '@rainbow-me/rainbowkit';

const Navbar = () => {
    return (
        <nav className='sticky top-0 z-50 w-full h-16 bg-neutral items-center flex justify-between text-neutral-content p-3'>
            <p className='text-xl'>UangKasep</p>
            <ConnectButton />
        </nav>
    );
}

export default Navbar;