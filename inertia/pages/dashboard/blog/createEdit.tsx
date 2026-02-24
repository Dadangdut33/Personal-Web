import BlogController from '#controllers/blog.controller'

import { InferPageProps, SharedProps } from '@adonisjs/inertia/types'
import { router } from '@inertiajs/core'
import { Head } from '@inertiajs/react'
import { route } from '@izzyjs/route/client'
import { Button, Group, MultiSelect, Paper, Stack, Text, TextInput, Textarea } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconArrowLeft, IconCancel, IconDeviceFloppy } from '@tabler/icons-react'
import { useState } from 'react'
import TiptapEditor from '~/components/RTE'
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

export default function Page(
  props: SharedProps &
    (InferPageProps<BlogController, 'viewEdit'> | InferPageProps<BlogController, 'viewCreate'>)
) {
  const { data, projects } = props
  const defaultContent = { type: 'doc', content: [] }
  const [content, setContent] = useState<Record<string, any>>(data?.content || defaultContent)

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
      tags_input: data?.tags?.map((tag) => tag.name).join(', ') || '',
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
        tags: form.values.tags_input
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        projectIds: form.values.projectIds,
      })
    },
  })

  const onReset = ConfirmResetModal({
    onConfirm: () => {
      form.reset()
      setContent(data?.content || defaultContent)
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

            <TextInput
              label="Thumbnail Media ID"
              placeholder="UUID media id"
              value={form.values.thumbnail_id}
              disabled={mutation.isPending}
              onChange={(e) => form.setFieldValue('thumbnail_id', e.target.value)}
            />

            <Textarea
              label="Description"
              placeholder="Short blog description"
              value={form.values.description}
              disabled={mutation.isPending}
              onChange={(e) => form.setFieldValue('description', e.target.value)}
              autosize
              minRows={3}
            />

            <TextInput
              label="Tags"
              description="Use comma separated tags. Example: tech, adonis, tutorial"
              placeholder="tech, adonis, tutorial"
              value={form.values.tags_input}
              disabled={mutation.isPending}
              onChange={(e) => form.setFieldValue('tags_input', e.target.value)}
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
    </DashboardLayout>
  )
}
