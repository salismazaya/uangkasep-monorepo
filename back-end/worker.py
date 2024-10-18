
from dotenv import load_dotenv

load_dotenv()

from web3 import AsyncWeb3
from abis.multisigAbi import multisigAbi
from helpers.database import db, setup_database
from datetime import datetime
import asyncio, os

w3 = AsyncWeb3(AsyncWeb3.AsyncHTTPProvider(os.environ['RPC_URL']))
multisigContract = w3.eth.contract(os.environ['MULTISIG_ADDRESS'], abi = multisigAbi)

semaphore = asyncio.Semaphore(10)
semaphore_database = asyncio.Semaphore(15)

async def execute_multisig_events(from_block, to_block):
    kwargs = {
        'from_block': from_block,
        'to_block': to_block
    }
    
    task_logs_submission = multisigContract.events.Submission().get_logs(**kwargs)
    task_logs_confirmation = multisigContract.events.Confirmation().get_logs(**kwargs)
    task_logs_revocation = multisigContract.events.Revocation().get_logs(**kwargs)
    task_logs_execution = multisigContract.events.Execution().get_logs(**kwargs)
    task_logs_execution_failure = multisigContract.events.ExecutionFailure().get_logs(**kwargs)
    # task_logs_deposit = multisigContract.events.Deposit().get_logs(**kwargs)
    # task_logs_owner_addition = multisigContract.events.OwnerAddition().get_logs(**kwargs)
    # task_logs_owner_removal = multisigContract.events.OwnerRemoval().get_logs(**kwargs)
    # task_logs_requirement_change = multisigContract.events.RequirementChange().get_logs(**kwargs)

    async with semaphore:
        logs_submission, logs_confirmation, logs_revocation, \
        logs_execution, logs_execution_failure = await asyncio.gather(
            task_logs_submission,
            task_logs_confirmation,
            task_logs_revocation,
            task_logs_execution,
            task_logs_execution_failure,
        )
    
    # now = datetime.now()

    # tasks = []
    # submission_documents = []
    # for log_submission in logs_submission:
    #     submission_documents.append({
    #         'transactionId': log_submission.args.transactionId,
    #         'status': 'waiting',
    #         'created': now,
    #         'updated': now,
    #     })
    
    # if submission_documents:
    #     await db.get_collection('transactions').insert_many(submission_documents)
        
    # for log_confirmation in logs_confirmation:
    #     document = {
    #         'sender': log_confirmation.args.sender,
    #         'transactionId': log_confirmation.args.transactionId,
    #         'action': 'accept',
    #         'created': now,
    #         'updated': now,
    #     }

    #     async def create_task():
    #         async with semaphore_database:
    #             updated_count = await db.get_collection('transactions_action').find_one_and_update({
    #                 'sender': log_confirmation.args.sender,
    #                 'transactionId': log_confirmation.args.transactionId,
    #             }, {
    #                 'action': 'accept',
    #                 'updated': now
    #             })

    #             if updated_count == 0:
    #                 await db.get_collection('transactions_action').insert_one(document)

    #     tasks.append(create_task())

    # for log_revocation in logs_revocation:
    #     document = {
    #         'sender': log_revocation.args.sender,
    #         'transactionId': log_revocation.args.transactionId,
    #         'action': 'revoke',
    #         'created': now,
    #         'updated': now,
    #     }
        
    #     async def create_task():
    #        async with semaphore_database:
    #             updated_count = await db.get_collection('transactions_action').find_one_and_update({
    #                 'sender': log_revocation.args.sender,
    #                 'transactionId': log_revocation.args.transactionId,
    #             }, {
    #                 'action': 'revoke',
    #                 'updated': now
    #             })

    #             if updated_count == 0:
    #                 await db.get_collection('transactions_action').insert_one(document)

    #     tasks.append(create_task())

    # for log_execution in logs_execution:
    #     task = db.get_collection('transactions').find_one_and_update(
    #         {'transactionId': log_execution.args.transactionId},
    #         {'status': 'executed'}
    #     )
    #     tasks.append(task)

    # for log_execution_failure in logs_execution_failure:
    #     task = db.get_collection('transactions').find_one_and_update(
    #         {'transactionId': log_execution_failure.args.transactionId},
    #         {'status': 'failure'}
    #     )
    #     tasks.append(task)

    # async with semaphore_database:
    #     await asyncio.gather(*tasks)

async def main():
    await setup_database()
    data_collection = db.get_collection('data')

    while True:
        raw_block_number = await data_collection.find_one({'key': 'block_number'})
        if raw_block_number is None:
            async with semaphore:
                from_block = await w3.eth.block_number
        else:
            from_block = int(raw_block_number['value'])

        async with semaphore:
            to_block = await w3.eth.block_number

        await asyncio.gather(
            execute_multisig_events(from_block, to_block),
        )

        await data_collection.find_one_and_replace({'key':'block_number'}, {'value': str(to_block)})
        await asyncio.sleep(1)

asyncio.run(main())