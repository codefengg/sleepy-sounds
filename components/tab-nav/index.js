Component({
  properties: {
    tabs: {
      type: Array,
      value: []
    },
    tabIcons: {
      type: Array,
      value: [null, null, null] // 第三个标签有图标
    },
    currentTab: {
      type: Number,
      value: 0
    }
  },

  data: {
    lineLeft: 0,
    lineOpacity: 0,
    currentSubTab: 0,
    // 每个主tab对应的副tab数据
    subTabs: []
  },

  lifetimes: {
    attached() {
      // 获取分类数据
      this.fetchCategories();
    },
    
    ready() {
      // 组件完全初始化后，计算初始位置
      this.setLinePosition(this.data.currentTab)
    }
  },

  methods: {
    // 获取分类数据
    fetchCategories() {
      wx.cloud.callFunction({
        name: 'categoryManager',
        data: {
          action: 'get'
        }
      })
      .then(res => {
        if (res.result && res.result.success) {
          this.processCategories(res.result.data);
        } else {
          console.error('获取分类失败:', res);
        }
      })
      .catch(err => {
        console.error('调用云函数失败:', err);
      });
    },

    // 处理分类数据
    processCategories(categories) {
      // 区分一级分类和二级分类
      const mainCategories = categories.filter(item => !item.parentId)
        .sort((a, b) => a.order - b.order);
      
      // 提取一级分类名称
      const tabs = mainCategories.map(item => item.name);
      
      // 为每个一级分类准备图标
      const tabIcons = mainCategories.map(item => 
        item._id === "f5d5a75067dd059500488a0429172332" ? '/assets/images/mie.png' : null
      );
      
      // 为每个一级分类找到对应的二级分类
      const subTabsMap = {};
      mainCategories.forEach(main => {
        // 找到当前一级分类下的所有二级分类
        const subs = categories.filter(item => item.parentId === main._id)
          .sort((a, b) => a.order - b.order);
        
        // 保存二级分类名称
        subTabsMap[main._id] = subs.map(item => item.name);
      });
      
      // 构建二维数组，与tabs顺序对应
      const subTabs = mainCategories.map(main => subTabsMap[main._id] || []);
      
      // 更新组件数据
      this.setData({
        tabs,
        tabIcons,
        subTabs
      });
      
      // 重新计算线条位置
      setTimeout(() => {
        this.setLinePosition(this.data.currentTab);
      }, 100);
    },

    setLinePosition(index) {
      const query = this.createSelectorQuery().in(this)
      query.select(`#tab-${index}`).boundingClientRect(rect => {
        if (rect) {
          // 计算线条位置：tab的中心点减去线条一半宽度
          const lineLeft = rect.left + (rect.width) / 2 - 15 - 16
          this.setData({
            lineLeft,
            lineOpacity: 1
          })
        }
      }).exec()
    },

    switchTab(e) {
      const index = e.currentTarget.dataset.index
      if (index === this.data.currentTab) return
      
      this.setLinePosition(index)
      this.setData({ currentSubTab: 0 }) // 切换主tab时重置副tab
      this.triggerEvent('change', { index, subIndex: 0 })
    },

    switchSubTab(e) {
      const subIndex = e.currentTarget.dataset.index
      if (subIndex === this.data.currentSubTab) return

      this.setData({ currentSubTab: subIndex })
      this.triggerEvent('change', { 
        index: this.data.currentTab, 
        subIndex 
      })
    }
  },

  observers: {
    'currentTab': function(newIndex, oldIndex) {
      if (typeof oldIndex !== 'undefined' && newIndex !== oldIndex) {
        this.setLinePosition(newIndex)
      }
    }
  }
}) 