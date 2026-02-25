import ProjectController from '#controllers/project.controller'

import { InferPageProps, SharedProps } from '@adonisjs/inertia/types'
import { router } from '@inertiajs/core'
import { Head } from '@inertiajs/react'
import { route } from '@izzyjs/route/client'
import {
  Alert,
  Button,
  Checkbox,
  Group,
  Image,
  Paper,
  Stack,
  TagsInput,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconArrowLeft, IconCancel, IconDeviceFloppy, IconPhoto, IconPhotoPlus, IconTrash, IconUpload } from '@tabler/icons-react'
import type React from 'react'
import { useRef, useState } from 'react'
import MediaLibraryDialog from '~/components/RTE/media-library-dialog'
import { uploadImage } from '~/components/RTE/upload-service'
import { useModals } from '~/components/core/modal/modal-hooks'
import { NotifyInfo } from '~/components/core/notify'
import { useGenericMutation } from '~/hooks/use_generic_mutation'
import DashboardLayout from '~/layouts/dashboard'
import { checkForm } from '~/lib/utils'

const baseRoute = 'project'
const basePerm = 'project'
const title = 'Project'

type ProjectFormValues = {
  id: string
  is_active: boolean
  is_pinned: boolean
  title: string
  thumbnail_id: string
  description: string
  tags: string[]
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
    (InferPageProps<ProjectController, 'viewEdit'> | InferPageProps<ProjectController, 'viewCreate'>)
) {
  const { data } = props
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string>(data?.thumbnail?.url || '')
  const [thumbnailUploadError, setThumbnailUploadError] = useState<string | null>(null)
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false)
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

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

  const form = useForm<ProjectFormValues>({
    initialValues: {
      id: data?.id || '',
      is_active: data?.is_active ?? true,
      is_pinned: data?.is_pinned ?? false,
      title: data?.title || '',
      thumbnail_id: data?.thumbnail_id || '',
      description: data?.description || '',
      tags: data?.tags || [],
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
        if (!data) {
          form.reset()
          setThumbnailPreviewUrl('')
          setThumbnailUploadError(null)
        }
      },
    }
  )

  const onSave = ConfirmAddModal({
    onConfirm: () => {
      if (!checkForm(form)) return

      mutation.mutate({
        id: form.values.id || undefined,
        is_active: form.values.is_active,
        is_pinned: form.values.is_pinned,
        title: form.values.title,
        thumbnail_id: form.values.thumbnail_id || null,
        description: form.values.description || null,
        tags: Array.from(
          new Set(form.values.tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0))
        ),
      })
    },
  })

  const onReset = ConfirmResetModal({
    onConfirm: () => {
      form.setValues({
        id: data?.id || '',
        is_active: data?.is_active ?? true,
        is_pinned: data?.is_pinned ?? false,
        title: data?.title || '',
        thumbnail_id: data?.thumbnail_id || '',
        description: data?.description || '',
        tags: data?.tags || [],
      })
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
      const uploadedMedia = await uploadImage(file, route('api.v1.media.upload').path)
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
      <Head title={`${title} ${data ? 'Edit' : 'Create'}`} />
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
              placeholder="Project title"
              value={form.values.title}
              error={form.errors.title}
              disabled={mutation.isPending}
              onChange={(event) => form.setFieldValue('title', event.target.value)}
            />

            <Group>
              <Checkbox
                label="Active"
                checked={form.values.is_active}
                disabled={mutation.isPending}
                onChange={(event) => form.setFieldValue('is_active', event.currentTarget.checked)}
              />
              <Checkbox
                label="Pinned"
                checked={form.values.is_pinned}
                disabled={mutation.isPending}
                onChange={(event) => form.setFieldValue('is_pinned', event.currentTarget.checked)}
              />
            </Group>

            <Stack gap={8}>
              <Text size="sm" fw={500}>
                Thumbnail
              </Text>

              {thumbnailPreviewUrl ? (
                <Image
                  src={thumbnailPreviewUrl}
                  alt="Project thumbnail preview"
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
              placeholder="Project description"
              value={form.values.description}
              disabled={mutation.isPending}
              onChange={(event) => form.setFieldValue('description', event.target.value)}
              autosize
              minRows={3}
              maxRows={6}
            />

            <TagsInput
              label="Tags"
              description="Type and press Enter/comma to add tags."
              placeholder="Type tags..."
              value={form.values.tags}
              splitChars={[',']}
              clearable
              disabled={mutation.isPending}
              onChange={(value) => form.setFieldValue('tags', value)}
            />
          </Stack>
        </Paper>
      </div>

      <MediaLibraryDialog
        open={mediaLibraryOpen}
        onOpenChange={setMediaLibraryOpen}
        onSelectImage={setThumbnailFromUrl}
        getURL={route('api.v1.media.list').path}
        deleteURL={route('api.v1.media.destroy').path}
        pickerType="image"
      />
    </DashboardLayout>
  )
}
