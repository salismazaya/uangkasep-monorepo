'use client'

import { useClientOnceOnly, useGetBill } from '../hooks'
import { useAccount } from 'wagmi'
import OwnersComponent from '../components/OwnersComponent'
import VotingRequiredComponent from '../components/VotingRequiredComponent'
import SubmittedTransactionComponent from '../components/SubmittedTransactionComponent'
import PendingTransactionComponent from '../components/PendingTransactionComponent'
import ExecutedTransactionComponent from '../components/ExecutedTransactionComponent'
import MyWbtcBalanceComponent from '../components/MyWbtcBalanceComponent'
import { contractExecutor } from '@/helpers/ethers'
import { readContract, writeContract } from 'wagmi/actions'
import config from '@/wagmi'
import kasepAbi from '@/abis/kasep.abi'
import { wbtcAddress, kasepAddress } from '@/variables'
import { ContractType, register } from '@/helpers/realtime'
import erc20Abi from '@/abis/erc20.abi'
import AmountPerMonthComponent from '@/components/AmountPerMonthComponent'
import { useEffect, useState } from 'react'
import WbtcBalanceComponent from '@/components/WbtcBalanceComponent'
import BitcoinValueComponent from '@/components/BitcoinValueComponent'

const Home = () => {
  const { address } = useAccount()
  const { bill, refetch } = useGetBill(address)

  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const pay = async () => {
    const allowance = await readContract(config, {
      abi: erc20Abi,
      address: wbtcAddress,
      functionName: 'allowance',
      args: [address, kasepAddress]
    })

    const amount = await readContract(config, {
      abi: kasepAbi,
      address: kasepAddress,
      functionName: 'getBill',
      args: [address]
    })

    // const amount_with_decimals = BigInt(amount as bigint / BigInt(10 ** 8))

    if (Number(allowance) < Number(amount)) {
      await contractExecutor(async () => {
        const hash = await writeContract(config, {
          abi: erc20Abi,
          address: wbtcAddress,
          functionName: 'approve',
          args: [kasepAddress, Number(amount)]
        })
        return hash
      })
    }

    await contractExecutor(async () => {
      const hash = await writeContract(config, {
        abi: kasepAbi,
        address: kasepAddress,
        functionName: 'payBill'
      })
      return hash
    })
  }

  useClientOnceOnly(() => {
    register({
      contract: ContractType.KASEP,
      abi: 'BillPaid(owner,to,amount)',
      callback: refetch
    })
  })

  return (
    <>
      <div className='grid grid-cols-1 lg:grid-cols-2 mt-3 gap-2'>
        <div className="stats shadow shadow-blue-300 w-full mt-3">
          <div className="stat">
            <div className="stat-title">Your Bill</div>
            <div className="stat-value">
              <BitcoinValueComponent value={bill} />
            </div>
            <div className="stat-desc">
              {isClient && address !== undefined && bill > 0 && <button className='btn btn-primary mt-3 text-lg px-8 py-1' onClick={pay}>Pay</button>}
              {isClient && (address === undefined || bill <= 0) && <button className='btn btn-primary btn-disabled mt-3 text-lg px-8 py-1'>Pay</button>}
            </div>
          </div>
        </div>

        <MyWbtcBalanceComponent />
      </div>

      <div className='grid grid-cols-2 lg:grid-cols-4 mt-3 gap-2'>
        <WbtcBalanceComponent />
        <AmountPerMonthComponent />
        <OwnersComponent />
        <VotingRequiredComponent />
        <SubmittedTransactionComponent />
        <PendingTransactionComponent />
        <ExecutedTransactionComponent />
      </div>
    </>
  )
}

export default Home
