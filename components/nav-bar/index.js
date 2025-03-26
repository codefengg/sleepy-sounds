const menuInfo = wx.getMenuButtonBoundingClientRect() || {};
const systemInfo = wx.getSystemInfoSync() || {};

Component({
  properties: {
    title: {
      type: String,
      value: ''
    },
    backgroundColor: {
      type: String,
      value: 'transparent'
    },
    textColor: {
      type: String,
      value: '#ffffff'
    },
    showBack: {
      type: Boolean,
      value: true
    }
  },

  data: {
    statusBarHeight: systemInfo.statusBarHeight || 20,
    navBarHeight: (menuInfo.height || 32) + ((menuInfo.top || 20) - (systemInfo.statusBarHeight || 20)) * 2,
    menuRect: menuInfo
  },

  methods: {
    onBack() {
      console.log('onBack')
      if (this.properties.showBack) {
        wx.navigateBack({
          fail: () => {
            wx.switchTab({
              url: '/pages/index/index'
            })
          }
        })
      }
      this.triggerEvent('back')
    }
  }
}) 