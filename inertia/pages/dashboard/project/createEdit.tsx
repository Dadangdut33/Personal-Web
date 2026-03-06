import { router } from '@inertiajs/core'
import { Head } from '@inertiajs/react'
import {
  ActionIcon,
  Alert,
  Button,
  Checkbox,
  Divider,
  Group,
  Paper,
  Stack,
  TagsInput,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconPhoto, IconPhotoPlus, IconPlus, IconTrash, IconUpload } from '@tabler/icons-react'
import type React from 'react'
import { useRef, useState } from 'react'
import MediaLibraryDialog from '~/components/RTE/media-library-dialog'
import { uploadImage } from '~/components/RTE/upload-service'
import DashboardFormActionBar from '~/components/core/dashboard/form-action-bar'
import LeavePageAfterSaveCheckbox from '~/components/core/form/leave-page-after-save-checkbox'
import ImageWithLoader from '~/components/core/image'
import { useModals } from '~/components/core/modal/modal-hooks'
import { NotifyInfo } from '~/components/core/notify'
import { IconPicker } from '~/components/page-components/project/icon-picker'
import { Data } from '~/generated/data'
import { useGenericMutation } from '~/hooks/use_generic_mutation'
import { useLeavePageAfterSave } from '~/hooks/use_leave_page_after_save'
import DashboardLayout from '~/layouts/dashboard'
import { urlFor } from '~/lib/client'
import { type ProjectLinkIconValue } from '~/lib/project_link_icons'
import { checkForm } from '~/lib/utils'
import { InertiaProps } from '~/types'

const baseRoute = 'project'
const basePerm = 'project'
const title = 'Project'

function extractMediaIdFromRedirectUrl(value: string): string | null {
  if (!value) return null

  try {
    const parsed = new URL(value, window.location.origin)
    const match = parsed.pathname.match(/^\/api\/v1\/public\/media\/redirect\/([^/?#]+)$/)
    return match?.[1] ? decodeURIComponent(match[1]) : null
  } catch {
    return null
  }
}

type PageProps = InertiaProps<{
  data: Data.Project | null
}>

export default function Page(props: PageProps) {
  const { data } = props
  const [leavePageAfterSave, setLeavePageAfterSave] = useLeavePageAfterSave(title)
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string>(data?.thumbnail?.url || '')
  const [thumbnailUploadError, setThumbnailUploadError] = useState<string | null>(null)
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false)
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  const breadcrumbs = [
    {
      title: 'Dashboard',
      href: urlFor('dashboard.view'),
    },
    {
      title,
      href: urlFor(`${basePerm}.index`),
    },
    {
      title: data ? 'Edit' : 'Create',
      href: props.currentPath,
    },
  ]

  const { ConfirmAddModal, ConfirmModal, ConfirmResetModal } = useModals()

  const form = useForm({
    initialValues: {
      id: data?.id || '',
      is_active: data?.is_active ?? true,
      is_pinned: data?.is_pinned ?? false,
      title: data?.title || '',
      thumbnail_id: data?.thumbnail_id || '',
      description: data?.description || '',
      tags: data?.tags || [],
      links: (data?.links || []).map((link) => ({
        label: link.label || '',
        url: link.url || '',
        icon: (link.icon as ProjectLinkIconValue) || 'IconLink',
      })),
    },
    validate: {
      title: (value) => (value.trim().length > 0 ? null : 'Title is required'),
    },
  })

  const mutation = useGenericMutation(
    data ? 'PATCH' : 'POST',
    urlFor(`${baseRoute}.${data ? 'update' : 'store'}`),
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      doRedirect: data ? leavePageAfterSave : true,
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
        links: form.values.links
          .map((link) => ({
            label: link.label.trim(),
            url: link.url.trim(),
            icon: link.icon,
          }))
          .filter((link) => link.label.length > 0 && link.url.length > 0),
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
        links: (data?.links || []).map((link) => ({
          label: link.label || '',
          url: link.url || '',
          icon: (link.icon as ProjectLinkIconValue) || 'IconLink',
        })),
      })
      setThumbnailPreviewUrl(data?.thumbnail?.url || '')
      setThumbnailUploadError(null)
      NotifyInfo('Form Reseted', 'Form has been reseted successfully')
    },
    name: 'Form',
  })

  const onBack = ConfirmModal({
    onConfirm: () => {
      router.visit(urlFor(`${baseRoute}.index`))
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
      const uploadedMedia = await uploadImage(file, urlFor('api.v1.media.upload'))
      console.log('Uploaded media:', uploadedMedia)
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
        <DashboardFormActionBar
          onBack={onBack}
          backLoading={mutation.isPending}
          beforeSecondaryActions={
            <LeavePageAfterSaveCheckbox
              checked={leavePageAfterSave}
              onChange={setLeavePageAfterSave}
              visible={!!data}
              disabled={mutation.isPending}
            />
          }
          secondaryActionLabel={data ? 'Cancel Changes' : 'Reset'}
          onSecondaryAction={onReset}
          secondaryActionLoading={mutation.isPending}
          primaryActionLabel={data ? 'Save Changes' : 'Create'}
          onPrimaryAction={onSave}
          primaryActionLoading={mutation.isPending}
        />

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
                <ImageWithLoader
                  src={thumbnailPreviewUrl}
                  alt="Project thumbnail preview"
                  radius="md"
                  h={220}
                  height={220}
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
                  disabled={
                    mutation.isPending || (!form.values.thumbnail_id && !thumbnailPreviewUrl)
                  }
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

            <Stack gap={8}>
              <Group justify="space-between" align="center">
                <Text size="sm" fw={500}>
                  Project Links
                </Text>
                <Button
                  variant="light"
                  size="xs"
                  leftSection={<IconPlus size={14} />}
                  disabled={mutation.isPending}
                  onClick={() =>
                    form.insertListItem('links', {
                      label: '',
                      url: '',
                      icon: 'IconLink',
                    })
                  }
                >
                  Add Link
                </Button>
              </Group>

              {form.values.links.length === 0 ? (
                <Text size="xs" c="dimmed">
                  No links yet. Add repository, website, demo, docs, etc.
                </Text>
              ) : null}

              {form.values.links.map((link, index) => (
                <Paper key={`link-${index}`} withBorder p="sm" radius="md">
                  <Group grow align="flex-end">
                    <TextInput
                      label="Label"
                      placeholder="Link label"
                      value={link.label}
                      disabled={mutation.isPending}
                      onChange={(event) =>
                        form.setFieldValue(`links.${index}.label`, event.target.value)
                      }
                    />
                    <TextInput
                      label="URL"
                      placeholder="https://..."
                      value={link.url}
                      disabled={mutation.isPending}
                      onChange={(event) =>
                        form.setFieldValue(`links.${index}.url`, event.target.value)
                      }
                    />
                    <IconPicker
                      value={link.icon}
                      onChange={(value) =>
                        form.setFieldValue(`links.${index}.icon`, value as ProjectLinkIconValue)
                      }
                    />
                    <ActionIcon
                      variant="light"
                      color="red"
                      size={'input-sm'}
                      disabled={mutation.isPending}
                      onClick={() => form.removeListItem('links', index)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Paper>
              ))}
              <Divider />
            </Stack>
          </Stack>
        </Paper>
      </div>

      <MediaLibraryDialog
        open={mediaLibraryOpen}
        onOpenChange={setMediaLibraryOpen}
        onSelectImage={setThumbnailFromUrl}
        getURL={urlFor('api.v1.media.list')}
        deleteURL={urlFor('api.v1.media.destroy')}
        pickerType="image"
      />
    </DashboardLayout>
  )
}
