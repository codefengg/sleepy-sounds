const { windowHeight } = wx.getSystemInfoSync()
const menuRect = wx.getMenuButtonBoundingClientRect()
const sheetHeight = windowHeight - (menuRect.bottom + menuRect.height + 60)

const middleSize = 0.6

// 导入云函数助手
const cloudHelper = require('../../utils/cloudHelper');

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    menuRect,
    sheetHeight,
    minSize: 0.6,
    maxSize: 1,
    snapSizes: [],
    middleSize,
    currentTabId: '', // 使用ID而不是索引
    activeTab: 'sleep', // 默认助眠为激活状态，可选值: 'sleep', 'breathe',
    tabIcons: [null, null, '/assets/images/mie.png'], // 第三个标签有图标
    gridList: [], // 存储网格列表数据
    // 默认UI数据
    defaultUI: {
      title: '夜深了',
      subtitle: '来一曲美妙的音乐吧 good night！',
      bgImage: '/assets/images/bg.png',
      pressImage: '/assets/images/press.png'
    },
    // 当前显示的UI数据
    title: '夜深了',
    subtitle: '来一曲美妙的音乐吧 good night！',
    bgImage: '/assets/images/bg.png',
    pressImage: '/assets/images/press.png',
    isPlaying: false,
    currentMusic: null,
    rotationAngle: 0,
    rotationTimer: null,
    allMusicList: [], // 存储所有音乐数据
    currentCategoryId: '', // 当前选中的分类ID
  },

  onSizeUpdate(e) {
    'worklet'
    const distance = sheetHeight - e.pixels
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 监听音频状态变化
    app.onAudioStateChange(this.handleAudioStateChange);
    
    // 初始化时获取当前状态
    const { isPlaying, currentMusic } = app.globalData.audioState;
    this.setData({ 
      isPlaying,
      currentMusic
    });
    
    // 初始化旋转角度
    this.startRotation();
    
    // 从本地缓存加载音乐数据（如果有）
    const cachedMusic = wx.getStorageSync('allMusicCache');
    if (cachedMusic && cachedMusic.timestamp) {
      // 检查缓存是否在24小时内
      const now = new Date().getTime();
      const cacheTime = cachedMusic.timestamp;
      
      // 如果缓存不超过24小时，直接使用缓存数据
      if (now - cacheTime < 24 * 60 * 60 * 1000) {
        this.setData({
          allMusicList: cachedMusic.data
        });
        
        // 仍然在后台更新数据，但不阻塞UI
        this.updateMusicInBackground();
      } else {
        // 缓存过期，获取新数据
        this.getAllMusic();
      }
    } else {
      // 没有缓存，获取新数据
      this.getAllMusic();
    }
  },

  onUnload() {
    // 清除定时器
    if (this.data.rotationTimer) {
      clearInterval(this.data.rotationTimer);
    }
  },

  // 处理分类变化事件
  onCategoryChange(e) {
    const { categoryId, mainCategoryId, subCategoryId, isDefaultData, isRealData } = e.detail;
    
    // 更新当前选中的tab ID
    this.setData({
      currentTabId: categoryId,
      currentCategoryId: categoryId
    });
    
    // 如果已经获取了所有音乐，直接过滤
    if (this.data.allMusicList.length > 0) {
      this.filterMusicByCategory(categoryId);
      return;
    }
  },
  
  // 获取音乐列表
  fetchMusicList(categoryId) {
    // 如果已经有所有音乐数据，直接过滤
    if (this.data.allMusicList.length > 0) {
      this.filterMusicByCategory(categoryId);
      return;
    }
    
    cloudHelper.callFunction('musicManager', {
      action: 'get',
      categoryId
    }).then(res => {
      if (res.success) {
        this.setData({
          gridList: res.data
        });
      } else {
        wx.showToast({
          title: '获取音乐失败',
          icon: 'none'
        });
      }
      wx.hideLoading();
    }).catch(err => {
      console.error('获取音乐失败', err);
      wx.hideLoading();
      wx.showToast({
        title: '获取音乐失败',
        icon: 'none'
      });
    });
  },

  // 切换底部标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    
    if (tab === 'breathe') {
      // 点击呼吸标签时跳转到呼吸列表页面
      wx.navigateTo({
        url: '/pages/breath-list/index'
      });
      return; // 不执行后续的标签切换逻辑
    }
    
    // 其他标签的切换逻辑保持不变
    this.setData({
      activeTab: tab
    });
  },

  // 处理音频状态变化
  handleAudioStateChange(state) {
    const { currentMusic, isPlaying } = state;
    this.setData({
      title: currentMusic?.title || this.data.defaultUI.title,
      subtitle: currentMusic?.subtitle || this.data.defaultUI.subtitle,
      bgImage: currentMusic?.backgroundUrl || this.data.defaultUI.bgImage,
      pressImage: currentMusic?.iconUrl || this.data.defaultUI.pressImage,
      isPlaying,
      currentMusic
    });
    
    // 根据播放状态控制旋转
    if (isPlaying) {
      this.startRotation();
    } else {
      this.pauseRotation();
    }
  },

  // 开始旋转
  startRotation() {
    // 如果已经有定时器，先清除
    if (this.data.rotationTimer) {
      clearInterval(this.data.rotationTimer);
    }
    
    // 创建新的定时器
    const timer = setInterval(() => {
      if (this.data.isPlaying && this.data.currentMusic) {
        this.setData({
          rotationAngle: (this.data.rotationAngle + 1) % 360
        });
      }
    }, 50); // 每50毫秒旋转1度
    
    this.setData({ rotationTimer: timer });
  },

  // 暂停旋转
  pauseRotation() {
    if (this.data.rotationTimer) {
      clearInterval(this.data.rotationTimer);
      this.setData({ rotationTimer: null });
    }
  },

  // 点击音乐项
  onItemTap(e) {
    const { id } = e.currentTarget.dataset;
    const music = this.data.gridList.find(item => item._id === id);
    
    if (!music) return;
    
    // 播放音乐
    app.playMusic(music);

    // 跳转到详情页
    wx.navigateTo({
      url: `/pages/detail/index?id=${id}`
    });
  },
  
  // 重置UI为默认状态
  resetUI() {
    this.setData({
      title: this.data.defaultUI.title,
      subtitle: this.data.defaultUI.subtitle,
      bgImage: this.data.defaultUI.bgImage,
      pressImage: this.data.defaultUI.pressImage
    });
  },

  // 点击呼吸图标跳转到呼吸列表页
  onBreathTap() {
    wx.navigateTo({
      url: '/pages/breath-list/index'
    });
  },

  // 播放/暂停切换
  togglePlay() {
    if (this.data.isPlaying) {
      app.pauseMusic();
    } else {
      app.resumeMusic();
    }
  },

  // 获取所有音乐数据
  getAllMusic: function() {
    
    // 调用云函数获取所有音乐
    cloudHelper.callFunction('musicManager', {
      action: 'getAll'
    }).then(res => {
      if (res.result.success) {
        this.setData({
          allMusicList: res.result.data
        });
        
        // 缓存数据
        wx.setStorageSync('allMusicCache', {
          data: res.result.data,
          timestamp: new Date().getTime()
        });
        
        // 如果已经选择了分类，则过滤数据
        if (this.data.currentCategoryId) {
          this.filterMusicByCategory(this.data.currentCategoryId);
        }
      } else {
      }
    }).catch(err => {
      console.error('获取音乐失败', err);
    });
  },
  
  // 根据分类ID过滤音乐
  filterMusicByCategory: function(categoryId) {
    const filteredList = this.data.allMusicList.filter(item => 
      item.categoryId === categoryId
    );
    
    this.setData({
      gridList: filteredList
    });
  },

  // 获取音乐列表
  getMusicList(categoryId) {
    if (!categoryId) {
      console.error('分类ID不能为空');
      return;
    }
    
    this.fetchMusicList(categoryId);
  },

  // 在后台更新音乐数据
  updateMusicInBackground: function() {
    cloudHelper.callFunction('musicManager', {
      action: 'getAll'
    }).then(res => {
      console.log('后台更新音乐数据', res);
      if (res.result.success) {
        // 更新数据和缓存
        this.setData({
          allMusicList: res.result.data
        });
        
        // 缓存数据
        wx.setStorageSync('allMusicCache', {
          data: res.result.data,
          timestamp: new Date().getTime()
        });
        
        // 如果当前有选中的分类，重新过滤
        if (this.data.currentCategoryId) {
          this.filterMusicByCategory(this.data.currentCategoryId);
        }
      }
    }).catch(err => {
      console.error('后台更新音乐失败', err);
    });
  },
})