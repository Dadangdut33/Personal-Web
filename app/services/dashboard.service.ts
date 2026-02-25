import Tables from '#enums/tables'
import ActivityLog from '#models/activity_log'
import Blog from '#models/blog'
import Project from '#models/project'
import User from '#models/user'
import env from '#start/env'

import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

type TrendPoint = {
  date: string
  count: number
}

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

export type DashboardOverview = {
  visibility: {
    users: boolean
    blogs: boolean
    projects: boolean
    media: boolean
    activityLogs: boolean
    giscus: boolean
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
}

@inject()
export default class DashboardService {
  private async count(tableName: Tables, where?: Record<string, any>) {
    const query = db.from(tableName)
    if (where) query.where(where)

    const result = await query.count('* as total').first()
    return Number((result as any)?.total ?? 0)
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

    const endpoint = 'https://api.github.com/graphql'
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }

    try {
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

  async getUserPermissions(user: User): Promise<string[]> {
    const roles = await user.related('roles').query().preload('permissions')
    const flatPermissions = roles.flatMap((role) =>
      role.permissions.map((permission) => permission.name)
    )
    return Array.from(new Set(flatPermissions))
  }

  async getOverview(permissions: string[]): Promise<DashboardOverview> {
    const canViewUsers = permissions.includes('user.view')
    const canViewBlogs = permissions.includes('blog.view')
    const canViewProjects = permissions.includes('project.view')
    const canViewMedia = permissions.includes('media.view')
    const canViewActivityLogs = permissions.includes('activity_log.view')
    const canViewGiscus = canViewBlogs

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
      blogsTrend,
      projectsTrend,
      mediaTrend,
      activityLogsTrend,
      recentBlogs,
      recentProjects,
      recentActivityLogs,
      giscus,
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

      canViewBlogs ? this.getDailyTrend(Tables.BLOGS) : Promise.resolve(this.buildEmptyTrend()),
      canViewProjects
        ? this.getDailyTrend(Tables.PROJECTS)
        : Promise.resolve(this.buildEmptyTrend()),
      canViewMedia ? this.getDailyTrend(Tables.MEDIAS) : Promise.resolve(this.buildEmptyTrend()),
      canViewActivityLogs
        ? this.getDailyTrend(Tables.ACTIVITY_LOGS, 'created_at')
        : Promise.resolve(this.buildEmptyTrend()),

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
    ])

    return {
      visibility: {
        users: canViewUsers,
        blogs: canViewBlogs,
        projects: canViewProjects,
        media: canViewMedia,
        activityLogs: canViewActivityLogs,
        giscus: canViewGiscus,
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
    }
  }
}
