from dotenv import load_dotenv

load_dotenv()

from web3 import AsyncWeb3
from web3.main import _PersistentConnectionWeb3
from web3.middleware.geth_poa import async_geth_poa_middleware
from web3.providers import WebsocketProviderV2
from helpers.database import db, setup_database
from datetime import datetime
from eth_abi.abi import decode
from abis.kasepAbi import kasepAbi
from zoneinfo import ZoneInfo
import asyncio, os, traceback

tz = ZoneInfo('UTC')


async def generator(w3: _PersistentConnectionWeb3):
    data_collection = db.get_collection('data')

    raw_block_number = await data_collection.find_one({'key': 'block_number'})
    if raw_block_number is None:
        from_block = await w3.eth.block_number
    else:
        from_block = int(raw_block_number['value'])

    filter_params = {
        'address': [os.environ['KASEP_ADDRESS']],
        'fromBlock': hex(from_block)
    }
    
    await asyncio.gather(
        w3.eth.subscribe('newHeads'),
        w3.eth.subscribe("logs", filter_params)
    )

    async for response in w3.ws.process_subscriptions():
        yield response

async def main():
    await setup_database()

    while True:
        try:
            async with AsyncWeb3.persistent_websocket(WebsocketProviderV2(os.environ['WSS_RPC_URL'])) as w3:
                w3.middleware_onion.inject(async_geth_poa_middleware, layer = 0)
                kasep_contract = w3.eth.contract(os.environ['KASEP_ADDRESS'], abi = kasepAbi)
                data_collection = db.get_collection('data')

                submission_hash = w3.keccak(text = "Submission(uint256)")
                confirmation_hash = w3.keccak(text = "Confirmation(address,uint256)")
                revocation_hash = w3.keccak(text = "Revocation(address,uint256)")
                execution_hash = w3.keccak(text = "Execution(uint256)")
                execution_failure_hash = w3.keccak(text = "ExecutionFailure(uint256)")
                
                async for payload in generator(w3):
                    now = datetime.now().astimezone(tz)
                    result = payload["result"]
                    if result.get('miner'): # check is log about new block
                        block_number = result['number']
                        if isinstance(result, str) and block_number.startswith('0x'):
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
                            transaction_id = decode(['uint256'], arguments[0])[0]
                            destination, value, data, _ = await kasep_contract.functions.transactions(transaction_id).call()

                            await db.get_collection('transactions').insert_one({
                                'transactionId': transaction_id,
                                'status': 'waiting',
                                'destination': destination,
                                'value': value,
                                'data': data.hex(),
                                'created': now,
                                'updated': None,
                            })

                        elif event_hash == execution_hash:
                            await db.get_collection('transactions').find_one_and_update({
                                'transactionId': decode(['uint256'], arguments[0])[0]
                            }, {
                                '$set': {
                                    'updated': now,
                                    'status': 'executed'
                                }
                            })

                        elif event_hash == execution_failure_hash:
                            await db.get_collection('transactions').find_one_and_update({
                                'transactionId': decode(['uint256'], arguments[0])[0]
                            }, {
                                '$set': {
                                    'updated': now,
                                    'status': 'failure'
                                }
                            })

                        elif event_hash == confirmation_hash:
                            is_updated = await db.get_collection('transactions_action').find_one_and_update({
                                'sender': w3.to_checksum_address(decode(['address'], arguments[0])[0]),
                                'transactionId': decode(['uint256'], arguments[1])[0],
                            }, {
                                '$set': {
                                    'updated': now,
                                    'status': 'accept',
                                }
                            })

                            if is_updated is None:
                                await db.get_collection('transactions_action').insert_one({
                                    'sender': w3.to_checksum_address(decode(['address'], arguments[0])[0]),
                                    'transactionId': decode(['uint256'], arguments[1])[0],
                                    'status': 'accept',
                                    'created': now,
                                    'updated': None,
                                })

                        elif event_hash == revocation_hash:
                            is_updated = await db.get_collection('transactions_action').find_one_and_update({
                                'sender': w3.to_checksum_address(decode(['address'], arguments[0])[0]),
                                'transactionId': decode(['uint256'], arguments[1])[0],
                            }, {
                                '$set': {
                                    'updated': now,
                                    'status': 'revoke',
                                }
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
        except:
            traceback.print_exc()
asyncio.run(main())