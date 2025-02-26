const { shared } = wx.worklet
const { windowHeight } = wx.getSystemInfoSync()

Component({
  properties: {
    height: {
      type: Number,
      value: windowHeight * 0.8
    },
    minSize: {
      type: Number,
      value: 0.5
    },
    maxSize: {
      type: Number,
      value: 1
    },
    initialSize: {
      type: Number,
      value: 0.5
    }
  },

  data: {
  },

  methods: {
    onSizeUpdate(e) {
      'worklet'
      const distance = this.data.height - e.pixels
      this.progress.value = distance >= 20 ? 1 : distance / 20
    }
  },

  lifetimes: {
    attached() {
      const progress = shared(1)
      this.progress = progress

      this.applyAnimatedStyle('.indicator', () => {
        'worklet'
        const t = progress.value
        return {
          opacity: t
        }
      })
    }
  }
}) 