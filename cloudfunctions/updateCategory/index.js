// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: 'cloud1-7g7ul2l734c0683b' }) // 使用指定的云环境ID
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { id, name, parentId, order } = event
  
  // 验证ID是否存在
  if (!id) {
    return {
      success: false,
      error: '分类ID不能为空'
    }
  }
  
  // 验证至少有一个要更新的字段
  if (!name && parentId === undefined && order === undefined) {
    return {
      success: false,
      error: '至少需要提供一个要更新的字段'
    }
  }
  
  // 验证order格式
  if (order !== undefined && (isNaN(order) || !Number.isInteger(Number(order)))) {
    return {
      success: false,
      error: '排序序号必须是整数'
    }
  }
  
  try {
    // 检查分类是否存在
    // 注意集合名称为 category
    const categoryResult = await db.collection('category').doc(id).get()
    if (!categoryResult.data) {
      return {
        success: false,
        error: '要更新的分类不存在'
      }
    }
    
    // 如果要更新parentId，验证父分类是否存在且为一级分类
    if (parentId !== undefined) {
      // 如果设置为空字符串，表示将其设为一级分类
      if (parentId === '') {
        // 无需验证，直接将其设为一级分类即可
      } else {
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
        
        // 检查是否形成循环引用
        if (parentId === id) {
          return {
            success: false,
            error: '不能将分类自身设为父分类'
          }
        }
      }
    }
    
    // 构建更新对象
    const updateData = {}
    
    if (name !== undefined && name.trim() !== '') {
      updateData.name = name.trim()
    }
    
    if (parentId !== undefined) {
      if (parentId === '') {
        // 删除parentId字段，将其设为一级分类
        // 注意集合名称为 category
        await db.collection('category').doc(id).update({
          data: {
            parentId: db.command.remove()
          }
        })
      } else {
        updateData.parentId = parentId
      }
    }
    
    if (order !== undefined) {
      updateData.order = Number(order)
    }
    
    // 如果有其他字段要更新，进行更新
    if (Object.keys(updateData).length > 0) {
      // 注意集合名称为 category
      await db.collection('category').doc(id).update({
        data: updateData
      })
    }
    
    // 获取更新后的分类信息
    // 注意集合名称为 category
    const updatedCategory = await db.collection('category').doc(id).get()
    
    return {
      success: true,
      data: updatedCategory.data
    }
  } catch (err) {
    return {
      success: false,
      error: err.message || '更新分类失败'
    }
  }
} 