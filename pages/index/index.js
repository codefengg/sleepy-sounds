const { windowHeight } = wx.getSystemInfoSync()
const menuRect = wx.getMenuButtonBoundingClientRect()
const sheetHeight = windowHeight - (menuRect.bottom + menuRect.height + 60)

const middleSize = 0.6

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
    currentTab: 0,
    activeTab: 'sleep', // 默认助眠为激活状态，可选值: 'sleep', 'breathe',
    tabIcons: [null, null, '/assets/images/mie.png'] // 第三个标签有图标
  },

  onSizeUpdate(e) {
    'worklet'
    const distance = sheetHeight - e.pixels
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
  },

  onTabChange(e) {
    this.setData({
      currentTab: e.detail.index
    })
  },

  // 切换底部标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      activeTab: tab
    })
  }
})