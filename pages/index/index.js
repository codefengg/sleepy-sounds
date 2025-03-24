const { windowHeight } = wx.getSystemInfoSync()
const menuRect = wx.getMenuButtonBoundingClientRect()
const sheetHeight = windowHeight - (menuRect.bottom + menuRect.height + 60)

const middleSize = 0.6

// 导入云函数助手
const cloudHelper = require('../../utils/cloudHelper');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    menuRect,
    sheetHeight,
    minSize: 0.6,
    maxSize: 1,
    snapSizes: [],
    middleSize,
    currentTabId: '', // 使用ID而不是索引
    activeTab: 'sleep', // 默认助眠为激活状态，可选值: 'sleep', 'breathe',
    tabIcons: [null, null, '/assets/images/mie.png'], // 第三个标签有图标
    gridList: [] // 存储网格列表数据
  },

  onSizeUpdate(e) {
    'worklet'
    const distance = sheetHeight - e.pixels
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 页面加载时不需要立即获取音乐列表
    // 等待tab-nav组件加载分类数据并触发categoryChange事件
  },

  // 处理分类变化事件
  onCategoryChange(e) {
    const { categoryId, mainCategoryId, subCategoryId } = e.detail;
    
    // 更新当前选中的tab ID
    this.setData({
      currentTabId: categoryId  // 直接使用categoryId，因为组件已经处理好了优先级
    });
    
    // 获取对应分类的音乐列表
    this.fetchMusicList(categoryId);
  },
  
  // 获取音乐列表
  fetchMusicList(categoryId) {
    if (!categoryId) {
      console.error('分类ID不能为空');
      return;
    }
    
    cloudHelper.callFunction('musicManager', {
      action: 'get',
      categoryId: categoryId
    })
    .then(res => {
      if (res.result && res.result.success) {
        // 更新网格列表数据
        const musicList = res.result.data;
        
        this.setData({
          gridList: musicList || []
        });
      }
    })
    .catch(() => {
    });
  },

  // 切换底部标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    
    if (tab === 'breathe') {
      // 点击呼吸标签时跳转到呼吸列表页面
      wx.navigateTo({
        url: '/pages/breath-list/index'
      });
      return; // 不执行后续的标签切换逻辑
    }
    
    // 其他标签的切换逻辑保持不变
    this.setData({
      activeTab: tab
    });
  },

  // 点击音乐项跳转到详情页
  onItemTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/index?id=${id}`
    });
  },
  
  // 点击呼吸图标跳转到呼吸列表页
  onBreathTap() {
    wx.navigateTo({
      url: '/pages/breath-list/index'
    });
  }
})