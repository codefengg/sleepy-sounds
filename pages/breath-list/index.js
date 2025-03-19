Page({
  data: {
    breathItems: [
      {
        id: 1,
        title: "4-7-8 呼吸法",
        content: "缓解头痛、减轻压力、改善睡眠。",
        image: "/assets/images/breath1.png"
      },
      {
        id: 2,
        title: "4-7-8 呼吸法",
        content: "缓解头痛、减轻压力、改善睡眠。",
        image: "/assets/images/breath1.png"
      },
      {
        id: 3,
        title: "4-7-8 呼吸法",
        content: "缓解头痛、减轻压力、改善睡眠。",
        image: "/assets/images/breath1.png"
      }
    ]
  },

  onItemTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/breath-detail/index?id=${id}`
    });
  }
}) 