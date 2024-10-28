import { isTestnet } from './variables'

import {
  polygon,
  sepolia
} from 'wagmi/chains'

// import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  argentWallet,
  coinbaseWallet,
  ledgerWallet,
  metaMaskWallet,
  rabbyWallet,
  rainbowWallet,
  safeWallet,
  walletConnectWallet,
  braveWallet
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from 'wagmi';

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [
        metaMaskWallet,
        rainbowWallet,
        walletConnectWallet,
        ledgerWallet,
        rabbyWallet,
        coinbaseWallet,
        argentWallet,
        safeWallet,
        braveWallet
      ],
    },
  ],
  { appName: process.env.NEXT_PUBLIC_WALLETCONNECT_APPNAME as string, projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string },
);

// const config = getDefaultConfig({
//   appName: process.env.NEXT_PUBLIC_WALLETCONNECT_APPNAME as string,
//   projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string,
//   chains: [isTestnet ? sepolia : polygon],
// })

const transports: Record<number, any> = {
  [sepolia.id]: http(),
  [polygon.id]: http(),
};


const config = createConfig({
  chains: [isTestnet ? sepolia : polygon],
  connectors,
  transports,
})

export default config