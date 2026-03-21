import { Injectable } from '@nestjs/common';
import { EmployeeProvider } from '../../common/interfaces/employee-provider.interface';
import { EmployeeSearchResponseDto, EmployeeSearchInput } from '../../common/dto/employee-search.dto';

@Injectable()
export class DevEmployeeProvider extends EmployeeProvider {
  async search(input: EmployeeSearchInput): Promise<EmployeeSearchResponseDto> {
    // Local mock data for development
    const mockEmployees = [
      {
        epId: '12345678',
        fullName: '홍길동',
        userId: 'ghdrlfthd',
        departmentName: 'Photo기술팀',
        emailAddress: 'hong.gildong@samsung.com',
      },
      {
        epId: '87654321',
        fullName: '김영희',
        userId: 'younghee.kim',
        departmentName: 'Align공정팀',
        emailAddress: 'younghee.kim@samsung.com',
      },
      {
        epId: '11223344',
        fullName: '이철수',
        userId: 'cheolsu.lee',
        departmentName: 'Overlay분석팀',
        emailAddress: 'cheolsu.lee@samsung.com',
      },
    ];

    const filtered = mockEmployees.filter((emp) => {
      const q = input.query.toLowerCase();
      if (input.condition === 'FullName') return emp.fullName.includes(q);
      if (input.condition === 'Organization') return emp.departmentName.toLowerCase().includes(q);
      if (input.condition === 'Title') return true; // Mock: title always matches
      return true;
    });

    return {
      result: 'SUCCESS',
      currentPage: 1,
      totalPage: 1,
      totalCount: filtered.length,
      employees: filtered,
    };
  }
}
