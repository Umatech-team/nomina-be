import { DatabaseModule } from '@infra/databases/Database.module';
import { Module } from '@nestjs/common';
import { ListCategoriesController } from './features/list-categories/list-categories.controller';
import { ListCategoriesHandler } from './features/list-categories/list-categories.handler';

@Module({
  imports: [DatabaseModule],
  controllers: [ListCategoriesController],
  providers: [ListCategoriesHandler],
  exports: [ListCategoriesHandler],
})
export class CategoryModule {}
