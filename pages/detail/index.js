const { shared } = wx.worklet
const app = getApp();

Page({
  data: {
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
    bgImage: '/assets/images/bg.png',
    title: '',
    isPlaying: false,
    timeRemaining: '05:00' // 格式化后的剩余时间
  },

  onLoad() {
    // 注册监听器
    app.onAudioStateChange(this.handleAudioStateChange);
    
    // 初始化时获取当前状态
    const { currentMusic, isPlaying, remainingTime, defaultDuration } = app.globalData.audioState;
    
    // 设置默认选中的时间值（分钟）
    const defaultMinutes = Math.floor(defaultDuration / 60);
    
    this.setData({
      bgImage: currentMusic?.backgroundUrl || '/assets/images/bg.png',
      title: currentMusic?.name || '',
      isPlaying: isPlaying,
      timeRemaining: this.formatTime(remainingTime),
      timerValue: defaultMinutes
    });

    this.generateTimerItems();
    this.getTimerSheetContext();
  },

  onUnload() {
    app.offAudioStateChange(this.handleAudioStateChange);
  },

  handleAudioStateChange(state) {
    const { currentMusic, isPlaying, remainingTime } = state;
    if (currentMusic) {
      this.setData({
        bgImage: currentMusic.backgroundUrl,
        title: currentMusic.name,
        isPlaying,
        timeRemaining: this.formatTime(remainingTime)
      });
    }
  },

  // 格式化时间
  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  },

  // 播放/暂停切换
  togglePlay() {
    if (this.data.isPlaying) {
      app.pauseMusic();
    } else {
      app.resumeMusic();
    }
  },

  // 确认选择时间
  confirmTimer(e) {
    const value = e.detail.value || this.data.timerValue;
    // 设置新的默认播放时长
    app.setDefaultDuration(value);
    
    // 隐藏选择器
    this.hideTimerPicker();
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

  // 快捷选择
  onTimerQuickSelect(e) {
    const value = e.detail.value;
    this.setData({
      timerValue: value
    });
  },
}) 