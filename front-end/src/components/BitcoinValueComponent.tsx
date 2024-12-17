export default ({ value }: { value: number }) => {
    return <span>{Number(value).toFixed(8)} BTC</span>
}