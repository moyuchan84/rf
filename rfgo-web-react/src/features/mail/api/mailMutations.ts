// src/features/mail/api/mailMutations.ts
import { gql } from '@apollo/client';

export const SEND_TEST_MAIL = gql`
  mutation SendTestMail($input: MailRequestDto!) {
    sendTestMail(input: $input)
  }
`;
