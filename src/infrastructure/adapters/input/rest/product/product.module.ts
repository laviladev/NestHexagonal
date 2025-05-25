import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { DomainModule } from '../../../../../domain/domain.module';
import { PersistenceModule } from '../../../output/persistence/persistence.module';

@Module({
  imports: [DomainModule, PersistenceModule],
  controllers: [ProductController],
})
export class ProductModule {}
