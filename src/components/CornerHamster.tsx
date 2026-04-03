import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { hamsterBubbleMessages } from '../utils/hamsterMessages'
const HOME_PAUSE_MS = 1280
const OUTBOUND_PAUSE_MS = 860
const RESUME_DELAY_MS = 320
const PATROL_SPEED_PX_PER_MS = 0.04
const PATROL_MIN_DISTANCE = 52
const PATROL_MAX_DISTANCE = 92

type LookDirection = 'left' | 'right'
type PatrolPhase = 'pause-home' | 'move-out' | 'pause-out' | 'move-home'

function getNextPatrolTarget() {
  return -1 * (PATROL_MIN_DISTANCE + Math.random() * (PATROL_MAX_DISTANCE - PATROL_MIN_DISTANCE))
}

export function CornerHamster() {
  const [isHovering, setIsHovering] = useState(false)
  const [isStamping, setIsStamping] = useState(false)
  const [bubble, setBubble] = useState<string | null>(null)
  const [bubbleKey, setBubbleKey] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [lookDirection, setLookDirection] = useState<LookDirection>('left')
  const [isWalking, setIsWalking] = useState(false)
  const stampTimeoutRef = useRef<number | null>(null)
  const bubbleTimeoutRef = useRef<number | null>(null)
  const resumeTimeoutRef = useRef<number | null>(null)
  const patrolFrameRef = useRef<number | null>(null)
  const patrolTrackRef = useRef<HTMLDivElement | null>(null)
  const lastFrameTimestampRef = useRef<number | null>(null)
  const patrolOffsetRef = useRef(0)
  const patrolPhaseRef = useRef<PatrolPhase>('pause-home')
  const patrolPhaseElapsedRef = useRef(0)
  const patrolTargetRef = useRef(getNextPatrolTarget())

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotionPreference = () => {
      setReducedMotion(mediaQuery.matches)
    }

    syncMotionPreference()
    mediaQuery.addEventListener('change', syncMotionPreference)

    return () => {
      mediaQuery.removeEventListener('change', syncMotionPreference)
      if (stampTimeoutRef.current !== null) {
        window.clearTimeout(stampTimeoutRef.current)
      }
      if (bubbleTimeoutRef.current !== null) {
        window.clearTimeout(bubbleTimeoutRef.current)
      }
      if (resumeTimeoutRef.current !== null) {
        window.clearTimeout(resumeTimeoutRef.current)
      }
      if (patrolFrameRef.current !== null) {
        window.cancelAnimationFrame(patrolFrameRef.current)
      }
    }
  }, [])

  useEffect(() => {
    patrolTrackRef.current?.style.setProperty('--corner-hamster-offset', '0px')
  }, [])

  useEffect(() => {
    const applyPatrolOffset = (offset: number) => {
      patrolOffsetRef.current = offset
      patrolTrackRef.current?.style.setProperty('--corner-hamster-offset', `${offset}px`)
    }

    const stopPatrol = () => {
      if (patrolFrameRef.current !== null) {
        window.cancelAnimationFrame(patrolFrameRef.current)
        patrolFrameRef.current = null
      }
      lastFrameTimestampRef.current = null
      setIsWalking(false)
    }

    const tick = (timestamp: number) => {
      if (reducedMotion || isHovering) {
        stopPatrol()
        return
      }

      if (lastFrameTimestampRef.current === null) {
        lastFrameTimestampRef.current = timestamp
        patrolFrameRef.current = window.requestAnimationFrame(tick)
        return
      }

      const delta = Math.min(timestamp - lastFrameTimestampRef.current, 34)
      lastFrameTimestampRef.current = timestamp
      patrolPhaseElapsedRef.current += delta

      if (patrolPhaseRef.current === 'pause-home') {
        setIsWalking(false)
        if (patrolPhaseElapsedRef.current >= HOME_PAUSE_MS) {
          patrolPhaseRef.current = 'move-out'
          patrolPhaseElapsedRef.current = 0
          patrolTargetRef.current = getNextPatrolTarget()
          setLookDirection('left')
        }
      } else if (patrolPhaseRef.current === 'move-out') {
        setIsWalking(true)
        const nextOffset = Math.max(patrolTargetRef.current, patrolOffsetRef.current - PATROL_SPEED_PX_PER_MS * delta)
        applyPatrolOffset(nextOffset)
        if (nextOffset <= patrolTargetRef.current) {
          patrolPhaseRef.current = 'pause-out'
          patrolPhaseElapsedRef.current = 0
          setIsWalking(false)
        }
      } else if (patrolPhaseRef.current === 'pause-out') {
        setIsWalking(false)
        if (patrolPhaseElapsedRef.current >= OUTBOUND_PAUSE_MS) {
          patrolPhaseRef.current = 'move-home'
          patrolPhaseElapsedRef.current = 0
          setLookDirection('right')
        }
      } else if (patrolPhaseRef.current === 'move-home') {
        setIsWalking(true)
        const nextOffset = Math.min(0, patrolOffsetRef.current + PATROL_SPEED_PX_PER_MS * delta)
        applyPatrolOffset(nextOffset)
        if (nextOffset >= 0) {
          patrolPhaseRef.current = 'pause-home'
          patrolPhaseElapsedRef.current = 0
          setIsWalking(false)
        }
      }

      patrolFrameRef.current = window.requestAnimationFrame(tick)
    }

    if (resumeTimeoutRef.current !== null) {
      window.clearTimeout(resumeTimeoutRef.current)
      resumeTimeoutRef.current = null
    }

    if (reducedMotion || isHovering) {
      stopPatrol()
      return
    }

    resumeTimeoutRef.current = window.setTimeout(() => {
      patrolFrameRef.current = window.requestAnimationFrame(tick)
      resumeTimeoutRef.current = null
    }, RESUME_DELAY_MS)

    return () => {
      if (resumeTimeoutRef.current !== null) {
        window.clearTimeout(resumeTimeoutRef.current)
        resumeTimeoutRef.current = null
      }
      stopPatrol()
    }
  }, [isHovering, reducedMotion])

  const handleClick = () => {
    const nextBubble = hamsterBubbleMessages[Math.floor(Math.random() * hamsterBubbleMessages.length)]

    if (stampTimeoutRef.current !== null) {
      window.clearTimeout(stampTimeoutRef.current)
    }
    if (bubbleTimeoutRef.current !== null) {
      window.clearTimeout(bubbleTimeoutRef.current)
    }

    if (!reducedMotion) {
      setIsStamping(true)
      stampTimeoutRef.current = window.setTimeout(() => {
        setIsStamping(false)
        stampTimeoutRef.current = null
      }, 420)
    }

    setBubble(nextBubble)
    setBubbleKey((current) => current + 1)
    bubbleTimeoutRef.current = window.setTimeout(() => {
      setBubble(null)
      bubbleTimeoutRef.current = null
    }, reducedMotion ? 900 : 1280)
  }

  const handlePointerMove = (event: MouseEvent<HTMLButtonElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const pointerX = event.clientX - bounds.left
    setLookDirection(pointerX < bounds.width * 0.52 ? 'left' : 'right')
  }

  return (
    <div className="corner-hamster-wrap">
      <div ref={patrolTrackRef} className="corner-hamster-track">
        {bubble ? (
          <div
            key={bubbleKey}
            className={`corner-hamster-bubble ${bubble ? 'is-visible' : ''}`}
            role="status"
            aria-live="polite"
          >
            {bubble}
          </div>
        ) : null}

        <button
          type="button"
          className={`corner-hamster ${isHovering ? 'is-hovering' : ''} ${isStamping ? 'is-stamping' : ''} ${
            isWalking ? 'is-walking' : ''
          } ${
            lookDirection === 'left' ? 'is-looking-left' : 'is-looking-right'
          }`}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onMouseMove={handlePointerMove}
          onFocus={() => setIsHovering(true)}
          onBlur={() => setIsHovering(false)}
          onClick={handleClick}
          aria-label="像素仓鼠值班员，点击可互动"
        >
          <span className="corner-hamster__shadow" />
          <span className="corner-hamster__sign">{isHovering ? '点我' : '待命'}</span>
          <span className="corner-hamster__stamp">
            <span className="corner-hamster__stamp-head" />
            <span className="corner-hamster__stamp-handle" />
          </span>
          <span className="corner-hamster__body">
            <span className="corner-hamster__ear corner-hamster__ear--left" />
            <span className="corner-hamster__ear corner-hamster__ear--right" />
            <span className="corner-hamster__face">
              <span className="corner-hamster__eye corner-hamster__eye--left" />
              <span className="corner-hamster__eye corner-hamster__eye--right" />
              <span className="corner-hamster__nose" />
            </span>
            <span className="corner-hamster__paw corner-hamster__paw--left" />
            <span className="corner-hamster__paw corner-hamster__paw--right" />
          </span>
        </button>
      </div>
    </div>
  )
}
