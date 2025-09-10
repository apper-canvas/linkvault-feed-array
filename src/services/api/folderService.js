import { toast } from 'react-toastify';

class FolderService {
  constructor() {
    this.tableName = 'folder_c';
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
    return new Promise(resolve => setTimeout(resolve, 250));
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
          {"field": {"Name": "parent_id_c"}},
          {"field": {"Name": "bookmark_count_c"}}
        ],
        orderBy: [{"fieldName": "name_c", "sorttype": "ASC"}],
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

      return response.data.map(folder => ({
        ...folder,
        name: folder.name_c || folder.Name,
        color: folder.color_c,
        parentId: folder.parent_id_c?.Id || folder.parent_id_c,
        bookmarkCount: folder.bookmark_count_c || 0
      }));
    } catch (error) {
      console.error("Error fetching folders:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getById(id) {
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
          {"field": {"Name": "parent_id_c"}},
          {"field": {"Name": "bookmark_count_c"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response?.data) {
        return null;
      }

      const folder = response.data;
      return {
        ...folder,
        name: folder.name_c || folder.Name,
        color: folder.color_c,
        parentId: folder.parent_id_c?.Id || folder.parent_id_c,
        bookmarkCount: folder.bookmark_count_c || 0
      };
    } catch (error) {
      console.error(`Error fetching folder ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }

  async create(folderData) {
    await this.delay();
    
    if (!this.apperClient) {
      this.initializeClient();
    }

    try {
      const params = {
        records: [{
          Name: folderData.name || folderData.Name,
          name_c: folderData.name,
          color_c: folderData.color,
          parent_id_c: folderData.parentId ? parseInt(folderData.parentId) : null,
          bookmark_count_c: 0
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
            color: created.color_c,
            parentId: created.parent_id_c?.Id || created.parent_id_c,
            bookmarkCount: created.bookmark_count_c || 0
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error creating folder:", error?.response?.data?.message || error);
      return null;
    }
  }

  async update(id, folderData) {
    await this.delay();
    
    if (!this.apperClient) {
      this.initializeClient();
    }

    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: folderData.name || folderData.Name,
          name_c: folderData.name,
          color_c: folderData.color,
          parent_id_c: folderData.parentId ? parseInt(folderData.parentId) : null,
          bookmark_count_c: folderData.bookmarkCount
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
            color: updated.color_c,
            parentId: updated.parent_id_c?.Id || updated.parent_id_c,
            bookmarkCount: updated.bookmark_count_c || 0
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error updating folder:", error?.response?.data?.message || error);
      return null;
    }
  }

  async delete(id) {
    await this.delay();
    
    if (!this.apperClient) {
      this.initializeClient();
    }

    try {
      const params = { 
        RecordIds: [parseInt(id)]
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
      console.error("Error deleting folder:", error?.response?.data?.message || error);
      return false;
    }
  }
}

export const folderService = new FolderService();