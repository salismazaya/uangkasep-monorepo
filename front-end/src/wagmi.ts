import { createConfig, http } from 'wagmi'
import {
  polygon,
} from 'wagmi/chains';
import {
  metaMaskWallet,
  rabbyWallet,
  braveWallet,
  walletConnectWallet
} from "@rainbow-me/rainbowkit/wallets";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [metaMaskWallet, rabbyWallet, braveWallet, walletConnectWallet],
    }
  ],
  {
    appName: process.env.NEXT_PUBLIC_WALLETCONNECT_APPNAME as string,
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string
  }
)

export const config = createConfig({
  chains: [polygon],
  transports: {
    [polygon.id]: http()
  },
  connectors,
  ssr: true
})