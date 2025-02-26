Component({
  properties: {
    visible: {
      type: Boolean,
      value: false,
      observer(newVal) {
        if (newVal) {
          // 打开时展开到中间位置
          this.setData({ translateY: this.data.middleHeight })
        }
      }
    }
  },

  data: {
    translateY: 0,
    startY: 0,
    moveY: 0,
    lastY: 0,
    moving: false,
    handleHeight: 40,  // 手柄高度
    animating: false,
    moveTime: 0,
    // 三个固定高度状态
    bottomHeight: 80,           // 底部状态（保持在tabbar上方）
    middleHeight: 400,         // 中间高度
    topHeight: 600            // 最大高度
  },

  methods: {
    touchStart(e) {
      this.setData({
        startY: e.touches[0].clientY,
        moving: true,
        lastY: this.data.translateY,
        animating: false,
        moveTime: e.timeStamp
      })
    },

    touchMove(e) {
      if (!this.data.moving) return
      
      const touch = e.touches[0]
      const moveY = touch.clientY - this.data.startY + this.data.lastY
      
      // 限制移动范围，确保不会低于tabbar
      const maxMove = this.data.topHeight - 80 // 保持在tabbar上方
      const minMove = 0
      
      let translateY = moveY
      
      // 添加阻尼效果
      if (moveY < minMove) {
        const overscroll = minMove - moveY
        translateY = minMove - Math.atan(overscroll / 100) * 10
      } else if (moveY > maxMove) {
        const overscroll = moveY - maxMove
        translateY = maxMove + Math.atan(overscroll / 100) * 10
      }
      
      this.setData({
        translateY,
        moveY: touch.clientY,
        moveTime: e.timeStamp
      })
    },

    touchEnd(e) {
      if (!this.data.moving) return

      const endY = e.changedTouches[0].clientY
      const endTime = e.timeStamp
      const velocity = (endY - this.data.moveY) / (endTime - this.data.moveTime)
      const currentY = this.data.translateY
      
      // 定义三个位置
      const positions = [
        0,                     // 顶部位置 (600px)
        200,                   // 中间位置 (400px)
        this.data.topHeight - 80  // 底部位置（保持在tabbar上方）
      ]

      let finalY
      if (Math.abs(velocity) > 0.3) {
        // 快速滑动时，根据方向和当前位置决定
        if (velocity > 0) { // 向下滑动
          if (currentY < 100) { // 在顶部区域
            finalY = positions[1] // 到中间
          } else if (currentY < 400) { // 在中间区域
            finalY = positions[2] // 到底部
          } else {
            finalY = positions[2] // 到底部
          }
        } else { // 向上滑动
          if (currentY > 400) { // 在底部区域
            finalY = positions[1] // 到中间
          } else if (currentY > 100) { // 在中间区域
            finalY = positions[0] // 到顶部
          } else {
            finalY = positions[0] // 到顶部
          }
        }
      } else {
        // 慢速滑动时，找到最近的位置
        const distances = positions.map(pos => Math.abs(currentY - pos))
        const minDistance = Math.min(...distances)
        const nearestIndex = distances.indexOf(minDistance)
        finalY = positions[nearestIndex]
      }

      this.setData({
        moving: false,
        animating: true,
        translateY: finalY
      })

      // 如果滑动到底部，关闭抽屉
      if (finalY === positions[2]) {
        setTimeout(() => {
          this.triggerEvent('close')
        }, 200)
      }
    },

    onMaskTap() {
      const closePosition = this.data.topHeight - this.data.handleHeight
      this.setData({
        animating: true,
        translateY: closePosition
      })
      setTimeout(() => {
        this.triggerEvent('close')
      }, 200)
    },

    // 阻止遮罩层的触摸移动事件
    preventTouchMove() {
      return false
    },

    // 阻止内容区域的事件冒泡
    preventBubble(e) {
      // 什么都不做，只阻止冒泡
    }
  }
}) 