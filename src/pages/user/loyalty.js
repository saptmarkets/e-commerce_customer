import { useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  FiGift, 
  FiTrendingUp, 
  FiClock, 
  FiStar,
  FiArrowUp,
  FiArrowDown,
  FiInfo,
  FiRefreshCw
} from "react-icons/fi";
import { IoTrophyOutline } from "react-icons/io5";
import useTranslation from "next-translate/useTranslation";
import Link from "next/link";

//internal import
import Dashboard from "./dashboard";
import useGetSetting from "@hooks/useGetSetting";
import Loading from "@components/preloader/Loading";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { SidebarContext } from "@context/SidebarContext";
import LoyaltyServices from "@services/LoyaltyServices";
import { getUserSession } from "@lib/auth";
import { notifyError, notifySuccess } from "@utils/toast";

const LoyaltyDashboard = () => {
  const { isLoading, setIsLoading } = useContext(SidebarContext);
  const { t } = useTranslation('common');
  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue, getNumberTwo, showDateFormat } = useUtilsFunction();
  
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get user info for Odoo loyalty points
  const userInfo = getUserSession();

  // Odoo Loyalty Points Query
  const {
    data: odooLoyaltyInfo,
    error: odooError,
    isLoading: odooLoading,
    refetch: refetchOdooLoyalty
  } = useQuery({
    queryKey: ["odoo-loyalty-info", userInfo?.contact || userInfo?.phone],
    queryFn: async () => {
      if (!userInfo?.contact && !userInfo?.phone) {
        throw new Error('No contact information available');
      }
      const customerPhone = userInfo.contact || userInfo.phone;
      const result = await LoyaltyServices.validateOdooLoyaltyPoints(customerPhone);
      return result.data;
    },
    enabled: !!(userInfo?.contact || userInfo?.phone),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Legacy queries (kept for fallback but marked as deprecated)
  const {
    data: loyaltySummary,
    error: summaryError,
    isLoading: summaryLoading,
  } = useQuery({
    queryKey: ["loyalty-summary"],
    queryFn: async () => await LoyaltyServices.getLoyaltySummary(),
    enabled: false, // Disabled - using Odoo instead
  });

  const {
    data: transactionHistory,
    error: historyError,
    isLoading: historyLoading,
  } = useQuery({
    queryKey: ["loyalty-transactions"],
    queryFn: async () => await LoyaltyServices.getTransactionHistory(),
    enabled: false, // Disabled - using Odoo instead
  });

  const {
    data: loyaltyConfig,
    isLoading: configLoading,
  } = useQuery({
    queryKey: ["loyalty-config"],
    queryFn: async () => await LoyaltyServices.getLoyaltyConfig(),
    enabled: false, // Disabled - using Odoo instead
  });

  // Refresh loyalty points function
  const handleRefreshLoyalty = async () => {
    setIsRefreshing(true);
    try {
      await refetchOdooLoyalty();
      notifySuccess('Loyalty points updated successfully!');
    } catch (error) {
      console.error('Error refreshing loyalty points:', error);
      notifyError('Failed to refresh loyalty points. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'earned':
        return <FiTrendingUp className="text-green-600" />;
      case 'bonus':
        return <FiGift className="text-purple-600" />;
      case 'redeemed':
        return <FiArrowDown className="text-red-600" />;
      case 'expired':
        return <FiClock className="text-gray-600" />;
      default:
        return <FiInfo className="text-blue-600" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'earned':
      case 'bonus':
        return 'text-green-600';
      case 'redeemed':
      case 'expired':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading || odooLoading) {
    return <Loading loading={true} />;
  }

  // Show error if no contact information
  if (!userInfo?.contact && !userInfo?.phone) {
    return (
      <Dashboard
        title={t('loyaltyProgram')}
        description={t('earnPointsWithEveryPurchase')}
      >
        <div className="font-serif">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <FiInfo className="text-yellow-600 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Contact Information Required
            </h3>
            <p className="text-yellow-700 mb-4">
              To view your loyalty points, please update your contact information in your profile.
            </p>
            <Link 
              href="/user/profile" 
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
            >
              Update Profile
            </Link>
          </div>
        </div>
      </Dashboard>
    );
  }

  // Show error if Odoo query failed
  if (odooError) {
    return (
      <Dashboard
        title={t('loyaltyProgram')}
        description={t('earnPointsWithEveryPurchase')}
      >
        <div className="font-serif">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <FiInfo className="text-red-600 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Unable to Load Loyalty Points
            </h3>
            <p className="text-red-700 mb-4">
              {odooError.message || 'Failed to load loyalty points. Please try again.'}
            </p>
            <button 
              onClick={handleRefreshLoyalty}
              disabled={isRefreshing}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <FiRefreshCw className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Try Again'}
            </button>
          </div>
        </div>
      </Dashboard>
    );
  }

  return (
    <Dashboard
      title={t('loyaltyProgram')}
      description={t('earnPointsWithEveryPurchase')}
    >
      <div className="font-serif">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {t('loyaltyProgram')}
            </h2>
            <p className="text-gray-600">
              {t('earnPointsWithEveryPurchase')}
            </p>
          </div>
          
          <div className="mt-4 lg:mt-0 flex items-center space-x-4">
            {/* Refresh Button */}
            <button
              onClick={handleRefreshLoyalty}
              disabled={isRefreshing}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              title="Refresh loyalty points"
            >
              <FiRefreshCw className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            
            {/* Loyalty Points Display */}
            {odooLoyaltyInfo && (
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl">
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {odooLoyaltyInfo.currentPoints || 0}
                  </div>
                  <div className="text-sm opacity-90">{t('availablePoints')}</div>
                  <div className="text-xs opacity-75 mt-1">
                    Customer: {odooLoyaltyInfo.customerName}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: t('overview'), icon: FiStar },
              { id: 'history', label: t('transactionHistory'), icon: FiClock },
              { id: 'how-it-works', label: t('howItWorks'), icon: FiInfo }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  selectedTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && odooLoyaltyInfo && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t('currentPoints')}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {odooLoyaltyInfo.currentPoints || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <FiStar className="text-purple-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t('customerName')}</p>
                    <p className="text-lg font-bold text-gray-900">
                      {odooLoyaltyInfo.customerName || 'N/A'}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FiInfo className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t('customerPhone')}</p>
                    <p className="text-lg font-bold text-gray-900">
                      {odooLoyaltyInfo.customerPhone || 'N/A'}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <FiTrendingUp className="text-green-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t('loyaltyCardId')}</p>
                    <p className="text-lg font-bold text-gray-900">
                      {odooLoyaltyInfo.loyaltyCardId || 'N/A'}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <FiGift className="text-orange-600" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Odoo Integration Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiInfo className="mr-2 text-blue-600" />
                Odoo Loyalty System Integration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Your loyalty points are now managed through our integrated Odoo system, providing real-time updates and enhanced security.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="font-medium">{new Date().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">System:</span>
                      <span className="font-medium text-green-600">Odoo Integration</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <button
                    onClick={handleRefreshLoyalty}
                    disabled={isRefreshing}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    <FiRefreshCw className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Updating...' : 'Update Points'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transaction History Tab */}
        {selectedTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <FiInfo className="text-blue-600 mx-auto mb-4" size={48} />
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Transaction History
              </h3>
              <p className="text-blue-700 mb-4">
                Transaction history is managed through the Odoo system. Please contact customer support for detailed transaction information.
              </p>
              <div className="text-sm text-blue-600">
                <p>Your current loyalty points: <strong>{odooLoyaltyInfo?.currentPoints || 0}</strong></p>
                <p>Customer: <strong>{odooLoyaltyInfo?.customerName || 'N/A'}</strong></p>
              </div>
            </div>
          </div>
        )}

        {/* How It Works Tab */}
        {selectedTab === 'how-it-works' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 rounded-xl">
              <h3 className="text-2xl font-bold mb-4">Odoo Loyalty System</h3>
              <p className="text-purple-100">
                Your loyalty points are managed through our integrated Odoo system for enhanced security and real-time updates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Status */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-purple-100 rounded-full mr-4">
                    <FiStar className="text-purple-600" size={24} />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">Current Status</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Points:</span>
                    <span className="font-semibold text-purple-600">{odooLoyaltyInfo?.currentPoints || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer Name:</span>
                    <span className="font-semibold">{odooLoyaltyInfo?.customerName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone Number:</span>
                    <span className="font-semibold">{odooLoyaltyInfo?.customerPhone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loyalty Card ID:</span>
                    <span className="font-semibold">{odooLoyaltyInfo?.loyaltyCardId || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* System Information */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full mr-4">
                    <FiInfo className="text-blue-600" size={24} />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">System Information</h4>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">
                    Your loyalty points are securely managed through our Odoo integration system.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">System:</span>
                      <span className="font-semibold text-green-600">Odoo Integration</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="font-medium">{new Date().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-semibold text-green-600">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Instructions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiInfo className="mr-2 text-blue-600" />
                How to Use Your Loyalty Points
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• <strong>Checkout Process:</strong> Your loyalty points are automatically available during checkout</li>
                  <li>• <strong>Auto-Population:</strong> Your contact number is automatically used for security</li>
                  <li>• <strong>Real-time Updates:</strong> Points are updated in real-time through Odoo system</li>
                  <li>• <strong>Security:</strong> Only you can use your loyalty points with your registered contact number</li>
                  <li>• <strong>Support:</strong> Contact customer support for any loyalty-related inquiries</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </Dashboard>
  );
};

export default LoyaltyDashboard; 