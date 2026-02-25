import { type NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import { AlertCircle, AlertTriangle, CheckCircle2, Info, Pencil, Save, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { cn } from '~/lib/utils'

type AlertType = 'info' | 'success' | 'warning' | 'error'
type CardSize = 'sm' | 'md' | 'lg'
type Position = 'left' | 'center' | 'right'

type AlertBlockAttrs = {
  alertType?: AlertType
  title?: string
  message?: string
  cardSize?: CardSize
  position?: Position
}

type FormState = {
  alertType: AlertType
  title: string
  message: string
  cardSize: CardSize
  position: Position
}

const attrsToForm = (attrs: AlertBlockAttrs): FormState => ({
  alertType: attrs.alertType || 'info',
  title: attrs.title || 'Info',
  message: attrs.message || '',
  cardSize: attrs.cardSize || 'md',
  position: attrs.position || 'center',
})

const getAlertStyles = (alertType: AlertType) => {
  if (alertType === 'success')
    return {
      cardClass: 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800',
      iconClass: 'text-emerald-600 dark:text-emerald-400',
      badgeClass: 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-black',
    }
  if (alertType === 'warning')
    return {
      cardClass: 'bg-amber-50 border-amber-300 dark:bg-amber-950/35 dark:border-amber-800',
      iconClass: 'text-amber-600 dark:text-amber-400',
      badgeClass: 'bg-amber-600 text-white dark:bg-amber-500 dark:text-black',
    }
  if (alertType === 'error')
    return {
      cardClass: 'bg-rose-50 border-rose-300 dark:bg-rose-950/35 dark:border-rose-800',
      iconClass: 'text-rose-600 dark:text-rose-400',
      badgeClass: 'bg-rose-600 text-white dark:bg-rose-500 dark:text-black',
    }
  return {
    cardClass: 'bg-sky-50 border-sky-300 dark:bg-sky-950/35 dark:border-sky-800',
    iconClass: 'text-sky-600 dark:text-sky-400',
    badgeClass: 'bg-sky-600 text-white dark:bg-sky-500 dark:text-black',
  }
}

const getAlertIcon = (alertType: AlertType) => {
  if (alertType === 'success') return CheckCircle2
  if (alertType === 'warning') return AlertTriangle
  if (alertType === 'error') return AlertCircle
  return Info
}

export default function AlertBlockNodeView({ node, editor, updateAttributes }: NodeViewProps) {
  const attrs = node.attrs as AlertBlockAttrs
  const [isEditable, setIsEditable] = useState(!!editor?.isEditable)
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<FormState>(() => attrsToForm(attrs))

  useEffect(() => {
    const syncEditable = () => setIsEditable(!!editor?.isEditable)
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
    if (!isEditing) setForm(attrsToForm(attrs))
  }, [attrs.alertType, attrs.title, attrs.message, attrs.cardSize, attrs.position, isEditing])

  const alertType = isEditing ? form.alertType : attrs.alertType || 'info'
  const title = isEditing ? form.title : attrs.title || 'Info'
  const message = isEditing ? form.message : attrs.message || ''
  const cardSize = isEditing ? form.cardSize : attrs.cardSize || 'md'
  const position = isEditing ? form.position : attrs.position || 'center'

  const widthClass =
    cardSize === 'sm'
      ? 'w-[22rem] max-w-full'
      : cardSize === 'lg'
        ? 'w-full'
        : 'w-[34rem] max-w-full'
  const positionClass =
    position === 'left' ? 'mr-auto' : position === 'right' ? 'ml-auto' : 'mx-auto'

  const styles = getAlertStyles(alertType)
  const AlertIcon = getAlertIcon(alertType)

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const saveManualEdit = () => {
    if (!isEditable) return
    updateAttributes({
      alertType: form.alertType,
      title: form.title.trim() || 'Info',
      message: form.message.trim(),
      cardSize: form.cardSize,
      position: form.position,
    })
    setIsEditing(false)
  }

  const cancelManualEdit = () => {
    setForm(attrsToForm(attrs))
    setIsEditing(false)
  }

  const card = (
    <Card className={cn('gap-0 border-2 py-4', styles.cardClass, widthClass, positionClass)}>
      <CardContent className="space-y-3 px-4">
        <div className="flex items-start gap-3">
          <div className="rounded-base border-2 border-border bg-background p-2">
            <AlertIcon className={cn('h-5 w-5', styles.iconClass)} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-heading text-foreground">{title}</p>
            <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">{message}</p>
          </div>
          <Badge className={cn('capitalize', styles.badgeClass)}>{alertType}</Badge>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <NodeViewWrapper className="not-prose my-3">
      {isEditable ? (
        <div className={cn('mb-2 flex flex-wrap items-center gap-2', widthClass, positionClass)}>
          {!isEditing ? (
            <Button size="sm" variant="outline" type="button" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          ) : (
            <>
              <Button size="sm" type="button" onClick={saveManualEdit}>
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button size="sm" variant="outline" type="button" onClick={cancelManualEdit}>
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </>
          )}
        </div>
      ) : null}

      {isEditing && isEditable ? (
        <div
          className={cn(
            'mb-3 grid gap-2 rounded-base border-2 border-border bg-secondary-background p-3',
            widthClass,
            positionClass
          )}
        >
          <div className="grid gap-2 sm:grid-cols-3">
            <select
              value={form.alertType}
              onChange={(e) => updateField('alertType', e.target.value as AlertType)}
              className="h-9 rounded-base border-2 border-border bg-background px-3 text-sm"
            >
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
            <select
              value={form.cardSize}
              onChange={(e) => updateField('cardSize', e.target.value as CardSize)}
              className="h-9 rounded-base border-2 border-border bg-background px-3 text-sm"
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </select>
            <select
              value={form.position}
              onChange={(e) => updateField('position', e.target.value as Position)}
              className="h-9 rounded-base border-2 border-border bg-background px-3 text-sm"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          <Input
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Alert title"
          />
          <Textarea
            value={form.message}
            onChange={(e) => updateField('message', e.target.value)}
            placeholder="Alert message"
            rows={3}
          />
        </div>
      ) : null}

      {card}
    </NodeViewWrapper>
  )
}
