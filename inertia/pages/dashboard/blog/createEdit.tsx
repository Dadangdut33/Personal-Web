import BlogController from '#controllers/blog.controller'

import { InferPageProps, SharedProps } from '@adonisjs/inertia/types'
import { router } from '@inertiajs/core'
import { Head } from '@inertiajs/react'
import { route } from '@izzyjs/route/client'
import {
  Alert,
  Button,
  Group,
  Image,
  MultiSelect,
  Paper,
  Stack,
  TagsInput,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import {
  IconArrowLeft,
  IconCancel,
  IconDeviceFloppy,
  IconPhoto,
  IconPhotoPlus,
  IconTrash,
  IconUpload,
} from '@tabler/icons-react'
import type React from 'react'
import { useRef, useState } from 'react'
import TiptapEditor from '~/components/RTE'
import MediaLibraryDialog from '~/components/RTE/media-library-dialog'
import { uploadImage } from '~/components/RTE/upload-service'
import { useModals } from '~/components/core/modal/modal-hooks'
import { NotifyInfo } from '~/components/core/notify'
import { useGenericMutation } from '~/hooks/use_generic_mutation'
import DashboardLayout from '~/layouts/dashboard'
import { checkForm } from '~/lib/utils'

const baseRoute = 'blog'
const basePerm = 'blog'
const title = 'Blog'

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

  const form = useForm({
    initialValues: {
      id: data ? data.id : '',
      title: data ? data.title : '',
      thumbnail_id: data?.thumbnail_id || '',
      description: data?.description || '',
      tags: data?.tags?.map((tag) => tag.name) || ([] as string[]),
      projectIds: data?.projects?.map((project) => project.id) || ([] as string[]),
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

  const onSave = ConfirmAddModal({
    onConfirm: () => {
      if (!checkForm(form)) return

      mutation.mutate({
        id: form.values.id || undefined,
        title: form.values.title,
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
      const uploadedMedia = await uploadImage(file, route('api.v1.media.upload').path, ['blog-content'])
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

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <Head title={`${title} ` + (data ? 'Edit' : 'Create')} />
      <div className="space-y-4">
        <Group>
          <Button
            variant="outline"
            style={{ width: 'fit-content' }}
            loading={mutation.isPending}
            leftSection={<IconArrowLeft size={16} />}
            color="gray"
            onClick={onBack}
          >
            Back
          </Button>
          <Group ms={'auto'} justify="flex-end">
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
          </Group>
        </Group>

        <Paper p="md" shadow="md" radius="md" withBorder>
          <Stack>
            {data && <TextInput label="ID" value={form.values.id} readOnly disabled />}

            <TextInput
              withAsterisk
              label="Title"
              placeholder="Blog title"
              value={form.values.title}
              error={form.errors.title}
              disabled={mutation.isPending}
              onChange={(e) => form.setFieldValue('title', e.target.value)}
            />

            <TextInput
              label="URL Preview"
              value={
                form.values.title
                  ? `${formSafeTitle(form.values.title)}-${data?.slug_id || '{slug_id}'}`
                  : '{title}-{slug_id}'
              }
              description="Format: {title}-{slug_id}. slug_id is generated by server."
              readOnly
              disabled
            />

            <Stack gap={8}>
              <Text size="sm" fw={500}>
                Thumbnail
              </Text>

              {thumbnailPreviewUrl ? (
                <Image
                  src={thumbnailPreviewUrl}
                  alt="Blog thumbnail preview"
                  radius="md"
                  h={220}
                  fit="cover"
                  fallbackSrc="https://placehold.co/800x400?text=Thumbnail"
                />
              ) : (
                <Paper withBorder radius="md" p="md">
                  <Group>
                    <IconPhoto size={18} />
                    <Text size="sm" c="dimmed">
                      No thumbnail selected
                    </Text>
                  </Group>
                </Paper>
              )}

              <Group>
                <Button
                  variant="outline"
                  leftSection={<IconPhotoPlus size={16} />}
                  disabled={mutation.isPending || isUploadingThumbnail}
                  onClick={() => setMediaLibraryOpen(true)}
                >
                  Select From Library
                </Button>
                <Button
                  variant="outline"
                  leftSection={<IconUpload size={16} />}
                  loading={isUploadingThumbnail}
                  disabled={mutation.isPending}
                  onClick={() => thumbnailInputRef.current?.click()}
                >
                  Upload Image
                </Button>
                <Button
                  variant="light"
                  color="red"
                  leftSection={<IconTrash size={16} />}
                  disabled={mutation.isPending || (!form.values.thumbnail_id && !thumbnailPreviewUrl)}
                  onClick={clearThumbnail}
                >
                  Remove
                </Button>
              </Group>

              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleThumbnailFileChange}
              />

              <TextInput
                label="Selected Thumbnail ID"
                placeholder="No thumbnail selected"
                value={form.values.thumbnail_id}
                readOnly
                disabled
              />

              {thumbnailUploadError ? (
                <Alert color="red" title="Thumbnail Error">
                  {thumbnailUploadError}
                </Alert>
              ) : null}
            </Stack>

            <Textarea
              label="Description"
              placeholder="Short blog description"
              value={form.values.description}
              disabled={mutation.isPending}
              onChange={(e) => form.setFieldValue('description', e.target.value)}
              autosize
              minRows={3}
              maxRows={6}
            />

            <TagsInput
              label="Tags"
              description="Type and press Enter/comma to add tags. "
              placeholder="Type tags..."
              data={tagSuggestions}
              value={form.values.tags}
              splitChars={[',']}
              clearable
              disabled={mutation.isPending}
              onChange={(value) => form.setFieldValue('tags', value)}
            />

            <MultiSelect
              label="Projects"
              placeholder="Select related projects"
              data={projects.map((project) => ({
                value: project.id,
                label: project.title,
              }))}
              searchable
              value={form.values.projectIds}
              disabled={mutation.isPending}
              onChange={(value) => form.setFieldValue('projectIds', value)}
            />

            <div>
              <Text size="sm" fw={500} mb={8}>
                Content
              </Text>
              <TiptapEditor
                content={content}
                onSave={(value) => setContent(value)}
                getMediaURL={route('api.v1.media.list').path}
                uploadMediaURL={route('api.v1.media.upload').path}
                deleteMediaURL={route('api.v1.media.destroy').path}
                className="min-h-[500px]"
                stickyToolbar={true}
                imageTags={['blog-content']}
              />
            </div>
          </Stack>
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
