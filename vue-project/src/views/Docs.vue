<template>
  <div class="docs-page">
    <div class="docs-layout">
      <!-- 左侧分类导航 -->
      <aside class="docs-sidebar card" :class="{ 'anim-shell': shellAnim }">
        <div class="sidebar-title">文档分类</div>
        <nav class="category-nav">
          <button
            v-for="cat in categories"
            :key="cat.name"
            class="category-item"
            :class="{ active: activeCategory === cat.name }"
            @click="activeCategory = cat.name"
          >
            <span class="cat-icon" v-html="cat.icon"></span>
            <span class="cat-name">{{ cat.name }}</span>
            <span class="cat-badge">{{ cat.count }}</span>
          </button>
        </nav>

        <div class="sidebar-divider"></div>

        <div class="sidebar-title">发布单位</div>
        <div class="dept-filter">
          <label
            v-for="dept in departments"
            :key="dept"
            class="dept-check"
            :class="{ checked: activeDepts.includes(dept) }"
            @click="toggleDept(dept)"
          >
            <span class="check-box"></span>
            {{ dept }}
          </label>
        </div>
      </aside>

      <!-- 中间文档列表 -->
      <main class="docs-main">
        <!-- 搜索栏 -->
        <div class="docs-search-bar" :class="{ 'anim-shell': shellAnim }">
          <div class="docs-search-input">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              v-model="searchText"
              placeholder="搜索文档标题、关键词、发布单位..."
              @input="filterDocs"
            />
            <button v-if="searchText" class="search-clear" @click="searchText = ''; filterDocs()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <button v-if="auth.isTeacher" class="import-btn" @click="showImport = true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            导入
          </button>
          <div class="docs-view-tabs">
            <button :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 结果计数 -->
        <div class="docs-result-info" :class="{ 'anim-shell': shellAnim }">
          <template v-if="loadingDocs">
            正在加载文档列表…
          </template>
          <template v-else>
            共找到 <strong>{{ filteredDocs.length }}</strong> 份文档
            <span v-if="activeCategory !== '全部分类'"> · 当前分类：{{ activeCategory }}</span>
            <span v-if="searchText"> · 关键词："{{ searchText }}"</span>
          </template>
        </div>

        <!-- 文档列表 -->
        <div :class="['docs-grid', viewMode]">
          <article
            v-for="(doc, index) in filteredDocs"
            :key="doc.id"
            class="doc-card card card-clickable"
            :class="{ 'anim-card': cardAnim }"
            :style="{ '--i': index }"
            @click="selectedDoc = doc"
          >
            <div class="doc-card-header">
              <div class="doc-type-badge" :class="'type-' + doc.format">
                {{ doc.format.toUpperCase() }}
              </div>
              <div class="doc-tags">
                <span v-for="tag in doc.tags" :key="tag" class="doc-tag">{{ tag }}</span>
              </div>
            </div>
            <h3 class="doc-title">{{ doc.title }}</h3>
            <p class="doc-desc">{{ doc.description }}</p>
            <div class="doc-meta">
              <span class="doc-dept">{{ doc.department }}</span>
              <span class="doc-date">{{ doc.date }}</span>
              <span class="doc-version">{{ doc.version }}</span>
            </div>
          </article>

          <!-- 加载中 -->
          <div v-if="loadingDocs" class="docs-empty">
            <div class="docs-loading-spinner"></div>
            <p>正在加载文档列表…</p>
          </div>

          <!-- 空状态 -->
          <div v-else-if="filteredDocs.length === 0" class="docs-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <p>没有找到匹配的文档</p>
            <span>尝试更换关键词或切换分类</span>
          </div>
        </div>
      </main>

      <!-- 右侧预览区 -->
      <aside class="docs-preview card" v-if="selectedDoc">
        <div class="preview-header">
          <h3>文档预览</h3>
          <button class="preview-close" @click="selectedDoc = null">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="pdf-preview">
          <div class="pdf-page">
            <div class="pdf-header-bar">
              <span class="pdf-title-text">{{ selectedDoc.title }}</span>
            </div>
            <div class="pdf-body">
              <div class="pdf-department">
                <span>{{ selectedDoc.department }}</span>
                <span>{{ selectedDoc.date }}</span>
              </div>
              <div class="pdf-divider"></div>

              <!-- ★ 即时文本预览：后端已解析，毫秒级展示 -->
              <div v-if="previewText" class="preview-text-content preview-quick-text">
                <div class="quick-text-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>
                  </svg>
                  文档内容速览
                </div>
                <p>{{ previewText.slice(0, 3000) }}</p>
                <p v-if="previewText.length > 3000" class="text-truncated">… 内容已截断，请下载原文查看完整内容</p>
              </div>

              <!-- 文档原文加载中 -->
              <div v-if="previewLoading" class="preview-loading preview-loading-compact">
                <div class="progress-spinner"></div>
                <p>{{ previewDownloadPct > 0 ? `正在加载原文（${previewDownloadPct}%）…` : '正在加载文档原文...' }}</p>
                <div v-if="previewDownloadPct > 0" class="download-progress-bar">
                  <div class="download-progress-fill" :style="{ width: previewDownloadPct + '%' }"></div>
                </div>
              </div>

              <!-- 预览错误（带重试） -->
              <div v-else-if="previewError" class="preview-error">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p>{{ previewError }}</p>
                <button class="btn btn-outline retry-btn" @click.stop="selectedDoc = { ...selectedDoc }">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                  </svg>
                  重新加载
                </button>
              </div>

              <!-- PDF / HTML iframe 直链预览 -->
              <div v-else-if="(isPDF || isHTML) && pdfPreviewSrc" class="preview-iframe-wrap">
                <div v-if="iframeLoading" class="iframe-loading-overlay">
                  <div class="progress-spinner"></div>
                  <p>{{ previewDownloadPct > 0 ? `正在下载文档（${previewDownloadPct}%）…` : '正在加载文档...' }}</p>
                  <div v-if="previewDownloadPct > 0" class="download-progress-bar" style="width: 60%; max-width: 280px;">
                    <div class="download-progress-fill" :style="{ width: previewDownloadPct + '%' }"></div>
                  </div>
                </div>
                <iframe
                  :src="pdfPreviewSrc"
                  class="preview-iframe"
                  :title="selectedDoc.title"
                  @load="iframeLoading = false"
                ></iframe>
              </div>

              <!-- DOCX HTML 预览 -->
              <div v-else-if="isDOCX && previewHtml" class="preview-docx-wrap">
                <div class="preview-docx-content" v-html="previewHtml"></div>
              </div>

              <!-- XLSX HTML 表格预览 -->
              <div v-else-if="isXLSX && previewHtml" class="preview-xlsx-wrap">
                <div class="preview-xlsx-content" v-html="previewHtml"></div>
              </div>

              <!-- 无法预览的格式 -->
              <div v-else-if="!previewText" class="preview-unavailable">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <p>此格式暂不支持在线预览</p>
                <span>请下载文件后查看完整内容</span>
              </div>
            </div>
            <div class="pdf-footer-bar">
              <span>{{ selectedDoc.version }}</span>
              <span>{{ selectedDoc.format.toUpperCase() }} · {{ selectedDoc.pages || '?' }} 页</span>
            </div>
          </div>
        </div>

        <div class="preview-actions">
          <button v-if="(isPDF || isHTML) && selectedDoc.backendFile" class="btn btn-outline" @click="openPdfInNewTab">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            在新窗口打开
          </button>
          <a v-else-if="(isPDF || isHTML) && selectedDoc.file" :href="selectedDoc.file" target="_blank" class="btn btn-outline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            在新窗口打开
          </a>
          <button v-if="selectedDoc.backendFile" class="btn btn-outline" @click="downloadBackendDoc(selectedDoc)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            下载原文
          </button>
          <a v-else-if="selectedDoc.file" :href="selectedDoc.file" class="btn btn-outline" download>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            下载原文
          </a>
          <button v-else class="btn btn-outline" disabled>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            暂无文件
          </button>
          <button
            v-if="auth.isTeacher && selectedDoc.status"
            class="btn btn-outline btn-danger"
            :disabled="deletingDoc"
            @click="removeDoc(selectedDoc)"
          >
            删除文档
          </button>
          <button class="btn btn-primary" @click="goChat(selectedDoc)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            询问此文档
          </button>
        </div>
      </aside>

      <!-- 无选中时 -->
      <aside class="docs-preview card preview-empty" v-else>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <p>选择左侧文档<br/>查看详细内容</p>
      </aside>
    </div>

    <!-- 导入弹窗 -->
    <teleport to="body">
      <transition name="modal">
        <div v-if="showImport" class="import-overlay" @click.self="showImport = false">
          <div class="import-modal">
            <div class="import-header">
              <h3>导入文档</h3>
              <p>支持 PDF / DOCX / XLSX 格式，可批量导入，系统将自动解析文本并提取元数据</p>
              <button class="import-close" @click="showImport = false">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <!-- 拖拽上传区 -->
            <div
              v-if="!importing"
              class="import-dropzone"
              @dragover="onDragOver"
              @drop="onDrop"
              @click="$refs.fileInput.click()"
            >
              <div class="dropzone-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <p class="dropzone-title">拖拽文件到此处，或点击选择</p>
              <p class="dropzone-hint">支持 .pdf / .docx / .xlsx 格式，可同时选择多个文件</p>
              <input
                ref="fileInput"
                type="file"
                accept=".pdf,.docx,.doc,.xlsx,.xls"
                multiple
                class="file-input-hidden"
                @change="handleFileSelect"
              />
            </div>

            <!-- 解析进度 -->
            <div v-else class="import-progress">
              <div class="progress-spinner"></div>
              <p class="progress-text">{{ importProgress }}</p>
              <p v-if="importedCount > 0" class="progress-done">已成功导入 {{ importedCount }} 个文档</p>
            </div>

          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
defineOptions({ name: 'Docs' })
import { ref, computed, onMounted, onActivated, onDeactivated, onUnmounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { uploadDocument, getDocumentList, getDocumentDetail, deleteDocument, fetchDocumentFile, getDocumentPreviewToken } from '../api/index.js'
import { downloadFile, buildDocumentFileUrl } from '../api/request.js'
import { getDefaultDocs, getAllDocs, saveAllDocs, getDocText, getDOCXHtml, getXLSXHtml } from '../services/knowledgeBase.js'
import { useAuthStore } from '../stores/auth.js'
import { useNotificationStore } from '../stores/notification'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const notifStore = useNotificationStore()
const searchText = ref('')
const activeCategory = ref('全部分类')
const activeDepts = ref([])
const viewMode = ref('grid')
const selectedDoc = ref(null)
const previewLoading = ref(false)
const iframeLoading = ref(false)
const previewText = ref('')
const previewHtml = ref('')
const previewBlobUrl = ref('')
const previewDirectUrl = ref('')       // 预览 token 直链（浏览器流式加载）
const previewError = ref('')
const previewDownloadPct = ref(0)
const loadingDocs = ref(true)
const shellAnim = ref(false)
const cardAnim = ref(false)

// Blob 缓存：避免重复下载同一文档
const blobCache = new Map()
const showImport = ref(false)
const importing = ref(false)
const importFiles = ref([])
const importProgress = ref('')
const importedCount = ref(0)
const deletingDoc = ref(false)

const categoryDefs = [
  { name: '全部分类', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>' },
  { name: '教务管理', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>' },
  { name: '学生事务', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>' },
  { name: '宿舍管理', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
  { name: '奖助学金', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>' },
  { name: '培养方案', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>' },
  { name: '校园通知', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>' },
  { name: '学院信息', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' }
]

const categories = computed(() =>
  categoryDefs.map(cat => ({
    ...cat,
    count: cat.name === '全部分类' ? allDocs.value.length : (categoryCounts.value[cat.name] || 0)
  }))
)

const departments = ['教务处', '学生处', '后勤管理处', '各学院']

// ---- 文档数据：从后端加载，合并默认文档元数据 ----
const allDocs = ref([])

// 默认文档的文件名→元数据映射（用于补全后端数据的预览路径等）
const defaultDocMap = new Map(
  getDefaultDocs().map(d => {
    const name = (d.file || '').split('/').pop() || ''
    return [name, d]
  })
)

function mapBackendDoc(doc) {
  const defaultMeta = defaultDocMap.get(doc.fileName) || {}
  const ext = (doc.fileName || '').split('.').pop().toLowerCase()
  // 后端返回的文件URL（可能是相对路径或完整URL）
  const backendFileUrl = doc.fileUrl || doc.filePath || doc.url || doc.downloadUrl || null
  const hasLocalFile = !!defaultMeta.file
  let fileUrl = defaultMeta.file || null
  // 如果后端给了文件URL，优先使用
  if (!fileUrl && backendFileUrl) {
    fileUrl = backendFileUrl.startsWith('http') ? backendFileUrl : backendFileUrl
  }
  return {
    id: doc.id,
    title: (doc.fileName || '').replace(/\.[^.]+$/, ''),
    department: defaultMeta.department || '未知单位',
    date: (doc.createdAt || '').slice(0, 10),
    format: ext,
    version: 'v1.0',
    pages: defaultMeta.pages || 0,
    category: defaultMeta.category || '校园通知',
    tags: defaultMeta.tags || [],
    description: defaultMeta.description || '',
    file: fileUrl,  // 文件URL（默认文档用本地路径，导入文档用后端路径）
    backendFile: !hasLocalFile && !!doc.id,  // 标记是否需要从后端 Blob 加载
    textContent: doc.textContent || defaultMeta.textContent || '',  // 后端解析出的文本内容
    status: doc.status || 'UNKNOWN'
  }
}

async function loadDocs() {
  loadingDocs.value = true
  try {
    const { data } = await getDocumentList({ size: 100 })
    const list = data?.list || data || []
    allDocs.value = Array.isArray(list) ? list.map(mapBackendDoc) : []
    saveAllDocs(allDocs.value)
  } catch (err) {
    console.error('[Docs] 加载文档列表失败:', err.message)
    const cached = getAllDocs()
    allDocs.value = cached.length > 0 ? cached : getDefaultDocs()
  } finally {
    loadingDocs.value = false
  }
}

onMounted(() => {
  loadDocs()

  // 后台预加载文档解析库，避免首次点击 DOCX/XLSX 时等待
  import('mammoth')
  import('xlsx')
})

// ---- CSS 入场动画（每次激活重播） ----
function triggerAnims() {
  nextTick(() => {
    shellAnim.value = true
    if (!loadingDocs.value) {
      cardAnim.value = true
    }
  })
}

onActivated(() => {
  shellAnim.value = false
  cardAnim.value = false
  triggerAnims()
})

onDeactivated(() => {
  shellAnim.value = false
  cardAnim.value = false
})

// 文档加载完成后卡片交错淡入 + 自动选中 URL 参数指定的文档
watch(loadingDocs, (val) => {
  if (!val) {
    nextTick(() => {
      cardAnim.value = true
      // 从聊天页引用跳转过来时，自动打开对应文档（模糊匹配）
      const docQuery = route.query.doc
      if (docQuery) {
        const clean = (s) => s.replace(/[《》福州大学\s]/g, '')
        const cleanQuery = clean(docQuery)
        const match = allDocs.value.find(d =>
          d.title === docQuery ||
          clean(d.title) === cleanQuery ||
          clean(d.title).includes(cleanQuery) ||
          cleanQuery.includes(clean(d.title))
        )
        if (match) selectedDoc.value = match
      }
    })
  }
})


const filteredDocs = computed(() => {
  let docs = allDocs.value
  if (activeCategory.value !== '全部分类') {
    docs = docs.filter(d => d.category === activeCategory.value)
  }
  if (activeDepts.value.length > 0) {
    docs = docs.filter(d => activeDepts.value.includes(d.department))
  }
  if (searchText.value.trim()) {
    const q = searchText.value.toLowerCase()
    docs = docs.filter(d =>
      d.title.toLowerCase().includes(q) ||
      d.department.toLowerCase().includes(q) ||
      d.tags.some(t => t.toLowerCase().includes(q)) ||
      d.description.toLowerCase().includes(q)
    )
  }
  return docs
})

// 更新分类计数
const categoryCounts = computed(() => {
  const counts = {}
  allDocs.value.forEach(d => {
    counts[d.category] = (counts[d.category] || 0) + 1
  })
  return counts
})

function filterDocs() { /* computed 自动处理 */ }

const isPDF = computed(() => {
  if (!selectedDoc.value) return false
  const doc = selectedDoc.value
  const f = doc.file || ''
  return f.toLowerCase().endsWith('.pdf') || doc.format === 'pdf'
})

const isHTML = computed(() => {
  if (!selectedDoc.value) return false
  const ext = (selectedDoc.value.format || '').toLowerCase()
  return ext === 'html' || ext === 'htm'
})

const pdfPreviewSrc = computed(() => {
  if (!selectedDoc.value) return ''
  if (previewDirectUrl.value) return previewDirectUrl.value
  if (previewBlobUrl.value) return previewBlobUrl.value
  return selectedDoc.value.file || ''
})

const isDOCX = computed(() => {
  if (!selectedDoc.value) return false
  const doc = selectedDoc.value
  const src = doc.file || doc.format || ''
  const ext = src.toLowerCase()
  return ext.endsWith('.docx') || ext.endsWith('.doc')
})

const isXLSX = computed(() => {
  if (!selectedDoc.value) return false
  const doc = selectedDoc.value
  const src = doc.file || doc.format || ''
  const ext = src.toLowerCase()
  return ext.endsWith('.xlsx') || ext.endsWith('.xls')
})

function clearPreviewBlob() {
  if (previewBlobUrl.value) {
    URL.revokeObjectURL(previewBlobUrl.value)
    previewBlobUrl.value = ''
  }
  previewDirectUrl.value = ''
  previewDownloadPct.value = 0
}

async function loadBackendFileBlob(doc, onProgress) {
  const cacheKey = `blob_${doc.id}`
  if (blobCache.has(cacheKey)) {
    if (onProgress) onProgress(100)
    return blobCache.get(cacheKey)
  }
  const { data } = await fetchDocumentFile(doc.id, onProgress)
  blobCache.set(cacheKey, data)
  return data
}

async function downloadBackendDoc(doc) {
  const fileName = doc.title + '.' + doc.format
  await downloadFile(`/document/${doc.id}/file`, fileName)
}

function openPdfInNewTab() {
  const url = pdfPreviewSrc.value
  if (url) window.open(url, '_blank')
}

// 请求版本号：防止快速切换文档时旧响应覆盖新状态
let previewReqId = 0

watch(selectedDoc, async (doc) => {
  previewText.value = ''
  previewHtml.value = ''
  previewError.value = ''
  iframeLoading.value = false
  previewLoading.value = false
  clearPreviewBlob()
  if (!doc) return

  // ★ 立即填充文本（后端已解析 textContent，毫秒级展示）
  if (doc.textContent) {
    previewText.value = doc.textContent.slice(0, 3000)
    if (doc.textContent.length > 3000) {
      previewText.value += '\n\n… 内容已截断，请下载原文查看完整内容'
    }
  }

  const myReqId = ++previewReqId
  const isLatest = () => myReqId === previewReqId
  const ext = (doc.format || (doc.file || '').split('.').pop() || '').toLowerCase()

  // ── 本地静态文件直接交给 iframe ──
  if (doc.file && !doc.backendFile && (ext === 'pdf' || ext === 'html' || ext === 'htm')) {
    iframeLoading.value = true
    return
  }

  // ── 后端 PDF / HTML：优先用预览 token 生成直链（流式加载，秒开） ──
  if (doc.backendFile && doc.id && (ext === 'pdf' || ext === 'html' || ext === 'htm')) {
    previewLoading.value = true
    iframeLoading.value = true
    let token = null
    try {
      const tokenRes = await Promise.race([
        getDocumentPreviewToken(doc.id),
        new Promise((_, reject) => setTimeout(() => reject(new Error('token_timeout')), 5000))
      ])
      token = tokenRes?.data?.token || tokenRes?.data
    } catch { /* token 接口超时，走下方 Blob 回退 */ }
    if (token && isLatest()) {
      previewDirectUrl.value = buildDocumentFileUrl(doc.id, token)
      previewLoading.value = false
      return
    }
    // 回退：下载完整文件为 Blob（120s 超时，显示进度）
    previewDownloadPct.value = 0
    try {
      const blob = await loadBackendFileBlob(doc, (pct) => {
        if (isLatest()) previewDownloadPct.value = pct
      })
      if (!isLatest()) return
      previewBlobUrl.value = URL.createObjectURL(blob)
      iframeLoading.value = true
    } catch (err) {
      if (!isLatest()) return
      previewError.value = `文档加载失败：${err.message || '网络异常'}`
    }
    if (isLatest()) previewLoading.value = false
    return
  }

  // ── DOCX / XLSX ──
  previewLoading.value = true
  previewDownloadPct.value = 0
  try {
    if (doc.backendFile) {
      const blob = await loadBackendFileBlob(doc, (pct) => {
        if (isLatest()) previewDownloadPct.value = pct
      })
      if (!isLatest()) return
      if (ext === 'docx' || ext === 'doc') {
        const html = await getDOCXHtml(blob)
        if (!isLatest()) return
        if (html) { previewHtml.value = html }
        else { previewText.value = (await getDocText(doc)) || '' }
        previewLoading.value = false
        return
      }
      if (ext === 'xlsx' || ext === 'xls') {
        const html = await getXLSXHtml(blob)
        if (!isLatest()) return
        previewHtml.value = html
        previewLoading.value = false
        return
      }
    }
    // 本地文件
    if (ext === 'docx' || ext === 'doc') {
      const html = doc.file ? await getDOCXHtml(doc.file) : null
      if (!isLatest()) return
      if (html) { previewHtml.value = html }
      else { previewText.value = (await getDocText(doc)) || '' }
    } else if (ext === 'xlsx' || ext === 'xls') {
      const html = doc.file ? await getXLSXHtml(doc.file) : null
      if (!isLatest()) return
      if (html) { previewHtml.value = html }
      else { previewText.value = (await getDocText(doc)) || '' }
    } else {
      previewText.value = (await getDocText(doc)) || ''
    }
    // 无内容则从后端详情补拉
    if (!isLatest()) return
    if (!previewText.value && !previewHtml.value && doc.id) {
      try {
        const { data } = await getDocumentDetail(doc.id)
        if (!isLatest()) return
        if (data) {
          doc.textContent = data.textContent || data.content || data.text || ''
          doc.file = doc.file || data.fileUrl || data.filePath || data.url || ''
          if (doc.textContent) {
            previewText.value = doc.textContent.slice(0, 3000)
            if (doc.textContent.length > 3000) previewText.value += '\n\n… 内容已截断，请下载原文查看完整内容'
          }
        }
      } catch { /* 静默 */ }
    }
    if (!isLatest()) return
    if (!previewText.value && !previewHtml.value) {
      previewError.value = '暂无可预览内容，请尝试下载原文查看'
    }
  } catch (err) {
    if (!isLatest()) return
    previewError.value = `文档加载失败：${err.message || '网络异常'}`
  } finally {
    if (isLatest()) {
      previewLoading.value = false
      previewDownloadPct.value = 0
    }
  }
})

onUnmounted(() => {
  clearPreviewBlob()
  blobCache.clear()
})

function toggleDept(dept) {
  const idx = activeDepts.value.indexOf(dept)
  if (idx >= 0) {
    activeDepts.value.splice(idx, 1)
  } else {
    activeDepts.value.push(dept)
  }
}

function goChat(doc) {
  const title = typeof doc === 'string' ? doc : doc.title
  const docId = typeof doc === 'object' && doc.id != null ? String(doc.id) : ''
  router.push({ path: '/chat', query: { q: title, docId } })
}

async function removeDoc(doc) {
  if (!doc?.id || deletingDoc.value) return
  if (!confirm(`确定删除《${doc.title}》？删除后无法恢复。`)) return
  deletingDoc.value = true
  try {
    await deleteDocument(doc.id)
    allDocs.value = allDocs.value.filter(d => d.id !== doc.id)
    if (selectedDoc.value?.id === doc.id) {
      selectedDoc.value = null
    }
  } catch (err) {
    alert(err.message || '删除失败')
  } finally {
    deletingDoc.value = false
  }
}

// ---- 文件导入 ----
async function handleFileSelect(e) {
  const files = Array.from(e.target.files || e.dataTransfer?.files || [])
  if (!files.length) return
  importFiles.value = files
  await processFiles(files)
}

async function processFiles(files) {
  importing.value = true
  importedCount.value = 0
  const importedNames = []

  for (const file of files) {
    importProgress.value = `正在上传：${file.name}`
    try {
      await uploadDocument(file)
      importedCount.value++
      importedNames.push(file.name.replace(/\.[^.]+$/, ''))
    } catch (err) {
      console.error('上传失败:', file.name, err.message)
      importProgress.value = `上传失败：${file.name} — ${err.message}`
    }
  }

  // 上传完成后刷新后端文档列表
  if (importedCount.value > 0) {
    await loadDocs()
    // 为每个成功导入的文件添加通知
    importedNames.forEach(name => {
      notifStore.addNotification({
        title: `新文档导入：${name}`,
        type: 'info',
        docId: null // 由 loadDocs 后的列表决定，此处先不关联具体 id
      })
    })
  }

  importing.value = false
  importProgress.value = ''
  importFiles.value = []

  if (importedCount.value > 0) {
    setTimeout(() => {
      showImport.value = false
    }, 1500)
  }
}


// 拖拽处理
function onDragOver(e) {
  e.preventDefault()
}
function onDrop(e) {
  e.preventDefault()
  handleFileSelect(e)
}
</script>

<style scoped>
.docs-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}

/* ===== 入场动画 ===== */
@keyframes sidebarIn {
  from { transform: translateX(-20px); opacity: 0; }
  to   { transform: translateX(0);     opacity: 1; }
}
@keyframes searchIn {
  from { transform: translateY(-12px); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
}
@keyframes infoIn {
  from { transform: translateY(-8px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
@keyframes cardUp {
  from { transform: translateY(20px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

.docs-sidebar.anim-shell {
  animation: sidebarIn 0.45s ease-out backwards;
}
.docs-search-bar.anim-shell {
  animation: searchIn 0.4s ease-out 0.08s backwards;
}
.docs-result-info.anim-shell {
  animation: infoIn 0.35s ease-out 0.15s backwards;
}
.doc-card.anim-card {
  animation: cardUp 0.4s ease-out backwards;
  animation-delay: calc(var(--i, 0) * 0.04s);
}

.docs-layout {
  flex: 1;
  display: grid;
  grid-template-columns: 240px 1fr 420px;
  gap: 0;
  margin-top: var(--navbar-height);
  overflow: hidden;
}

/* ===== 左侧分类导航 ===== */
.docs-sidebar {
  border-radius: 0;
  border: none;
  border-right: 1px solid var(--border-light);
  box-shadow: none;
  padding: 20px;
  overflow-y: auto;
  background: var(--bg-cool);
}

.sidebar-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 10px;
}

.category-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: 0.88rem;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
  width: 100%;
  text-align: left;
}

.category-item:hover {
  background: var(--bg-warm);
  color: var(--text);
}

.category-item.active {
  background: var(--primary-light);
  color: var(--primary);
  font-weight: 600;
}

.cat-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.cat-badge {
  margin-left: auto;
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--text-tertiary);
  background: var(--bg-warm);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.sidebar-divider {
  height: 1px;
  background: var(--border-light);
  margin: 18px 0;
}

.dept-filter {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dept-check {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.dept-check:hover {
  background: var(--bg-warm);
}

.dept-check.checked {
  color: var(--primary);
}

.check-box {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border);
  border-radius: 4px;
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.dept-check.checked .check-box {
  background: var(--primary);
  border-color: var(--primary);
}

/* ===== 中间文档列表 ===== */
.docs-main {
  padding: 20px 24px;
  overflow-y: auto;
  min-width: 0;
}

.docs-search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.docs-search-input {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.docs-search-input:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(200, 103, 58, 0.08);
}

.docs-search-input input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.9rem;
  background: transparent;
  color: var(--text);
}

.docs-search-input input::placeholder {
  color: var(--text-placeholder);
}

.docs-search-input svg {
  flex-shrink: 0;
  color: var(--text-tertiary);
}

.search-clear {
  background: var(--bg-warm);
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  transition: all var(--transition-fast);
}

.search-clear:hover {
  background: var(--border);
  color: var(--text);
}

.docs-view-tabs {
  display: flex;
  gap: 4px;
  background: var(--bg-warm);
  padding: 3px;
  border-radius: var(--radius-sm);
}

.docs-view-tabs button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: transparent;
  color: var(--text-tertiary);
  transition: all var(--transition-fast);
}

.docs-view-tabs button.active {
  background: var(--surface);
  color: var(--text);
  box-shadow: var(--shadow-xs);
}

.docs-result-info {
  font-size: 0.82rem;
  color: var(--text-tertiary);
  margin-bottom: 16px;
}

.docs-result-info strong {
  color: var(--text);
}

/* 文档网格 */
.docs-grid.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.docs-grid.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.docs-grid.list .doc-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
}

.docs-grid.list .doc-card-header {
  flex-shrink: 0;
}

.docs-grid.list .doc-title {
  flex: 1;
  margin-bottom: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.docs-grid.list .doc-desc {
  display: none;
}

.docs-grid.list .doc-meta {
  flex-shrink: 0;
}

.doc-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.doc-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.doc-type-badge {
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.type-pdf { background: #FDE8E8; color: #C84A4A; }
.type-docx { background: #E8EEF8; color: #4A6FA5; }
.type-doc { background: #E8EEF8; color: #4A6FA5; }
.type-xlsx { background: #E8F5E9; color: #388E3C; }

.doc-tags {
  display: flex;
  gap: 6px;
}

.doc-tag {
  padding: 2px 8px;
  background: var(--bg-warm);
  border-radius: var(--radius-full);
  font-size: 0.7rem;
  color: var(--text-tertiary);
}

.doc-tag.has-file {
  background: #E8F5E9;
  color: #388E3C;
  font-weight: 600;
}

.doc-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.doc-desc {
  font-size: 0.82rem;
  color: var(--text-tertiary);
  line-height: 1.6;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.doc-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-light);
  font-size: 0.78rem;
  color: var(--text-tertiary);
}

.doc-dept {
  font-weight: 500;
  color: var(--text-secondary);
}

.doc-version {
  margin-left: auto;
  padding: 2px 8px;
  background: var(--bg-warm);
  border-radius: var(--radius-full);
}

/* 空状态 */
.docs-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 64px 20px;
  color: var(--text-tertiary);
}

.docs-empty svg { margin-bottom: 16px; }
.docs-empty p { font-size: 0.95rem; margin-bottom: 4px; }
.docs-empty span { font-size: 0.82rem; }

.docs-loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ===== 右侧预览 ===== */
.docs-preview {
  border-radius: 0;
  border: none;
  border-left: 1px solid var(--border-light);
  box-shadow: none;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--bg-cool);
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.docs-preview.preview-empty {
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--text-tertiary);
}

.preview-empty svg { margin-bottom: 12px; }
.preview-empty p { font-size: 0.85rem; line-height: 1.6; }

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.preview-header h3 {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text);
}

.preview-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: transparent;
  color: var(--text-tertiary);
  transition: all var(--transition-fast);
}

.preview-close:hover {
  background: var(--bg-warm);
  color: var(--text);
}

/* PDF 预览模拟 */
.pdf-preview {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;
}

.pdf-page {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.pdf-header-bar {
  padding: 10px 16px;
  background: #f5f5f5;
  border-bottom: 1px solid #e5e5e5;
}

.pdf-title-text {
  font-size: 0.72rem;
  font-weight: 600;
  color: #555;
}

.pdf-body {
  padding: 20px 18px;
}

.pdf-department {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  color: #999;
  margin-bottom: 10px;
}

.pdf-divider {
  height: 1px;
  background: #eee;
  margin-bottom: 16px;
}

/* 预览加载 / iframe / 文本 */
.preview-loading {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-tertiary);
}

.preview-loading .progress-spinner {
  margin: 0 auto 12px;
  width: 28px;
  height: 28px;
  border-width: 2px;
}

/* 下载进度条 */
.download-progress-bar {
  width: 80%;
  max-width: 320px;
  height: 6px;
  background: var(--border);
  border-radius: 3px;
  margin: 10px auto 0;
  overflow: hidden;
}
.download-progress-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* 预览错误 */
.preview-error {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-tertiary);
}
.preview-error svg { margin-bottom: 10px; color: #E6A23C; }
.preview-error p {
  font-size: 0.85rem;
  margin-bottom: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
  word-break: break-word;
}
.retry-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 18px;
  font-size: 0.82rem;
  margin-top: 4px;
}

/* 紧凑型加载 */
.preview-loading-compact {
  padding: 24px 20px !important;
}
.preview-loading-compact .progress-spinner {
  width: 22px !important;
  height: 22px !important;
  border-width: 2px !important;
  margin-bottom: 8px !important;
}

/* 即时文本速览 */
.preview-quick-text {
  background: linear-gradient(135deg, #fdfcf8 0%, #faf7f0 100%);
  border: 1px solid #ede4d3;
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 14px;
  max-height: 240px;
  animation: quickTextIn 0.3s ease-out;
}
@keyframes quickTextIn {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.quick-text-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #9b7d4c;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 8px;
  padding: 2px 10px;
  background: rgba(155, 125, 76, 0.08);
  border-radius: 4px;
}
.quick-text-label svg { flex-shrink: 0; opacity: 0.7; }

/* iframe 加载遮罩 */
.iframe-loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: rgba(255, 255, 255, 0.92);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.iframe-loading-overlay p { font-size: 0.82rem; color: var(--text-tertiary); }
.iframe-loading-overlay .progress-spinner { margin: 0; }

.preview-iframe-wrap {
  width: 100%;
  height: 460px;
  border: 1px solid var(--border);
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  position: relative;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* DOCX HTML 预览 */
.preview-docx-wrap {
  max-height: 460px;
  overflow-y: auto;
  overflow-x: hidden;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 4px;
}

.preview-docx-content {
  padding: 20px 24px;
  font-size: 0.82rem;
  line-height: 1.8;
  color: #333;
}

.preview-docx-content :deep(h1) { font-size: 1.3rem; margin: 16px 0 10px; }
.preview-docx-content :deep(h2) { font-size: 1.15rem; margin: 14px 0 8px; }
.preview-docx-content :deep(h3) { font-size: 1.05rem; margin: 12px 0 6px; }
.preview-docx-content :deep(p) { margin: 6px 0; }
.preview-docx-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 10px 0;
  font-size: 0.76rem;
}
.preview-docx-content :deep(th),
.preview-docx-content :deep(td) {
  border: 1px solid #ddd;
  padding: 6px 10px;
  text-align: left;
}
.preview-docx-content :deep(th) { background: #f5f5f5; font-weight: 600; }
.preview-docx-content :deep(ul), .preview-docx-content :deep(ol) { padding-left: 20px; margin: 6px 0; }
.preview-docx-content :deep(li) { margin: 2px 0; }
.preview-docx-content :deep(img) { max-width: 100%; height: auto; }

/* XLSX HTML 表格预览 */
.preview-xlsx-wrap {
  max-height: 460px;
  overflow: auto;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 4px;
}

.preview-xlsx-content {
  padding: 8px;
}

.xlsx-sheet {
  margin-bottom: 4px;
}

.xlsx-sheet-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: #555;
  padding: 6px 10px;
  background: #f0f4f8;
  border-radius: 4px 4px 0 0;
  margin: 0;
}

.preview-xlsx-content :deep(table) {
  border-collapse: collapse;
  font-size: 0.74rem;
  width: auto;
  min-width: 100%;
}

.preview-xlsx-content :deep(th),
.preview-xlsx-content :deep(td) {
  border: 1px solid #d0d0d0;
  padding: 4px 10px;
  text-align: left;
  white-space: nowrap;
}

.preview-xlsx-content :deep(th) {
  background: #e8ecf0;
  font-weight: 600;
  color: #333;
}

.preview-xlsx-content :deep(td) {
  background: #fff;
}

.preview-xlsx-content :deep(tr:nth-child(even) td) {
  background: #fafbfc;
}

.preview-text-content {
  max-height: 460px;
  overflow-y: auto;
  overflow-x: hidden;
  font-size: 0.78rem;
  line-height: 1.8;
  color: var(--text-secondary);
  padding: 8px 4px;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-break: break-word;
}

.text-truncated {
  color: var(--text-tertiary);
  font-style: italic;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed var(--border);
}

.preview-unavailable {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-tertiary);
}

.preview-unavailable svg { margin-bottom: 10px; color: var(--border); }
.preview-unavailable p { font-size: 0.88rem; margin-bottom: 4px; }
.preview-unavailable span { font-size: 0.78rem; }

.pdf-footer-bar {
  padding: 8px 16px;
  background: #f5f5f5;
  border-top: 1px solid #e5e5e5;
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
  color: #999;
}

.preview-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preview-actions .btn {
  flex: 1 1 calc(50% - 4px);
  min-width: 140px;
  font-size: 0.82rem;
  padding: 8px 12px;
}

/* ===== 导入按钮 ===== */
.import-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: var(--surface);
  border: 1.5px dashed var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.import-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light);
}

/* ===== 导入弹窗 ===== */
.import-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.import-modal {
  width: 520px;
  max-width: 100%;
  background: var(--surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.import-header {
  position: relative;
  padding: 28px 28px 20px;
  border-bottom: 1px solid var(--border-light);
}

.import-header h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 6px;
}

.import-header p {
  font-size: 0.84rem;
  color: var(--text-tertiary);
}

.import-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: transparent;
  color: var(--text-tertiary);
  transition: all var(--transition-fast);
}

.import-close:hover {
  background: var(--bg-warm);
  color: var(--text);
}

/* 拖拽区 */
.import-dropzone {
  margin: 24px;
  padding: 56px 24px;
  border: 2px dashed var(--border);
  border-radius: var(--radius);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition);
  background: var(--bg);
}

.import-dropzone:hover {
  border-color: var(--primary);
  background: var(--primary-light);
}

.dropzone-icon {
  color: var(--text-tertiary);
  margin-bottom: 16px;
  transition: color var(--transition);
}

.import-dropzone:hover .dropzone-icon {
  color: var(--primary);
}

.dropzone-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
}

.dropzone-hint {
  font-size: 0.82rem;
  color: var(--text-tertiary);
}

.file-input-hidden {
  display: none;
}

/* 进度 */
.import-progress {
  padding: 56px 24px;
  text-align: center;
}

.progress-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.progress-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.progress-done {
  font-size: 0.88rem;
  color: #388E3C;
  font-weight: 600;
}

/* 弹窗动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .import-modal,
.modal-leave-active .import-modal {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.modal-enter-from .import-modal {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

.modal-leave-to .import-modal {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

/* ===== 响应式 ===== */
@media (max-width: 1200px) {
  .docs-layout {
    grid-template-columns: 200px 1fr 380px;
  }
  .docs-grid.grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .docs-layout {
    grid-template-columns: 1fr;
  }
  .docs-sidebar, .docs-preview {
    display: none;
  }
}
</style>
