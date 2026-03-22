import { Injectable } from '@nestjs/common';
import { EmployeeProvider } from '../domain/employee-provider.interface';
import { EmployeeSearchInput, EmployeeSearchResponseDto } from '../interface/dto/employee.dto';

@Injectable()
export class EmployeeService {
  constructor(private readonly provider: EmployeeProvider) {}

  async searchEmployees(input: EmployeeSearchInput): Promise<EmployeeSearchResponseDto> {
    return this.provider.search(input);
  }
}
