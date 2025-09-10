import tagsData from '@/services/mockData/tags.json';

class TagService {
  constructor() {
    this.storageKey = 'linkvault-tags';
    this.initializeData();
  }
  
  initializeData() {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      localStorage.setItem(this.storageKey, JSON.stringify(tagsData));
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
    return new Promise(resolve => setTimeout(resolve, 200));
  }
  
  async getAll() {
    await this.delay();
    return [...this.getData()].sort((a, b) => b.usageCount - a.usageCount);
  }
  
  async getByName(name) {
    await this.delay();
    const data = this.getData();
    const tag = data.find(item => item.name === name);
    return tag ? { ...tag } : null;
  }
  
  async create(tagData) {
    await this.delay();
    const data = this.getData();
    
    // Check if tag already exists
    const existingTag = data.find(item => item.name === tagData.name);
    if (existingTag) {
      return { ...existingTag };
    }
    
    const newTag = {
      name: tagData.name,
      color: tagData.color || '#2563eb',
      usageCount: 1
    };
    
    data.push(newTag);
    this.saveData(data);
    return { ...newTag };
  }
  
  async updateUsageCount(tagName, increment = true) {
    await this.delay();
    const data = this.getData();
    const tag = data.find(item => item.name === tagName);
    
    if (tag) {
      tag.usageCount += increment ? 1 : -1;
      if (tag.usageCount <= 0) {
        // Remove tag if usage count reaches 0
        const filteredData = data.filter(item => item.name !== tagName);
        this.saveData(filteredData);
      } else {
        this.saveData(data);
      }
    }
    
    return tag;
  }
  
  async delete(name) {
    await this.delay();
    const data = this.getData();
    const filteredData = data.filter(item => item.name !== name);
    
    if (filteredData.length === data.length) {
      throw new Error('Tag not found');
    }
    
    this.saveData(filteredData);
    return true;
  }
}

export const tagService = new TagService();