<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-brand">
          <span class="footer-logo">∑</span>
          <p class="footer-tagline">经济学，如此简单</p>
        </div>

        <div class="footer-sections">
          <div class="footer-section">
            <span class="section-label">内容</span>
            <nav class="footer-nav">
              <router-link to="/learn" class="footer-link">章节学习</router-link>
              <router-link to="/explore" class="footer-link">图表探索</router-link>
            </nav>
          </div>

          <div class="footer-section">
            <span class="section-label">关于</span>
            <nav class="footer-nav">
              <a href="#" class="footer-link">项目说明</a>
              <a href="#" class="footer-link">参考资料</a>
            </nav>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="footer-copy">
          © {{ currentYear }} EconoLearn. 内容仅供参考，不构成投资建议。
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.footer {
  margin-top: var(--space-24);
  padding: var(--space-16) 0 var(--space-8);
  border-top: 1px solid var(--color-border-light);
}

.footer-content {
  display: flex;
  justify-content: space-between;
  gap: var(--space-12);
  margin-bottom: var(--space-12);
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.footer-logo {
  font-family: var(--font-serif);
  font-size: 2rem;
  font-weight: 300;
  color: var(--color-primary);
}

.footer-tagline {
  font-family: var(--font-serif);
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.footer-sections {
  display: flex;
  gap: var(--space-12);
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.footer-nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.footer-link {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-default);
}

.footer-link:hover {
  color: var(--color-primary);
}

.footer-bottom {
  display: flex;
  justify-content: center;
  padding-top: var(--space-8);
  border-top: 1px solid var(--color-border-light);
}

.footer-copy {
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  color: var(--color-text-tertiary);
  margin: 0;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: var(--space-8);
  }

  .footer-sections {
    flex-direction: row;
    flex-wrap: wrap;
    gap: var(--space-8);
  }
}
</style>
