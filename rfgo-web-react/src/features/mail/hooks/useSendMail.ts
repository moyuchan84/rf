// src/features/mail/hooks/useSendMail.ts
import { useMutation } from '@apollo/client/react';
import { SEND_TEST_MAIL } from '../api/mailMutations';
import { useMailStore } from '../store/useMailStore';

interface SendTestMailData {
  sendTestMail: boolean;
}

interface SendTestMailVariables {
  input: {
    subject: string;
    docSecuType: 'PERSONAL' | 'OFFICIAL';
    contents: string;
    contentType: 'TEXT' | 'MIME' | 'HTML';
    sender: { emailAddress: string };
    recipients: Array<{ emailAddress: string; recipientType: string }>;
  };
}

export const useSendMail = () => {
  const [sendMailMutation] = useMutation<SendTestMailData, SendTestMailVariables>(SEND_TEST_MAIL);
  const { setLastSentSubject, setIsSending, isSending } = useMailStore();

  const sendTestMail = async (email: string) => {
    setIsSending(true);
    const subject = '[RFGo] System Test Mail';
    try {
      const { data } = await sendMailMutation({
        variables: {
          input: {
            subject,
            docSecuType: 'OFFICIAL',
            contents: '<h3>This is a test mail from RFGo System.</h3>',
            contentType: 'HTML',
            sender: { emailAddress: 'rfgo-system@samsung.com' },
            recipients: [{ emailAddress: email, recipientType: 'TO' }],
          },
        },
      });

      if (data?.sendTestMail) {
        setLastSentSubject(subject);
        alert('Mail sent successfully!');
      } else {
        alert('Failed to send mail.');
      }
    } catch (error) {
      console.error('Mail sending error:', error);
      alert('Error sending mail.');
    } finally {
      setIsSending(false);
    }
  };

  return { sendTestMail, isSending };
};

