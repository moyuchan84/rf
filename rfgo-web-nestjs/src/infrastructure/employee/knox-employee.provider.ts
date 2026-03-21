import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { EmployeeProvider } from '../../common/interfaces/employee-provider.interface';
import { EmployeeSearchResponseDto, EmployeeSearchInput } from '../../common/dto/employee-search.dto';
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

      // We use flexible DTO approach. Knox might return much more data, 
      // but we only pick what we defined in DTO + allow extra fields if needed in some contexts.
      return response.data;
    } catch (error) {
      console.error('[KnoxEmployeeProvider] Employee search failed:', error);
      throw error;
    }
  }
}
