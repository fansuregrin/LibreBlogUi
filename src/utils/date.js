// src/utils/date.js

/**
 * 日期时间格式化函数
 * @param {Date|number|string} date - 可被Date解析的时间格式
 * @param {string} [format='YYYY-MM-DD HH:mm:ss'] - 格式模板
 * @returns {string} 格式化后的日期字符串
 */
export const formatDateTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
    // 处理不同输入类型
    let d
    if (date instanceof Date) {
        d = date
    } else if (typeof date === 'number' || typeof date === 'string') {
        d = new Date(date)
    } else {
        d = 'invalid datetime'
    }

    // 验证日期有效性
    if (isNaN(d.getTime())) {
        return 'invalid datetime'
    }

    // 解构日期组件
    const year = d.getFullYear()
    const month = d.getMonth() + 1
    const day = d.getDate()
    const hours = d.getHours()
    const minutes = d.getMinutes()
    const seconds = d.getSeconds()

    // 补零函数
    const padStart = (n) => String(n).padStart(2, '0')

    // 格式化规则映射
    const formatMap = {
        'YYYY': year,
        'MM': padStart(month),
        'DD': padStart(day),
        'HH': padStart(hours),
        'mm': padStart(minutes),
        'ss': padStart(seconds),
        'M': month,
        'D': day,
        'H': hours,
        'm': minutes,
        's': seconds
    }

    // 使用正则替换格式化占位符
    return format.replace(/(YYYY|MM|DD|HH|mm|ss|M|D|H|m|s)/g, (match) => {
        return formatMap[match] || match
    })
}
