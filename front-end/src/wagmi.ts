import { isTestnet } from './variables'

import {
  polygon,
  sepolia
} from 'wagmi/chains'

// import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { connectorsForWallets } from "@rainbow-me/rainbowkit"
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
} from "@rainbow-me/rainbowkit/wallets"
import { createConfig, http } from 'wagmi'
import { Transport } from 'viem'

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [
        metaMaskWallet,
        braveWallet,
        rainbowWallet,
        walletConnectWallet,
        ledgerWallet,
        rabbyWallet,
        coinbaseWallet,
        argentWallet,
        safeWallet,
      ],
    },
  ],
  { appName: process.env.NEXT_PUBLIC_WALLETCONNECT_APPNAME as string, projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string },
)

// const config = getDefaultConfig({
//   appName: process.env.NEXT_PUBLIC_WALLETCONNECT_APPNAME as string,
//   projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string,
//   chains: [isTestnet ? sepolia : polygon],
// })

const transports: Record<number, Transport> = {
  [sepolia.id]: http('https://1rpc.io/sepolia'),
  [polygon.id]: http(),
}


const config = createConfig({
  chains: [isTestnet ? sepolia : polygon],
  connectors,
  transports,
})

export default config