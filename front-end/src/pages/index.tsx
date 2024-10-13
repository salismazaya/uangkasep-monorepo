import { FormatRupiah } from '@arismun/format-rupiah';
import {
  useBillingOwner,
  useExecutedTransactionCount, useGetBill, useIdrtBalance, useOwners,
  usePendingTransactionCount, useSubmittedTransactionCount, useVotingRequired
} from '../context';
import { useAccount } from 'wagmi';
import { kasepAddress } from '../variables';
import Link from 'next/link';

interface StatsInterface {
  title: string,
  value?: number | string | JSX.Element,
  footer?: JSX.Element
}

const Home = () => {
  const { address } = useAccount();
  const { owners } = useOwners();
  const { votingRequired } = useVotingRequired();
  const { transactionCount } = useSubmittedTransactionCount();
  const { pendingTransactionCount } = usePendingTransactionCount();
  const { executedTransactionCount } = useExecutedTransactionCount();
  const { idrtBalance } = useIdrtBalance(kasepAddress);
  const { idrtBalance: myIdrtBalance } = useIdrtBalance(address);
  const { billingsOwner } = useBillingOwner();
  const { bill } = useGetBill(address);

  const stats: StatsInterface[] = [
    {
      title: 'IDRT Balance',
      value: <FormatRupiah value={idrtBalance} />,
      footer: <div className='mt-2'>
        <button className='text-sm hover:text-gray-400'>Transfer</button>
      </div>
    },
    {
      title: 'Total Owner',
      value: owners?.length,
      footer: <div className='mt-2'>
        <button className='text-sm hover:text-gray-400'>Add</button>
        <span className='mx-1'>|</span>
        <button className='text-sm hover:text-gray-400'>Remove</button>
      </div>
    },
    {
      title: 'Voting Required',
      value: votingRequired?.toString(),
      footer: <div className='mt-2'>
        <button className='text-sm hover:text-gray-400'>Change</button>
      </div>
    },
    {
      title: 'Transaction Submitted',
      value: transactionCount?.toString()
    },
    {
      title: 'Transaction Pending',
      value: pendingTransactionCount?.toString()
    },
    {
      title: 'Transaction Executed',
      value: executedTransactionCount?.toString()
    },
  ]

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
        {stats.map(stat => {
          return (
            <div className="stats shadow" key={stat.title}>
              <div className="stat">
                <div className="stat-title">{stat.title}</div>
                <div className="stat-value">{stat.value}</div>
                {stat.footer !== undefined && <div className="stat-desc">{stat.footer}</div>}
              </div>
            </div>
          )
        })}
      </div>

      <div className='mt-4'>
        <div>
          <table className="table table-fixed">
            <thead>
              <tr>
                <th className='w-2/12'></th>
                <th className='w-7/12'>Owner</th>
                <th className='w-3/12'>Billing</th>
              </tr>
            </thead>
            <tbody>
              {billingsOwner?.map((billingOwner, i) => {
                return (
                  <tr key={billingOwner.address}>
                    <th>{i + 1}</th>
                    <td>
                      <p className='truncate'>
                        <Link className='text-blue-300 hover:text-blue-400' href={'https://polygonscan.com/address/' + billingOwner.address} target='_blank'>
                          {billingOwner.address}
                        </Link>
                      </p>
                    </td>
                    <td>
                      <FormatRupiah value={billingOwner.billing}></FormatRupiah>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
};

export default Home;
