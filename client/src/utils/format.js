/**
 * 日期格式化
 * @param {string} dateString - 日期字符串
 * @returns {string} 格式化后的日期 YYYY-MM-DD HH:mm
 */
export function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

/**
 * Element Plus Table 日期格式化器
 */
export function dateFormatter(row, column, cellValue) {
  return formatDate(cellValue)
}

/**
 * 格式化简历路径
 * @param {string} resumePath - 简历路径
 * @returns {string} 完整的简历URL
 */
export function formatResumePath(resumePath) {
  if (!resumePath) return ''
  return `/files/${resumePath.replace('api/files/', '').replace('api/', '')}`
}

/**
 * 获取状态标签类型
 * @param {string} status - 状态文本
 * @returns {string} Element Plus tag type
 */
export function getStatusTagType(status) {
  switch (status) {
    case '已就业': return 'success'
    case '未就业': return 'warning'
    case '实习中': return 'info'
    default: return ''
  }
}
