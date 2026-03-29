// rfgo-web-react/src/features/mailing/hooks/useMergedWatchers.ts
import { useMailSelectorStore, EmployeeDto, UserMailGroup } from '../store/useMailSelectorStore';
import { useMailingGroups } from './useMailingGroups';

export const useMergedWatchers = () => {
  const { selectedGroupIds, manualRecipients } = useMailSelectorStore();
  const { groups } = useMailingGroups();

  const getMergedInitialWatchers = (additionalEmployee?: EmployeeDto | null): EmployeeDto[] => {
    // 1. Get members from selected groups
    const selectedGroupMembers = groups
      .filter((g: UserMailGroup) => selectedGroupIds.includes(g.id))
      .flatMap((g: UserMailGroup) => g.members);

    // 2. Combine with manual recipients and optional additional employee (requester)
    const all = [...selectedGroupMembers, ...manualRecipients];
    if (additionalEmployee) {
      all.push(additionalEmployee);
    }

    // 3. Deduplicate by userId, epId, or emailAddress
    const uniqueMap = new Map<string, EmployeeDto>();
    all.forEach(emp => {
      const key = emp.userId || emp.epId || emp.emailAddress;
      if (key && !uniqueMap.has(key)) {
        uniqueMap.set(key, emp);
      }
    });

    // 4. Clean objects for GraphQL Input (remove __typename, metadata)
    return Array.from(uniqueMap.values()).map(({ __typename, addedAt, isMute, ...rest }: any) => rest);
  };

  return { getMergedInitialWatchers };
};
