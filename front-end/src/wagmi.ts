import { createConfig, http } from 'wagmi'
import {
  polygon,
  holesky,
} from 'wagmi/chains';
import {
  metaMaskWallet,
  rabbyWallet,
  phantomWallet,
  braveWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { isTestnet } from './variables';

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [metaMaskWallet, rabbyWallet, braveWallet, walletConnectWallet, phantomWallet],
    }
  ],
  {
    appName: process.env.NEXT_PUBLIC_WALLETCONNECT_APPNAME as string,
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string
  }
)

export const config = createConfig({
  chains: [isTestnet ? holesky : polygon],
  transports: {
    [polygon.id]: http(),
    [holesky.id]: http(),
  },
  connectors,
  ssr: true
})