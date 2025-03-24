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
    lineOpacity: 0
  },

  lifetimes: {
    attached() {
      // 获取分类数据
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
            
            this.setData({ mainCategories, subCategories });
            
            // 默认选中第一个一级分类
            if (mainCategories.length > 0) {
              const firstMainId = mainCategories[0]._id;
              let firstSubId = '';
              
              // 如果有二级分类，默认选中第一个
              if (subCategories[firstMainId] && subCategories[firstMainId].length > 0) {
                firstSubId = subCategories[firstMainId][0]._id;
              }
              
              // 设置选中状态
              this.setData({
                currentMainId: firstMainId,
                currentSubId: firstSubId
              });
              
              // 设置线条位置
              setTimeout(() => {
                this.setLinePosition(0);
              }, 100);
              
              // 触发事件
              this.triggerEvent('categoryChange', {
                categoryId: firstSubId || firstMainId,
                mainCategoryId: firstMainId,
                subCategoryId: firstSubId
              });
            }
          }
        });
    },
    
    // 设置线条位置
    setLinePosition(index) {
      const query = this.createSelectorQuery().in(this);
      query.select(`#tab-${index}`).boundingClientRect(rect => {
        if (rect) {
          const lineLeft = rect.left + rect.width / 2 - 15 - 16;
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