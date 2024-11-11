export const wbtcAddress = process.env.NEXT_PUBLIC_IDRT_ADDRESS as `0x${string}`
export const kasepAddress = process.env.NEXT_PUBLIC_KASEP_ADDRESS as `0x${string}`
export const isTestnet = process.env.NEXT_PUBLIC_IS_TESTNET == 'true'
export const wssRpcUrl = process.env.NEXT_PUBLIC_WSS_RPC as string
export const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL as string