import bookmarksData from '@/services/mockData/bookmarks.json';

class BookmarkService {
  constructor() {
    this.storageKey = 'linkvault-bookmarks';
    this.initializeData();
  }
  
  initializeData() {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      localStorage.setItem(this.storageKey, JSON.stringify(bookmarksData));
    }
  }
  
  getData() {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }
  
  saveData(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }
  
  async delay() {
    return new Promise(resolve => setTimeout(resolve, 300));
  }
  
  async getAll() {
    await this.delay();
    return [...this.getData()].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
  }
  
  async getById(id) {
    await this.delay();
    const data = this.getData();
    const bookmark = data.find(item => item.Id === parseInt(id));
    return bookmark ? { ...bookmark } : null;
  }
  
  async getByTag(tagName) {
    await this.delay();
    const data = this.getData();
    return data
      .filter(bookmark => bookmark.tags && bookmark.tags.includes(tagName))
      .map(bookmark => ({ ...bookmark }))
      .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
  }
  
  async getByFolder(folderId) {
    await this.delay();
    const data = this.getData();
    return data
      .filter(bookmark => bookmark.folderId === folderId)
      .map(bookmark => ({ ...bookmark }))
      .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
  }
  
  async create(bookmarkData) {
    await this.delay();
    const data = this.getData();
    const maxId = data.length > 0 ? Math.max(...data.map(item => item.Id)) : 0;
    
    const newBookmark = {
      Id: maxId + 1,
      ...bookmarkData,
      dateAdded: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      favicon: this.getFaviconUrl(bookmarkData.url)
    };
    
    data.push(newBookmark);
    this.saveData(data);
    return { ...newBookmark };
  }
  
  async update(id, bookmarkData) {
    await this.delay();
    const data = this.getData();
    const index = data.findIndex(item => item.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error('Bookmark not found');
    }
    
    data[index] = {
      ...data[index],
      ...bookmarkData,
      Id: parseInt(id),
      dateModified: new Date().toISOString(),
      favicon: this.getFaviconUrl(bookmarkData.url || data[index].url)
    };
    
    this.saveData(data);
    return { ...data[index] };
  }
  
  async delete(id) {
    await this.delay();
    const data = this.getData();
    const filteredData = data.filter(item => item.Id !== parseInt(id));
    
    if (filteredData.length === data.length) {
      throw new Error('Bookmark not found');
    }
    
    this.saveData(filteredData);
    return true;
  }
  
  getFaviconUrl(url) {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?sz=32&domain=${domain}`;
    } catch {
      return null;
    }
  }
}

export const bookmarkService = new BookmarkService();