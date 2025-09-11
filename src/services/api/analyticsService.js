import { toast } from 'react-toastify';

class AnalyticsService {
  constructor() {
    this.tableName = 'analytics_c'; // Future database table name
    this.apperClient = null;
    this.initializeClient();
  }

  initializeClient() {
    if (window.ApperSDK) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
  }

  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Mock data storage - replace with ApperClient when analytics table is available
  getMockData() {
    const stored = localStorage.getItem('analytics_data');
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Default mock data
    const defaultData = [
      { Id: 1, bookmark_id: 1, user_id: 1, timestamp: new Date('2024-01-15T10:30:00Z').toISOString(), usage_type: 'click' },
      { Id: 2, bookmark_id: 2, user_id: 1, timestamp: new Date('2024-01-15T11:45:00Z').toISOString(), usage_type: 'click' },
      { Id: 3, bookmark_id: 1, user_id: 1, timestamp: new Date('2024-01-16T09:15:00Z').toISOString(), usage_type: 'click' },
      { Id: 4, bookmark_id: 3, user_id: 1, timestamp: new Date('2024-01-16T14:20:00Z').toISOString(), usage_type: 'click' },
      { Id: 5, bookmark_id: 2, user_id: 1, timestamp: new Date('2024-01-17T08:30:00Z').toISOString(), usage_type: 'click' },
      { Id: 6, bookmark_id: 1, user_id: 1, timestamp: new Date('2024-01-17T16:45:00Z').toISOString(), usage_type: 'click' },
      { Id: 7, bookmark_id: 4, user_id: 1, timestamp: new Date('2024-01-18T10:00:00Z').toISOString(), usage_type: 'click' },
      { Id: 8, bookmark_id: 2, user_id: 1, timestamp: new Date('2024-01-18T13:30:00Z').toISOString(), usage_type: 'click' },
      { Id: 9, bookmark_id: 1, user_id: 1, timestamp: new Date('2024-01-19T11:15:00Z').toISOString(), usage_type: 'click' },
      { Id: 10, bookmark_id: 5, user_id: 1, timestamp: new Date('2024-01-19T15:45:00Z').toISOString(), usage_type: 'click' },
      { Id: 11, bookmark_id: 3, user_id: 1, timestamp: new Date('2024-01-20T09:30:00Z').toISOString(), usage_type: 'click' },
      { Id: 12, bookmark_id: 1, user_id: 1, timestamp: new Date('2024-01-20T12:00:00Z').toISOString(), usage_type: 'click' },
      { Id: 13, bookmark_id: 6, user_id: 1, timestamp: new Date('2024-01-21T10:30:00Z').toISOString(), usage_type: 'click' },
      { Id: 14, bookmark_id: 2, user_id: 1, timestamp: new Date('2024-01-21T14:15:00Z').toISOString(), usage_type: 'click' },
      { Id: 15, bookmark_id: 1, user_id: 1, timestamp: new Date('2024-01-22T08:45:00Z').toISOString(), usage_type: 'click' }
    ];
    
    localStorage.setItem('analytics_data', JSON.stringify(defaultData));
    return defaultData;
  }

  saveMockData(data) {
    localStorage.setItem('analytics_data', JSON.stringify(data));
  }

  async getAll() {
    await this.delay();
    try {
      return [...this.getMockData()];
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  async trackUsage(bookmarkId, usageType = 'click') {
    await this.delay(150);
    try {
      const analytics = this.getMockData();
      const newEntry = {
        Id: Date.now(),
        bookmark_id: parseInt(bookmarkId),
        user_id: 1, // Will use actual user ID when authentication is implemented
        timestamp: new Date().toISOString(),
        usage_type: usageType
      };
      
      analytics.push(newEntry);
      this.saveMockData(analytics);
      
      return newEntry;
    } catch (error) {
      console.error('Error tracking usage:', error);
      throw error;
    }
  }

  async getUsageStats() {
    await this.delay();
    try {
      const analytics = this.getMockData();
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const todayClicks = analytics.filter(entry => 
        new Date(entry.timestamp) >= today
      ).length;

      const weeklyClicks = analytics.filter(entry => 
        new Date(entry.timestamp) >= thisWeek
      ).length;

      const monthlyClicks = analytics.filter(entry => 
        new Date(entry.timestamp) >= thisMonth
      ).length;

      return {
        total: analytics.length,
        today: todayClicks,
        thisWeek: weeklyClicks,
        thisMonth: monthlyClicks
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      throw error;
    }
  }

  async getMostUsed(limit = 10) {
    await this.delay();
    try {
      const analytics = this.getMockData();
      const bookmarkUsage = {};

      analytics.forEach(entry => {
        const bookmarkId = entry.bookmark_id;
        bookmarkUsage[bookmarkId] = (bookmarkUsage[bookmarkId] || 0) + 1;
      });

      const sortedUsage = Object.entries(bookmarkUsage)
        .map(([bookmarkId, count]) => ({
          bookmarkId: parseInt(bookmarkId),
          count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

      return sortedUsage;
    } catch (error) {
      console.error('Error getting most used bookmarks:', error);
      throw error;
    }
  }

  async getUsageTrends(days = 7) {
    await this.delay();
    try {
      const analytics = this.getMockData();
      const now = new Date();
      const trends = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

        const dayClicks = analytics.filter(entry => {
          const entryDate = new Date(entry.timestamp);
          return entryDate >= dayStart && entryDate < dayEnd;
        }).length;

        trends.push({
          date: dayStart.toISOString().split('T')[0],
          clicks: dayClicks
        });
      }

      return trends;
    } catch (error) {
      console.error('Error getting usage trends:', error);
      throw error;
    }
  }

  async getPopularTimes() {
    await this.delay();
    try {
      const analytics = this.getMockData();
      const hourlyUsage = new Array(24).fill(0);

      analytics.forEach(entry => {
        const hour = new Date(entry.timestamp).getHours();
        hourlyUsage[hour]++;
      });

      return hourlyUsage.map((count, hour) => ({
        hour,
        count
      }));
    } catch (error) {
      console.error('Error getting popular times:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();