// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: 'cloud1-7g7ul2l734c0683b' }) // 使用指定的云环境ID
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 获取所有分类，注意集合名称为 category
    const categoriesResult = await db.collection('category')
      .orderBy('order', 'asc')  // 按order字段升序排列
      .get()
    
    return {
      success: true,
      data: categoriesResult.data
    }
  } catch (err) {
    return {
      success: false,
      error: err.message || '获取分类失败'
    }
  }
} 