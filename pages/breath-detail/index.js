Page({
  data: {
    isPlaying: false,
    totalTime: 300, // 5分钟，单位秒
    remainTime: 300,
    progress: 0,
    formattedTime: '05:00',
    timeRemaining: "26:24",
    timerValue: 30, // 默认30分钟
    timerItems: [],
    timerSelectedIndex: 0,
    timerMinValue: 5,
    timerMaxValue: 120,
    timerStep: 5,
    sheetHeight: 465,
    initialSize: 0,
    minSize: 0,
    maxSize: 1,
  },

  onLoad(options) {
    const id = options.id;
    console.log('加载呼吸详情页，ID:', id);
    this.generateTimerItems();
    this.getTimerSheetContext();
  },

  togglePlay() {
    const isPlaying = !this.data.isPlaying;
    this.setData({ isPlaying });

    if (isPlaying) {
      this.startTimer();
    } else {
      this.pauseTimer();
    }
  },

  startTimer() {
    if (this.timer) clearInterval(this.timer);

    this.timer = setInterval(() => {
      let remainTime = this.data.remainTime - 1;
      let progress = (this.data.totalTime - remainTime) / this.data.totalTime * 100;

      if (remainTime <= 0) {
        clearInterval(this.timer);
        remainTime = 0;
        progress = 100;
        this.setData({ isPlaying: false });
      }

      const minutes = Math.floor(remainTime / 60).toString().padStart(2, '0');
      const seconds = (remainTime % 60).toString().padStart(2, '0');
      const formattedTime = `${minutes}:${seconds}`;

      this.setData({
        remainTime,
        progress,
        formattedTime
      });
    }, 1000);
  },

  pauseTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  onTimeSelected(e) {
    const { minutes, seconds } = e.detail;
    const totalTime = minutes * 60 + seconds;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    this.setData({
      totalTime,
      remainTime: totalTime,
      progress: 0,
      formattedTime,
    });

    if (this.data.isPlaying) {
      this.pauseTimer();
      this.startTimer();
    }
  },

  onUnload() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },
  // 获取 draggable-sheet 上下文
  getTimerSheetContext() {
    this.createSelectorQuery()
      .select(".breath-sheet")
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