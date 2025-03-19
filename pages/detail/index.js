const { shared } = wx.worklet

Page({
  data: {
    title: "小雨声",
    timeRemaining: "26:24",
    timerValue: 30, // 默认30分钟
    timerItems: [],
    timerSelectedIndex: 0,
    timerMinValue: 5,
    timerMaxValue: 120,
    timerStep: 5,
    sheetHeight: 508,
    initialSize: 0,
    minSize: 0,
    maxSize: 1,
  },

  onLoad(options) {
    // 可以从options中获取传递的参数
    this.generateTimerItems();
    this.getTimerSheetContext();
  },

  // 播放/暂停按钮点击事件
  onPlayPause() {
    // 播放/暂停逻辑
  },

  // 获取 draggable-sheet 上下文
  getTimerSheetContext() {
    this.createSelectorQuery()
      .select(".timer-sheet")
      .node()
      .exec(res => {
        if (res && res[0]) {
          this.timerSheetContext = res[0].node;
          console.log('获取 timer sheet 上下文成功');
        }
      });
  },

  // 生成选项数据
  generateTimerItems() {
    const { timerMinValue, timerMaxValue, timerStep, timerValue } = this.data;
    const items = [];
    let selectedIndex = 0;
    
    for (let i = timerMinValue; i <= timerMaxValue; i += timerStep) {
      items.push(i);
      if (i === timerValue) {
        selectedIndex = items.length - 1;
      }
    }
    
    this.setData({ 
      timerItems: items,
      timerSelectedIndex: selectedIndex
    });
  },

  // 显示倒计时选择器
  showTimerPicker() {
    wx.nextTick(() => {
      this.scrollToCurrentTimerValue();
      
      if (this.timerSheetContext) {
        this.timerSheetContext.scrollTo({
          size: 1,
          pixels: 600,
          animated: true,
          duration: 300,
          easingFunction: 'ease'
        });
      }
    });
  },

  // 隐藏倒计时选择器
  hideTimerPicker(e) {
    // 如果点击的是播放器区域，不隐藏
    if (e && e.target.id === 'player') return;
    
    if (this.timerSheetContext) {
      this.timerSheetContext.scrollTo({
        size: 0,
        animated: true,
        duration: 300,
        easingFunction: 'ease'
      });
    }
  },

  // 滚动到当前值
  scrollToCurrentTimerValue() {
    const { timerValue, timerItems } = this.data;
    
    // 找到最接近当前值的选项
    let closestIndex = 0;
    let minDiff = Math.abs(timerItems[0] - timerValue);
    
    for (let i = 1; i < timerItems.length; i++) {
      const diff = Math.abs(timerItems[i] - timerValue);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }
    
    this.setData({ timerSelectedIndex: closestIndex });
  },

  // picker-view 变化事件
  onTimerPickerChange(e) {
    const timerSelectedIndex = e.detail.value[0];
    this.setData({ timerSelectedIndex });
  },

  // 确认选择
  confirmTimer() {
    const timerValue = this.data.timerItems[this.data.timerSelectedIndex];
    console.log('确认选择:', timerValue, '分钟');
    
    // 这里可以添加你的业务逻辑，例如设置倒计时
  },

  // 快捷选择
  onTimerQuickSelect(e) {
    const value = parseInt(e.currentTarget.dataset.value);
    
    // 找到对应的索引
    const { timerItems } = this.data;
    let timerSelectedIndex = 0;
    
    for (let i = 0; i < timerItems.length; i++) {
      if (timerItems[i] === value) {
        timerSelectedIndex = i;
        break;
      }
    }
    
    this.setData({ timerSelectedIndex });
  },
}) 