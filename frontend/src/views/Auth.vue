<template>
  <div class="auth-page">
    <div class="auth-container">
      <!-- Logo -->
      <div class="auth-logo">
        <span class="logo-symbol">∑</span>
        <span class="logo-text">EconoLearn</span>
      </div>

      <!-- Tab 切换 -->
      <div class="auth-tabs">
        <button
          class="tab-button"
          :class="{ 'tab-active': mode === 'login' }"
          @click="mode = 'login'"
        >
          登录
        </button>
        <button
          class="tab-button"
          :class="{ 'tab-active': mode === 'register' }"
          @click="mode = 'register'"
        >
          注册
        </button>
      </div>

      <!-- 登录表单 -->
      <form v-if="mode === 'login'" class="auth-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="login-username">用户名或邮箱</label>
          <input
            id="login-username"
            v-model="loginForm.username"
            type="text"
            placeholder="请输入用户名或邮箱"
            required
          />
        </div>

        <div class="form-group">
          <label for="login-password">密码</label>
          <input
            id="login-password"
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            required
          />
        </div>

        <p v-if="loginError" class="form-error">{{ loginError }}</p>

        <button type="submit" class="btn-submit" :disabled="authStore.isLoading">
          {{ authStore.isLoading ? '登录中...' : '登录' }}
        </button>

        <div class="form-footer">
          <p class="hint-text">
            测试账号: admin / admin123 或 test / test123
          </p>
        </div>
      </form>

      <!-- 注册表单 -->
      <form v-else class="auth-form" @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="register-username">用户名</label>
          <input
            id="register-username"
            v-model="registerForm.username"
            type="text"
            placeholder="3-50个字符"
            minlength="3"
            maxlength="50"
            required
          />
        </div>

        <div class="form-group">
          <label for="register-email">邮箱</label>
          <input
            id="register-email"
            v-model="registerForm.email"
            type="email"
            placeholder="请输入邮箱地址"
            required
          />
        </div>

        <div class="form-group">
          <label for="register-password">密码</label>
          <input
            id="register-password"
            v-model="registerForm.password"
            type="password"
            placeholder="至少6个字符"
            minlength="6"
            required
          />
        </div>

        <div class="form-group">
          <label for="register-confirm">确认密码</label>
          <input
            id="register-confirm"
            v-model="registerForm.confirm"
            type="password"
            placeholder="请再次输入密码"
            required
          />
        </div>

        <p v-if="registerError" class="form-error">{{ registerError }}</p>
        <p v-if="registerSuccess" class="form-success">{{ registerSuccess }}</p>

        <button
          type="submit"
          class="btn-submit"
          :disabled="authStore.isLoading || !isPasswordMatch"
        >
          {{ authStore.isLoading ? '注册中...' : '注册' }}
        </button>
      </form>

      <!-- 返回首页 -->
      <div class="auth-footer">
        <router-link to="/" class="back-link">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 8L4 8M4 8L8 4M4 8L8 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          返回首页
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const mode = ref<'login' | 'register'>('login')

const loginForm = ref({
  username: '',
  password: ''
})

const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirm: ''
})

const loginError = ref('')
const registerError = ref('')
const registerSuccess = ref('')

const isPasswordMatch = computed(() => {
  return registerForm.value.password === registerForm.value.confirm
})

async function handleLogin() {
  loginError.value = ''

  const result = await authStore.login(
    loginForm.value.username,
    loginForm.value.password
  )

  if (result.success) {
    router.push('/')
  } else {
    loginError.value = result.error || '登录失败'
  }
}

async function handleRegister() {
  registerError.value = ''
  registerSuccess.value = ''

  if (!isPasswordMatch.value) {
    registerError.value = '两次输入的密码不一致'
    return
  }

  const result = await authStore.register(
    registerForm.value.username,
    registerForm.value.email,
    registerForm.value.password
  )

  if (result.success) {
    registerSuccess.value = '注册成功！请登录'
    setTimeout(() => {
      mode.value = 'login'
      loginForm.value.username = registerForm.value.username
      registerSuccess.value = ''
    }, 1500)
  } else {
    registerError.value = result.error || '注册失败'
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
}

.auth-container {
  width: 100%;
  max-width: 420px;
}

.auth-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  margin-bottom: var(--space-8);
}

.logo-symbol {
  font-family: var(--font-serif);
  font-size: 2.5rem;
  font-weight: 300;
  color: var(--color-primary);
}

.logo-text {
  font-family: var(--font-sans);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
}

.auth-tabs {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-8);
  background: var(--color-surface);
  padding: var(--space-1);
  border-radius: var(--radius-md);
}

.tab-button {
  flex: 1;
  padding: var(--space-3);
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-default);
}

.tab-button:hover {
  color: var(--color-text);
}

.tab-active {
  background: var(--color-surface-elevated);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-group label {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

.form-group input {
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-sans);
  font-size: 1rem;
  color: var(--color-text);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  outline: none;
  transition: border-color var(--duration-fast) var(--ease-default);
}

.form-group input:focus {
  border-color: var(--color-primary);
}

.form-group input::placeholder {
  color: var(--color-text-tertiary);
}

.form-error,
.form-success {
  font-size: 0.875rem;
  margin: 0;
  padding: var(--space-3);
  border-radius: var(--radius-sm);
}

.form-error {
  color: var(--color-error);
  background: rgba(196, 58, 58, 0.08);
}

.form-success {
  color: var(--color-success);
  background: rgba(74, 124, 89, 0.08);
}

.btn-submit {
  padding: var(--space-4);
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: var(--color-primary);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-default);
}

.btn-submit:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-footer {
  text-align: center;
}

.hint-text {
  font-size: 0.8125rem;
  color: var(--color-text-tertiary);
  margin: 0;
}

.auth-footer {
  margin-top: var(--space-8);
  text-align: center;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-default);
}

.back-link:hover {
  color: var(--color-primary);
}
</style>
