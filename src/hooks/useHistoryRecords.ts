import { useEffect, useState } from 'react'
import type { FormatterSnapshot, HistoryRecord } from '../types'

const HISTORY_STORAGE_KEY = 'json-xml-formatter-history'
const HISTORY_LIMIT = 12

function readStoredHistory(): HistoryRecord[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const rawValue = window.localStorage.getItem(HISTORY_STORAGE_KEY)
    if (!rawValue) {
      return []
    }

    const parsedValue = JSON.parse(rawValue) as HistoryRecord[]
    return Array.isArray(parsedValue) ? parsedValue : []
  } catch {
    return []
  }
}

export function useHistoryRecords() {
  const [records, setRecords] = useState<HistoryRecord[]>(readStoredHistory)

  useEffect(() => {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(records))
  }, [records])

  function addRecord(snapshot: FormatterSnapshot) {
    const nextRecord: HistoryRecord = {
      ...snapshot,
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    }

    setRecords((currentRecords) => {
      const dedupedRecords = currentRecords.filter(
        (record) =>
          !(
            record.mode === nextRecord.mode &&
            record.input === nextRecord.input &&
            record.output === nextRecord.output &&
            record.outputViewMode === nextRecord.outputViewMode
          ),
      )

      return [nextRecord, ...dedupedRecords].slice(0, HISTORY_LIMIT)
    })
  }

  function removeRecord(id: string) {
    setRecords((currentRecords) => currentRecords.filter((record) => record.id !== id))
  }

  function clearHistory() {
    setRecords([])
  }

  return {
    records,
    addRecord,
    removeRecord,
    clearHistory,
  }
}
