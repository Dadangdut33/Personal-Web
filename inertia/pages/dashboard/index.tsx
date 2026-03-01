import type { DashboardOverview } from '#services/dashboard.service'

import { Head, router } from '@inertiajs/react'
import {
  Badge,
  Group,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core'
import {
  IconAlertCircle,
  IconBook2,
  IconBox,
  IconBrandGithub,
  IconChartBar,
  IconDatabase,
  IconExternalLink,
  IconPhoto,
  IconTimeline,
  IconUser,
} from '@tabler/icons-react'
import dayjs from 'dayjs'
import { JSX } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { LogMarkdownCompact } from '~/components/core/log/log-markdown-compact'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart'
import DashboardLayout from '~/layouts/dashboard'
import { urlFor } from '~/lib/client'
import { InertiaProps } from '~/types'

type PageProps = InertiaProps<{ overview: DashboardOverview }>

type StatCardProps = {
  label: string
  value: number | null
  sub?: string
  icon: JSX.Element
  color: string
}

function StatCard({ label, value, sub, icon, color }: StatCardProps) {
  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between" align="flex-start">
        <Stack gap={2}>
          <Text c="dimmed" fz="xs" tt="uppercase" fw={700}>
            {label}
          </Text>
          <Text fz="xl" fw={800}>
            {(value ?? 0).toLocaleString()}
          </Text>
          {sub ? (
            <Text fz="xs" c="dimmed">
              {sub}
            </Text>
          ) : null}
        </Stack>
        <ThemeIcon color={color} variant="light" size="lg" radius="md">
          {icon}
        </ThemeIcon>
      </Group>
    </Paper>
  )
}

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** exponent

  return `${value >= 10 || exponent === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[exponent]}`
}

function ContentRecentList({
  title,
  items,
}: {
  title: string
  items: {
    id: string
    title: string
    is_active: boolean
    is_pinned: boolean
    updated_at: string
  }[]
}) {
  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="sm">
        <Text fw={700}>{title}</Text>
        {items.length === 0 ? (
          <Text c="dimmed" fz="sm">
            No data yet.
          </Text>
        ) : (
          items.map((item) => (
            <Group key={item.id} justify="space-between" align="flex-start" wrap="nowrap">
              <Stack gap={2} style={{ minWidth: 0 }}>
                <Text fw={600} fz="sm" truncate>
                  {item.title}
                </Text>
                <Group gap={6}>
                  <Badge size="xs" variant="light" color={item.is_active ? 'green' : 'gray'}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge size="xs" variant="light" color={item.is_pinned ? 'yellow' : 'gray'}>
                    {item.is_pinned ? 'Pinned' : 'Not pinned'}
                  </Badge>
                </Group>
              </Stack>
              <Text fz="xs" c="dimmed">
                {item.updated_at ? dayjs(item.updated_at).format('YYYY-MM-DD HH:mm') : '-'}
              </Text>
            </Group>
          ))
        )}
      </Stack>
    </Paper>
  )
}

function ActivityRecentList({
  items,
}: {
  items: {
    id: string
    action: string
    target: string
    created_at: string
    user: {
      id: string
      full_name: string
    } | null
  }[]
}) {
  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="sm">
        <Text fw={700}>Latest Activity Logs</Text>
        {items.length === 0 ? (
          <Text c="dimmed" fz="sm">
            No activity yet.
          </Text>
        ) : (
          items.map((item) => (
            <Stack key={item.id} gap={3}>
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Stack gap={2} style={{ minWidth: 0 }}>
                  <Group gap={6}>
                    <Badge size="xs" variant="outline">
                      {item.action}
                    </Badge>
                    <Text fz="xs" c="dimmed">
                      {item.user?.full_name || 'System'}
                    </Text>
                  </Group>
                  <LogMarkdownCompact markdown={item.target} maxChars={160} lineClamp={2} />
                </Stack>
                <Text fz="xs" c="dimmed">
                  {item.created_at ? dayjs(item.created_at).format('YYYY-MM-DD HH:mm') : '-'}
                </Text>
              </Group>
            </Stack>
          ))
        )}
      </Stack>
    </Paper>
  )
}

function TrendChart({
  title,
  data,
  color,
  unit,
}: {
  title: string
  data: { date: string; count: number }[]
  color: string
  unit: 'day' | 'month'
}) {
  const chartConfig = {
    count: {
      label: title,
      color,
    },
  } satisfies ChartConfig

  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="sm">
        <Text fw={700}>{title}</Text>
        <ChartContainer config={chartConfig} className="h-[220px] w-full aspect-auto">
          <AreaChart data={data} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                unit === 'month' ? dayjs(value).format('MMM YY') : dayjs(value).format('MM/DD')
              }
            />
            <YAxis allowDecimals={false} width={30} />
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--color-count)"
              fill="var(--color-count)"
              fillOpacity={0.15}
            />
          </AreaChart>
        </ChartContainer>
      </Stack>
    </Paper>
  )
}

function QuickLinksCard({
  umamiPublicUrl,
  repoUrl,
}: {
  umamiPublicUrl?: string | null
  repoUrl?: string | null
}) {
  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="sm">
        <Text fw={700}>Quick Links</Text>

        <Group justify="space-between" align="center">
          <Group gap={8}>
            <ThemeIcon variant="light" color="dark" radius="md" size="sm">
              <IconBrandGithub size={14} />
            </ThemeIcon>
            <Text fz="sm">Project Repository</Text>
          </Group>
          {repoUrl ? (
            <a href={repoUrl} target="_blank" rel="noopener noreferrer">
              <Badge variant="outline" rightSection={<IconExternalLink size={12} />}>
                Open
              </Badge>
            </a>
          ) : (
            <Text fz="xs" c="dimmed">
              Repo URL not configured
            </Text>
          )}
        </Group>

        <Group justify="space-between" align="center">
          <Group gap={8}>
            <ThemeIcon variant="light" color="cyan" radius="md" size="sm">
              <IconChartBar size={14} />
            </ThemeIcon>
            <Text fz="sm">Umami Public URL</Text>
          </Group>
          {umamiPublicUrl ? (
            <a href={umamiPublicUrl} target="_blank" rel="noopener noreferrer">
              <Badge variant="outline" rightSection={<IconExternalLink size={12} />}>
                Open
              </Badge>
            </a>
          ) : (
            <Text fz="xs" c="dimmed">
              Umami env not configured
            </Text>
          )}
        </Group>
      </Stack>
    </Paper>
  )
}

export default function Page(props: PageProps) {
  const { overview } = props
  const rangeOptions = [
    { label: '7D', value: '7d' },
    { label: '14D', value: '14d' },
    { label: '30D', value: '30d' },
    { label: 'All', value: 'all' },
  ]

  const onRangeChange = (value: string) => {
    router.get(
      urlFor('dashboard.view'),
      { range: value },
      { preserveState: true, preserveScroll: true, replace: true }
    )
  }

  return (
    <DashboardLayout
      breadcrumbs={[
        {
          title: 'Dashboard',
          href: urlFor('dashboard.view'),
        },
      ]}
      className="gap-4"
    >
      <Head title="Dashboard" />
      <Paper withBorder p="sm" radius="md">
        <Group justify="space-between" align="center">
          <Text fw={700} fz="sm">
            Time Range
          </Text>
          <SegmentedControl
            data={rangeOptions}
            value={overview.range}
            onChange={onRangeChange}
            size="sm"
          />
        </Group>
      </Paper>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
        {overview.visibility.blogs ? (
          <StatCard
            label="Blogs"
            value={overview.counts.blogs}
            sub={`${overview.counts.blogsActive || 0} active • ${overview.counts.blogsPinned || 0} pinned`}
            icon={<IconBook2 size={18} />}
            color="blue"
          />
        ) : null}

        {overview.visibility.projects ? (
          <StatCard
            label="Projects"
            value={overview.counts.projects}
            sub={`${overview.counts.projectsActive || 0} active • ${overview.counts.projectsPinned || 0} pinned`}
            icon={<IconBox size={18} />}
            color="grape"
          />
        ) : null}

        {overview.visibility.media ? (
          <StatCard
            label="Media"
            value={overview.counts.media}
            icon={<IconPhoto size={18} />}
            color="teal"
          />
        ) : null}

        {overview.visibility.users ? (
          <StatCard
            label="Users"
            value={overview.counts.users}
            icon={<IconUser size={18} />}
            color="indigo"
          />
        ) : null}

        {overview.visibility.activityLogs ? (
          <StatCard
            label="Activity Logs"
            value={overview.counts.activityLogs}
            icon={<IconTimeline size={18} />}
            color="orange"
          />
        ) : null}

        {overview.visibility.umami ? (
          <StatCard
            label="Umami Page Views"
            value={overview.umami.pageviews}
            sub={`${overview.umami.visitors || 0} visitors • ${overview.umami.visits || 0} visits`}
            icon={<IconChartBar size={18} />}
            color="cyan"
          />
        ) : null}

        <StatCard
          label="Database Size"
          value={overview.counts.databaseSizeBytes}
          sub={formatBytes(overview.counts.databaseSizeBytes)}
          icon={<IconDatabase size={18} />}
          color="gray"
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing="md">
        {overview.visibility.blogs ? (
          <TrendChart
            title={`Blogs (${overview.rangeLabel})`}
            data={overview.trends.blogs}
            color="hsl(217 91% 60%)"
            unit={overview.trendUnit}
          />
        ) : null}

        {overview.visibility.projects ? (
          <TrendChart
            title={`Projects (${overview.rangeLabel})`}
            data={overview.trends.projects}
            color="hsl(267 84% 70%)"
            unit={overview.trendUnit}
          />
        ) : null}

        {overview.visibility.media ? (
          <TrendChart
            title={`Media (${overview.rangeLabel})`}
            data={overview.trends.media}
            color="hsl(173 80% 40%)"
            unit={overview.trendUnit}
          />
        ) : null}

        {overview.visibility.activityLogs ? (
          <TrendChart
            title={`Activity Logs (${overview.rangeLabel})`}
            data={overview.trends.activityLogs}
            color="hsl(24 95% 53%)"
            unit={overview.trendUnit}
          />
        ) : null}

        {overview.visibility.umami ? (
          <TrendChart
            title={`Page Views (Umami ${overview.rangeLabel})`}
            data={overview.umami.trend}
            color="hsl(188 95% 43%)"
            unit={overview.trendUnit}
          />
        ) : null}

        <QuickLinksCard umamiPublicUrl={props.umami_share_url} repoUrl={props.project_repo_url} />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        {overview.visibility.umami ? (
          <Paper withBorder p="md" radius="md">
            <Stack gap="sm">
              <Group justify="space-between">
                <Text fw={700}>Umami Analytics</Text>
                <Badge variant="outline">{overview.rangeLabel}</Badge>
              </Group>

              {!overview.umami.configured ? (
                <Group gap="xs" align="flex-start" wrap="nowrap">
                  <IconAlertCircle size={16} className="mt-0.5" />
                  <Text fz="sm" c="dimmed">
                    Umami stats are not configured yet. Set `UMAMI_SHARE_URL`.
                  </Text>
                </Group>
              ) : overview.umami.error ? (
                <Group gap="xs" align="flex-start" wrap="nowrap">
                  <IconAlertCircle size={16} className="mt-0.5" />
                  <Text fz="sm" c="red">
                    Failed to fetch stats: {overview.umami.error}
                  </Text>
                </Group>
              ) : (
                <SimpleGrid cols={2} spacing="xs">
                  <Paper withBorder p="sm" radius="md">
                    <Text c="dimmed" fz="xs" tt="uppercase" fw={700}>
                      Page Views
                    </Text>
                    <Text fw={800} fz="lg">
                      {(overview.umami.pageviews || 0).toLocaleString()}
                    </Text>
                  </Paper>
                  <Paper withBorder p="sm" radius="md">
                    <Text c="dimmed" fz="xs" tt="uppercase" fw={700}>
                      Visitors
                    </Text>
                    <Text fw={800} fz="lg">
                      {(overview.umami.visitors || 0).toLocaleString()}
                    </Text>
                  </Paper>
                  <Paper withBorder p="sm" radius="md">
                    <Text c="dimmed" fz="xs" tt="uppercase" fw={700}>
                      Visits
                    </Text>
                    <Text fw={800} fz="lg">
                      {(overview.umami.visits || 0).toLocaleString()}
                    </Text>
                  </Paper>
                  <Paper withBorder p="sm" radius="md">
                    <Text c="dimmed" fz="xs" tt="uppercase" fw={700}>
                      Bounce / Avg Time
                    </Text>
                    <Text fw={800} fz="sm">
                      {overview.umami.bounceRate !== null
                        ? `${overview.umami.bounceRate.toFixed(2)}%`
                        : '-'}{' '}
                      /{' '}
                      {overview.umami.averageVisitTime !== null
                        ? `${Math.round(overview.umami.averageVisitTime)}s`
                        : '-'}
                    </Text>
                  </Paper>
                </SimpleGrid>
              )}

              {overview.umami.fetchedAt ? (
                <Text fz="xs" c="dimmed">
                  Last sync: {dayjs(overview.umami.fetchedAt).format('YYYY-MM-DD HH:mm:ss')}
                </Text>
              ) : null}
            </Stack>
          </Paper>
        ) : null}

        {overview.visibility.giscus ? (
          <Paper withBorder p="md" radius="md">
            <Stack gap="sm">
              <Group justify="space-between">
                <Group gap="xs">
                  <ThemeIcon variant="light" color="dark" radius="md">
                    <IconBrandGithub size={16} />
                  </ThemeIcon>
                  <Text fw={700}>Giscus Comments</Text>
                </Group>
                {overview.giscus.repo ? (
                  <Badge variant="outline">{overview.giscus.repo}</Badge>
                ) : null}
              </Group>

              {!overview.giscus.configured ? (
                <Group gap="xs" align="flex-start" wrap="nowrap">
                  <IconAlertCircle size={16} className="mt-0.5" />
                  <Text fz="sm" c="dimmed">
                    Giscus stats are not configured yet. Set `GISCUS_REPO_OWNER`,
                    `GISCUS_REPO_NAME`, and `GISCUS_GITHUB_TOKEN`.
                  </Text>
                </Group>
              ) : overview.giscus.error ? (
                <Group gap="xs" align="flex-start" wrap="nowrap">
                  <IconAlertCircle size={16} className="mt-0.5" />
                  <Text fz="sm" c="red">
                    Failed to fetch stats: {overview.giscus.error}
                  </Text>
                </Group>
              ) : (
                <SimpleGrid cols={3} spacing="xs">
                  <Paper withBorder p="sm" radius="md">
                    <Text c="dimmed" fz="xs" tt="uppercase" fw={700}>
                      Threads
                    </Text>
                    <Text fw={800} fz="lg">
                      {(overview.giscus.totalDiscussions || 0).toLocaleString()}
                    </Text>
                  </Paper>
                  <Paper withBorder p="sm" radius="md">
                    <Text c="dimmed" fz="xs" tt="uppercase" fw={700}>
                      Open
                    </Text>
                    <Text fw={800} fz="lg">
                      {(overview.giscus.openDiscussions || 0).toLocaleString()}
                    </Text>
                  </Paper>
                  <Paper withBorder p="sm" radius="md">
                    <Text c="dimmed" fz="xs" tt="uppercase" fw={700}>
                      Comments
                    </Text>
                    <Text fw={800} fz="lg">
                      {(overview.giscus.totalComments || 0).toLocaleString()}
                    </Text>
                  </Paper>
                </SimpleGrid>
              )}

              {overview.giscus.fetchedAt ? (
                <Text fz="xs" c="dimmed">
                  Last sync: {dayjs(overview.giscus.fetchedAt).format('YYYY-MM-DD HH:mm:ss')}
                </Text>
              ) : null}
            </Stack>
          </Paper>
        ) : null}

        {overview.visibility.blogs ? (
          <ContentRecentList title="Recent Blogs" items={overview.recent.blogs} />
        ) : null}

        {overview.visibility.projects ? (
          <ContentRecentList title="Recent Projects" items={overview.recent.projects} />
        ) : null}
      </SimpleGrid>

      {overview.visibility.activityLogs ? (
        <ActivityRecentList items={overview.recent.activityLogs} />
      ) : null}
    </DashboardLayout>
  )
}
