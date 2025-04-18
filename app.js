App({
  globalData: {
    audioState: {
      currentMusic: null,  // 当前选中的音乐信息
      isPlaying: false,    // 播放状态（后续用）
      defaultDuration: 5 * 60,  // 默认时长（秒）
      remainingTime: 0         // 实际剩余时间（秒）
    },
    backgroundAudioManager: null,
    timer: null // 用于倒计时
  },
  
  _listeners: [],
  
  // 更新音乐信息的方法
  setCurrentMusic(music) {
    this.globalData.audioState.currentMusic = {
      id: music._id,
      name: music.name || '未知音乐',
      title: music.title || '轻音乐',
      subtitle: music.subtitle || '',
      backgroundUrl: music.backgroundUrl || '/assets/images/bg.png',
      iconUrl: music.iconUrl || '/assets/images/press.png',
      audioUrl: music.audioUrl
    };
    
    // 通知所有监听器
    this._listeners.forEach(listener => {
      listener(this.globalData.audioState);
    });
  },
  
  // 监听状态变化
  onAudioStateChange(listener) {
    this._listeners.push(listener);
  },
  
  offAudioStateChange(listener) {
    const index = this._listeners.indexOf(listener);
    if (index > -1) {
      this._listeners.splice(index, 1);
    }
  },

  onLaunch() {
    // 初始化背景音频管理器
    this.globalData.backgroundAudioManager = wx.getBackgroundAudioManager();
    this.initAudioManager();

    // 初始化云环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'cloud1-7g7ul2l734c0683b',
        traceUser: true,
      });
    }
  },

  // 初始化音频管理器
  initAudioManager() {
    const audioManager = this.globalData.backgroundAudioManager;

    // 监听播放状态
    audioManager.onPlay(() => {
      this.setAudioState({ isPlaying: true });
    });

    audioManager.onPause(() => {
      this.setAudioState({ isPlaying: false });
      // 暂停时清除定时器
      if (this.globalData.timer) {
        clearInterval(this.globalData.timer);
      }
    });

    audioManager.onStop(() => {
      this.setAudioState({ isPlaying: false });
      // 停止时清除定时器
      if (this.globalData.timer) {
        clearInterval(this.globalData.timer);
      }
    });

    // 监听音频自然播放结束
    audioManager.onEnded(() => {
      const { currentMusic } = this.globalData.audioState;
      const { remainingTime } = this.globalData.audioState;
      
      // 如果还有剩余时间，继续播放
      if (remainingTime > 0) {
        // 重新播放当前音频
        audioManager.title = currentMusic.name;
        audioManager.epname = currentMusic.title;
        audioManager.coverImgUrl = currentMusic.backgroundUrl;
        audioManager.src = currentMusic.audioUrl; // 重新设置src会自动播放
      } else {
        // 时间到，停止播放
        this.stopMusic();
      }
    });
  },

  // 播放音乐
  playMusic(music) {
    const audioManager = this.globalData.backgroundAudioManager;
    const currentState = this.globalData.audioState;
    
    // 检查是否是同一首音乐
    if (currentState.currentMusic && currentState.currentMusic.id === music._id) {
      // 同一首音乐，不需要重新播放，只更新状态
      this.setAudioState({
        currentMusic: {
          ...music,
          id: music._id
        }
      });
      return;
    }
    
    // 不同音乐，需要重新播放
    // 使用全局默认时长
    const { defaultDuration } = currentState;
    
    // 更新状态
    this.setAudioState({
      currentMusic: {
        ...music,
        id: music._id
      },
      isPlaying: true,
      remainingTime: defaultDuration  // 新音乐使用默认时长
    });
    
    // 设置音频信息
    audioManager.title = music.name || '未知音乐';
    audioManager.epname = music.title || '轻音乐';
    audioManager.coverImgUrl = music.backgroundUrl;
    audioManager.src = music.audioUrl;

    // 启动倒计时
    this.startTimer();
  },

  // 启动倒计时
  startTimer() {
    // 清除可能存在的旧定时器
    if (this.globalData.timer) {
      clearInterval(this.globalData.timer);
    }

    // 创建新的定时器
    this.globalData.timer = setInterval(() => {
      const { remainingTime } = this.globalData.audioState;
      if (remainingTime > 0) {
        this.setAudioState({
          remainingTime: remainingTime - 1
        });
      } else {
        // 时间到，停止播放
        this.stopMusic();
      }
    }, 1000);
  },

  // 设置默认播放时长
  setDefaultDuration(minutes) {
    const seconds = minutes * 60;
    this.setAudioState({
      defaultDuration: seconds,
      // 如果当前正在播放，也更新剩余时间
      ...(this.globalData.audioState.isPlaying ? { remainingTime: seconds } : {})
    });
  },

  // 暂停播放
  pauseMusic() {
    this.globalData.backgroundAudioManager.pause();
    // 暂停时清除定时器，但保留剩余时间
    if (this.globalData.timer) {
      clearInterval(this.globalData.timer);
      this.globalData.timer = null;
    }
    this.setAudioState({ isPlaying: false });
  },

  // 继续播放
  resumeMusic() {
    // 如果有剩余时间才继续播放
    if (this.globalData.audioState.remainingTime > 0) {
      this.globalData.backgroundAudioManager.play();
      this.startTimer(); // 重新启动定时器
      this.setAudioState({ isPlaying: true });
    }
  },

  // 停止播放
  stopMusic() {
    this.globalData.backgroundAudioManager.stop();
    // 清除定时器
    if (this.globalData.timer) {
      clearInterval(this.globalData.timer);
      this.globalData.timer = null;
    }
    this.setAudioState({
      currentMusic: null,
      isPlaying: false,
      remainingTime: 0
    });
  },

  // 更新音频状态
  setAudioState(state) {
    this.globalData.audioState = {
      ...this.globalData.audioState,
      ...state
    };
    
    // 通知所有监听器
    this._listeners.forEach(listener => {
      listener(this.globalData.audioState);
    });
  }
}) 