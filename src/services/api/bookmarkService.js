import { toast } from "react-toastify";
import React from "react";
import Error from "@/components/ui/Error";

class BookmarkService {
  constructor() {
    this.tableName = 'bookmark_c';
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

  async getAll() {
    await this.delay();
    
    if (!this.apperClient) {
      this.initializeClient();
    }

    try {
const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "url_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "tags_c"}},
          {"field": {"Name": "favicon_c"}},
          {"field": {"Name": "date_added_c"}},
          {"field": {"Name": "date_modified_c"}},
          {"field": {"Name": "pinned_c"}},
          {"field": {"Name": "folder_id_c"}},
          {"field": {"Name": "archived_c"}}
        ],
        where: [{"FieldName": "archived_c", "Operator": "EqualTo", "Values": [false]}],
        orderBy: [{"fieldName": "date_added_c", "sorttype": "DESC"}],
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

      return response.data.map(bookmark => ({
        ...bookmark,
        url: bookmark.url_c,
        title: bookmark.title_c || bookmark.Name,
        description: bookmark.description_c,
        tags: bookmark.tags_c ? bookmark.tags_c.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        favicon: bookmark.favicon_c || this.getFaviconUrl(bookmark.url_c),
        dateAdded: bookmark.date_added_c,
        dateModified: bookmark.date_modified_c,
folderId: bookmark.folder_id_c?.Id || bookmark.folder_id_c,
        isPinned: bookmark.pinned_c || false,
        isArchived: bookmark.archived_c || false
      }));
    } catch (error) {
      console.error("Error fetching bookmarks:", error?.response?.data?.message || error);
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
          {"field": {"Name": "url_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "tags_c"}},
          {"field": {"Name": "favicon_c"}},
          {"field": {"Name": "date_added_c"}},
          {"field": {"Name": "date_modified_c"}},
          {"field": {"Name": "folder_id_c"}},
          {"field": {"Name": "pinned_c"}},
          {"field": {"Name": "archived_c"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response?.data) {
        return null;
      }

      const bookmark = response.data;
      return {
        ...bookmark,
        url: bookmark.url_c,
        title: bookmark.title_c || bookmark.Name,
        description: bookmark.description_c,
        tags: bookmark.tags_c ? bookmark.tags_c.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        favicon: bookmark.favicon_c || this.getFaviconUrl(bookmark.url_c),
dateAdded: bookmark.date_added_c,
        dateModified: bookmark.date_modified_c,
        isPinned: bookmark.pinned_c || false,
        isArchived: bookmark.archived_c || false,
        folderId: bookmark.folder_id_c?.Id || bookmark.folder_id_c
      };
    } catch (error) {
      console.error(`Error fetching bookmark ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }

  async getByTag(tagName) {
    await this.delay();
    
    if (!this.apperClient) {
      this.initializeClient();
    }

    try {
      const params = {
fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "url_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "tags_c"}},
          {"field": {"Name": "favicon_c"}},
          {"field": {"Name": "date_added_c"}},
          {"field": {"Name": "date_modified_c"}},
          {"field": {"Name": "folder_id_c"}},
          {"field": {"Name": "pinned_c"}},
          {"field": {"Name": "archived_c"}}
        ],
        where: [
          {"FieldName": "archived_c", "Operator": "EqualTo", "Values": [false]},
          {"FieldName": "tags_c", "Operator": "Contains", "Values": [tagName]}
        ],
        orderBy: [{"fieldName": "date_added_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success || !response.data) {
        return [];
      }

      return response.data.map(bookmark => ({
        ...bookmark,
        url: bookmark.url_c,
        title: bookmark.title_c || bookmark.Name,
        description: bookmark.description_c,
tags: bookmark.tags_c ? bookmark.tags_c.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        favicon: bookmark.favicon_c || this.getFaviconUrl(bookmark.url_c),
        isPinned: bookmark.pinned_c || false,
        isArchived: bookmark.archived_c || false,
        dateAdded: bookmark.date_added_c,
        dateModified: bookmark.date_modified_c,
        folderId: bookmark.folder_id_c?.Id || bookmark.folder_id_c
      }));
    } catch (error) {
      console.error("Error fetching bookmarks by tag:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getByFolder(folderId) {
    await this.delay();
    
    if (!this.apperClient) {
      this.initializeClient();
    }

    try {
      const params = {
fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "url_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "tags_c"}},
          {"field": {"Name": "favicon_c"}},
          {"field": {"Name": "date_added_c"}},
          {"field": {"Name": "date_modified_c"}},
          {"field": {"Name": "folder_id_c"}},
          {"field": {"Name": "archived_c"}},
          {"field": {"Name": "pinned_c"}}
        ],
        where: [{"FieldName": "folder_id_c", "Operator": "ExactMatch", "Values": [parseInt(folderId)]}],
        orderBy: [{"fieldName": "date_added_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success || !response.data) {
        return [];
      }

      return response.data.map(bookmark => ({
        ...bookmark,
        url: bookmark.url_c,
        title: bookmark.title_c || bookmark.Name,
description: bookmark.description_c,
        tags: bookmark.tags_c ? bookmark.tags_c.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        isPinned: bookmark.pinned_c || false,
        isArchived: bookmark.archived_c || false,
        favicon: bookmark.favicon_c || this.getFaviconUrl(bookmark.url_c),
        dateAdded: bookmark.date_added_c,
        dateModified: bookmark.date_modified_c,
        folderId: bookmark.folder_id_c?.Id || bookmark.folder_id_c
      }));
    } catch (error) {
      console.error("Error fetching bookmarks by folder:", error?.response?.data?.message || error);
      return [];
    }
  }

  async create(bookmarkData) {
    await this.delay();
    
    if (!this.apperClient) {
      this.initializeClient();
    }

    try {
      const now = new Date().toISOString();
      const params = {
        records: [{
          Name: bookmarkData.title || 'Untitled Bookmark',
          url_c: bookmarkData.url,
          title_c: bookmarkData.title,
          description_c: bookmarkData.description || '',
          tags_c: Array.isArray(bookmarkData.tags) ? bookmarkData.tags.join(',') : (bookmarkData.tags || ''),
          favicon_c: this.getFaviconUrl(bookmarkData.url),
          date_added_c: now,
          date_modified_c: now,
folder_id_c: bookmarkData.folderId ? parseInt(bookmarkData.folderId) : null,
          pinned_c: bookmarkData.isPinned || false,
          archived_c: bookmarkData.isArchived || false
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
            url: created.url_c,
            title: created.title_c || created.Name,
            description: created.description_c,
            tags: created.tags_c ? created.tags_c.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
favicon: created.favicon_c,
            dateAdded: created.date_added_c,
            isPinned: created.pinned_c || false,
            isArchived: created.archived_c || false,
            dateModified: created.date_modified_c,
            folderId: created.folder_id_c?.Id || created.folder_id_c
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error creating bookmark:", error?.response?.data?.message || error);
      return null;
    }
  }

  async update(id, bookmarkData) {
    await this.delay();
    
    if (!this.apperClient) {
      this.initializeClient();
    }

    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: bookmarkData.title || 'Untitled Bookmark',
          url_c: bookmarkData.url,
          title_c: bookmarkData.title,
          description_c: bookmarkData.description || '',
          tags_c: Array.isArray(bookmarkData.tags) ? bookmarkData.tags.join(',') : (bookmarkData.tags || ''),
          favicon_c: this.getFaviconUrl(bookmarkData.url),
date_modified_c: new Date().toISOString(),
          folder_id_c: bookmarkData.folderId ? parseInt(bookmarkData.folderId) : null,
          pinned_c: bookmarkData.isPinned !== undefined ? bookmarkData.isPinned : false,
          archived_c: bookmarkData.isArchived !== undefined ? bookmarkData.isArchived : false
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
            url: updated.url_c,
            title: updated.title_c || updated.Name,
            description: updated.description_c,
            tags: updated.tags_c ? updated.tags_c.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
            favicon: updated.favicon_c,
dateAdded: updated.date_added_c,
            dateModified: updated.date_modified_c,
            isPinned: updated.pinned_c || false,
            isArchived: updated.archived_c || false,
            folderId: updated.folder_id_c?.Id || updated.folder_id_c
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error updating bookmark:", error?.response?.data?.message || error);
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
      console.error("Error deleting bookmark:", error?.response?.data?.message || error);
      return false;
    }
  }

async togglePin(id) {
    await this.delay();
    
    if (!this.apperClient) {
      this.initializeClient();
    }

    try {
      // First get current bookmark to check pin status
      const currentBookmark = await this.getById(id);
      if (!currentBookmark) {
        throw new Error('Bookmark not found');
      }
      
      const newPinStatus = !currentBookmark.isPinned;
      
      const params = {
        records: [{
          Id: parseInt(id),
          pinned_c: newPinStatus
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
          console.error(`Failed to toggle pin status:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }
        
        if (successful.length > 0) {
          toast.success(newPinStatus ? 'Bookmark pinned!' : 'Bookmark unpinned!');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error toggling pin status:', error?.response?.data?.message || error);
      toast.error('Failed to update pin status');
      return false;
    }
  }
async toggleArchive(id) {
    await this.delay();
    
    if (!this.apperClient) {
      this.initializeClient();
    }

    try {
      // First get the current bookmark to check its current archive status
      const current = await this.getById(id);
      if (!current) {
        toast.error('Bookmark not found');
        return false;
      }

      const params = {
        records: [{
          Id: parseInt(id),
          archived_c: !current.isArchived
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
          console.error(`Failed to toggle archive for ${failed.length} records:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const action = !current.isArchived ? 'archived' : 'unarchived';
          toast.success(`Bookmark ${action} successfully`);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Error toggling archive:", error?.response?.data?.message || error);
      return false;
    }
  }

  async getArchived() {
    await this.delay();
    
    if (!this.apperClient) {
      this.initializeClient();
    }

    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "url_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "tags_c"}},
          {"field": {"Name": "favicon_c"}},
          {"field": {"Name": "date_added_c"}},
          {"field": {"Name": "date_modified_c"}},
{"field": {"Name": "pinned_c"}},
          {"field": {"Name": "folder_id_c"}},
          {"field": {"Name": "archived_c"}}
        ],
        where: [{"FieldName": "archived_c", "Operator": "EqualTo", "Values": [true]}],
        orderBy: [{"fieldName": "date_modified_c", "sorttype": "DESC"}],
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

      return response.data.map(bookmark => ({
        ...bookmark,
        title: bookmark.title_c || bookmark.Name,
        url: bookmark.url_c,
        description: bookmark.description_c,
        tags: bookmark.tags_c ? bookmark.tags_c.split(',').map(tag => tag.trim()) : [],
        dateAdded: bookmark.date_added_c,
        dateModified: bookmark.date_modified_c,
folderId: bookmark.folder_id_c?.Id || bookmark.folder_id_c,
        isPinned: bookmark.pinned_c || false,
        isArchived: bookmark.archived_c || false,
        favicon: bookmark.favicon_c || this.getFaviconUrl(bookmark.url_c)
      }));
    } catch (error) {
      console.error("Error fetching archived bookmarks:", error?.response?.data?.message || error);
      return [];
    }
  }
  async getPinned() {
    await this.delay();
    
    if (!this.apperClient) {
      this.initializeClient();
    }

    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "url_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "tags_c"}},
          {"field": {"Name": "favicon_c"}},
          {"field": {"Name": "date_added_c"}},
          {"field": {"Name": "date_modified_c"}},
{"field": {"Name": "folder_id_c"}},
          {"field": {"Name": "pinned_c"}},
          {"field": {"Name": "archived_c"}}
        ],
        where: [
          {"FieldName": "pinned_c", "Operator": "EqualTo", "Values": [true]},
          {"FieldName": "archived_c", "Operator": "EqualTo", "Values": [false]}
        ],
        orderBy: [{"fieldName": "date_added_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success || !response.data) {
        return [];
      }
      
      return response.data.map(bookmark => ({
        ...bookmark,
        url: bookmark.url_c,
        title: bookmark.title_c || bookmark.Name,
        description: bookmark.description_c,
        tags: bookmark.tags_c ? bookmark.tags_c.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        favicon: bookmark.favicon_c || this.getFaviconUrl(bookmark.url_c),
        dateAdded: bookmark.date_added_c,
        dateModified: bookmark.date_modified_c,
folderId: bookmark.folder_id_c?.Id || bookmark.folder_id_c,
        isArchived: bookmark.archived_c || false,
        isPinned: true
      }));
    } catch (error) {
      console.error('Error fetching pinned bookmarks:', error?.response?.data?.message || error);
      return [];
    }
  }

  getFaviconUrl(url) {
    if (!url) return null;
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?sz=32&domain=${domain}`;
    } catch {
      return null;
    }
  }
}

export const bookmarkService = new BookmarkService();