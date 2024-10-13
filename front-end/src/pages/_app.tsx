import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from 'next/app';
import { Raleway } from 'next/font/google'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAccount, WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';

import { config } from '../wagmi';
import Head from 'next/head';
import Navbar from '../components/NavbarComponent';
import { useIsOwner } from '../hooks';
import { useContext, useEffect, useState } from 'react';

const font = Raleway({
  subsets: ['latin']
});
const client = new QueryClient();

const Base = ({ children }: { children: JSX.Element }) => {
  const { isConnected, address } = useAccount();

  const { isOwner } = useIsOwner(address);

  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])


  return (
    <div className='p-4'>
      {isClient && !isConnected && <div role="alert" className="alert alert-info flex w-[calc(100%-2rem)]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="h-6 w-6 shrink-0 stroke-current">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span className='text-lg'>Wallet not connected</span>
      </div>}

      {isClient && isOwner === false && <div role="alert" className="alert alert-error flex w-[calc(100%-2rem)]">
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
        <span className='text-lg'>You're not owner</span>
      </div>}

      {children}
    </div>
  );
}

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>Uang Kasep</title>
      </Head>

      <WagmiProvider config={config}>
        <QueryClientProvider client={client}>
          <RainbowKitProvider>
            <Navbar></Navbar>

            <main className={font.className}>
              <Base>
                <Component {...pageProps} />
              </Base>
            </main>

          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
}

export default App;
