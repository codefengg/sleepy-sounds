// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: 'cloud1-7g7ul2l734c0683b' }) // 使用指定的云环境ID
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const { id } = event
  
  // 验证ID是否存在
  if (!id) {
    return {
      success: false,
      error: '分类ID不能为空'
    }
  }
  
  try {
    // 检查分类是否存在
    // 注意集合名称为 category
    const categoryResult = await db.collection('category').doc(id).get()
    if (!categoryResult.data) {
      return {
        success: false,
        error: '要删除的分类不存在'
      }
    }
    
    // 如果是一级分类，先删除其所有子分类
    if (!categoryResult.data.parentId) {
      // 查找所有子分类
      // 注意集合名称为 category
      const childrenResult = await db.collection('category')
        .where({
          parentId: id
        })
        .get()
      
      // 如果有子分类，先删除子分类
      if (childrenResult.data && childrenResult.data.length > 0) {
        // 获取所有子分类ID
        const childrenIds = childrenResult.data.map(child => child._id)
        
        // 一次删除最多100条记录，如果超过需要分批删除
        const batchSize = 100
        for (let i = 0; i < childrenIds.length; i += batchSize) {
          const batchIds = childrenIds.slice(i, i + batchSize)
          // 注意集合名称为 category
          await db.collection('category').where({
            _id: _.in(batchIds)
          }).remove()
        }
      }
    }
    
    // 删除当前分类
    // 注意集合名称为 category
    await db.collection('category').doc(id).remove()
    
    return {
      success: true,
      deletedId: id
    }
  } catch (err) {
    return {
      success: false,
      error: err.message || '删除分类失败'
    }
  }
} 