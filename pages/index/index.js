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
  },

  onSizeUpdate(e) {
    'worklet'
    const distance = sheetHeight - e.pixels
    this.progress.value = distance >= 20 ? 1 : distance / 20
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
  }
})