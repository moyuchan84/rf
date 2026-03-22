import { Injectable } from '@nestjs/common';
import { EmployeeProvider } from '../../common/interfaces/employee-provider.interface';
import { EmployeeSearchResponseDto, EmployeeSearchInput } from '../../common/dto/employee-search.dto';

@Injectable()
export class DevEmployeeProvider extends EmployeeProvider {
  async search(input: EmployeeSearchInput): Promise<EmployeeSearchResponseDto> {
    const firstNames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '전', '홍'];
    const lastNames = ['민준', '서준', '도윤', '예준', '시우', '하준', '주원', '지호', '지후', '준서', '서연', '서윤', '지우', '서현', '하은', '하윤', '민서', '지유', '윤서', '채원'];
    const depts = [
      'Photo기술팀', 'Align공정팀', 'Overlay분석팀', '계측기술파트', 
      'EUV운영팀', '설비기술1팀', '소자개발그룹', 'Inno혁신팀',
      'QA품질보증', '메모리제조센터', '파운드리사업부', '시스템LSI'
    ];
    
    const mockEmployees: any[] = [];
    let idCounter = 10000000;

    // 1. Generate standard unique employees (~400)
    firstNames.forEach((f, fIdx) => {
      lastNames.forEach((l, lIdx) => {
        const fullName = f + l;
        const dept = depts[(fIdx + lIdx) % depts.length];
        const userId = `${fIdx}${lIdx}${idCounter % 1000}`;
        
        mockEmployees.push({
          epId: idCounter.toString(),
          fullName: fullName,
          userId: `user.${userId}`,
          departmentName: dept,
          emailAddress: `user.${userId}@samsung.com`,
        });
        idCounter++;
      });
    });

    // 2. Explicitly add "Common Names" across ALL departments to test secondary filtering
    const commonNames = ['김삼성', '이철수', '박지민', '최현우', '홍길동'];
    commonNames.forEach((name, nIdx) => {
      depts.forEach((dept, dIdx) => {
        const userId = `common.${nIdx}.${dIdx}`;
        mockEmployees.push({
          epId: (20000000 + nIdx * 100 + dIdx).toString(),
          fullName: name,
          userId: userId,
          departmentName: dept,
          emailAddress: `${userId}@samsung.com`,
        });
      });
    });

    // 3. Add some "Department Specialists" (Multiple people with similar IDs in one dept)
    for(let i=0; i<10; i++) {
      mockEmployees.push({
        epId: (30000000 + i).toString(),
        fullName: `전문가${i}`,
        userId: `spec.${i}`,
        departmentName: 'Photo기술팀',
        emailAddress: `spec.${i}@samsung.com`,
      });
    }

    const filtered = mockEmployees.filter((emp) => {
      const q = input.query.toLowerCase();
      if (input.condition === 'FullName') return emp.fullName.includes(q);
      if (input.condition === 'Organization') return emp.departmentName.toLowerCase().includes(q);
      if (input.condition === 'Title') return true;
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
