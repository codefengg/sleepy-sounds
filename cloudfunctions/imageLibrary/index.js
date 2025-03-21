// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: 'cloud1-7g7ul2l734c0683b' })
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const { action } = event
  
  // 根据action参数执行不同操作
  switch (action) {
    case 'get':
      return getImages(event)
    case 'add':
      return addImage(event)
    case 'delete':
      return deleteImage(event)
    default:
      return {
        success: false,
        error: '未知的操作类型'
      }
  }
}

// 获取图片列表
async function getImages(event) {
  const { type, limit = 20, skip = 0 } = event
  
  try {
    let query = db.collection('library')
    
    // 如果指定了类型，则按类型筛选
    if (type) {
      query = query.where({ type })
    }
    
    // 获取总数
    const countResult = await query.count()
    const total = countResult.total
    
    // 获取图片列表，按创建时间倒序排列
    const imagesResult = await query
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(limit)
      .get()
    
    return {
      success: true,
      data: imagesResult.data,
      total,
      limit,
      skip
    }
  } catch (err) {
    return {
      success: false,
      error: err.message || '获取图片列表失败'
    }
  }
}

// 添加图片
async function addImage(event) {
  const { url, name, type, size, description } = event
  
  // 输入验证
  if (!url || url.trim() === '') {
    return {
      success: false,
      error: '图片URL不能为空'
    }
  }
  
  if (!name || name.trim() === '') {
    return {
      success: false,
      error: '图片名称不能为空'
    }
  }
  
  try {
    // 添加图片记录
    const newImage = {
      url: url.trim(),
      name: name.trim(),
      createTime: db.serverDate(),
      // 可选字段
      type: type || 'default',
      size: size || 0,
      description: description || ''
    }
    
    const result = await db.collection('library').add({
      data: newImage
    })
    
    // 获取新添加的图片完整信息
    const newImageData = await db.collection('library').doc(result._id).get()
    
    return {
      success: true,
      data: newImageData.data
    }
  } catch (err) {
    return {
      success: false,
      error: err.message || '添加图片失败'
    }
  }
}

// 删除图片
async function deleteImage(event) {
  const { id } = event
  
  // 验证ID是否存在
  if (!id) {
    return {
      success: false,
      error: '图片ID不能为空'
    }
  }
  
  try {
    // 检查图片是否存在
    const imageResult = await db.collection('library').doc(id).get()
    if (!imageResult.data) {
      return {
        success: false,
        error: '要删除的图片不存在'
      }
    }
    
    // 删除图片记录
    await db.collection('library').doc(id).remove()
    
    // 注意：这里只删除了数据库中的记录，并没有从云存储中删除实际的图片文件
    // 如果需要同时删除云存储中的文件，还需要调用云存储的删除API
    
    return {
      success: true,
      deletedId: id
    }
  } catch (err) {
    return {
      success: false,
      error: err.message || '删除图片失败'
    }
  }
}