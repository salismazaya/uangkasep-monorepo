export default ({ value }: { value: number }) => {
    return <span>{value.toFixed(8)} BTC</span>
}