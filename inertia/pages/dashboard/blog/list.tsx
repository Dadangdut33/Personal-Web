import BlogController from '#controllers/blog.controller'
import { RouteNameType } from '#types/app'

import { InferPageProps, SharedProps } from '@adonisjs/inertia/types'
import { Head, Link } from '@inertiajs/react'
import { route } from '@izzyjs/route/client'
import {
  ActionIcon,
  Alert,
  Badge,
  Group,
  Tooltip as MantineTooltip,
  Menu,
  Paper,
  Text,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconAlertCircle, IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { Trash2 } from 'lucide-react'
import {
  DataTable,
  DataTableProps,
  DataTableSortStatus,
  useDataTableColumns,
} from 'mantine-datatable'
import { useState } from 'react'
import { DashboardSearchPanel } from '~/components/core/dashboard/search-panel'
import { DashboardTableButtons } from '~/components/core/dashboard/table-buttons'
import { GenericBulkDeleteDescription, GenericDeleteTitle } from '~/components/core/delete-helper'
import { FilterDate } from '~/components/core/table-filter/date-filter'
import { FilterText } from '~/components/core/table-filter/text-filter'
import { TooltipIfTrue } from '~/components/core/tooltipper'
import { useDeleteGeneric } from '~/hooks/use_generic_delete'
import useSearchFilter from '~/hooks/use_search_filter'
import DashboardLayout from '~/layouts/dashboard'

const baseRoute = 'blog'
const basePerm = 'blog'
const pageTitle = 'Blog'
type PageProps = SharedProps & InferPageProps<BlogController, 'viewList'>
type DataType = PageProps['data'][number]

export default function Page(props: PageProps) {
  const breadcrumbs = [
    {
      title: 'Dashboard',
      href: route('dashboard.view').path,
    },
    {
      title: pageTitle,
      href: props.currentPath,
    },
  ]

  const { data, meta } = props

  const canAdd = props.user?.permissions.includes(`${basePerm}.create`)
  const canEdit = props.user?.permissions.includes(`${basePerm}.update`)
  const canDelete = props.user?.permissions.includes(`${basePerm}.delete`)

  const searchFilter = useSearchFilter(`${baseRoute}.index` as RouteNameType)
  const [selected, setSelected] = useState<DataType>()
  const [selectedRecords, setSelectedRecords] = useState<DataType[]>([])
  const [isOpen, { open: onOpen, close: onClose }] = useDisclosure(false)
  const [searching, setSearching] = useState(false)

  const handleSearchingButton = () => {
    setSearching((prev) => !prev)
  }

  useDeleteGeneric({
    isOpen,
    onClose,
    data: selected,
    onSuccess: () => {
      const deleted = selected
      setSelectedRecords((prev) => prev.filter((r) => r.id !== deleted?.id))
      setSelected(undefined)
      onClose()
      searchFilter.doSearch()
    },
    deleteParam: { params: { id: selected?.id } },
    routeName: `${baseRoute}.destroy` as RouteNameType,
    title: (
      <div className="flex items-center gap-2">
        <Trash2 className="size-5 text-red-400" />
        <span>
          Delete {pageTitle} ({selected?.title})
        </span>
      </div>
    ),
  })

  const { confirmModal: confirmBulkDel } = useDeleteGeneric({
    data: { ids: selectedRecords.map((r) => r.id) },
    isOpen: false,
    onClose: () => {},
    onSuccess: () => {
      setSelectedRecords([])
      searchFilter.doSearch()
    },
    routeName: `${baseRoute}.bulkDestroy` as RouteNameType,
    deleteParam: { params: {} },
    title: <GenericDeleteTitle bulk={true} />,
    message: (
      <GenericBulkDeleteDescription length={selectedRecords.length}>
        {selectedRecords.map((r) => '> ' + r.title).join('\n')}
      </GenericBulkDeleteDescription>
    ),
  })

  const key = 'blog-table'
  const columns: DataTableProps<DataType>['columns'] = [
    {
      accessor: 'title',
      title: 'Title',
      sortable: true,
      filter: () => (
        <FilterText
          column={'title'}
          searchFilter={searchFilter}
          label="Title"
          description="Filter by title"
        />
      ),
      filtering: searchFilter.searchBy.title ? true : false,
    },
    {
      accessor: 'slug_id',
      title: 'Slug',
      sortable: true,
      filter: () => (
        <FilterText
          column={'slug_id'}
          searchFilter={searchFilter}
          label="Slug"
          description="Filter by slug"
        />
      ),
      filtering: searchFilter.searchBy.slug_id ? true : false,
    },
    {
      accessor: 'tags',
      title: 'Tags',
      sortable: false,
      render: (record) => (
        <Group gap={6}>
          {record.tags?.map((tag) => (
            <Badge key={tag.id} variant="light">
              {tag.name}
            </Badge>
          ))}
        </Group>
      ),
    },
    {
      accessor: 'created_at',
      title: 'Created At',
      toggleable: true,
      sortable: true,
      width: 200,
      render: ({ created_at }) => (
        <MantineTooltip label={dayjs(created_at).format('YYYY-MM-DD HH:mm:ss')}>
          <Text fz="sm">{dayjs(created_at).format('YYYY-MM-DD')}</Text>
        </MantineTooltip>
      ),
      filter: () => (
        <FilterDate
          column={'created_at'}
          searchFilter={searchFilter}
          label="Created At"
          description="Filter by created at"
        />
      ),
      filtering: searchFilter.searchBy.created_at ? true : false,
    },
    {
      accessor: 'updated_at',
      title: 'Updated At',
      toggleable: true,
      sortable: true,
      width: 200,
      render: ({ updated_at }) => (
        <MantineTooltip label={dayjs(updated_at).format('YYYY-MM-DD HH:mm:ss')}>
          <Text fz="sm">{dayjs(updated_at).format('YYYY-MM-DD')}</Text>
        </MantineTooltip>
      ),
      filter: () => (
        <FilterDate
          column={'updated_at'}
          searchFilter={searchFilter}
          label="Updated At"
          description="Filter by updated at"
        />
      ),
      filtering: searchFilter.searchBy.updated_at ? true : false,
    },
    {
      accessor: 'id',
      title: 'Actions',
      toggleable: false,
      sortable: false,
      width: 75,
      render: (record) => {
        return (
          <Menu withArrow width={150} shadow="md">
            <Menu.Target>
              <div className="flex">
                <ActionIcon className="mx-auto" variant="light">
                  <IconDotsVertical size={16} />
                </ActionIcon>
              </div>
            </Menu.Target>
            <Menu.Dropdown>
              <TooltipIfTrue isTrue={!canEdit} label="You don't have permission to edit blog">
                <Menu.Item
                  fw={600}
                  fz="sm"
                  color="blue"
                  variant="filled"
                  component={!canEdit ? undefined : Link}
                  leftSection={<IconEdit size={16} />}
                  href={route(`${baseRoute}.edit`, { params: { id: record.id } }).path}
                  disabled={!canEdit}
                >
                  Edit
                </Menu.Item>
              </TooltipIfTrue>

              <TooltipIfTrue isTrue={!canDelete} label="You don't have permission to delete blog">
                <Menu.Item
                  fw={600}
                  fz="sm"
                  color="red"
                  variant="filled"
                  leftSection={<IconTrash size={16} />}
                  onClick={() => {
                    if (!canDelete) return
                    setSelected(() => record)
                    onOpen()
                  }}
                  disabled={!canDelete}
                >
                  Delete
                </Menu.Item>
              </TooltipIfTrue>
            </Menu.Dropdown>
          </Menu>
        )
      },
    },
  ]

  const { effectiveColumns, resetColumnsToggle, resetColumnsWidth, resetColumnsOrder } =
    useDataTableColumns<DataType>({
      key,
      columns,
    })
  const resetColumnState = () => {
    resetColumnsToggle()
    resetColumnsWidth()
    resetColumnsOrder()
  }

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <Head title={pageTitle} />
      <div className="space-y-4">
        {!canDelete && (
          <Alert icon={<IconAlertCircle size={16} />} title="Access" color="yellow" variant="light">
            You can view data, but delete actions are disabled due to permissions.
          </Alert>
        )}

        <DashboardTableButtons
          searching={searching}
          canResetSearch={searchFilter.searchParamIsSet}
          selectedRecords={selectedRecords}
          canDelete={canDelete}
          canAdd={canAdd}
          showAddButton={true}
          addHref={route(`${baseRoute}.create`).path}
          onToggleSearch={handleSearchingButton}
          onBulkDelete={confirmBulkDel}
          onResetFilter={() => {
            searchFilter.resetSearch()
          }}
          onResetColumns={resetColumnState}
          labels={{
            noDeletePermission: "You don't have permission to delete blog",
            noAddPermission: "You don't have permission to add blog",
            bulkDeleteMin: 'Select at least 1 record to delete',
          }}
        />

        <DashboardSearchPanel
          opened={searching}
          value={searchFilter.search}
          onChange={(value) => searchFilter.onSearch(value)}
          placeholder={`Search ${pageTitle.toLowerCase()}...`}
        />

        <Paper p="xs" shadow="md" radius="md" withBorder mb={'md'}>
          <DataTable
            minHeight={
              searchFilter.searchParamIsSet || searchFilter.isFetching || data.length === 0
                ? 200
                : undefined
            }
            verticalSpacing="xs"
            horizontalSpacing={'xs'}
            striped
            highlightOnHover
            withColumnBorders
            verticalAlign="top"
            storeColumnsKey={key}
            columns={effectiveColumns}
            records={data}
            selectedRecords={selectedRecords}
            fetching={searchFilter.isFetching}
            totalRecords={meta.total}
            recordsPerPage={meta.per_page}
            page={meta.current_page}
            recordsPerPageOptions={[5, 10, 15, 20, 50, 100, 200, 500, 1000]}
            onSelectedRecordsChange={setSelectedRecords}
            onPageChange={(page) => searchFilter.onPageChange(page)}
            onRecordsPerPageChange={(perPage) => searchFilter.onRecordsPerPage(perPage)}
            sortStatus={searchFilter.sortStatus as DataTableSortStatus<DataType>}
            onSortStatusChange={(sortStatus: DataTableSortStatus<DataType>) =>
              searchFilter.onSortStatus(sortStatus as DataTableSortStatus<any>)
            }
          />
        </Paper>
      </div>
    </DashboardLayout>
  )
}
