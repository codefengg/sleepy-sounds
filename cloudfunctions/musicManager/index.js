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
      return getMusicList(event)
    case 'getAll':
      return getAllMusic()
    case 'getById':
      return getMusicById(event)
    case 'add':
      return addMusic(event)
    case 'update':
      return updateMusic(event)
    case 'delete':
      return deleteMusic(event)
    default:
      return {
        success: false,
        error: '未知的操作类型'
      }
  }
}

// 获取音乐列表
async function getMusicList(event) {
  const { categoryId } = event
  
  try {
    let query = db.collection('audios').orderBy('order', 'asc')
    
    // 如果有分类ID，则按分类筛选
    if (categoryId) {
      query = query.where({
        categoryId: categoryId
      })
    }
    
    const result = await query.get()
    
    return {
      success: true,
      data: result.data
    }
  } catch (err) {
    return {
      success: false,
      error: err.message || '获取音乐列表失败'
    }
  }
}

// 获取所有音乐
async function getAllMusic() {
  try {
    // 直接获取所有音乐（因为数据不超过100条）
    const result = await db.collection('audios')
      .orderBy('order', 'asc')
      .get();
    
    return {
      success: true,
      data: result.data
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || '获取所有音乐失败'
    };
  }
}

// 获取音乐列表
async function getMusic(event) {
  const { categoryId, limit = 20, skip = 0 } = event
  
  try {
    let query = db.collection('audios')
    
    // 如果指定了分类ID，则按分类筛选
    if (categoryId) {
      // 首先检查这个分类ID是一级分类还是二级分类
      const categoryResult = await db.collection('category').doc(categoryId).get()
        .catch(() => ({ data: null })); // 捕获可能的错误
      
      if (categoryResult.data) {
        const category = categoryResult.data;
        
        // 如果没有parentId，说明是一级分类
        if (!category.parentId) {
          // 查找所有以该分类为父级的二级分类
          const subCategoriesResult = await db.collection('category')
            .where({ parentId: categoryId })
            .get();
          
          const subCategoryIds = subCategoriesResult.data.map(item => item._id);
          
          // 构建查询条件：直接关联到该一级分类，或关联到其下任一二级分类
          if (subCategoryIds.length > 0) {
            query = query.where(_.or([
              { categoryId: categoryId },
              { categoryId: _.in(subCategoryIds) }
            ]));
          } else {
            // 如果没有二级分类，只查询直接关联到该一级分类的音乐
            query = query.where({ categoryId: categoryId });
          }
        } else {
          // 如果有parentId，说明是二级分类，直接查询关联到该分类的音乐
          query = query.where({ categoryId: categoryId });
        }
      } else {
        // 分类不存在，返回空结果
        return {
          success: true,
          data: [],
          total: 0,
          limit,
          skip
        };
      }
    }
    
    // 获取总数
    const countResult = await query.count();
    const total = countResult.total;
    
    // 获取音乐列表，按创建时间倒序排列
    const musicResult = await query
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(limit)
      .get();
    
    return {
      success: true,
      data: musicResult.data,
      total,
      limit,
      skip
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || '获取音乐列表失败'
    };
  }
}

// 添加音乐
async function addMusic(event) {
  const { 
    audioUrl,       // 音乐链接
    name,           // 音乐名称
    title,          // 标题
    backgroundUrl,  // 音乐背景图
    iconUrl,        // 音乐播放图标
    listImageUrl,   // 音乐列表图
    subtitle,       // 副标题
    categoryId      // 分类ID
  } = event
  
  // 输入验证
  if (!audioUrl || audioUrl.trim() === '') {
    return {
      success: false,
      error: '音乐链接不能为空'
    }
  }
  
  if (!name || name.trim() === '') {
    return {
      success: false,
      error: '音乐名称不能为空'
    }
  }
  
  if (!title || title.trim() === '') {
    return {
      success: false,
      error: '标题不能为空'
    }
  }
  
  if (!categoryId) {
    return {
      success: false,
      error: '分类ID不能为空'
    }
  }
  
  try {
    // 添加音乐记录
    const newMusic = {
      audioUrl: audioUrl.trim(),
      name: name.trim(),
      title: title.trim(),
      backgroundUrl: backgroundUrl || '',
      iconUrl: iconUrl || '',
      listImageUrl: listImageUrl || '',
      subtitle: subtitle || '',
      categoryId,
      createTime: db.serverDate(),
      playCount: 0,  // 初始播放次数为0
      order: 0       // 默认排序
    }
    
    const result = await db.collection('audios').add({
      data: newMusic
    })
    
    // 获取新添加的音乐完整信息
    const newMusicData = await db.collection('audios').doc(result._id).get()
    
    return {
      success: true,
      data: newMusicData.data
    }
  } catch (err) {
    return {
      success: false,
      error: err.message || '添加音乐失败'
    }
  }
}

// 更新音乐
async function updateMusic(event) {
  const { id, ...updateData } = event
  
  // 验证ID是否存在
  if (!id) {
    return {
      success: false,
      error: '音乐ID不能为空'
    }
  }
  
  // 移除不允许直接更新的字段
  delete updateData.action
  delete updateData.createTime
  delete updateData._id
  
  // 验证至少有一个要更新的字段
  if (Object.keys(updateData).length === 0) {
    return {
      success: false,
      error: '没有提供要更新的字段'
    }
  }
  
  try {
    // 检查音乐是否存在
    const musicResult = await db.collection('audios').doc(id).get()
    if (!musicResult.data) {
      return {
        success: false,
        error: '要更新的音乐不存在'
      }
    }
    
    // 更新音乐记录
    await db.collection('audios').doc(id).update({
      data: updateData
    })
    
    // 获取更新后的音乐信息
    const updatedMusic = await db.collection('audios').doc(id).get()
    
    return {
      success: true,
      data: updatedMusic.data
    }
  } catch (err) {
    return {
      success: false,
      error: err.message || '更新音乐失败'
    }
  }
}

// 删除音乐
async function deleteMusic(event) {
  const { id } = event
  
  // 验证ID是否存在
  if (!id) {
    return {
      success: false,
      error: '音乐ID不能为空'
    }
  }
  
  try {
    // 检查音乐是否存在
    const musicResult = await db.collection('audios').doc(id).get()
    if (!musicResult.data) {
      return {
        success: false,
        error: '要删除的音乐不存在'
      }
    }
    
    // 删除音乐记录
    await db.collection('audios').doc(id).remove()
    
    // 注意：这里只删除了数据库中的记录，并没有从云存储中删除实际的音频文件
    // 如果需要同时删除云存储中的文件，还需要调用云存储的删除API
    
    return {
      success: true,
      deletedId: id
    }
  } catch (err) {
    return {
      success: false,
      error: err.message || '删除音乐失败'
    }
  }
} 