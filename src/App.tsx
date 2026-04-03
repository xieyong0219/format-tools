import { useEffect, useRef, useState, type DragEvent } from 'react'
import { CompareToolbar } from './components/CompareToolbar'
import { CompareWorkspace } from './components/CompareWorkspace'
import { CronToolbar } from './components/CronToolbar'
import { CronWorkspace } from './components/CronWorkspace'
import { HistoryPanel } from './components/HistoryPanel'
import { OutputPreviewDialog } from './components/OutputPreviewDialog'
import { StructuredInput, type StructuredInputHandle } from './components/StructuredInput'
import { StructuredOutput } from './components/StructuredOutput'
import { Toolbar } from './components/Toolbar'
import { WorkbenchDialog } from './components/WorkbenchDialog'
import { WorkspaceSwitcher } from './components/WorkspaceSwitcher'
import { useClipboard } from './hooks/useClipboard'
import { useCompareWorkbench } from './hooks/useCompareWorkbench'
import { useCronWorkbench } from './hooks/useCronWorkbench'
import { useFileTransfer } from './hooks/useFileTransfer'
import { useFormatter } from './hooks/useFormatter'
import { useHistoryRecords } from './hooks/useHistoryRecords'
import { useHotkeys } from './hooks/useHotkeys'
import { useTheme } from './hooks/useTheme'
import type { ComparePane, HistoryRecord, ScrollSyncState, WorkbenchId } from './types'
import { getNextHeroMessage } from './utils/heroMessages'
import { workbenchMetaMap } from './utils/workbenchMeta'

function noop() {}

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
  const {
    acceptedExtensions,
    fileInputRef,
    openFilePicker,
    readDroppedFiles,
    exportText,
    handleBrowserFileInputChange,
  } =
    useFileTransfer()
  const formatter = useFormatter()
  const compare = useCompareWorkbench()
  const cron = useCronWorkbench()
  const { records, addRecord, removeRecord, clearHistory } = useHistoryRecords()
  const { isDark, toggleTheme } = useTheme()
  const [workspace, setWorkspace] = useState<WorkbenchId>('formatter')
  const [heroMessage, setHeroMessage] = useState(() => getNextHeroMessage())
  const [isHeroMessageHitting, setIsHeroMessageHitting] = useState(false)
  const [showHeroMerit, setShowHeroMerit] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [linkedScrollEnabled, setLinkedScrollEnabled] = useState(false)
  const [outputPreviewOpen, setOutputPreviewOpen] = useState(false)
  const [workbenchDialogOpen, setWorkbenchDialogOpen] = useState(false)
  const [scrollSyncState, setScrollSyncState] = useState<ScrollSyncState | null>(null)
  const [isDraggingFile, setIsDraggingFile] = useState(false)

  useEffect(() => {
    if (workbenchDialogOpen && workspace === 'formatter') {
      inputRef.current?.focus()
    }
  }, [workspace, workbenchDialogOpen])

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

  async function handleCompareImportClipboard(target?: ComparePane) {
    try {
      const text = await readClipboardText()
      if (!text.trim()) {
        compare.setNotice('剪贴板中暂无可导入内容。', 'info')
        return
      }

      compare.importPane(target ?? compare.activePane, text)
    } catch {
      compare.setNotice('读取系统剪贴板失败，请检查权限设置。', 'error')
    }
  }

  async function handleCronImportClipboard() {
    try {
      const text = await readClipboardText()
      if (!text.trim()) {
        cron.setNotice('剪贴板中暂无可导入内容。', 'info')
        return
      }

      cron.importExpression(text)
    } catch {
      cron.setNotice('读取系统剪贴板失败，请检查权限设置。', 'error')
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

  async function handleCompareImportFile(target: ComparePane) {
    try {
      const imported = await openFilePicker()

      if (imported === null) {
        return
      }

      if (!imported.text.trim()) {
        compare.setNotice('文件内容为空，未导入。', 'info')
        return
      }

      compare.importPane(target, imported.text, imported.path ?? imported.name)
    } catch {
      compare.setNotice('读取文件失败，请检查文件编码或重试。', 'error')
    }
  }

  async function handleOpenImportFile() {
    try {
      const imported = await openFilePicker()

      if (imported === null) {
        return
      }

      if (!imported.text.trim()) {
        formatter.setNotice('文件内容为空，未导入。', 'info')
        return
      }

      formatter.importInput(imported.text)
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

  async function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDraggingFile(false)

    try {
      const text = await readDroppedFiles(event.dataTransfer.files)
      if (!text.trim()) {
        if (workspace === 'compare') {
          compare.setNotice('拖入的文件内容为空。', 'info')
        } else if (workspace === 'cron') {
          cron.setNotice('Cron 工作台暂未开放文件导入。', 'info')
        } else {
          formatter.setNotice('拖入的文件内容为空。', 'info')
        }
        return
      }

      if (workspace === 'compare') {
        compare.importPane(compare.activePane, text)
        setWorkbenchDialogOpen(true)
      } else if (workspace === 'cron') {
        cron.setNotice('Cron 工作台暂未开放文件导入。', 'info')
      } else {
        formatter.importInput(text)
        formatter.setNotice('已通过拖拽导入文件。', 'success')
        setWorkbenchDialogOpen(true)
        inputRef.current?.focus()
      }
    } catch {
      if (workspace === 'compare') {
        compare.setNotice('拖拽导入失败，请重试。', 'error')
      } else if (workspace === 'cron') {
        cron.setNotice('Cron 工作台暂未开放文件导入。', 'info')
      } else {
        formatter.setNotice('拖拽导入失败，请重试。', 'error')
      }
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

  async function handleCopyCronExpression() {
    if (!cron.expressionDraft.trim()) {
      cron.setNotice('暂无可复制的 Cron 表达式。', 'info')
      return
    }

    try {
      await writeClipboardText(cron.expressionDraft.trim())
      cron.setNotice('Cron 表达式已复制到系统剪贴板。', 'success')
    } catch {
      cron.setNotice('复制 Cron 表达式失败，请稍后重试。', 'error')
    }
  }

  function handleWorkspaceSelect(nextWorkspace: WorkbenchId) {
    setWorkspace(nextWorkspace)
    setHistoryOpen(false)
    setOutputPreviewOpen(false)
    setWorkbenchDialogOpen(true)
  }

  useHotkeys({
    onFormat:
      workbenchDialogOpen
        ? workspace === 'formatter'
          ? handleFormat
          : workspace === 'compare'
            ? compare.formatBoth
            : cron.parseExpression
        : noop,
    onCompress:
      workbenchDialogOpen
        ? workspace === 'formatter'
          ? handleCompress
          : workspace === 'cron'
            ? handleCopyCronExpression
            : noop
        : noop,
    onClear:
      workbenchDialogOpen
        ? workspace === 'formatter'
          ? formatter.clearAll
          : workspace === 'compare'
            ? compare.clearAll
            : cron.clearAll
        : noop,
    onImportClipboard:
      workbenchDialogOpen
        ? workspace === 'formatter'
          ? handleImportClipboard
          : workspace === 'compare'
            ? () => handleCompareImportClipboard()
            : handleCronImportClipboard
        : noop,
  })

  const activeErrorMessage =
    workspace === 'formatter'
      ? formatter.errorMessage
      : workspace === 'compare' && compare.statusTone === 'error'
        ? compare.statusMessage
        : workspace === 'cron' && cron.statusTone === 'error'
          ? cron.statusMessage
          : ''
  const activeWorkbenchMeta = workbenchMetaMap[workspace]
  const activeErrorBanner = activeErrorMessage ? (
    <div className="flex max-w-full flex-wrap items-center gap-2 self-start">
      <span className="pixel-chip pixel-chip-tone-error px-3 py-1.5 text-[11px] font-semibold">错误</span>
      <div className="pixel-chip max-w-full px-3 py-1.5 text-[12px] leading-6 text-rose-700 dark:text-rose-200">
        {activeErrorMessage}
      </div>
    </div>
  ) : null

  function closeWorkbenchDialog() {
    setWorkbenchDialogOpen(false)
    setOutputPreviewOpen(false)
  }

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
        onChange={handleBrowserFileInputChange}
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

      <OutputPreviewDialog
        open={outputPreviewOpen}
        mode={formatter.mode}
        value={formatter.output}
        stats={formatter.outputStats}
        isDark={isDark}
        onChange={formatter.setOutput}
        onCopy={handleCopyOutput}
        onExport={handleExportFile}
        onClose={() => setOutputPreviewOpen(false)}
      />

      <WorkbenchDialog
        open={workbenchDialogOpen}
        title={activeWorkbenchMeta.dialogTitle}
        description={activeWorkbenchMeta.dialogDescription}
        onClose={closeWorkbenchDialog}
      >
        {workspace === 'formatter' ? (
          <>
            <Toolbar
              mode={formatter.mode}
              linkedScrollEnabled={linkedScrollEnabled}
              historyOpen={historyOpen}
              onModeChange={formatter.changeMode}
              onFormat={handleFormat}
              onCompress={handleCompress}
              onCopy={handleCopyOutput}
              onClear={formatter.clearAll}
              onImportClipboard={handleImportClipboard}
              onImportFile={handleOpenImportFile}
              onExportFile={handleExportFile}
              onToggleLinkedScroll={() => setLinkedScrollEnabled((current) => !current)}
              onToggleHistory={() => setHistoryOpen((current) => !current)}
            />

            <main className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto px-2 pb-2 pt-0.5 sm:px-3 sm:pb-3 lg:px-5 lg:pb-5">
              {historyOpen ? (
                <HistoryPanel
                  records={records}
                  onRestore={handleRestoreHistory}
                  onRemove={removeRecord}
                  onClear={clearHistory}
                />
              ) : null}

              {activeErrorBanner}

              <div className="grid min-h-0 flex-1 gap-2.5 xl:gap-3 2xl:grid-cols-2">
                <StructuredInput
                  ref={inputRef}
                  mode={formatter.mode}
                  title="输入区"
                  value={formatter.input}
                  isDark={isDark}
                  onChange={formatter.setInput}
                  errorLocation={formatter.errorLocation}
                  linkedScrollEnabled={linkedScrollEnabled}
                  externalScrollState={scrollSyncState}
                  stats={formatter.inputStats}
                  onScrollSync={handleScrollSync}
                />

                <StructuredOutput
                  mode={formatter.mode}
                  value={formatter.output}
                  isDark={isDark}
                  onChange={formatter.setOutput}
                  linkedScrollEnabled={linkedScrollEnabled}
                  externalScrollState={scrollSyncState}
                  stats={formatter.outputStats}
                  onScrollSync={handleScrollSync}
                  onOpenPreview={() => setOutputPreviewOpen(true)}
                />
              </div>
            </main>

          </>
        ) : null}

        {workspace === 'compare' ? (
          <>
            <CompareToolbar
              mode={compare.mode}
              ignoreTrimWhitespace={compare.ignoreTrimWhitespace}
              sideBySide={compare.sideBySide}
              onModeChange={compare.changeMode}
              onFormatBoth={compare.formatBoth}
              onSwap={compare.swapPanes}
              onClear={compare.clearAll}
              onToggleIgnoreWhitespace={compare.toggleIgnoreTrimWhitespace}
              onToggleSideBySide={compare.toggleSideBySide}
              onImportLeft={() => handleCompareImportFile('left')}
              onImportRight={() => handleCompareImportFile('right')}
            />

            <main className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto px-2 pb-2 pt-0.5 sm:px-3 sm:pb-3 lg:px-5 lg:pb-5">
              {activeErrorBanner}
              <CompareWorkspace
                leftValue={compare.leftValue}
                rightValue={compare.rightValue}
                leftStats={compare.leftStats}
                rightStats={compare.rightStats}
                leftSourcePath={compare.leftSourcePath}
                rightSourcePath={compare.rightSourcePath}
                mode={compare.mode}
                resolvedMode={compare.resolvedMode}
                activePane={compare.activePane}
                diffStats={compare.diffStats}
                ignoreTrimWhitespace={compare.ignoreTrimWhitespace}
                sideBySide={compare.sideBySide}
                isDark={isDark}
                onChangeLeft={compare.setLeftValue}
                onChangeRight={compare.setRightValue}
                onActivePaneChange={compare.setActivePane}
                onDiffStatsChange={compare.setDiffStats}
              />
            </main>

          </>
        ) : null}

        {workspace === 'cron' ? (
          <>
            <CronToolbar
              onCopyExpression={handleCopyCronExpression}
              onParse={cron.parseExpression}
              onImportClipboard={handleCronImportClipboard}
              onClear={cron.clearAll}
            />

            <main className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto px-2 pb-2 pt-0.5 sm:px-3 sm:pb-3 lg:px-5 lg:pb-5">
              {activeErrorBanner}
              <CronWorkspace
                builder={cron.builder}
                expressionDraft={cron.expressionDraft}
                validation={cron.validation}
                description={cron.description}
                nextRuns={cron.nextRuns}
                templates={cron.templates}
                onPresetChange={cron.changePreset}
                onBuilderChange={cron.updateBuilder}
                onExpressionChange={cron.setExpression}
                onApplyTemplate={cron.applyTemplate}
              />
            </main>
          </>
        ) : null}
      </WorkbenchDialog>

      <div className="relative mx-auto flex h-full min-h-0 max-w-[1540px] flex-col px-2 py-2 sm:px-4 sm:py-4 lg:px-8 lg:py-6">
        <section className="pixel-shell flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="border-b border-slate-200/75 px-4 py-4 dark:border-zinc-800/80 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
            <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-start 2xl:justify-between">
              <div className="max-w-4xl min-w-0">
                <h1 className="pixel-title text-[20px] text-slate-900 dark:text-zinc-50 sm:text-[24px] lg:text-[34px]">
                  开发者工具箱
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <p className="pixel-subtitle min-w-0 max-w-3xl flex-1 text-[13px] leading-6 text-slate-600 dark:text-zinc-400 sm:text-[14px] sm:leading-7">
                    {heroMessage}
                  </p>
                  <MuyuButtonWithMerit
                    hitting={isHeroMessageHitting}
                    showMerit={showHeroMerit}
                    onClick={handleRefreshHeroMessage}
                  />
                </div>
              </div>

              <div className="flex justify-end self-start pt-0.5 2xl:min-w-[72px]">
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
            </div>
          </div>

          <main className="flex min-h-0 flex-1 flex-col overflow-auto px-2 pb-2 pt-0.5 sm:px-3 sm:pb-3 lg:px-5 lg:pb-5">
            <WorkspaceSwitcher workspace={workspace} onSelect={handleWorkspaceSelect} />
          </main>
        </section>
      </div>
    </div>
  )
}

export default App
