import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from '../../application/auth.service';
import { UserType, RoleType, PaginatedUsers } from '../dto/user.type';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { RoleName } from '../../domain/role.enum';

@Resolver()
@UseGuards(GqlAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class UserManagementResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => PaginatedUsers, { name: 'users' })
  async findAllUsers(
    @Args('search', { type: () => String, nullable: true }) search?: string,
    @Args('skip', { type: () => Int, defaultValue: 0 }) skip: number = 0,
    @Args('take', { type: () => Int, defaultValue: 10 }) take: number = 10,
  ) {
    return this.authService.findAllUsers(search, skip, take);
  }

  @Query(() => [RoleType], { name: 'roles' })
  async findAllRoles() {
    return this.authService.findAllRoles();
  }

  @Mutation(() => UserType)
  async updateUserRole(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('roleId', { type: () => Int }) roleId: number,
  ) {
    return this.authService.updateUserRole(userId, roleId);
  }
}
