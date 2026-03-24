// rfgo-web-react/src/pages/MailingPage.tsx
import React from 'react';
import { MailGroupManager } from '../features/mailing/components/MailGroupManager';

const MailingPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">    
      <div className="w-full">
        <MailGroupManager />
      </div>
    </div>
  );
};

export default MailingPage;
