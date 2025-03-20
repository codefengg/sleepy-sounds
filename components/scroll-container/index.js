Component({
  options: {
    multipleSlots: true // 启用多插槽
  },
  
  properties: {
    currentTab: {
      type: Number,
      value: 0
    },
    tabIcons: {
      type: Array,
      value: []
    },
    // 是否显示指示器
    showIndicator: {
      type: Boolean,
      value: true
    },
    // 底部间距高度
    bottomSpace: {
      type: Number,
      value: 94
    },
    // 背景颜色
    backgroundColor: {
      type: String,
      value: 'rgba(49, 59, 131, 0.24)'
    },
    // 是否启用模糊效果
    enableBlur: {
      type: Boolean,
      value: true
    }
  },
  
  methods: {
    onTabChange(e) {
      this.triggerEvent('change', e.detail);
    }
  }
}) 