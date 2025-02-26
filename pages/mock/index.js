Page({
  data: {
    visible: true
  },

  openDrawer() {
    this.setData({ visible: true })
  },

  onDrawerClose() {
    this.setData({ visible: false })
  }
}) 