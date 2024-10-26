from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Depends, Response, Request
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
from pydantic import BaseModel
from fastapi.security import APIKeyHeader
from eth_account.messages import encode_defunct
from helpers.database import db, setup_database
from abis.kasepAbi import kasepAbi
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from redis.asyncio import Redis
from web3 import AsyncWeb3
import os

r = Redis.from_url(os.environ['REDIS_URL'])

w3 = AsyncWeb3(AsyncWeb3.AsyncHTTPProvider(os.environ['RPC_URL']))

kasep_contract = w3.eth.contract(os.environ['KASEP_ADDRESS'], abi = kasepAbi)

api_key_scheme = APIKeyHeader(name = 'x-signature')
expired_scheme = APIKeyHeader(name = 'x-expired')

app = FastAPI()

@app.on_event('startup')
async def setup():
    await setup_database()
    redis_connection = Redis.from_url(os.environ['REDIS_URL'], encoding = 'utf-8', decode_responses = True)
    await FastAPILimiter.init(redis_connection)

origins = os.environ['CORS_ORIGINS'].split(',')

app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_methods = ['PUT', 'POST', 'GET'],
    allow_headers = ['*'],
)

async def ip_identifier(request: Request):
    real_ip = request.headers.get('X-Real-IP')
    return real_ip

dependencies = [Depends(RateLimiter(times = 30, seconds = 60, identifier = ip_identifier))]

@app.get('/transactions', dependencies = dependencies)
async def get_transactions():
    owners = await kasep_contract.functions.getOwners().call()
    required = await kasep_contract.functions.required().call()

    owners_query = []

    for owner in owners:
        owners_query.append({'sender': w3.to_checksum_address(owner)})

    result = []
    
    async for transaction in db.get_collection('transactions')\
        .find({}, {'_id': False})\
        .sort({'created': -1}):

        total_accept = await db.get_collection('transactions_action').count_documents({
            '$and': [
                {'status': 'accept'},
                {'transactionId': transaction['transactionId']},
                {'$or': owners_query}
            ]
        })
        total_reject = await db.get_collection('transactions_action').count_documents({
            '$and': [
                {'status': 'reject'},
                {'transactionId': transaction['transactionId']},
                {'$or': owners_query}
            ]
        })
        total_pending = len(owners) - total_accept - total_reject
        if total_pending < 0:
            total_pending = 0

        if transaction['status'] == 'executed' and required > total_accept:
            required = total_accept

        status = transaction['status']
        if required % 2 == 0:
            if total_reject >= required // 2:
                status = 'rejected'
        else:
            if total_reject >= required // 2 + 1:
                status = 'rejected'

        data = {}
        data['transactionId'] = transaction['transactionId']
        data['destination'] = transaction['destination']
        data['value'] = transaction['value']
        data['data'] = transaction['data']
        data['total_accept'] = total_accept
        data['total_reject'] = total_reject
        data['total_pending'] = total_pending
        data['total_accept_required'] = required
        data['created'] = transaction['created']
        data['status'] = status
        result.append(data)

    return result


@app.get('/transactions/{transaction_id}', dependencies = dependencies)
async def get_transaction_detail(transaction_id: int, response: Response):
    transaction = await db.get_collection('transactions').find_one({'transactionId': transaction_id})

    if transaction is None:
        response.status_code = 404
        return {'status': 404, 'detail': 'Transaction not found'}

    owners = await kasep_contract.functions.getOwners().call()
    required = await kasep_contract.functions.required().call()

    owners_query = []

    accept_owners = []
    reject_owners = []
    pending_owners = []

    for owner in owners:
        owners_query.append({'sender': w3.to_checksum_address(owner)})

    async for _transaction in db.get_collection('transactions_action').find({
        '$and': [
            {'status': 'accept'},
            {'transactionId': transaction['transactionId']},
            {'$or': owners_query}
        ]
    }, {'sender': True}):
        accept_owners.append(_transaction['sender'])
    
    async for _transaction in db.get_collection('transactions_action').find({
        '$and': [

            {'status': 'reject'},
            {'transactionId': transaction['transactionId']},
            {'$or': owners_query}
        ]
    }, {'sender': True}):
        reject_owners.append(_transaction['sender'])

    total_accept = await db.get_collection('transactions_action').count_documents({
        '$and': [
            {'status': 'accept'},
            {'transactionId': transaction['transactionId']},
            {'$or': owners_query}
        ]
    })
    total_reject = await db.get_collection('transactions_action').count_documents({
        '$and': [
            {'status': 'reject'},
            {'transactionId': transaction['transactionId']},
            {'$or': owners_query}
        ]
    })

    accept_and_reject_owners = accept_owners + reject_owners
    for _owner in owners:
        if not _owner in accept_and_reject_owners:
            pending_owners.append(_owner)

    total_pending = len(owners) - total_accept - total_reject
    if total_pending < 0:
        total_pending = 0

    status = transaction['status']
    if required % 2 == 0:
        if total_reject >= required // 2:
            status = 'rejected'
    else:
        if total_reject >= required // 2 + 1:
            status = 'rejected'
            
    data = {}
    data['transactionId'] = transaction['transactionId']
    data['destination'] = transaction['destination']
    data['value'] = transaction['value']
    data['data'] = transaction['data']
    data['total_accept'] = total_accept
    data['total_reject'] = total_reject
    data['total_pending'] = total_pending
    data['total_accept_required'] = required
    data['created'] = transaction['created']
    data['accept_owners'] = accept_owners
    data['reject_owners'] = reject_owners
    data['pending_owners'] = pending_owners
    data['status'] = status

    return data


@app.get('/transactions/{transactionId}/{address}')
async def get_transaction(transactionId: int, address: str, response: Response):
    try:
        address = w3.to_checksum_address(address)
    except:
        response.status_code = 400
        return {'status': 400, 'detail': 'address not valid'}
    
    transaction = await db.get_collection('transactions_action').find_one({
        'transactionId': transactionId,
        'sender': address
    })

    if transaction is None:
        return {'status': 200, 'detail': 'ok', 'data': {'status': 'waiting'}}
    
    return {'status': 200, 'detail': 'ok', 'data': {'status': transaction['status']}}


@app.put('/transactions/{transactionId}/reject')
async def reject_transaction(transactionId: int, response: Response, signature: str = Depends(api_key_scheme), expired: int = Depends(expired_scheme)):
    try:
        now = datetime.now()
        expected_message = f"Reject transaction for id {transactionId}. this message expire at {expired}"
        message = encode_defunct(text = expected_message)
        if not signature.startswith('0x'):
            signature = '0x' + signature

        signer = w3.eth.account.recover_message(message, signature = signature)

        if await db.get_collection('transactions').find_one({
            'transactionId': transactionId
        }) is None:
            response.status_code = 404
            return {'status': 404, 'detail': 'Transaction Not Found'}

        is_updated = await db.get_collection('transactions_action').find_one_and_update({
            'sender': w3.to_checksum_address(signer),
            'transactionId': transactionId,
        }, {
            '$set': {
                'updated': now,
                'status': 'reject',
            }
        })

        if is_updated is None:
            await db.get_collection('transactions_action').insert_one({
                'sender': w3.to_checksum_address(signer),
                'transactionId': transactionId,
                'status': 'reject',
                'created': now,
                'updated': None,
            })
        
        return {'status': 200, 'detail': 'Successfully Rejected'}
        
    except Exception as e:
        response.status_code = 400
        return {'status': 400, 'detail': str(e)}


class RegisterUserNameData(BaseModel):
    name: str


@app.post('/users/name')
async def register_user_name(address: str, response: Response, data: RegisterUserNameData, signature: str = Depends(api_key_scheme)):
    try:
        address_checksumed = w3.to_checksum_address(address)
        name = data.name
        now = datetime.now()

        expected_message = f"Register Name {name} For Address {address}"
        message = encode_defunct(text = expected_message)
        if not signature.startswith('0x'):
            signature = '0x' + signature

        signer = w3.eth.account.recover_message(message, signature = signature)
        await db.get_collection('users').insert_one({
            'owner_address': w3.to_checksum_address(signer),
            'address': address_checksumed,
            'name': None,
            'created': now
        })

        return {'status': 200, 'detail': 'Successfully Registered'}
        
    except Exception as e:
        response.status_code = 400
        return {'status': 400, 'detail': str(e)}