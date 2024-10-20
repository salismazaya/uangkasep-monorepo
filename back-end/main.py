from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Depends, Response
from pydantic import BaseModel
from fastapi.security import APIKeyHeader
from eth_account.messages import encode_defunct
from helpers.database import db, setup_database
from datetime import datetime
from web3 import Web3
import asyncio

app = FastAPI()

w3 = Web3()

api_key_scheme = APIKeyHeader(name = 'x-signature')
expired_scheme = APIKeyHeader(name = 'x-expired')

asyncio.run(setup_database())

@app.put('/transactions/{transactionId}/reject')
async def reject_transaction(transactionId: int, response: Response, signature: str = Depends(api_key_scheme), expired: int = Depends(expired_scheme)):
    try:
        now = datetime.now()
        expected_message = f"Reject transaction for id {transactionId} expire at {expired}"
        message = encode_defunct(text = expected_message)
        if not signature.startswith('0x'):
            signature = '0x' + signature

        signer = w3.eth.account.recover_message(message, signature = signature)

        if await db.get_collection('transactions').find_one({
            'transactionId': transactionId
        }) is None:
            response.status_code = 404
            return {'status': 404, 'detail': 'Transaction Not Found'}

        is_updated = await db.get_collection('transactions_action').find_one_and_replace({
            'sender': w3.to_checksum_address(signer),
            'transactionId': transactionId,
        }, {
            'updated': now,
            'status': 'reject',
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