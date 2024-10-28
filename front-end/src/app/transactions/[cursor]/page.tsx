import TransactionList from "../base"

const Transactions = ({ params: { cursor } }: { params: { cursor: string | number } }) => {
    return <TransactionList cursor={parseInt(cursor as string)} />
}

export default Transactions