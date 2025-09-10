import { toast } from 'react-toastify';

class FolderSharingService {
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
    return new Promise(resolve => setTimeout(resolve, 300));
  }

  async shareFolder(folderId, recipients, permissions = 'view') {
    await this.delay();
    
    if (!this.apperClient) {
      this.initializeClient();
    }

    try {
      const recipientEmails = Array.isArray(recipients) ? recipients.join(',') : recipients;
      
      const params = {
        records: [{
          Id: parseInt(folderId),
          shared_c: true,
          shared_with_c: recipientEmails,
          share_permissions_c: permissions
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to share folder:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }
        
        if (successful.length > 0) {
          toast.success('Folder shared successfully!');
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error sharing folder:', error?.response?.data?.message || error);
      toast.error('Failed to share folder');
      return false;
    }
  }

  async unshareFolder(folderId) {
    await this.delay();
    
    if (!this.apperClient) {
      this.initializeClient();
    }

    try {
      const params = {
        records: [{
          Id: parseInt(folderId),
          shared_c: false,
          shared_with_c: '',
          share_permissions_c: 'view'
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to unshare folder:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }
        
        if (successful.length > 0) {
          toast.success('Folder sharing stopped');
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error unsharing folder:', error?.response?.data?.message || error);
      toast.error('Failed to stop sharing');
      return false;
    }
  }

  async updateSharePermissions(folderId, permissions) {
    await this.delay();
    
    if (!this.apperClient) {
      this.initializeClient();
    }

    try {
      const params = {
        records: [{
          Id: parseInt(folderId),
          share_permissions_c: permissions
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update permissions:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }
        
        if (successful.length > 0) {
          toast.success('Permissions updated successfully');
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error updating permissions:', error?.response?.data?.message || error);
      toast.error('Failed to update permissions');
      return false;
    }
  }

  async getSharedFolders() {
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
          {"field": {"Name": "bookmark_count_c"}},
          {"field": {"Name": "shared_c"}},
          {"field": {"Name": "shared_with_c"}},
          {"field": {"Name": "share_permissions_c"}}
        ],
        where: [{"FieldName": "shared_c", "Operator": "EqualTo", "Values": [true]}],
        orderBy: [{"fieldName": "Name", "sorttype": "ASC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success || !response.data) {
        return [];
      }

      return response.data.map(folder => ({
        ...folder,
        name: folder.name_c || folder.Name,
        color: folder.color_c,
        parentId: folder.parent_id_c?.Id || folder.parent_id_c,
        bookmarkCount: folder.bookmark_count_c,
        isShared: folder.shared_c,
        sharedWith: folder.shared_with_c ? folder.shared_with_c.split(',').map(email => email.trim()).filter(email => email) : [],
        sharePermissions: folder.share_permissions_c
      }));
    } catch (error) {
      console.error('Error fetching shared folders:', error?.response?.data?.message || error);
      return [];
    }
  }

  generateShareLink(folderId) {
    const baseUrl = window.location.origin;
    const shareId = btoa(folderId.toString()).replace(/[+/=]/g, '');
    return `${baseUrl}/shared/folder/${shareId}`;
  }

  async copyShareLink(folderId) {
    const shareLink = this.generateShareLink(folderId);
    
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success('Share link copied to clipboard!');
      return shareLink;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Failed to copy link');
      return shareLink;
    }
  }
}

export const folderSharingService = new FolderSharingService();