import React, { useState, useEffect } from 'react';
import { analyticsService } from '@/services/api/analyticsService';
import { bookmarkService } from '@/services/api/bookmarkService';
import ApperIcon from '@/components/ApperIcon';
import { formatDistanceToNow } from 'date-fns';
import ReactApexChart from 'react-apexcharts';

const Dashboard = () => {
  const [usageStats, setUsageStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0
  });
  const [mostUsedBookmarks, setMostUsedBookmarks] = useState([]);
  const [usageTrends, setUsageTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [stats, mostUsed, trends] = await Promise.all([
        analyticsService.getUsageStats(),
        analyticsService.getMostUsed(8),
        analyticsService.getUsageTrends(7)
      ]);

      setUsageStats(stats);
      setUsageTrends(trends);

      // Get bookmark details for most used items
      const bookmarkDetails = await Promise.all(
        mostUsed.map(async (usage) => {
          try {
            const bookmark = await bookmarkService.getById(usage.bookmarkId);
            return {
              ...usage,
              bookmark: bookmark || {
                title_c: 'Unknown Bookmark',
                url_c: '#',
                favicon_c: null
              }
            };
          } catch {
            return {
              ...usage,
              bookmark: {
                title_c: 'Unknown Bookmark',
                url_c: '#',
                favicon_c: null
              }
            };
          }
        })
      );

      setMostUsedBookmarks(bookmarkDetails);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    chart: {
      type: 'area',
      height: 300,
      toolbar: {
        show: false
      },
      sparkline: {
        enabled: false
      }
    },
    colors: ['#2563eb'],
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100]
      }
    },
    xaxis: {
      type: 'category',
      categories: usageTrends.map(trend => {
        const date = new Date(trend.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      show: true,
      labels: {
        formatter: (value) => Math.round(value)
      }
    },
    grid: {
      strokeDashArray: 3,
      borderColor: '#e2e8f0'
    },
    tooltip: {
      theme: 'light',
      x: {
        show: true
      },
      y: {
        title: {
          formatter: () => 'Clicks:'
        }
      }
    }
  };

  const chartSeries = [{
    name: 'Usage',
    data: usageTrends.map(trend => trend.clicks)
  }];

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <ApperIcon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <ApperIcon name="BarChart3" size={28} className="text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        </div>
        <p className="text-gray-600 mt-1">Track your bookmark usage and discover patterns</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{usageStats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <ApperIcon name="MousePointer" size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{usageStats.today}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <ApperIcon name="Calendar" size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{usageStats.thisWeek}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <ApperIcon name="TrendingUp" size={24} className="text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{usageStats.thisMonth}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <ApperIcon name="Calendar" size={24} className="text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Usage Trends Chart */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Usage Trends</h3>
              <p className="text-sm text-gray-600 mt-1">Daily bookmark clicks over the past 7 days</p>
            </div>
            <div className="p-6">
              <ReactApexChart
                options={chartOptions}
                series={chartSeries}
                type="area"
                height={300}
              />
            </div>
          </div>

          {/* Most Used Bookmarks */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Most Used</h3>
              <p className="text-sm text-gray-600 mt-1">Your frequently accessed bookmarks</p>
            </div>
            <div className="p-6">
              {mostUsedBookmarks.length === 0 ? (
                <div className="text-center py-8">
                  <ApperIcon name="BarChart3" size={48} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No usage data yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {mostUsedBookmarks.map((item, index) => (
                    <div
                      key={item.bookmarkId}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">#{index + 1}</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {item.bookmark?.favicon_c && (
                            <img
                              src={item.bookmark.favicon_c}
                              alt=""
                              className="w-4 h-4 rounded"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.bookmark?.title_c || 'Unknown Bookmark'}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {item.count} {item.count === 1 ? 'click' : 'clicks'}
                        </p>
                      </div>
                      
                      <div className="flex-shrink-0">
                        <div
                          className="w-2 h-8 bg-primary rounded-full opacity-60"
                          style={{
                            opacity: Math.max(0.3, item.count / Math.max(...mostUsedBookmarks.map(b => b.count)))
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;