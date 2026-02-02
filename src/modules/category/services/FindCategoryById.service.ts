import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { FindCategoryByIdDTO } from '../dto/FindCategoryByIdDTO';
import { Category } from '../entities/Category';
import { CategoryNotFoundError } from '../errors/CategoryNotFoundError';
import { CategoryRepository } from '../repositories/contracts/CategoryRepository';

type Request = FindCategoryByIdDTO & Pick<TokenPayloadSchema, 'sub'>;

type Errors = CategoryNotFoundError;

type Response = {
  category: Category;
};

@Injectable()
export class FindCategoryByIdService
  implements Service<Request, Errors, Response>
{
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute({
    categoryId,
    sub,
  }: Request): Promise<Either<Errors, Response>> {
    const category = await this.categoryRepository.findById(categoryId);

    if (!category) {
      return left(new CategoryNotFoundError());
    }

    if (category.workspaceId !== sub) {
      return left(new CategoryNotFoundError());
    }

    return right({
      category,
    });
  }
}
