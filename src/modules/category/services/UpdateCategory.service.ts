import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UpdateCategoryDTO } from '../dto/UpdateCategoryDTO';
import { Category } from '../entities/Category';
import { CategoryNotFoundError } from '../errors/CategoryNotFoundError';
import { ConflictCategoryError } from '../errors/ConflictCategoryError';
import { InvalidCategoryError } from '../errors/InvalidCategoryError';
import { SystemCategoryCannotBeModifiedError } from '../errors/SystemCategoryCannotBeModifiedError';
import { CategoryRepository } from '../repositories/contracts/CategoryRepository';

type Request = UpdateCategoryDTO &
  Pick<TokenPayloadSchema, 'sub'> & { categoryId: string };

type Errors =
  | CategoryNotFoundError
  | ConflictCategoryError
  | InvalidCategoryError
  | SystemCategoryCannotBeModifiedError;

type Response = {
  category: Category;
};

@Injectable()
export class UpdateCategoryService
  implements Service<Request, Errors, Response>
{
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute({
    categoryId,
    name,
    sub,
    color,
    icon,
    parentId,
    type,
  }: Request): Promise<Either<Errors, Response>> {
    // Verificar se a categoria existe e pertence ao workspace
    const category = await this.categoryRepository.findById(categoryId);

    if (!category) {
      return left(new CategoryNotFoundError());
    }

    if (category.workspaceId !== sub) {
      return left(new CategoryNotFoundError());
    }

    // Impedir modificação de categorias do sistema
    if (category.isSystemCategory) {
      return left(new SystemCategoryCannotBeModifiedError());
    }

    // Validar se o parentId mudou e prevenir auto-referência
    if (parentId !== undefined && parentId === categoryId) {
      return left(
        new InvalidCategoryError(
          'Uma categoria não pode ser sua própria categoria pai.',
        ),
      );
    }

    // Validar hierarquia circular se parentId foi alterado
    if (parentId !== undefined && parentId !== null) {
      const isValidHierarchy = await this.validateHierarchy(
        categoryId,
        parentId,
      );
      if (!isValidHierarchy) {
        return left(
          new InvalidCategoryError(
            'Hierarquia circular detectada. Uma categoria não pode ser filha de suas próprias subcategorias.',
          ),
        );
      }

      // Validar se o novo parent existe e pertence ao mesmo workspace
      const parentCategory = await this.categoryRepository.findById(parentId);
      if (!parentCategory) {
        return left(
          new InvalidCategoryError('A categoria pai especificada não existe.'),
        );
      }

      if (parentCategory.workspaceId !== sub) {
        return left(
          new InvalidCategoryError(
            'A categoria pai não pertence ao mesmo workspace.',
          ),
        );
      }
    }

    // Verificar conflito de nome (mesma name + type + parentId no workspace)
    if (name && (name !== category.name || type !== category.type)) {
      const existingCategory =
        await this.categoryRepository.findByNameTypeAndWorkspace(
          name || category.name,
          type || category.type,
          sub,
          parentId !== undefined ? parentId : category.parentId,
        );

      if (existingCategory && existingCategory.id !== categoryId) {
        return left(
          new ConflictCategoryError(
            'Já existe uma categoria com esse nome, tipo e categoria pai neste workspace.',
          ),
        );
      }
    }

    // Atualizar propriedades
    if (name) category.name = name;
    if (icon !== undefined) category.icon = icon;
    if (color !== undefined) category.color = color;
    if (type) category.type = type;
    if (parentId !== undefined) category.parentId = parentId;

    const updatedCategory = await this.categoryRepository.update(category);

    return right({
      category: updatedCategory,
    });
  }

  private async validateHierarchy(
    categoryId: string,
    newParentId: string,
  ): Promise<boolean> {
    let currentParent = await this.categoryRepository.findById(newParentId);

    while (currentParent) {
      if (currentParent.id === categoryId) {
        return false; // Circular reference detected
      }

      if (!currentParent.parentId) {
        break;
      }

      currentParent = await this.categoryRepository.findById(
        currentParent.parentId,
      );
    }

    return true;
  }
}
