import { gql } from '@apollo/client';

export const SEARCH_EMPLOYEES = gql`
  query SearchEmployees($input: EmployeeSearchInput!) {
    searchEmployees(input: $input) {
      result
      currentPage
      totalPage
      totalCount
      employees {
        epId
        fullName
        userId
        departmentName
        emailAddress
      }
    }
  }
`;
