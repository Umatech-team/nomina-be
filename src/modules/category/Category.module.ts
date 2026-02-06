import { DatabaseModule } from '@infra/databases/Database.module';
import { Module } from '@nestjs/common';
import { CreateCategoryController } from './controllers/CreateCategory.controller';
import { DeleteCategoryController } from './controllers/DeleteCategory.controller';
import { FindCategoryController } from './controllers/FindCategory.controller';
import { ListCategoriesController } from './controllers/ListCategories.controller';
import { UpdateCategoryController } from './controllers/UpdateCategory.controller';
import { CreateCategoryService } from './services/CreateCategory.service';
import { DeleteCategoryService } from './services/DeleteCategory.service';
import { FindCategoryByIdService } from './services/FindCategoryById.service';
import { ListCategoriesService } from './services/ListCategories.service';
import { UpdateCategoryService } from './services/UpdateCategory.service';

@Module({
  imports: [DatabaseModule],
  controllers: [
    CreateCategoryController,
    UpdateCategoryController,
    DeleteCategoryController,
    FindCategoryController,
    ListCategoriesController,
  ],
  providers: [
    CreateCategoryService,
    UpdateCategoryService,
    DeleteCategoryService,
    FindCategoryByIdService,
    ListCategoriesService,
  ],
  exports: [FindCategoryByIdService, ListCategoriesService],
})
export class CategoryModule {}
