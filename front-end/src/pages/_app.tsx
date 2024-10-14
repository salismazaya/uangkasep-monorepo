import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import 'react-toastify/dist/ReactToastify.css'
import type { AppProps } from 'next/app';
import { Raleway } from 'next/font/google'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';

import { config } from '../wagmi';
import Head from 'next/head';
import Navbar from '../components/NavbarComponent';
import { lazy, Suspense, useEffect, useState } from 'react';
import { useClientOnceOnly } from '../hooks';

const font = Raleway({
  subsets: ['latin']
});
const client = new QueryClient();

const Base: any = lazy(() => import('./_base'));

const App = ({ Component, pageProps }: AppProps) => {
  const [isClient, setIsClient] = useState(false);
  useClientOnceOnly(() => setIsClient(true));
  
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
              {isClient && <Suspense>
                <Base>
                  <Component {...pageProps} />
                </Base>
              </Suspense>}
            </main>

          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
}

export default App;
