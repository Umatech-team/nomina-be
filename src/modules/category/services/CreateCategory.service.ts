import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { CreateCategoryDTO } from '../dto/CreateCategoryDTO';
import { Category } from '../entities/Category';
import { InvalidCategoryError } from '../errors/InvalidCategoryError';
import { CategoryRepository } from '../repositories/contracts/CategoryRepository';

type Request = CreateCategoryDTO & Pick<TokenPayloadSchema, 'sub'>;

type Errors = InvalidCategoryError;

type Response = {
  category: Category;
};

@Injectable()
export class CreateCategoryService
  implements Service<Request, Errors, Response>
{
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute({
    name,
    sub,
    color,
    icon,
    parentId,
    type,
  }: Request): Promise<Either<Errors, Response>> {
    const categoryNameAlreadyExists =
      await this.categoryRepository.findByNameAndWorkspaceId(name, sub);

    if (categoryNameAlreadyExists) {
      return left(
        new InvalidCategoryError(
          'Já existe uma categoria com esse nome no seu espaço.',
        ),
      );
    }

    const categoryOrError = Category.create({
      workspaceId: sub,
      name,
      color,
      icon,
      parentId,
      type,
      isSystemCategory: false,
    });

    if (categoryOrError.isLeft()) {
      return left(categoryOrError.value);
    }

    const category = await this.categoryRepository.create(
      categoryOrError.value,
    );

    return right({
      category,
    });
  }
}
