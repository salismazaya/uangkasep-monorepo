import { isTestnet } from './variables'

import {
  polygon,
  sepolia
} from 'wagmi/chains'

import { getDefaultConfig } from '@rainbow-me/rainbowkit'

const config = getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_WALLETCONNECT_APPNAME as string,
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string,
  chains: [isTestnet ? sepolia : polygon],
})

export default config