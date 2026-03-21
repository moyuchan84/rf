import { Injectable } from '@nestjs/common';
import { EmployeeProvider } from '../../../common/interfaces/employee-provider.interface';
import { EmployeeSearchInput, EmployeeSearchResponseDto } from '../../../common/dto/employee-search.dto';

@Injectable()
export class EmployeeService {
  constructor(private readonly provider: EmployeeProvider) {}

  async searchEmployees(input: EmployeeSearchInput): Promise<EmployeeSearchResponseDto> {
    return this.provider.search(input);
  }
}
