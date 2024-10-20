'use client'

import {
    RainbowKitProvider,
} from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import {
    QueryClientProvider,
    QueryClient,
} from '@tanstack/react-query'
import config from '@/wagmi';
import React from 'react';

const queryClient = new QueryClient();

function Web3Wrapper({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}

export default Web3Wrapper

