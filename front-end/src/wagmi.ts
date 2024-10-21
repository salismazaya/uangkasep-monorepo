import { isTestnet } from './variables'

import {
  polygon,
  polygonAmoy,
} from 'wagmi/chains'

import { getDefaultConfig } from '@rainbow-me/rainbowkit'

const config = getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_WALLETCONNECT_APPNAME as string,
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string,
  chains: [isTestnet ? polygonAmoy : polygon],
})

export default config