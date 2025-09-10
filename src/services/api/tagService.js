import { toast } from 'react-toastify';

class TagService {
  constructor() {
    this.tableName = 'tag_c';
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

  async delay() {
    return new Promise(resolve => setTimeout(resolve, 200));
  }

  async getAll() {
    await this.delay();
    
    if (!this.apperClient) {
      this.initializeClient();
    }

    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "usage_count_c"}}
        ],
        orderBy: [{"fieldName": "usage_count_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      return response.data.map(tag => ({
        ...tag,
        name: tag.name_c || tag.Name,
        color: tag.color_c || '#2563eb',
        usageCount: tag.usage_count_c || 0
      }));
    } catch (error) {
      console.error("Error fetching tags:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getByName(name) {
    await this.delay();
    
    if (!this.apperClient) {
      this.initializeClient();
    }

    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "usage_count_c"}}
        ],
        where: [{"FieldName": "name_c", "Operator": "ExactMatch", "Values": [name]}],
        pagingInfo: {"limit": 1, "offset": 0}
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success || !response.data || response.data.length === 0) {
        return null;
      }

      const tag = response.data[0];
      return {
        ...tag,
        name: tag.name_c || tag.Name,
        color: tag.color_c || '#2563eb',
        usageCount: tag.usage_count_c || 0
      };
    } catch (error) {
      console.error(`Error fetching tag ${name}:`, error?.response?.data?.message || error);
      return null;
    }
  }

  async create(tagData) {
    await this.delay();
    
    if (!this.apperClient) {
      this.initializeClient();
    }

    // First check if tag exists
    const existingTag = await this.getByName(tagData.name);
    if (existingTag) {
      return existingTag;
    }

    try {
      const params = {
        records: [{
          Name: tagData.name,
          name_c: tagData.name,
          color_c: tagData.color || '#2563eb',
          usage_count_c: 1
        }]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} records:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const created = successful[0].data;
          return {
            ...created,
            name: created.name_c || created.Name,
            color: created.color_c || '#2563eb',
            usageCount: created.usage_count_c || 1
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error creating tag:", error?.response?.data?.message || error);
      return null;
    }
  }

  async updateUsageCount(tagName, increment = true) {
    await this.delay();
    
    const tag = await this.getByName(tagName);
    if (!tag) return null;

    const newCount = (tag.usageCount || 0) + (increment ? 1 : -1);
    
    if (newCount <= 0) {
      // Delete tag if usage count reaches 0
      return await this.delete(tagName);
    }

    try {
      const params = {
        records: [{
          Id: tag.Id,
          Name: tag.name,
          name_c: tag.name,
          color_c: tag.color,
          usage_count_c: newCount
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} records:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const updated = successful[0].data;
          return {
            ...updated,
            name: updated.name_c || updated.Name,
            color: updated.color_c || '#2563eb',
            usageCount: updated.usage_count_c || 0
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error updating tag usage count:", error?.response?.data?.message || error);
      return null;
    }
  }

  async delete(name) {
    await this.delay();
    
    const tag = await this.getByName(name);
    if (!tag) {
      throw new Error('Tag not found');
    }

    if (!this.apperClient) {
      this.initializeClient();
    }

    try {
      const params = { 
        RecordIds: [tag.Id]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} records:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        return successful.length > 0;
      }

      return true;
    } catch (error) {
      console.error("Error deleting tag:", error?.response?.data?.message || error);
      return false;
    }
  }
}

export const tagService = new TagService();