const { shared } = wx.worklet
const app = getApp();

Page({
  data: {
    timeRemaining: "26:24",
    timerValue: 0, // 当前选中的时间值（分钟）
    timerItems: [],
    timerSelectedIndex: 0,
    timerMinValue: 5,
    timerMaxValue: 120,
    timerStep: 5,
    sheetHeight: 465,
    initialSize: 0,
    minSize: 0,
    maxSize: 1,
    // 音乐相关信息
    currentMusic: null,
    bgImage: '/assets/images/bg.png',  // 默认背景图
    title: ''
  },

  onLoad(options) {
    // 直接从全局状态获取当前音乐信息
    const { currentMusic } = app.globalData.audioState;
    if (currentMusic) {
      this.setData({
        bgImage: currentMusic.backgroundUrl,
        title: currentMusic.name
      });
    }

    // 注册监听器，以便后续状态变化时更新
    app.onAudioStateChange(this.handleAudioStateChange);
    
    this.generateTimerItems();
    this.getTimerSheetContext();
  },

  onUnload() {
    // 移除监听器
    app.offAudioStateChange(this.handleAudioStateChange);
  },

  handleAudioStateChange(state) {
    const { currentMusic } = state;
    if (currentMusic) {
      this.setData({
        bgImage: currentMusic.backgroundUrl,
        title: currentMusic.name
      });
    }
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
  onTimerChange(e) {
    const value = e.detail.value;
    this.setData({
      timerValue: value
    });
  },

  // 确认选择
  confirmTimer(e) {
    const value = e.detail.value || this.data.timerValue;
    // 设置倒计时逻辑
    // ...
    
    // 隐藏选择器
    this.hideTimerPicker();
  },

  // 快捷选择
  onTimerQuickSelect(e) {
    const value = e.detail.value;
    this.setData({
      timerValue: value
    });
  },
}) 