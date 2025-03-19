Component({
  properties: {
    isPlaying: {
      type: Boolean,
      value: false
    },
    size: {
      type: Number,
      value: 64 // 默认大小
    },
    text: {
      type: String,
      value: ''
    },
    showText: {
      type: Boolean,
      value: true
    }
  },

  methods: {
    onTap() {
      this.triggerEvent('toggle');
    }
  }
}) 