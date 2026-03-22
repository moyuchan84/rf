import { EmployeeSearchResponseDto, EmployeeSearchInput } from '../interface/dto/employee.dto';

export abstract class EmployeeProvider {
  abstract search(input: EmployeeSearchInput): Promise<EmployeeSearchResponseDto>;
}
