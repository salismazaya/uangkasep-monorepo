from pymongo import AsyncMongoClient
import os, asyncio

client = AsyncMongoClient(os.environ['MONGO_URI'])
db = client.get_database('uangkasep')

async def setup_database():
    await asyncio.gather(
        db.get_collection('transactions_action').create_index(('sender', 'transactionId'), unique = True),
        db.get_collection('transactions').create_index(('transactionId',), unique = True),
    )