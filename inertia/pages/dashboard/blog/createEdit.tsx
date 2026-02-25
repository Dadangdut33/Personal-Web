import BlogController from '#controllers/blog.controller'

import { InferPageProps, SharedProps } from '@adonisjs/inertia/types'
import { router } from '@inertiajs/core'
import { Head } from '@inertiajs/react'
import { route } from '@izzyjs/route/client'
import { Button, Group, Paper, Tabs } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconArrowLeft, IconCancel, IconDeviceFloppy } from '@tabler/icons-react'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import MediaLibraryDialog from '~/components/RTE/media-library-dialog'
import { uploadImage } from '~/components/RTE/upload-service'
import { useModals } from '~/components/core/modal/modal-hooks'
import { NotifyInfo } from '~/components/core/notify'
import BlogEditorTab from '~/components/page-components/blog/editor-tab'
import BlogRollbackTab from '~/components/page-components/blog/rollback-tab'
import { useGenericMutation } from '~/hooks/use_generic_mutation'
import DashboardLayout from '~/layouts/dashboard'
import { checkForm } from '~/lib/utils'

const baseRoute = 'blog'
const basePerm = 'blog'
const title = 'Blog'

type BlogFormValues = {
  id: string
  title: string
  is_active: boolean
  is_pinned: boolean
  thumbnail_id: string
  description: string
  tags: string[]
  projectIds: string[]
}

function formSafeTitle(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function extractMediaIdFromRedirectUrl(value: string): string | null {
  if (!value) return null

  try {
    const parsed = new URL(value, window.location.origin)
    const match = parsed.pathname.match(/^\/api\/v1\/media\/redirect\/([^/?#]+)$/)
    return match?.[1] ? decodeURIComponent(match[1]) : null
  } catch {
    return null
  }
}

export default function Page(
  props: SharedProps &
    (InferPageProps<BlogController, 'viewEdit'> | InferPageProps<BlogController, 'viewCreate'>)
) {
  const { data, projects, availableTags } = props
  const defaultContent = { type: 'doc', content: [] }
  const [content, setContent] = useState<Record<string, any>>(data?.content || defaultContent)
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string>(data?.thumbnail?.url || '')
  const [thumbnailUploadError, setThumbnailUploadError] = useState<string | null>(null)
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false)
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'editor' | 'rollback'>(() => {
    if (typeof window === 'undefined') return 'editor'
    return window.location.search.includes('tab=rollback') && !!data ? 'rollback' : 'editor'
  })
  const [selectedRevisionId, setSelectedRevisionId] = useState<string | null>(
    data?.versions?.[0]?.id || null
  )
  const [selectedRollbackFields, setSelectedRollbackFields] = useState<string[]>([])
  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const tagSuggestions = (availableTags || []).map((tag) => tag.name)

  const breadcrumbs = [
    {
      title: 'Dashboard',
      href: route('dashboard.view').path,
    },
    {
      title,
      href: route(`${basePerm}.index`).path,
    },
    {
      title: data ? 'Edit' : 'Create',
      href: props.currentPath,
    },
  ]

  const { ConfirmAddModal, ConfirmModal, ConfirmResetModal } = useModals()

  const form = useForm<BlogFormValues>({
    initialValues: {
      id: data ? data.id : '',
      title: data ? data.title : '',
      is_active: data?.is_active ?? true,
      is_pinned: data?.is_pinned ?? false,
      thumbnail_id: data?.thumbnail_id || '',
      description: data?.description || '',
      tags: data?.tags?.map((tag) => tag.name) || [],
      projectIds: data?.projects?.map((project) => project.id) || [],
    },
    validate: {
      title: (value) => (value.trim().length > 0 ? null : 'Title is required'),
    },
  })

  const mutation = useGenericMutation(
    data ? 'PATCH' : 'POST',
    route(`${baseRoute}.${data ? 'update' : 'store'}`).path,
    {
      onSuccess: () => {
        form.reset()
      },
    }
  )

  const refreshEditData = () => {
    if (!data?.id) return

    router.visit(
      `${route(`${baseRoute}.edit`, { params: { id: data.id } }).path}?tab=${activeTab}`,
      {
        replace: true,
        preserveState: false,
        preserveScroll: true,
      }
    )
  }

  const rollbackMutation = useGenericMutation('POST', route('blog.rollback').path, {
    doRedirect: false,
    onSuccess: refreshEditData,
  })

  const rollbackFieldsMutation = useGenericMutation('POST', route('blog.rollbackFields').path, {
    doRedirect: false,
    onSuccess: refreshEditData,
  })

  const onSave = ConfirmAddModal({
    onConfirm: () => {
      if (!checkForm(form)) return

      mutation.mutate({
        id: form.values.id || undefined,
        title: form.values.title,
        is_active: form.values.is_active,
        is_pinned: form.values.is_pinned,
        thumbnail_id: form.values.thumbnail_id ? form.values.thumbnail_id : null,
        description: form.values.description ? form.values.description : null,
        content,
        tags: Array.from(
          new Set(form.values.tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0))
        ),
        projectIds: form.values.projectIds,
      })
    },
  })

  const onReset = ConfirmResetModal({
    onConfirm: () => {
      form.reset()
      setContent(data?.content || defaultContent)
      setThumbnailPreviewUrl(data?.thumbnail?.url || '')
      setThumbnailUploadError(null)
      NotifyInfo('Form Reseted', 'Form has been reseted successfully')
    },
    name: 'Form',
  })

  const onBack = ConfirmModal({
    onConfirm: () => {
      router.visit(route(`${baseRoute}.index`))
    },
    message: 'Are you sure you want to go back?',
    confirmText: 'Go Back',
    confirmVariant: 'destructive',
  })

  const setThumbnailFromUrl = (url: string) => {
    const mediaId = extractMediaIdFromRedirectUrl(url)
    if (!mediaId) {
      setThumbnailUploadError('Selected media URL is invalid.')
      return
    }

    form.setFieldValue('thumbnail_id', mediaId)
    setThumbnailPreviewUrl(url)
    setThumbnailUploadError(null)
  }

  const clearThumbnail = () => {
    form.setFieldValue('thumbnail_id', '')
    setThumbnailPreviewUrl('')
    setThumbnailUploadError(null)
  }

  const handleThumbnailFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setThumbnailUploadError(null)
    setIsUploadingThumbnail(true)
    try {
      const uploadedMedia = await uploadImage(file, route('api.v1.media.upload').path, [
        'blog-content',
      ])
      form.setFieldValue('thumbnail_id', uploadedMedia.id)
      setThumbnailPreviewUrl(uploadedMedia.url)
    } catch (error) {
      setThumbnailUploadError(error instanceof Error ? error.message : 'Failed to upload thumbnail')
    } finally {
      setIsUploadingThumbnail(false)
      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = ''
      }
    }
  }

  const selectedRevision = data?.versions?.find((version) => version.id === selectedRevisionId)
  const currentTagsText = form.values.tags.join(', ')
  const contentCurrentText = JSON.stringify(content, null, 2)
  const contentRevisionText = JSON.stringify(selectedRevision?.content || {}, null, 2)
  const revisionSelectData =
    data?.versions?.map((version) => ({
      value: version.id,
      label: `v${version.version} • ${new Date(version.created_at).toLocaleString()} • ${version.change_type}`,
    })) || []

  const onRollbackFull = () => {
    if (!data?.id || !selectedRevisionId) return

    rollbackMutation.mutate({
      id: data.id,
      revisionId: selectedRevisionId,
    })
  }

  const onRollbackFields = () => {
    if (!data?.id || !selectedRevisionId || selectedRollbackFields.length === 0) return

    rollbackFieldsMutation.mutate({
      id: data.id,
      revisionId: selectedRevisionId,
      fields: selectedRollbackFields,
    })
  }

  useEffect(() => {
    if (!data) return

    form.setValues({
      id: data.id,
      title: data.title,
      is_active: data.is_active,
      is_pinned: data.is_pinned,
      thumbnail_id: data.thumbnail_id || '',
      description: data.description || '',
      tags: data.tags?.map((tag) => tag.name) || [],
      projectIds: data.projects?.map((project) => project.id) || [],
    })
    setContent(data.content || defaultContent)
    setThumbnailPreviewUrl(data.thumbnail?.url || '')
    setThumbnailUploadError(null)
    setSelectedRevisionId(data.versions?.[0]?.id || null)
    setSelectedRollbackFields([])
  }, [data?.updated_at])

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <Head title={`${title} ` + (data ? 'Edit' : 'Create')} />
      <div className="space-y-4">
        <Group>
          <Button
            variant="outline"
            style={{ width: 'fit-content' }}
            loading={
              mutation.isPending || rollbackMutation.isPending || rollbackFieldsMutation.isPending
            }
            leftSection={<IconArrowLeft size={16} />}
            color="gray"
            onClick={onBack}
          >
            Back
          </Button>
          <Group ms={'auto'} justify="flex-end">
            {activeTab === 'editor' ? (
              <>
                <Button
                  variant="outline"
                  style={{ width: 'fit-content' }}
                  loading={mutation.isPending}
                  leftSection={<IconCancel size={16} />}
                  color="red"
                  onClick={onReset}
                >
                  {data ? 'Cancel Changes' : 'Reset'}
                </Button>
                <Button
                  style={{ width: 'fit-content' }}
                  loading={mutation.isPending}
                  leftSection={<IconDeviceFloppy size={16} />}
                  onClick={onSave}
                >
                  {data ? 'Save Changes' : 'Create'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  color="yellow"
                  variant="outline"
                  loading={rollbackMutation.isPending}
                  disabled={!selectedRevisionId || rollbackFieldsMutation.isPending}
                  onClick={onRollbackFull}
                >
                  Rollback Full Revision
                </Button>
                <Button
                  color="orange"
                  loading={rollbackFieldsMutation.isPending}
                  disabled={
                    !selectedRevisionId ||
                    selectedRollbackFields.length === 0 ||
                    rollbackMutation.isPending
                  }
                  onClick={onRollbackFields}
                >
                  Rollback Selected Fields
                </Button>
              </>
            )}
          </Group>
        </Group>

        <Paper p="md" shadow="md" radius="md" withBorder>
          <Tabs value={activeTab} onChange={(value) => setActiveTab((value as any) || 'editor')}>
            <Tabs.List>
              <Tabs.Tab value="editor">Editor</Tabs.Tab>
              {data ? <Tabs.Tab value="rollback">Version Rollback</Tabs.Tab> : null}
            </Tabs.List>

            <Tabs.Panel value="editor" pt="md">
              <BlogEditorTab
                data={data ? { id: data.id, slug_id: data.slug_id } : null}
                form={form}
                mutationPending={mutation.isPending}
                isUploadingThumbnail={isUploadingThumbnail}
                thumbnailPreviewUrl={thumbnailPreviewUrl}
                thumbnailUploadError={thumbnailUploadError}
                thumbnailInputRef={thumbnailInputRef}
                tagSuggestions={tagSuggestions}
                projects={projects}
                content={content}
                onContentChange={setContent}
                onOpenMediaLibrary={() => setMediaLibraryOpen(true)}
                onThumbnailFileChange={handleThumbnailFileChange}
                onClearThumbnail={clearThumbnail}
                formSafeTitle={formSafeTitle}
              />
            </Tabs.Panel>

            {data ? (
              <Tabs.Panel value="rollback" pt="md">
                <BlogRollbackTab
                  selectedRevisionId={selectedRevisionId}
                  selectedRevision={selectedRevision}
                  selectedRollbackFields={selectedRollbackFields}
                  currentTitle={form.values.title}
                  currentIsActive={form.values.is_active}
                  currentIsPinned={form.values.is_pinned}
                  currentDescription={form.values.description || ''}
                  currentTagsText={currentTagsText}
                  contentCurrentText={contentCurrentText}
                  contentRevisionText={contentRevisionText}
                  revisionSelectData={revisionSelectData}
                  rollbackPending={rollbackMutation.isPending}
                  rollbackFieldsPending={rollbackFieldsMutation.isPending}
                  onSelectRevision={setSelectedRevisionId}
                  onChangeRollbackFields={setSelectedRollbackFields}
                  onRollbackFull={onRollbackFull}
                  onRollbackFields={onRollbackFields}
                />
              </Tabs.Panel>
            ) : null}
          </Tabs>
        </Paper>
      </div>

      <MediaLibraryDialog
        open={mediaLibraryOpen}
        onOpenChange={setMediaLibraryOpen}
        pickerType="image"
        onSelectImage={setThumbnailFromUrl}
        getURL={route('api.v1.media.list').path}
        deleteURL={route('api.v1.media.destroy').path}
      />
    </DashboardLayout>
  )
}
