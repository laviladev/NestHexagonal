// src/infrastructure/adapters/output/persistence/typeorm/transaction.repository.adapter.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';
import { Transaction } from '../../../../../domain/models/transaction.entity'; // Entidad de Dominio
import { CreateTransactionDto } from '../../../../adapters/input/rest/transaction/dto/create.transaction.dto'; // DTO
import { IRepository } from '../../../../../domain/ports/output/index.repository.port'; // El puerto general

@Injectable()
export class TypeORMTransactionRepositoryAdapter implements IRepository<Transaction, CreateTransactionDto> {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionTypeOrmRepository: Repository<Transaction>, // Repositorio TypeORM real para Transaction
  ) {}

  async save(entity: CreateTransactionDto | Transaction): Promise<Transaction> {
    const transactionToSave = this.transactionTypeOrmRepository.create(entity);
    return this.transactionTypeOrmRepository.save(transactionToSave);
  }

  async findOne(filter: FindOneOptions<Transaction>): Promise<Transaction | null> {
    return this.transactionTypeOrmRepository.findOne(filter);
  }

  async find(filter?: FindManyOptions<Transaction>): Promise<Transaction[]> {
    return this.transactionTypeOrmRepository.find(filter);
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.transactionTypeOrmRepository.findOne({ where: { id } });
  }

  async update(id: string, entity: Transaction): Promise<Transaction | undefined> {
    const transaction = await this.transactionTypeOrmRepository.findOne({ where: { id } });
    if (!transaction) {
      return undefined;
    }
    Object.assign(transaction, entity);
    return this.transactionTypeOrmRepository.save(transaction);
  }

  async remove(entity: Transaction): Promise<void> {
    await this.transactionTypeOrmRepository.remove(entity);
  }
}
