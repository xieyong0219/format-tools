import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { HistoryPanel } from './components/HistoryPanel'
import { StatusBar } from './components/StatusBar'
import { StructuredInput, type StructuredInputHandle } from './components/StructuredInput'
import { StructuredOutput } from './components/StructuredOutput'
import { Toolbar } from './components/Toolbar'
import { useClipboard } from './hooks/useClipboard'
import { useFileTransfer } from './hooks/useFileTransfer'
import { useFormatter } from './hooks/useFormatter'
import { useHistoryRecords } from './hooks/useHistoryRecords'
import { useHotkeys } from './hooks/useHotkeys'
import { useTheme } from './hooks/useTheme'
import { useWindowControls } from './hooks/useWindowControls'
import type { HistoryRecord, ScrollSyncState } from './types'
import { getNextHeroMessage } from './utils/heroMessages'

function ThemeIcon({ isDark }: { isDark: boolean }) {
  if (isDark) {
    return (
      <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
        <path d="M11.5 2.8A7 7 0 1 0 17.2 8 5.8 5.8 0 0 1 11.5 2.8Z" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
      <circle cx="10" cy="10" r="3.2" />
      <path d="M10 1.8v2.4M10 15.8v2.4M18.2 10h-2.4M4.2 10H1.8M15.8 4.2l-1.7 1.7M5.9 14.1l-1.7 1.7M15.8 15.8l-1.7-1.7M5.9 5.9 4.2 4.2" />
    </svg>
  )
}

function MuyuButtonWithMerit({
  hitting,
  showMerit,
  onClick,
}: {
  hitting: boolean
  showMerit: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pixel-muyu-button px-2.5 py-1.5 transition-all duration-150 ease-out ${hitting ? 'is-hitting' : ''} ${showMerit ? 'is-merit-visible' : ''}`}
      title="敲一下，换条提示语"
      aria-label="敲一下，换条提示语"
    >
      <span className="pixel-muyu-icon" aria-hidden="true">
        <span className="pixel-muyu-mallet" />
        <span className="pixel-muyu-body" />
      </span>
      <span className="pixel-muyu-label">敲一下</span>
      <span className="pixel-muyu-merit" aria-hidden="true">
        功德+1
      </span>
    </button>
  )
}

function App() {
  const inputRef = useRef<StructuredInputHandle>(null)
  const heroHitTimeoutRef = useRef<number | null>(null)
  const heroMeritTimeoutRef = useRef<number | null>(null)
  const { readClipboardText, writeClipboardText } = useClipboard()
  const { acceptedExtensions, fileInputRef, openFilePicker, readSelectedFile, readDroppedFiles, exportText } =
    useFileTransfer()
  const formatter = useFormatter()
  const { records, addRecord, removeRecord, clearHistory } = useHistoryRecords()
  const { isDark, toggleTheme } = useTheme()
  const windowControls = useWindowControls()
  const [heroMessage, setHeroMessage] = useState(() => getNextHeroMessage())
  const [isHeroMessageHitting, setIsHeroMessageHitting] = useState(false)
  const [showHeroMerit, setShowHeroMerit] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [linkedScrollEnabled, setLinkedScrollEnabled] = useState(false)
  const [scrollSyncState, setScrollSyncState] = useState<ScrollSyncState | null>(null)
  const [isDraggingFile, setIsDraggingFile] = useState(false)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    return () => {
      if (heroHitTimeoutRef.current !== null) {
        window.clearTimeout(heroHitTimeoutRef.current)
      }
      if (heroMeritTimeoutRef.current !== null) {
        window.clearTimeout(heroMeritTimeoutRef.current)
      }
    }
  }, [])

  function handleScrollSync(state: ScrollSyncState) {
    setScrollSyncState(state)
  }

  function handleRefreshHeroMessage() {
    setIsHeroMessageHitting(false)
    window.requestAnimationFrame(() => {
      setIsHeroMessageHitting(true)
    })

    if (heroHitTimeoutRef.current !== null) {
      window.clearTimeout(heroHitTimeoutRef.current)
    }
    if (heroMeritTimeoutRef.current !== null) {
      window.clearTimeout(heroMeritTimeoutRef.current)
    }

    heroHitTimeoutRef.current = window.setTimeout(() => {
      setIsHeroMessageHitting(false)
      heroHitTimeoutRef.current = null
    }, 190)

    setShowHeroMerit(false)
    window.requestAnimationFrame(() => {
      setShowHeroMerit(true)
    })

    heroMeritTimeoutRef.current = window.setTimeout(() => {
      setShowHeroMerit(false)
      heroMeritTimeoutRef.current = null
    }, 820)

    setHeroMessage(getNextHeroMessage())
  }

  function handleFormat() {
    const snapshot = formatter.formatContent()
    if (snapshot) {
      addRecord(snapshot)
    }
  }

  function handleCompress() {
    const snapshot = formatter.compressContent()
    if (snapshot) {
      addRecord(snapshot)
    }
  }

  async function handleImportClipboard() {
    try {
      const text = await readClipboardText()
      if (!text.trim()) {
        formatter.setNotice('剪贴板中暂无可导入内容。', 'info')
        return
      }

      formatter.importInput(text)
      inputRef.current?.focus()
    } catch {
      formatter.setNotice('读取系统剪贴板失败，请检查权限设置。', 'error')
    }
  }

  async function handleCopyOutput() {
    if (!formatter.output.trim()) {
      formatter.setNotice('暂无可复制内容。', 'info')
      return
    }

    try {
      await writeClipboardText(formatter.output)
      formatter.setNotice('结果已复制到系统剪贴板。', 'success')
    } catch {
      formatter.setNotice('复制失败，请稍后重试。', 'error')
    }
  }

  async function handleImportFile(file?: File | null) {
    try {
      const text = await readSelectedFile(file)
      if (!text.trim()) {
        formatter.setNotice('文件内容为空，未导入。', 'info')
        return
      }

      formatter.importInput(text)
      formatter.setNotice('文件内容已导入输入区。', 'success')
      inputRef.current?.focus()
    } catch {
      formatter.setNotice('读取文件失败，请检查文件编码或重试。', 'error')
    }
  }

  async function handleOpenImportFile() {
    try {
      const text = await openFilePicker()

      if (text === null) {
        return
      }

      if (!text.trim()) {
        formatter.setNotice('文件内容为空，未导入。', 'info')
        return
      }

      formatter.importInput(text)
      formatter.setNotice('文件内容已导入输入区。', 'success')
      inputRef.current?.focus()
    } catch {
      formatter.setNotice('读取文件失败，请检查文件编码或重试。', 'error')
    }
  }

  async function handleExportFile() {
    if (!formatter.output.trim()) {
      formatter.setNotice('暂无可导出的结果。', 'info')
      return
    }

    try {
      const exported = await exportText(formatter.mode, formatter.output)

      if (!exported) {
        formatter.setNotice('已取消导出。', 'info')
        return
      }

      formatter.setNotice('结果已导出到本地文件。', 'success')
    } catch {
      formatter.setNotice('导出失败，请稍后重试。', 'error')
    }
  }

  async function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    await handleImportFile(file)
    event.target.value = ''
  }

  async function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDraggingFile(false)

    try {
      const text = await readDroppedFiles(event.dataTransfer.files)
      if (!text.trim()) {
        formatter.setNotice('拖入的文件内容为空。', 'info')
        return
      }

      formatter.importInput(text)
      formatter.setNotice('已通过拖拽导入文件。', 'success')
      inputRef.current?.focus()
    } catch {
      formatter.setNotice('拖拽导入失败，请重试。', 'error')
    }
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    if (event.dataTransfer.types.includes('Files')) {
      setIsDraggingFile(true)
    }
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return
    }

    setIsDraggingFile(false)
  }

  function handleRestoreHistory(record: HistoryRecord) {
    formatter.restoreSnapshot(record)
    setHistoryOpen(false)
    inputRef.current?.focus()
  }

  async function handleToggleAlwaysOnTop() {
    const enabled = await windowControls.toggleAlwaysOnTop()

    if (enabled === null) {
      formatter.setNotice('当前环境暂不支持窗口置顶。', 'info')
      return
    }

    formatter.setNotice(enabled ? '已开启窗口置顶。' : '已关闭窗口置顶。', 'success')
  }

  useHotkeys({
    onFormat: handleFormat,
    onCompress: handleCompress,
    onClear: formatter.clearAll,
    onImportClipboard: handleImportClipboard,
  })

  return (
    <div
      className="relative h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_rgba(241,245,249,0.98)_38%,_#e9edf3_100%)] text-slate-900 dark:bg-[radial-gradient(circle_at_top,_rgba(63,63,70,0.34),_rgba(24,24,27,0.98)_28%,_#09090b_100%)] dark:text-zinc-100"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedExtensions}
        className="hidden"
        onChange={handleFileInputChange}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-[320px] bg-[linear-gradient(180deg,_rgba(255,255,255,0.16),_transparent)] dark:bg-[linear-gradient(180deg,_rgba(101,212,110,0.08),_transparent)]" />

      {isDraggingFile ? (
        <div className="fixed inset-6 z-50 flex items-center justify-center border-2 border-dashed border-emerald-500/70 bg-[#f6eedb]/80 backdrop-blur-sm dark:border-emerald-400/50 dark:bg-black/70">
          <div className="pixel-card px-8 py-8 text-center">
            <div className="text-lg font-semibold text-slate-900 dark:text-zinc-100">松开即可导入文件</div>
            <div className="mt-2 text-sm text-slate-500 dark:text-zinc-400">支持 .json / .xml / .txt / .pom</div>
          </div>
        </div>
      ) : null}

      <div className="relative mx-auto flex h-full min-h-0 max-w-[1540px] flex-col px-4 py-4 lg:px-8 lg:py-6">
        <section className="pixel-shell flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="border-b border-slate-200/75 px-6 py-6 dark:border-zinc-800/80 lg:px-8 lg:py-7">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-4xl">
                <h1 className="pixel-title text-[28px] text-slate-900 dark:text-zinc-50 lg:text-[34px]">
                  JSON / XML 格式化工具
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <p className="pixel-subtitle max-w-3xl flex-1 text-[14px] leading-7 text-slate-600 dark:text-zinc-400">
                    {heroMessage}
                  </p>
                  <MuyuButtonWithMerit
                    hitting={isHeroMessageHitting}
                    showMerit={showHeroMerit}
                    onClick={handleRefreshHeroMessage}
                  />
                </div>
              </div>

              <div className="flex flex-col items-stretch gap-2 xl:min-w-[450px] xl:items-end">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="pixel-icon-button inline-flex h-10 w-10 items-center justify-center text-slate-500 transition-all duration-150 ease-out will-change-transform hover:text-slate-900 active:translate-y-[2px] active:scale-[0.96] dark:text-zinc-300 dark:hover:text-zinc-100"
                    title={isDark ? '切换到浅色模式' : '切换到深色模式'}
                    aria-label={isDark ? '切换到浅色模式' : '切换到深色模式'}
                  >
                    <ThemeIcon isDark={isDark} />
                  </button>
                </div>

                <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[450px]">
                  <div className="pixel-card px-3.5 py-3">
                    <div className="pixel-stat-label text-[10px] font-semibold uppercase text-slate-400 dark:text-zinc-500">
                      Mode
                    </div>
                    <div className="mt-1 text-[18px] font-semibold text-slate-900 dark:text-zinc-100">
                      {formatter.mode.toUpperCase()}
                    </div>
                  </div>
                  <div className="pixel-card px-3.5 py-3">
                    <div className="pixel-stat-label text-[10px] font-semibold uppercase text-slate-400 dark:text-zinc-500">
                      Input
                    </div>
                    <div className="mt-1 text-[18px] font-semibold text-slate-900 dark:text-zinc-100">
                      {formatter.inputStats.characters}
                    </div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-zinc-400">字符数</div>
                  </div>
                  <div className="pixel-card px-3.5 py-3">
                    <div className="pixel-stat-label text-[10px] font-semibold uppercase text-slate-400 dark:text-zinc-500">
                      Output
                    </div>
                    <div className="mt-1 text-[18px] font-semibold text-slate-900 dark:text-zinc-100">
                      {formatter.outputStats.characters}
                    </div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-zinc-400">字符数</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Toolbar
            mode={formatter.mode}
            alwaysOnTop={windowControls.isAlwaysOnTop}
            alwaysOnTopAvailable={windowControls.isAvailable}
            linkedScrollEnabled={linkedScrollEnabled}
            historyOpen={historyOpen}
            onModeChange={formatter.changeMode}
            onFormat={handleFormat}
            onCompress={handleCompress}
            onCopy={handleCopyOutput}
            onApply={formatter.applyOutputToInput}
            onClear={formatter.clearAll}
            onImportClipboard={handleImportClipboard}
            onImportFile={handleOpenImportFile}
            onExportFile={handleExportFile}
            onToggleLinkedScroll={() => setLinkedScrollEnabled((current) => !current)}
            onToggleHistory={() => setHistoryOpen((current) => !current)}
            onToggleAlwaysOnTop={handleToggleAlwaysOnTop}
          />

          <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto px-4 pb-4 pt-2 lg:px-6 lg:pb-6">
            {historyOpen ? (
              <HistoryPanel
                records={records}
                onRestore={handleRestoreHistory}
                onRemove={removeRecord}
                onClear={clearHistory}
              />
            ) : null}

            {formatter.errorMessage ? (
              <div className="rounded-[24px] border border-rose-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.9),_rgba(255,241,242,0.98))] px-5 py-4 shadow-[0_12px_30px_rgba(244,63,94,0.08)] dark:border-rose-900/80 dark:bg-[linear-gradient(180deg,_rgba(69,10,10,0.9),_rgba(24,24,27,0.96))] dark:shadow-none">
                <div className="text-sm font-semibold text-rose-700">错误提示</div>
                <div className="mt-2 text-sm leading-6 text-rose-600 dark:text-rose-200">
                  {formatter.errorMessage}
                </div>
              </div>
            ) : null}

            <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
              <StructuredInput
                ref={inputRef}
                mode={formatter.mode}
                title="输入区"
                value={formatter.input}
                isDark={isDark}
                onChange={formatter.setInput}
                placeholder="在这里粘贴 JSON 或 XML 内容..."
                errorLocation={formatter.errorLocation}
                linkedScrollEnabled={linkedScrollEnabled}
                externalScrollState={scrollSyncState}
                stats={formatter.inputStats}
                helperText="默认已填充示例 JSON，可直接修改后操作。"
                onScrollSync={handleScrollSync}
              />

              <StructuredOutput
                mode={formatter.mode}
                value={formatter.output}
                isDark={isDark}
                viewMode={formatter.outputViewMode}
                onChange={formatter.setOutput}
                placeholder="格式化或压缩结果会显示在这里..."
                linkedScrollEnabled={linkedScrollEnabled}
                externalScrollState={scrollSyncState}
                stats={formatter.outputStats}
                helperText="输出区现在也可直接编辑，复制或回填前可先手动调整。"
                onScrollSync={handleScrollSync}
              />
            </div>
          </main>

          <StatusBar
            mode={formatter.mode}
            modeSource={formatter.modeSource}
            inputStats={formatter.inputStats}
            outputStats={formatter.outputStats}
            historyCount={records.length}
            isDark={isDark}
            linkedScrollEnabled={linkedScrollEnabled}
            alwaysOnTop={windowControls.isAlwaysOnTop}
            alwaysOnTopAvailable={windowControls.isAvailable}
            statusTone={formatter.statusTone}
            statusMessage={formatter.statusMessage}
            errorSummary={formatter.errorSummary}
          />
        </section>
      </div>
    </div>
  )
}

export default App
