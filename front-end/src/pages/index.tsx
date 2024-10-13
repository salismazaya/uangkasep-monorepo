import { FormatRupiah } from '@arismun/format-rupiah';
import {
  useGetBill, useIdrtBalance
} from '../hooks';
import { useAccount } from 'wagmi';
import OwnersComponent from '../components/OwnersComponent';
import IdrtBalanceComponent from '../components/IdrtBalanceComponent';
import VotingRequiredComponent from '../components/VotingRequiredComponent';
import SubmittedTransactionComponent from '../components/SubmittedTransactionComponent';
import PendingTransactionComponent from '../components/PendingTransactionComponent';
import ExecutedTransactionComponent from '../components/ExecutedTransactionComponent';

const Home = () => {
  const { address } = useAccount();
  const { idrtBalance: myIdrtBalance } = useIdrtBalance(address);
  const { bill } = useGetBill(address);

  return (
    <>
      <div className='grid grid-cols-1 lg:grid-cols-2 mt-3 gap-2'>
        <div className="stats shadow shadow-blue-300 w-full mt-3">
          <div className="stat">
            <div className="stat-title">Your Bill</div>
            <div className="stat-value">
              <FormatRupiah value={bill}></FormatRupiah>
            </div>
            <div className="stat-desc">
              <button className='btn btn-primary mt-3 text-lg px-8 py-1'>Pay</button>
            </div>
          </div>
        </div>

        <div className="stats shadow shadow-blue-300 w-full mt-3">
          <div className="stat">
            <div className="stat-title">Your IDRT Balance</div>
            <div className="stat-value">
              <FormatRupiah value={myIdrtBalance}></FormatRupiah>
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-2 lg:grid-cols-4 mt-3 gap-2'>
        <IdrtBalanceComponent></IdrtBalanceComponent>
        <OwnersComponent></OwnersComponent>
        <VotingRequiredComponent></VotingRequiredComponent>
        <SubmittedTransactionComponent></SubmittedTransactionComponent>
        <PendingTransactionComponent></PendingTransactionComponent>
        <ExecutedTransactionComponent></ExecutedTransactionComponent>
      </div>
    </>
  )
};

export default Home;
