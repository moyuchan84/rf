import { useQuery } from '@apollo/client';
import { GET_DASHBOARD_DATA, GET_RECENT_REQUESTS } from '../api/dashboardQueries';
import { subMonths, isAfter, parseISO } from 'date-fns';
import { useDashboardStore } from '../store/useDashboardStore';
import { useEffect } from 'react';

export const useDashboard = () => {
  const { setLastRefreshedAt } = useDashboardStore();
  const lastMonth = subMonths(new Date(), 1);

  const { 
    data: statsData, 
    loading: statsLoading, 
    error: statsError, 
    refetch: refetchStats 
  } = useQuery(GET_DASHBOARD_DATA, {
    notifyOnNetworkStatusChange: true,
  });

  const { 
    data: recentData, 
    loading: recentLoading, 
    error: recentError,
    refetch: refetchRecent
  } = useQuery(GET_RECENT_REQUESTS, {
    variables: { take: 10 },
  });

  useEffect(() => {
    if (statsData) {
      setLastRefreshedAt(new Date());
    }
  }, [statsData, setLastRefreshedAt]);

  const stats = {
    requestsThisMonth: statsData?.requestItems?.items?.filter((item: any) => 
      isAfter(new Date(item.createdAt), lastMonth)
    ).length || 0,
    
    keyDesignsThisMonth: statsData?.keyDesigns?.filter((item: any) => 
      isAfter(new Date(item.createdAt), lastMonth)
    ).length || 0,

    photoKeysByPlan: statsData?.processPlans?.map((plan: any) => ({
      planId: plan.id,
      designRule: plan.designRule,
      count: statsData?.photoKeys?.filter((pk: any) => 
        pk.processPlanId === plan.id && isAfter(new Date(pk.updateDate), lastMonth)
      ).length || 0
    })) || [],

    totalPhotoKeysThisMonth: statsData?.photoKeys?.filter((pk: any) => 
      isAfter(new Date(pk.updateDate), lastMonth)
    ).length || 0,
  };

  const handleRefresh = async () => {
    await Promise.all([refetchStats(), refetchRecent()]);
  };

  return {
    stats,
    recentRequests: recentData?.requestItems?.items || [],
    loading: statsLoading || recentLoading,
    error: statsError || recentError,
    handleRefresh,
  };
};
