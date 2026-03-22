import { Resolver, Query, Args } from '@nestjs/graphql';
import { EmployeeService } from '../../application/employee.service';
import { EmployeeSearchResponseDto, EmployeeSearchInput } from '../dto/employee.dto';

@Resolver()
export class EmployeeResolver {
  constructor(private readonly employeeService: EmployeeService) {}

  @Query(() => EmployeeSearchResponseDto)
  async searchEmployees(
    @Args('input') input: EmployeeSearchInput,
  ): Promise<EmployeeSearchResponseDto> {
    return this.employeeService.searchEmployees(input);
  }
}
