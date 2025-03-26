App({
  globalData: {
    audioState: {
      currentMusic: null,  // 当前选中的音乐信息
      isPlaying: false    // 播放状态（后续用）
    },
    backgroundAudioManager: null
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
    });

    audioManager.onStop(() => {
      this.setAudioState({ isPlaying: false });
    });

    audioManager.onEnded(() => {
      this.setAudioState({ isPlaying: false });
    });
  },

  // 播放音乐
  playMusic(music) {
    const audioManager = this.globalData.backgroundAudioManager;
    
    // 设置音频信息
    audioManager.title = music.name || '未知音乐';
    audioManager.epname = music.title || '轻音乐';
    audioManager.coverImgUrl = music.backgroundUrl;
    // 设置了 src 后会自动播放
    audioManager.src = music.audioUrl;

    // 更新状态
    this.setAudioState({
      currentMusic: music,
      isPlaying: true
    });
  },

  // 暂停播放
  pauseMusic() {
    this.globalData.backgroundAudioManager.pause();
  },

  // 继续播放
  resumeMusic() {
    this.globalData.backgroundAudioManager.play();
  },

  // 停止播放
  stopMusic() {
    this.globalData.backgroundAudioManager.stop();
    this.setAudioState({
      currentMusic: null,
      isPlaying: false
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