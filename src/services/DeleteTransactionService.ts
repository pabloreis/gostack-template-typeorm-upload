import { getCustomRepository } from 'typeorm';

import TransactionRepository from '../repositories/TransactionsRepository';

import AppError from '../errors/AppError';

class DeleteTransactionService {
  public async execute(transactionId: string): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionRepository);

    const transaction = await transactionRepository.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new AppError('The transaction ID is invalid or does not exist!');
    }

    await transactionRepository.remove(transaction);
  }
}

export default DeleteTransactionService;
