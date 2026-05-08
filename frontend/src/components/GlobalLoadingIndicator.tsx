import { useIsFetching } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useNavigation } from 'react-router-dom'

import { EdTechRocketSpinner } from '@/components/EdTechRocketSpinner'

function EdTechLoadingPanel({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-6 px-6">
      <div className="edtech-loader-float" aria-hidden>
        <EdTechRocketSpinner />
      </div>
      <div className="space-y-1.5 text-center">
        <p className="max-w-[min(90vw,22rem)] text-base font-semibold tracking-tight text-white sm:text-lg">
          {label}
        </p>
        <p className="text-xs font-medium text-amber-100/55 sm:text-sm">กรุณารอสักครู่</p>
      </div>
    </div>
  )
}

export function GlobalLoadingIndicator() {
  const navigation = useNavigation()
  const isFetching = useIsFetching()
  const [showRouteOverlay, setShowRouteOverlay] = useState(false)
  const [showFetchingOverlay, setShowFetchingOverlay] = useState(false)
  const routeShowTimerRef = useRef<number | null>(null)
  const routeHideTimerRef = useRef<number | null>(null)
  const fetchShowTimerRef = useRef<number | null>(null)
  const fetchHideTimerRef = useRef<number | null>(null)
  const navigationPending = navigation.state !== 'idle'
  const fetchingPending = isFetching > 0

  useEffect(() => {
    if (navigationPending) {
      if (routeHideTimerRef.current) {
        window.clearTimeout(routeHideTimerRef.current)
        routeHideTimerRef.current = null
      }
      if (!showRouteOverlay && !routeShowTimerRef.current) {
        routeShowTimerRef.current = window.setTimeout(() => {
          setShowRouteOverlay(true)
          routeShowTimerRef.current = null
        }, 120)
      }
      return
    }

    if (routeShowTimerRef.current) {
      window.clearTimeout(routeShowTimerRef.current)
      routeShowTimerRef.current = null
    }
    if (showRouteOverlay && !routeHideTimerRef.current) {
      routeHideTimerRef.current = window.setTimeout(() => {
        setShowRouteOverlay(false)
        routeHideTimerRef.current = null
      }, 220)
    }
  }, [navigationPending, showRouteOverlay])

  useEffect(() => {
    if (fetchingPending) {
      if (fetchHideTimerRef.current) {
        window.clearTimeout(fetchHideTimerRef.current)
        fetchHideTimerRef.current = null
      }
      if (!showFetchingOverlay && !fetchShowTimerRef.current) {
        fetchShowTimerRef.current = window.setTimeout(() => {
          setShowFetchingOverlay(true)
          fetchShowTimerRef.current = null
        }, 180)
      }
      return
    }

    if (fetchShowTimerRef.current) {
      window.clearTimeout(fetchShowTimerRef.current)
      fetchShowTimerRef.current = null
    }
    if (showFetchingOverlay && !fetchHideTimerRef.current) {
      fetchHideTimerRef.current = window.setTimeout(() => {
        setShowFetchingOverlay(false)
        fetchHideTimerRef.current = null
      }, 260)
    }
  }, [fetchingPending, showFetchingOverlay])

  useEffect(() => {
    return () => {
      if (routeShowTimerRef.current) window.clearTimeout(routeShowTimerRef.current)
      if (routeHideTimerRef.current) window.clearTimeout(routeHideTimerRef.current)
      if (fetchShowTimerRef.current) window.clearTimeout(fetchShowTimerRef.current)
      if (fetchHideTimerRef.current) window.clearTimeout(fetchHideTimerRef.current)
    }
  }, [])

  const visible = showRouteOverlay || showFetchingOverlay
  if (!visible) return null

  const label = showRouteOverlay ? 'กำลังเปิดหน้าใหม่...' : 'กำลังโหลดข้อมูล...'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/72 backdrop-blur-md"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <EdTechLoadingPanel label={label} />
    </div>
  )
}
