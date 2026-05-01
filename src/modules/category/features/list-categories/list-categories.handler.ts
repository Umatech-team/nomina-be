import { Category } from '@modules/category/entities/Category';
import { CategoryRepository } from '@modules/category/repositories/contracts/CategoryRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, right } from '@shared/core/errors/Either';
import { ListCategoriesRequest } from './list-categories.dto';

type Request = ListCategoriesRequest & Pick<TokenPayloadSchema, 'sub'>;
type Response = {
  categories: Category[];
  total: number;
};

@Injectable()
export class ListCategoriesService implements Service<
  Request,
  Error,
  Response
> {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute({
    sub,
    page,
    pageSize,
    type,
  }: Request): Promise<Either<Error, Response>> {
    const { categories, total } =
      await this.categoryRepository.findManyByWorkspaceId(
        sub,
        { type },
        page,
        pageSize,
      );

    return right({
      categories,
      total,
    });
  }
}
