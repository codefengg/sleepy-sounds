Page({
  data: {
    breathItems: [
      { id: 1, title: '蜂鸟呼吸法', content: '快速平静心情' },
      { id: 2, title: '4-7-8呼吸法', content: '缓解焦虑压力' },
      { id: 3, title: '腹式呼吸法', content: '改善睡眠质量' }
      // 可以添加更多呼吸练习项目
    ]
  },
  
  // 点击列表项跳转到呼吸详情页
  onItemTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/breath-detail/index?id=${id}`
    });
  }
}) 