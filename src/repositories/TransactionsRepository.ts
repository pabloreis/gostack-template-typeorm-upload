import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    const categoriesRepository = getRepository(Category);
    const categories = await categoriesRepository.find();

    const { income, outcome } = transactions.reduce(
      (acc: Balance, transaction: Transaction) => {
        const transactionType: { income: Function; outcome: Function } = {
          income: (): void => {
            acc.income += Number(transaction.value);
          },
          outcome: (): void => {
            acc.outcome += Number(transaction.value);
          },
        };

        transactionType[transaction.type]();

        return acc;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    const total = income - outcome;

    return { income, outcome, total };
  }
}

export default TransactionsRepository;
