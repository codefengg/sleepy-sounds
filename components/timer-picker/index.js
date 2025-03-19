const { shared } = wx.worklet

Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    value: {
      type: Number,
      value: 30
    },
    minValue: {
      type: Number,
      value: 5
    },
    maxValue: {
      type: Number,
      value: 120
    },
    step: {
      type: Number,
      value: 5
    }
  },
  
  observers: {
    'value, minValue, maxValue, step': function() {
      this.generateItems()
    },
    'visible': function(visible) {
      if (visible) {
        // 当显示选择器时，滚动到当前值并展开面板
        this.scrollToCurrentValue()
        if (this.sheetContext) {
          this.sheetContext.scrollTo({
            size: 0.4,
            animated: true,
            duration: 300,
            easingFunction: 'ease'
          })
        }
      } else {
        // 隐藏面板
        if (this.sheetContext) {
          this.sheetContext.scrollTo({
            size: 0,
            animated: true,
            duration: 300,
            easingFunction: 'ease'
          })
        }
      }
    }
  },
  
  lifetimes: {
    created() {
      console.log('timer-picker component created')
    },
    attached() {
      console.log('timer-picker component attached')
      this.generateItems()
    },
    ready() {
      console.log('timer-picker component ready')
      this.setupCustomPickerStyles()
      this.getSheetContext()
    }
  },
  
  data: {
    items: [],
    selectedIndex: 0
  },
  
  methods: {
    // 生成选项数据
    generateItems() {
      const { minValue, maxValue, step, value } = this.properties
      const items = []
      let selectedIndex = 0
      
      for (let i = minValue; i <= maxValue; i += step) {
        items.push(i)
        if (i === value) {
          selectedIndex = items.length - 1
        }
      }
      
      this.setData({ 
        items,
        selectedIndex
      })
    },
    
    // 设置自定义选择器样式
    setupCustomPickerStyles() {
      // 不再需要动态更新样式
      // 只需确保选择器正确初始化
      setTimeout(() => {
        // 初始化完成后，可以做一些其他设置
        console.log('选择器初始化完成')
      }, 100)
    },
    
    // 滚动到当前值
    scrollToCurrentValue() {
      const { value } = this.properties
      const { items } = this.data
      
      // 找到最接近当前值的选项
      let closestIndex = 0
      let minDiff = Math.abs(items[0] - value)
      
      for (let i = 1; i < items.length; i++) {
        const diff = Math.abs(items[i] - value)
        if (diff < minDiff) {
          minDiff = diff
          closestIndex = i
        }
      }
      
      this.setData({ selectedIndex: closestIndex })
    },
    
    // picker-view 变化事件
    onPickerChange(e) {
      const selectedIndex = e.detail.value[0]
      this.setData({ selectedIndex })
    },
    
    // 确认选择
    confirm() {
      const value = this.data.items[this.data.selectedIndex]
      console.log('确认选择:', value, '分钟')
      this.triggerEvent('confirm', { value })
      this.triggerEvent('close')
    },
    
    // 取消选择
    cancel() {
      console.log('取消选择')
      this.triggerEvent('close')
      if (this.sheetContext) {
        this.sheetContext.scrollTo({
          size: 0,
          animated: true,
          duration: 300,
          easingFunction: 'ease'
        })
      }
    },
    
    // 快捷选择
    onQuickSelect(e) {
      const value = parseInt(e.currentTarget.dataset.value);
      
      // 找到对应的索引
      const { items } = this.data;
      let selectedIndex = 0;
      
      for (let i = 0; i < items.length; i++) {
        if (items[i] === value) {
          selectedIndex = i;
          break;
        }
      }
      
      this.setData({ selectedIndex });
    },
    
    // 添加获取 draggable-sheet 上下文的方法
    getSheetContext() {
      this.createSelectorQuery()
        .select(".timer-sheet")
        .node()
        .exec(res => {
          if (res && res[0]) {
            this.sheetContext = res[0].node
            console.log('获取 sheet 上下文成功')
          }
        })
    }
  }
}) 