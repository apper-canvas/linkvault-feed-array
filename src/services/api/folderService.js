import foldersData from '@/services/mockData/folders.json';

class FolderService {
  constructor() {
    this.storageKey = 'linkvault-folders';
    this.initializeData();
  }
  
  initializeData() {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      localStorage.setItem(this.storageKey, JSON.stringify(foldersData));
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
    return new Promise(resolve => setTimeout(resolve, 250));
  }
  
  async getAll() {
    await this.delay();
    return [...this.getData()].sort((a, b) => a.name.localeCompare(b.name));
  }
  
  async getById(id) {
    await this.delay();
    const data = this.getData();
    const folder = data.find(item => item.Id === parseInt(id));
    return folder ? { ...folder } : null;
  }
  
  async create(folderData) {
    await this.delay();
    const data = this.getData();
    const maxId = data.length > 0 ? Math.max(...data.map(item => item.Id)) : 0;
    
    const newFolder = {
      Id: maxId + 1,
      ...folderData,
      bookmarkCount: 0
    };
    
    data.push(newFolder);
    this.saveData(data);
    return { ...newFolder };
  }
  
  async update(id, folderData) {
    await this.delay();
    const data = this.getData();
    const index = data.findIndex(item => item.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error('Folder not found');
    }
    
    data[index] = {
      ...data[index],
      ...folderData,
      Id: parseInt(id)
    };
    
    this.saveData(data);
    return { ...data[index] };
  }
  
  async delete(id) {
    await this.delay();
    const data = this.getData();
    const filteredData = data.filter(item => item.Id !== parseInt(id));
    
    if (filteredData.length === data.length) {
      throw new Error('Folder not found');
    }
    
    this.saveData(filteredData);
    return true;
  }
}

export const folderService = new FolderService();