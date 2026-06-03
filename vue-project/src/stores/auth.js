import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { loginApi, getUserInfo } from '../api'
import { setToken, removeToken } from '../api/request'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(!!sessionStorage.getItem('auth_user'))
  const rawUser = JSON.parse(sessionStorage.getItem('auth_user') || 'null')
  // 兼容旧格式：缺少新增字段时用 mock 补全
  const user = ref(rawUser ? { ...buildMockUser(rawUser.id), ...rawUser, avatar: rawUser.avatar || null } : null)

  const isTeacher = computed(() => user.value?.identity === '教师')

  function setUser(userInfo) {
    sessionStorage.setItem('auth_user', JSON.stringify(userInfo))
    user.value = userInfo
  }

  /**
   * 登录 —— 优先调用后端 API，失败时回退到本地 mock 验证。
   */
  async function login(userId, password) {
    try {
      const data = await loginApi(userId, password)
      setToken(data.token)

      // 获取用户信息；后端返回的字段优先，缺失的用 mock 补全
      const defaults = buildMockUser(userId)
      let userInfo
      try {
        const { data: info } = await getUserInfo()
        userInfo = { ...defaults, ...info, id: info.id || userId, avatar: info.avatar || null }
      } catch {
        userInfo = defaults
      }

      setUser(userInfo)
      isAuthenticated.value = true
      return { ok: true }
    } catch (err) {
      console.warn('后端登录不可用，使用本地验证:', err.message)
    }

    if (!/^\d{6,12}$/.test(userId)) {
      return { ok: false, msg: '学号/工号格式不正确，请输入6-12位数字' }
    }
    if (!password || password.length < 4) {
      return { ok: false, msg: '密码长度至少4位' }
    }

    const userInfo = buildMockUser(userId)
    setUser(userInfo)
    isAuthenticated.value = true
    return { ok: true }
  }

  function updateAvatar(avatarUrl) {
    if (!user.value) return
    user.value = { ...user.value, avatar: avatarUrl }
    sessionStorage.setItem('auth_user', JSON.stringify(user.value))
  }

  function updateProfile(fields) {
    if (!user.value) return
    user.value = { ...user.value, ...fields }
    sessionStorage.setItem('auth_user', JSON.stringify(user.value))
  }

  function logout() {
    removeToken()
    sessionStorage.removeItem('auth_user')
    user.value = null
    isAuthenticated.value = false
  }

  return { isAuthenticated, user, isTeacher, login, logout, setUser, updateAvatar, updateProfile }
})

function buildMockUser(userId) {
  const isStudent = userId.startsWith('1')
  return {
    id: userId,
    name: isStudent ? '张同学' : '李老师',
    identity: isStudent ? '学生' : '教师',
    role: isStudent ? '本科生' : '讲师',
    college: '计算机与大数据学院',
    avatar: null,
    // 学生特有
    ...(isStudent ? {
      major: '计算机科学与技术',
      grade: '2024级',
      className: '计科2401班',
      phone: '138****5678',
    } : {
      // 教师特有
      title: '讲师',
      email: 'lisi@fzu.edu.cn',
    })
  }
}
