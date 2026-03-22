import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { EmployeeProvider } from '../../domain/employee-provider.interface';
import { EmployeeSearchResponseDto, EmployeeSearchInput } from '../../interface/dto/employee.dto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class KnoxEmployeeProvider extends EmployeeProvider {
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {
    super();
  }

  async search(input: EmployeeSearchInput): Promise<EmployeeSearchResponseDto> {
    const apiUrl = this.config.get<string>('KNOX_API_URL') || 'https://api.internal/employee/search';
    
    // Knox Search Specific Payload
    const payload = { 
      SearchQuery: input.query, 
      SearchCondition: input.condition 
    };

    try {
      const response = await lastValueFrom(
        this.httpService.post(apiUrl, payload)
      );

      return response.data;
    } catch (error) {
      console.error('[KnoxEmployeeProvider] Employee search failed:', error);
      throw error;
    }
  }
}
