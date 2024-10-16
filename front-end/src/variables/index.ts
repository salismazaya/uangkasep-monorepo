export const multiSigAddress = process.env.NEXT_PUBLIC_MULTISIG_ADDRESS as `0x${string}`;
export const IdrtAddress = process.env.NEXT_PUBLIC_IDRT_ADDRESS as `0x${string}`;
export const kasepAddress = process.env.NEXT_PUBLIC_KASEP_ADDRESS as `0x${string}`;
// export const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY as string;
// export const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string;
export const isTestnet = process.env.NEXT_PUBLIC_IS_TESTNET == 'true';
export const wssRpcUrl = process.env.NEXT_PUBLIC_WSS_RPC as string;

