from dotenv import load_dotenv

load_dotenv()

from web3 import AsyncWeb3
from helpers.database import db, setup_database
from datetime import datetime
from eth_abi.abi import decode
import asyncio, os, traceback

async def main():
    await setup_database()
    data_collection = db.get_collection('data')

    async with AsyncWeb3(AsyncWeb3.WebSocketProvider(os.environ['WSS_RPC_URL'])) as w3:
        raw_block_number = await data_collection.find_one({'key': 'block_number'})
        if raw_block_number is None:
            from_block = await w3.eth.block_number
        else:
            from_block = int(raw_block_number['value'])
        
        filter_params = {
            'address': [os.environ['MULTISIG_ADDRESS']],
            'fromBlock': from_block
        }

        submission_hash = w3.keccak(text = "Submission(uint256)")
        confirmation_hash = w3.keccak(text = "Confirmation(address,uint256)")
        revocation_hash = w3.keccak(text = "Revocation(address,uint256)")
        execution_hash = w3.keccak(text = "Execution(uint256)")
        execution_failure_hash = w3.keccak(text = "ExecutionFailure(uint256)")
        
        await asyncio.gather(
            w3.eth.subscribe("newHeads"),
            w3.eth.subscribe("logs", filter_params)
        )

        async for payload in w3.socket.process_subscriptions():
            now = datetime.now()
            result = payload["result"]
            if result.get('miner'): # check is log about new block
                block_number = result['number']
                if block_number.startswith('0x'):
                    block_number = str(int(block_number, 16))
                else:
                    block_number = str(block_number)

                await data_collection.find_one_and_replace({'key':'block_number'}, {'value': block_number})  
                continue
            
            topics = result['topics']
            event_hash = topics[0]
            arguments = topics[1:]

            try:
                if event_hash == submission_hash:
                    await db.get_collection('transactions').insert_one({
                        'transactionId': decode(['uint256'], arguments[0])[0],
                        'status': 'waiting',
                        'created': now,
                        'updated': None,
                    })

                elif event_hash == execution_hash:
                    await db.get_collection('transactions').find_one_and_replace({
                        'transactionId': decode(['uint256'], arguments[0])[0]
                    }, {
                        'updated': now,
                        'status': 'executed'
                    })

                elif event_hash == execution_failure_hash:
                    await db.get_collection('transactions').find_one_and_replace({
                        'transactionId': decode(['uint256'], arguments[0])[0]
                    }, {
                        'updated': now,
                        'status': 'failure'
                    })

                elif event_hash == confirmation_hash:
                    is_updated = await db.get_collection('transactions_action').find_one_and_replace({
                        'sender': decode(['address'], arguments[0])[0],
                        'transactionId': decode(['uint256'], arguments[1])[0],
                    }, {
                        'updated': now,
                        'status': 'accept',
                    })

                    if is_updated is None:
                        await db.get_collection('transactions_action').insert_one({
                            'sender': decode(['address'], arguments[0])[0],
                            'transactionId': decode(['uint256'], arguments[1])[0],
                            'status': 'accept',
                            'created': now,
                            'updated': None,
                        })

                elif event_hash == revocation_hash:
                    is_updated = await db.get_collection('transactions_action').find_one_and_replace({
                        'sender': decode(['address'], arguments[0])[0],
                        'transactionId': decode(['uint256'], arguments[1])[0],
                    }, {
                        'updated': now,
                        'status': 'revoke',
                    })

                    if is_updated is None:
                        await db.get_collection('transactions_action').insert_one({
                            'transactionId': decode(['uint256'], arguments[0])[0],
                            'sender': decode(['address'], arguments[1])[0],
                            'status': 'revoke',
                            'created': now,
                            'updated': None,
                        })
            except:
                traceback.print_exc()

asyncio.run(main())