import { DatabaseModule } from '@infra/databases/Database.module';
import { Module } from '@nestjs/common';
import { ListCategoriesController } from './features/list-categories/list-categories.controller';
import { ListCategoriesService } from './features/list-categories/list-categories.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ListCategoriesController],
  providers: [ListCategoriesService],
  exports: [ListCategoriesService],
})
export class CategoryModule {}
