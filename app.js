App({
  globalData: {
    audioState: {
      currentMusic: null,  // 当前选中的音乐信息
      isPlaying: false    // 播放状态（后续用）
    }
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
    // 初始化云环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'cloud1-7g7ul2l734c0683b',
        traceUser: true,
      });
    }
  }
}) 