import { EmployeeSearchResponseDto, EmployeeSearchInput } from '../dto/employee-search.dto';

export abstract class EmployeeProvider {
  abstract search(input: EmployeeSearchInput): Promise<EmployeeSearchResponseDto>;
}
