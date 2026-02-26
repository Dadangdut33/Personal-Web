import Tables from '#enums/tables'
import ActivityLog from '#models/activity_log'
import Blog from '#models/blog'
import Project from '#models/project'
import User from '#models/user'
import UmamiService from '#services/umami.service'
import env from '#start/env'

import cache from '@adonisjs/cache/services/main'
import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

type TrendPoint = {
  date: string
  count: number
}
export type DashboardRange = '7d' | '14d' | '30d' | 'all'

type GiscusStats = {
  enabled: boolean
  configured: boolean
  repo: string | null
  totalDiscussions: number | null
  openDiscussions: number | null
  totalComments: number | null
  fetchedAt: string | null
  error: string | null
}

type UmamiStats = {
  enabled: boolean
  configured: boolean
  pageviews: number | null
  visitors: number | null
  visits: number | null
  bounceRate: number | null
  averageVisitTime: number | null
  trend: TrendPoint[]
  fetchedAt: string | null
  error: string | null
}

export type DashboardOverview = {
  range: DashboardRange
  rangeLabel: string
  trendUnit: 'day' | 'month'
  visibility: {
    users: boolean
    blogs: boolean
    projects: boolean
    media: boolean
    activityLogs: boolean
    giscus: boolean
    umami: boolean
  }
  counts: {
    users: number | null
    blogs: number | null
    blogsActive: number | null
    blogsPinned: number | null
    projects: number | null
    projectsActive: number | null
    projectsPinned: number | null
    media: number | null
    activityLogs: number | null
    databaseSizeBytes: number | null
  }
  trends: {
    blogs: TrendPoint[]
    projects: TrendPoint[]
    media: TrendPoint[]
    activityLogs: TrendPoint[]
  }
  recent: {
    blogs: {
      id: string
      title: string
      is_active: boolean
      is_pinned: boolean
      updated_at: string
    }[]
    projects: {
      id: string
      title: string
      is_active: boolean
      is_pinned: boolean
      updated_at: string
    }[]
    activityLogs: {
      id: string
      action: string
      target: string
      created_at: string
      user: {
        id: string
        full_name: string
      } | null
    }[]
  }
  giscus: GiscusStats
  umami: UmamiStats
}

@inject()
export default class DashboardService {
  constructor(protected umamiSvc: UmamiService) {}
  private readonly externalFetchTtl = '5m'

  private async count(tableName: Tables, where?: Record<string, any>) {
    const query = db.from(tableName)
    if (where) query.where(where)

    const result = await query.count('* as total').first()
    return Number((result as any)?.total ?? 0)
  }

  private async getDatabaseSizeBytes(): Promise<number | null> {
    try {
      const result = await db.rawQuery(
        'SELECT pg_database_size(current_database())::bigint AS size_bytes'
      )
      const rawSize = result?.rows?.[0]?.size_bytes
      const size = typeof rawSize === 'string' ? Number.parseInt(rawSize, 10) : Number(rawSize)

      return Number.isFinite(size) ? size : null
    } catch {
      return null
    }
  }

  private buildEmptyTrend(days = 7): TrendPoint[] {
    return Array.from({ length: days }).map((_, idx) => {
      const day =
        DateTime.now()
          .minus({ days: days - 1 - idx })
          .toISODate() || ''
      return { date: day, count: 0 }
    })
  }

  private resolveRange(range: DashboardRange) {
    if (range === '14d') return { days: 14, unit: 'day' as const, label: 'Last 14 days' }
    if (range === '30d') return { days: 30, unit: 'day' as const, label: 'Last 30 days' }
    if (range === 'all') return { days: null, unit: 'month' as const, label: 'All time' }
    return { days: 7, unit: 'day' as const, label: 'Last 7 days' }
  }

  private buildEmptyMonthlyTrend(startMonthIso: string, endMonthIso: string): TrendPoint[] {
    const start = DateTime.fromISO(startMonthIso).startOf('month')
    const end = DateTime.fromISO(endMonthIso).startOf('month')
    if (!start.isValid || !end.isValid || start > end) return []

    const series: TrendPoint[] = []
    let cursor = start
    while (cursor <= end) {
      series.push({ date: cursor.toISODate() || '', count: 0 })
      cursor = cursor.plus({ months: 1 })
    }

    return series
  }

  private async getDailyTrend(
    tableName: Tables,
    dateColumn = 'created_at',
    days = 7
  ): Promise<TrendPoint[]> {
    const rows = (await db
      .from(tableName)
      .select(db.raw(`DATE(${dateColumn}) as day`))
      .count('* as total')
      .whereRaw(`${dateColumn} >= NOW() - INTERVAL '${days - 1} days'`)
      .groupByRaw(`DATE(${dateColumn})`)
      .orderBy('day', 'asc')) as Array<{ day: string; total: string | number }>

    const map = new Map(rows.map((row) => [String(row.day), Number(row.total || 0)]))

    return this.buildEmptyTrend(days).map((item) => ({
      date: item.date,
      count: map.get(item.date) ?? 0,
    }))
  }

  private async getMonthlyTrend(
    tableName: Tables,
    dateColumn = 'created_at'
  ): Promise<TrendPoint[]> {
    const rows = (await db
      .from(tableName)
      .select(db.raw(`DATE_TRUNC('month', ${dateColumn})::date as month`))
      .count('* as total')
      .groupByRaw(`DATE_TRUNC('month', ${dateColumn})`)
      .orderBy('month', 'asc')) as Array<{ month: string; total: string | number }>

    if (rows.length === 0) return []

    const firstMonth = String(rows[0].month)
    const lastMonth = DateTime.now().startOf('month').toISODate() || firstMonth
    const map = new Map(rows.map((row) => [String(row.month), Number(row.total || 0)]))

    return this.buildEmptyMonthlyTrend(firstMonth, lastMonth).map((item) => ({
      date: item.date,
      count: map.get(item.date) ?? 0,
    }))
  }

  private async getTrend(
    tableName: Tables,
    range: DashboardRange,
    dateColumn = 'created_at'
  ): Promise<TrendPoint[]> {
    const resolved = this.resolveRange(range)
    if (resolved.unit === 'month') {
      return this.getMonthlyTrend(tableName, dateColumn)
    }

    return this.getDailyTrend(tableName, dateColumn, resolved.days!)
  }

  private async fetchGiscusStatsUncached(
    owner: string,
    repo: string,
    token: string
  ): Promise<GiscusStats> {
    const endpoint = 'https://api.github.com/graphql'
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }

    const metaQuery = `
      query RepoDiscussionsMeta($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          discussions(first: 1) { totalCount }
          open: discussions(first: 1, states: OPEN) { totalCount }
        }
      }
    `
    const metaResponse = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: metaQuery,
        variables: { owner, name: repo },
      }),
    })

    if (!metaResponse.ok) {
      throw new Error(`GitHub API returned ${metaResponse.status}`)
    }

    const metaJson = (await metaResponse.json()) as any
    if (metaJson.errors?.length) {
      throw new Error(metaJson.errors[0]?.message || 'Failed to fetch repository discussions')
    }

    const totalDiscussions = Number(metaJson?.data?.repository?.discussions?.totalCount ?? 0)
    const openDiscussions = Number(metaJson?.data?.repository?.open?.totalCount ?? 0)

    let totalComments = 0
    let hasNextPage = true
    let cursor: string | null = null

    while (hasNextPage) {
      const commentsQuery = `
        query RepoDiscussionsComments($owner: String!, $name: String!, $after: String) {
          repository(owner: $owner, name: $name) {
            discussions(first: 100, after: $after) {
              nodes {
                comments { totalCount }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }
      `

      const commentsResponse = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: commentsQuery,
          variables: { owner, name: repo, after: cursor },
        }),
      })

      if (!commentsResponse.ok) {
        throw new Error(`GitHub API returned ${commentsResponse.status}`)
      }

      const commentsJson = (await commentsResponse.json()) as any
      if (commentsJson.errors?.length) {
        throw new Error(commentsJson.errors[0]?.message || 'Failed to fetch discussion comments')
      }

      const page = commentsJson?.data?.repository?.discussions
      const nodes = page?.nodes || []
      totalComments += nodes.reduce(
        (sum: number, node: any) => sum + Number(node?.comments?.totalCount ?? 0),
        0
      )

      hasNextPage = Boolean(page?.pageInfo?.hasNextPage)
      cursor = page?.pageInfo?.endCursor || null
    }

    return {
      enabled: true,
      configured: true,
      repo: `${owner}/${repo}`,
      totalDiscussions,
      openDiscussions,
      totalComments,
      fetchedAt: new Date().toISOString(),
      error: null,
    }
  }

  private async fetchGiscusStats(): Promise<GiscusStats> {
    const owner = env.get('GISCUS_REPO_OWNER')
    const repo = env.get('GISCUS_REPO_NAME')
    const token = env.get('GISCUS_GITHUB_TOKEN')

    if (!owner || !repo || !token) {
      return {
        enabled: false,
        configured: false,
        repo: owner && repo ? `${owner}/${repo}` : null,
        totalDiscussions: null,
        openDiscussions: null,
        totalComments: null,
        fetchedAt: null,
        error: null,
      }
    }

    try {
      return await cache.getOrSet({
        key: `dashboard:giscus:${owner}:${repo}`,
        ttl: this.externalFetchTtl,
        factory: async () => this.fetchGiscusStatsUncached(owner, repo, token),
      })
    } catch (error) {
      return {
        enabled: true,
        configured: true,
        repo: `${owner}/${repo}`,
        totalDiscussions: null,
        openDiscussions: null,
        totalComments: null,
        fetchedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Failed to fetch Giscus stats',
      }
    }
  }

  private async fetchUmamiStatsWithApiConfig(range: DashboardRange) {
    const resolved = this.resolveRange(range)
    const endAt = Date.now()
    const startAt =
      resolved.unit === 'month'
        ? 0
        : DateTime.now()
            .minus({ days: (resolved.days || 7) - 1 })
            .startOf('day')
            .toMillis()

    const { stats: statsJson, pageviews: pageviewsJson } = await this.umamiSvc.fetchWebsiteStats({
      startAt,
      endAt,
      unit: resolved.unit,
    })

    const rawSeries = Array.isArray(pageviewsJson)
      ? pageviewsJson
      : Array.isArray(pageviewsJson?.pageviews)
        ? pageviewsJson.pageviews
        : []

    const map = new Map<string, number>()
    for (const item of rawSeries) {
      const rawDate = item?.x ?? item?.date ?? item?.createdAt ?? item?.timestamp
      let isoDate: string | null = null

      if (typeof rawDate === 'number' || (typeof rawDate === 'string' && /^\d+$/.test(rawDate))) {
        const millis = Number(rawDate)
        isoDate = Number.isFinite(millis) ? DateTime.fromMillis(millis).toISODate() : null
      } else if (typeof rawDate === 'string') {
        isoDate = DateTime.fromISO(rawDate).toISODate()
      }

      if (!isoDate) continue
      map.set(isoDate, Number(item?.y ?? item?.value ?? item?.count ?? 0))
    }

    const trend =
      resolved.unit === 'month'
        ? (() => {
            const rows = Array.from(map.keys()).sort()
            if (rows.length === 0) return []
            const firstMonth = rows[0]
            const lastMonth = DateTime.now().startOf('month').toISODate() || firstMonth
            return this.buildEmptyMonthlyTrend(firstMonth, lastMonth).map((item) => ({
              date: item.date,
              count: map.get(item.date) ?? 0,
            }))
          })()
        : this.buildEmptyTrend(resolved.days || 7).map((item) => ({
            date: item.date,
            count: map.get(item.date) ?? 0,
          }))

    const pageviews = Number(statsJson?.pageviews?.value ?? statsJson?.pageviews ?? 0)
    const visitors = Number(statsJson?.visitors?.value ?? statsJson?.visitors ?? 0)
    const visits = Number(statsJson?.visits?.value ?? statsJson?.visits ?? 0)
    const bounceRate = Number(
      statsJson?.bounces?.value ?? statsJson?.bounceRate ?? statsJson?.bounce_rate ?? 0
    )
    const averageVisitTime = Number(
      statsJson?.totaltime?.value ?? statsJson?.averageVisitTime ?? statsJson?.avg_visit_time ?? 0
    )

    return {
      enabled: true,
      configured: true,
      pageviews: Number.isFinite(pageviews) ? pageviews : 0,
      visitors: Number.isFinite(visitors) ? visitors : 0,
      visits: Number.isFinite(visits) ? visits : 0,
      bounceRate: Number.isFinite(bounceRate) ? bounceRate : null,
      averageVisitTime: Number.isFinite(averageVisitTime) ? averageVisitTime : null,
      trend,
      fetchedAt: new Date().toISOString(),
      error: null,
    } as UmamiStats
  }

  private async fetchUmamiStats(range: DashboardRange): Promise<UmamiStats> {
    const resolved = this.resolveRange(range)
    const apiConfig = this.umamiSvc.getApiConfig()
    if (!apiConfig) {
      return {
        enabled: false,
        configured: false,
        pageviews: null,
        visitors: null,
        visits: null,
        bounceRate: null,
        averageVisitTime: null,
        trend:
          resolved.unit === 'month'
            ? this.buildEmptyMonthlyTrend(
                DateTime.now().startOf('month').toISODate() || '',
                DateTime.now().startOf('month').toISODate() || ''
              )
            : this.buildEmptyTrend(resolved.days || 7),
        fetchedAt: null,
        error: null,
      }
    }

    try {
      const cacheKey = `dashboard:umami:api:${apiConfig.websiteId}:range:${range}`

      return await cache.getOrSet({
        key: cacheKey,
        ttl: this.externalFetchTtl,
        factory: async () => this.fetchUmamiStatsWithApiConfig(range),
      })
    } catch (error) {
      return {
        enabled: true,
        configured: true,
        pageviews: null,
        visitors: null,
        visits: null,
        bounceRate: null,
        averageVisitTime: null,
        trend:
          resolved.unit === 'month'
            ? this.buildEmptyMonthlyTrend(
                DateTime.now().startOf('month').toISODate() || '',
                DateTime.now().startOf('month').toISODate() || ''
              )
            : this.buildEmptyTrend(resolved.days || 7),
        fetchedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Failed to fetch Umami stats',
      }
    }
  }

  async getUserPermissions(user: User): Promise<string[]> {
    const roles = await user.related('roles').query().preload('permissions')
    const flatPermissions = roles.flatMap((role) =>
      role.permissions.map((permission) => permission.name)
    )
    return Array.from(new Set(flatPermissions))
  }

  async getOverview(
    permissions: string[],
    range: DashboardRange = '7d'
  ): Promise<DashboardOverview> {
    const resolvedRange = this.resolveRange(range)
    const canViewUsers = permissions.includes('user.view')
    const canViewBlogs = permissions.includes('blog.view')
    const canViewProjects = permissions.includes('project.view')
    const canViewMedia = permissions.includes('media.view')
    const canViewActivityLogs = permissions.includes('activity_log.view')
    const canViewGiscus = canViewBlogs
    const canViewUmami = true

    const [
      users,
      blogs,
      blogsActive,
      blogsPinned,
      projects,
      projectsActive,
      projectsPinned,
      media,
      activityLogs,
      databaseSizeBytes,
      blogsTrend,
      projectsTrend,
      mediaTrend,
      activityLogsTrend,
      recentBlogs,
      recentProjects,
      recentActivityLogs,
      giscus,
      umami,
    ] = await Promise.all([
      canViewUsers ? this.count(Tables.USERS) : Promise.resolve(null),
      canViewBlogs ? this.count(Tables.BLOGS) : Promise.resolve(null),
      canViewBlogs ? this.count(Tables.BLOGS, { is_active: true }) : Promise.resolve(null),
      canViewBlogs ? this.count(Tables.BLOGS, { is_pinned: true }) : Promise.resolve(null),
      canViewProjects ? this.count(Tables.PROJECTS) : Promise.resolve(null),
      canViewProjects ? this.count(Tables.PROJECTS, { is_active: true }) : Promise.resolve(null),
      canViewProjects ? this.count(Tables.PROJECTS, { is_pinned: true }) : Promise.resolve(null),
      canViewMedia ? this.count(Tables.MEDIAS) : Promise.resolve(null),
      canViewActivityLogs ? this.count(Tables.ACTIVITY_LOGS) : Promise.resolve(null),
      this.getDatabaseSizeBytes(),

      canViewBlogs
        ? this.getTrend(Tables.BLOGS, range)
        : Promise.resolve(
            resolvedRange.unit === 'month'
              ? this.buildEmptyMonthlyTrend(
                  DateTime.now().startOf('month').toISODate() || '',
                  DateTime.now().startOf('month').toISODate() || ''
                )
              : this.buildEmptyTrend(resolvedRange.days || 7)
          ),
      canViewProjects
        ? this.getTrend(Tables.PROJECTS, range)
        : Promise.resolve(
            resolvedRange.unit === 'month'
              ? this.buildEmptyMonthlyTrend(
                  DateTime.now().startOf('month').toISODate() || '',
                  DateTime.now().startOf('month').toISODate() || ''
                )
              : this.buildEmptyTrend(resolvedRange.days || 7)
          ),
      canViewMedia
        ? this.getTrend(Tables.MEDIAS, range)
        : Promise.resolve(
            resolvedRange.unit === 'month'
              ? this.buildEmptyMonthlyTrend(
                  DateTime.now().startOf('month').toISODate() || '',
                  DateTime.now().startOf('month').toISODate() || ''
                )
              : this.buildEmptyTrend(resolvedRange.days || 7)
          ),
      canViewActivityLogs
        ? this.getTrend(Tables.ACTIVITY_LOGS, range, 'created_at')
        : Promise.resolve(
            resolvedRange.unit === 'month'
              ? this.buildEmptyMonthlyTrend(
                  DateTime.now().startOf('month').toISODate() || '',
                  DateTime.now().startOf('month').toISODate() || ''
                )
              : this.buildEmptyTrend(resolvedRange.days || 7)
          ),

      canViewBlogs
        ? Blog.query()
            .select(['id', 'title', 'is_active', 'is_pinned', 'updated_at'])
            .orderBy('updated_at', 'desc')
            .limit(5)
        : Promise.resolve([]),

      canViewProjects
        ? Project.query()
            .select(['id', 'title', 'is_active', 'is_pinned', 'updated_at'])
            .orderBy('updated_at', 'desc')
            .limit(5)
        : Promise.resolve([]),

      canViewActivityLogs
        ? ActivityLog.query()
            .select(['id', 'action', 'target', 'createdAt', 'userId'])
            .preload('user', (query) => query.select(['id', 'full_name']))
            .orderBy('createdAt', 'desc')
            .limit(8)
        : Promise.resolve([]),

      canViewGiscus
        ? this.fetchGiscusStats()
        : Promise.resolve({
            enabled: false,
            configured: false,
            repo: null,
            totalDiscussions: null,
            openDiscussions: null,
            totalComments: null,
            fetchedAt: null,
            error: null,
          }),
      canViewUmami
        ? this.fetchUmamiStats(range)
        : Promise.resolve({
            enabled: false,
            configured: false,
            pageviews: null,
            visitors: null,
            visits: null,
            bounceRate: null,
            averageVisitTime: null,
            trend:
              resolvedRange.unit === 'month'
                ? this.buildEmptyMonthlyTrend(
                    DateTime.now().startOf('month').toISODate() || '',
                    DateTime.now().startOf('month').toISODate() || ''
                  )
                : this.buildEmptyTrend(resolvedRange.days || 7),
            fetchedAt: null,
            error: null,
          }),
    ])

    return {
      range,
      rangeLabel: resolvedRange.label,
      trendUnit: resolvedRange.unit,
      visibility: {
        users: canViewUsers,
        blogs: canViewBlogs,
        projects: canViewProjects,
        media: canViewMedia,
        activityLogs: canViewActivityLogs,
        giscus: canViewGiscus,
        umami: canViewUmami,
      },
      counts: {
        users,
        blogs,
        blogsActive,
        blogsPinned,
        projects,
        projectsActive,
        projectsPinned,
        media,
        activityLogs,
        databaseSizeBytes,
      },
      trends: {
        blogs: blogsTrend,
        projects: projectsTrend,
        media: mediaTrend,
        activityLogs: activityLogsTrend,
      },
      recent: {
        blogs: recentBlogs.map((item) => ({
          id: item.id,
          title: item.title,
          is_active: item.is_active,
          is_pinned: item.is_pinned,
          updated_at: item.updated_at ? item.updated_at.toISO() || '' : '',
        })),
        projects: recentProjects.map((item) => ({
          id: item.id,
          title: item.title,
          is_active: item.is_active,
          is_pinned: item.is_pinned,
          updated_at: item.updated_at ? item.updated_at.toISO() || '' : '',
        })),
        activityLogs: recentActivityLogs.map((item) => ({
          id: item.id,
          action: item.action,
          target: item.target,
          created_at: item.createdAt ? item.createdAt.toISO() || '' : '',
          user: item.user
            ? {
                id: item.user.id,
                full_name: item.user.full_name,
              }
            : null,
        })),
      },
      giscus,
      umami,
    }
  }
}
