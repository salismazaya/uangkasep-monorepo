export interface IsOwnerInteface {
    data?: boolean;
    refetch: any;
}

export interface OwnersInterface {
    data?: string[];
    refetch: any;
}

export interface NumberInterface {
    data?: number;
    refetch: any;
}

export interface ArrayBigIntInterface {
    data?: bigint[];
    refetch: any;
}

export interface TransactionInterface {
    status: string;
    created: number;
    transactionId: number;
    total_accept: number;
    total_reject: number;
    total_pending: number;
    destination: string;
}