// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: 'cloud1-7g7ul2l734c0683b' }) // 使用指定的云环境ID
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { name, parentId, order } = event
  
  // 输入验证
  if (!name || name.trim() === '') {
    return {
      success: false,
      error: '分类名称不能为空'
    }
  }
  
  if (order !== undefined && (isNaN(order) || !Number.isInteger(Number(order)))) {
    return {
      success: false,
      error: '排序序号必须是整数'
    }
  }
  
  const orderValue = order !== undefined ? Number(order) : 0
  
  try {
    // 如果有parentId，验证父分类是否存在且为一级分类
    if (parentId) {
      // 注意集合名称为 category
      const parentResult = await db.collection('category').doc(parentId).get()
      
      // 检查父分类是否存在
      if (!parentResult.data) {
        return {
          success: false,
          error: '父分类不存在'
        }
      }
      
      // 检查父分类是否已经是二级分类
      if (parentResult.data.parentId) {
        return {
          success: false,
          error: '不能创建三级分类，父分类已经是二级分类'
        }
      }
    }
    
    // 添加分类
    const newCategory = {
      name: name.trim(),
      order: orderValue,
      createTime: db.serverDate()
    }
    
    // 如果有父分类ID，则添加到新分类中
    if (parentId) {
      newCategory.parentId = parentId
    }
    
    // 注意集合名称为 category
    const result = await db.collection('category').add({
      data: newCategory
    })
    
    // 获取新创建的分类完整信息
    // 注意集合名称为 category
    const newCategoryData = await db.collection('category').doc(result._id).get()
    
    return {
      success: true,
      data: newCategoryData.data
    }
  } catch (err) {
    return {
      success: false,
      error: err.message || '添加分类失败'
    }
  }
} 