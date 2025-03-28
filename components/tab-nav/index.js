// 导入云函数助手
const cloudHelper = require('../../utils/cloudHelper');

Component({
  properties: {
    currentTabId: {
      type: String,
      value: ''
    }
  },

  data: {
    mainCategories: [], // 一级分类
    subCategories: {}, // 二级分类映射
    currentMainId: '', // 当前选中的一级分类ID
    currentSubId: '', // 当前选中的二级分类ID
    lineLeft: 0,
    lineOpacity: 0,
    isDefaultData: false // 标记是否为默认数据
  },

  lifetimes: {
    attached() {
      // 尝试从缓存获取数据
      const cacheData = wx.getStorageSync('categoryData');
      
      if (cacheData) {
        // 有缓存数据，使用缓存数据
        console.log('使用缓存的分类数据');
        this.processCategories(cacheData, false);
      } else {
        // 无缓存数据，使用默认数据
        const defaultData = {
          mainCategories: [{
            _id: 'default',
            name: '助眠',
            order: 0
          }],
          subCategories: {}
        };
        
        this.setData({
          mainCategories: defaultData.mainCategories,
          subCategories: defaultData.subCategories,
          currentMainId: defaultData.mainCategories[0]._id,
          isDefaultData: true // 标记为默认数据
        });
        
        // 设置默认线条位置
        setTimeout(() => {
          this.setLinePosition(0);
        }, 100);
      }
      
      // 获取最新数据
      this.fetchCategories();
    }
  },

  methods: {
    // 获取分类数据
    fetchCategories() {
      cloudHelper.callFunction('categoryManager', { action: 'get' })
        .then(res => {
          if (res.result && res.result.success) {
            const categories = res.result.data;
            
            // 保存到缓存
            wx.setStorageSync('categoryData', categories);
            
            // 处理真实数据
            this.processCategories(categories, true);
          }
        });
    },

    // 处理分类数据
    // isRealData: 是否为真实数据（区分缓存数据和真实数据）
    processCategories(categories, isRealData) {
      if (!categories || categories.length === 0) return;
      
      // 分离一级和二级分类
      const mainCategories = categories.filter(item => !item.parentId)
        .sort((a, b) => a.order - b.order);
      
      // 构建二级分类映射
      const subCategories = {};
      categories.filter(item => item.parentId).forEach(item => {
        if (!subCategories[item.parentId]) {
          subCategories[item.parentId] = [];
        }
        subCategories[item.parentId].push(item);
      });
      
      // 排序二级分类
      Object.keys(subCategories).forEach(key => {
        subCategories[key].sort((a, b) => a.order - b.order);
      });
      
      // 更新数据
      this.setData({ 
        mainCategories, 
        subCategories,
        isDefaultData: false // 无论是缓存还是真实数据，都不是默认数据
      });
      
      // 如果当前没有选中的分类，或者是真实数据更新，选中第一个
      if (!this.data.currentMainId || isRealData) {
        const firstMainId = mainCategories[0]._id;
        let firstSubId = '';
        
        if (subCategories[firstMainId] && subCategories[firstMainId].length > 0) {
          firstSubId = subCategories[firstMainId][0]._id;
        }
        
        this.setData({
          currentMainId: firstMainId,
          currentSubId: firstSubId
        });
        
        // 触发事件，并标记数据来源
        this.triggerEvent('categoryChange', {
          categoryId: firstSubId || firstMainId,
          mainCategoryId: firstMainId,
          subCategoryId: firstSubId,
          isDefaultData: false,
          isRealData // 区分缓存数据和真实数据
        });
      }
      
      // 重新设置线条位置
      const index = mainCategories.findIndex(item => item._id === this.data.currentMainId);
      if (index !== -1) {
        setTimeout(() => {
          this.setLinePosition(index);
        }, 100);
      }
    },
    
    // 设置线条位置
    setLinePosition(index) {
      const query = this.createSelectorQuery().in(this);
      query.select(`#tab-${index}`).boundingClientRect(rect => {
        if (rect) {
          const lineLeft = rect.left + (rect.width) / 2 - 15 - 16;
          this.setData({
            lineLeft,
            lineOpacity: 1
          });
        }
      }).exec();
    },
    
    // 切换主分类
    switchTab(e) {
      const index = e.currentTarget.dataset.index;
      const id = e.currentTarget.dataset.id;
      
      if (id === this.data.currentMainId) return;
      
      // 获取该主分类下的子分类
      const subs = this.data.subCategories[id] || [];
      const subId = subs.length > 0 ? subs[0]._id : '';
      
      this.setData({
        currentMainId: id,
        currentSubId: subId
      });
      
      // 设置线条位置
      this.setLinePosition(index);
      
      // 触发事件
      this.triggerEvent('categoryChange', {
        categoryId: subId || id,
        mainCategoryId: id,
        subCategoryId: subId
      });
    },
    
    // 切换子分类
    switchSubTab(e) {
      const subId = e.currentTarget.dataset.id;
      
      if (subId === this.data.currentSubId) return;
      
      this.setData({ currentSubId: subId });
      
      // 触发事件
      this.triggerEvent('categoryChange', {
        categoryId: subId,
        mainCategoryId: this.data.currentMainId,
        subCategoryId: subId
      });
    }
  }
}); 