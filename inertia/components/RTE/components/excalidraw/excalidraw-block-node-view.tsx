import type {
  BinaryFiles,
  ExcalidrawInitialDataState,
  ExcalidrawProps,
} from '@excalidraw/excalidraw/types'
import { type NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import { Loader2, PencilRuler } from 'lucide-react'
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { cn } from '~/lib/utils'

type CardSize = 'sm' | 'md' | 'lg'
type Position = 'left' | 'center' | 'right'

type ExcalidrawAttrs = {
  sceneData?: string | null
  cardSize?: CardSize
  position?: Position
  height?: number
}

type ExcalidrawOnChange = NonNullable<ExcalidrawProps['onChange']>
const ExcalidrawCanvas = lazy(async () => {
  await import('@excalidraw/excalidraw/index.css')
  const mod = await import('@excalidraw/excalidraw')
  return { default: mod.Excalidraw }
})

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const normalizeAppState = (rawAppState: unknown): ExcalidrawInitialDataState['appState'] => {
  if (!rawAppState || typeof rawAppState !== 'object') return {}

  const appState = { ...(rawAppState as Record<string, unknown>) }

  // Excalidraw expects these as Map/Set. Old serialized JSON may contain plain objects.
  if ('collaborators' in appState && !(appState.collaborators instanceof Map)) {
    appState.collaborators = new Map()
  }
  if ('followedBy' in appState && !(appState.followedBy instanceof Set)) {
    appState.followedBy = new Set()
  }

  return appState as ExcalidrawInitialDataState['appState']
}

const parseSceneData = (raw: string | null | undefined): ExcalidrawInitialDataState => {
  if (!raw) return { elements: [], appState: {}, files: {} as BinaryFiles }

  try {
    const parsed = JSON.parse(raw) as Partial<ExcalidrawInitialDataState>
    return {
      elements: Array.isArray(parsed?.elements) ? parsed.elements : [],
      appState: normalizeAppState(parsed?.appState),
      files:
        typeof parsed?.files === 'object' && parsed?.files
          ? (parsed.files as BinaryFiles)
          : ({} as BinaryFiles),
    }
  } catch {
    return { elements: [], appState: {}, files: {} as BinaryFiles }
  }
}

const extractPersistedAppState = (
  appState: Parameters<ExcalidrawOnChange>[1]
): ExcalidrawInitialDataState['appState'] => {
  return {
    scrollX: appState.scrollX,
    scrollY: appState.scrollY,
    zoom: appState.zoom,
    viewBackgroundColor: appState.viewBackgroundColor,
    theme: appState.theme,
    gridSize: appState.gridSize,
    gridStep: appState.gridStep,
  }
}

const serializeSceneData = (
  elements: Parameters<ExcalidrawOnChange>[0],
  appState: Parameters<ExcalidrawOnChange>[1],
  files: Parameters<ExcalidrawOnChange>[2]
) =>
  JSON.stringify({
    elements,
    appState: extractPersistedAppState(appState),
    files,
  })

export default function ExcalidrawBlockNodeView({ node, editor, updateAttributes }: NodeViewProps) {
  const attrs = node.attrs as ExcalidrawAttrs
  const [isEditable, setIsEditable] = useState(!!editor?.isEditable)
  const [isEditingCanvas, setIsEditingCanvas] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const [heightInput, setHeightInput] = useState(String(attrs.height ?? 460))
  const saveTimerRef = useRef<number | null>(null)
  const lastSavedSceneRef = useRef(attrs.sceneData || '')

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const syncEditable = () => {
      const editable = !!editor?.isEditable
      setIsEditable(editable)
      if (!editable) setIsEditingCanvas(false)
    }

    syncEditable()
    editor.on('transaction', syncEditable)
    editor.on('selectionUpdate', syncEditable)
    editor.on('focus', syncEditable)
    editor.on('blur', syncEditable)

    return () => {
      editor.off('transaction', syncEditable)
      editor.off('selectionUpdate', syncEditable)
      editor.off('focus', syncEditable)
      editor.off('blur', syncEditable)
    }
  }, [editor])

  useEffect(() => {
    setHeightInput(String(attrs.height ?? 460))
  }, [attrs.height])

  useEffect(() => {
    lastSavedSceneRef.current = attrs.sceneData || ''
  }, [attrs.sceneData])

  useEffect(() => {
    return () => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current)
      }
    }
  }, [])

  const scene = useMemo(() => parseSceneData(attrs.sceneData), [attrs.sceneData])
  const hasElements = (scene.elements?.length || 0) > 0

  const cardSize = attrs.cardSize || 'lg'
  const position = attrs.position || 'center'
  const height = clamp(Number(attrs.height) || 460, 280, 900)

  const widthClass =
    cardSize === 'sm'
      ? 'w-[24rem] max-w-full'
      : cardSize === 'md'
        ? 'w-[40rem] max-w-full'
        : 'w-full'
  const positionClass =
    position === 'left' ? 'mr-auto' : position === 'right' ? 'ml-auto' : 'mx-auto'

  const persistScene: ExcalidrawOnChange = (elements, appState, files) => {
    if (!isEditable) return

    const nextScene = serializeSceneData(elements, appState, files)
    if (nextScene === lastSavedSceneRef.current) return

    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current)
    }

    saveTimerRef.current = window.setTimeout(() => {
      updateAttributes({ sceneData: nextScene })
      lastSavedSceneRef.current = nextScene
    }, 300)
  }

  const updateLayoutField = (key: 'cardSize' | 'position', value: CardSize | Position) => {
    if (!isEditable) return
    updateAttributes({ [key]: value })
  }

  const saveHeight = () => {
    if (!isEditable) return
    const parsed = clamp(Number.parseInt(heightInput, 10) || 460, 280, 900)
    updateAttributes({ height: parsed })
    setHeightInput(String(parsed))
  }

  const canEditCanvas = isEditable && isEditingCanvas

  return (
    <NodeViewWrapper className="not-prose my-3">
      {isEditable ? (
        <div className={cn('mb-2 flex flex-wrap items-center gap-2', widthClass, positionClass)}>
          <Button
            size="sm"
            variant={isEditingCanvas ? 'default' : 'outline'}
            type="button"
            onClick={() => setIsEditingCanvas((prev) => !prev)}
          >
            <PencilRuler className="h-4 w-4" />
            {isEditingCanvas ? 'Editing' : 'Preview'}
          </Button>

          <select
            value={cardSize}
            onChange={(e) => updateLayoutField('cardSize', e.target.value as CardSize)}
            className="h-9 rounded-base border-2 border-border bg-secondary-background px-3 text-sm"
          >
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </select>

          <select
            value={position}
            onChange={(e) => updateLayoutField('position', e.target.value as Position)}
            className="h-9 rounded-base border-2 border-border bg-secondary-background px-3 text-sm"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>

          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={280}
              max={900}
              className="h-9 w-28"
              value={heightInput}
              onChange={(e) => setHeightInput(e.target.value)}
              onBlur={saveHeight}
            />
            <span className="text-xs text-muted-foreground">height</span>
          </div>
        </div>
      ) : null}

      <Card className={cn('gap-0 overflow-hidden py-4', widthClass, positionClass)}>
        <CardContent className="px-4">
          <div className="overflow-hidden rounded-base border-2 border-border">
            <div className="bg-background" style={{ height }}>
              {isClient ? (
                <Suspense
                  fallback={
                    <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading Excalidraw...
                    </div>
                  }
                >
                  <ExcalidrawCanvas
                    initialData={scene}
                    viewModeEnabled={!canEditCanvas}
                    onChange={persistScene}
                    UIOptions={{
                      canvasActions: {
                        changeViewBackgroundColor: canEditCanvas,
                        clearCanvas: canEditCanvas,
                        loadScene: canEditCanvas,
                        saveToActiveFile: false,
                        toggleTheme: canEditCanvas,
                      },
                    }}
                  />
                </Suspense>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Excalidraw preview is available after page load.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {isEditable ? (
        <p className={cn('mt-1 text-xs text-muted-foreground', widthClass, positionClass)}>
          {hasElements ? 'Excalidraw block' : 'Excalidraw block (empty)'}
        </p>
      ) : null}
    </NodeViewWrapper>
  )
}
