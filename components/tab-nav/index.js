Component({
  properties: {
    tabs: {
      type: Array,
      value: ['助眠音乐', '白噪音', '数羊']
    },
    tabIcons: {
      type: Array,
      value: [null, null, '/assets/images/mie.png'] // 第三个标签有图标
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
    subTabs: [
      ['轻音乐', '白噪音', '自然声', '冥想音乐'],
      ['雨声', '海浪', '风声', '火声'],
      ['睡前', '清晨', '午后', '深夜']
    ]
  },

  lifetimes: {
    ready() {
      // 组件完全初始化后，计算初始位置
      this.setLinePosition(this.data.currentTab)
    }
  },

  methods: {
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