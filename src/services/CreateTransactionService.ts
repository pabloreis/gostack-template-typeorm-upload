import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);
    const { total } = await transactionRepository.getBalance();

    if (!['income', 'outcome'].includes(type)) {
      throw new AppError('Invalid type!');
    }

    if (type === 'outcome' && total < value) {
      throw new AppError('Your balance is insufficient!');
    }

    const findCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    let categoryObj: Category | undefined = findCategory;

    if (!categoryObj) {
      const createCategory = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(createCategory);

      categoryObj = createCategory;
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: categoryObj,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
