import env from '#start/env'

import cache from '@adonisjs/cache/services/main'
import { inject } from '@adonisjs/core'
import axios from 'axios'

type UmamiApiConfig = {
  baseUrl: string
  websiteId: string
  apiKey: string | null
  username: string | null
  password: string | null
}

type WebsiteStatsResponse = {
  stats: any
  pageviews: any
}

@inject()
export default class UmamiService {
  getApiConfig(): UmamiApiConfig | null {
    const websiteId = env.get('UMAMI_ID')
    if (!websiteId) return null

    const explicitApiUrl = env.get('UMAMI_API_URL')
    const scriptUrl = env.get('UMAMI_SCRIPT_URL')

    let baseUrl = explicitApiUrl || null
    if (!baseUrl && scriptUrl) {
      try {
        const parsed = new URL(scriptUrl)
        baseUrl = `${parsed.origin}/api`
      } catch {
        baseUrl = null
      }
    }

    if (!baseUrl) return null

    const apiKey = env.get('UMAMI_API_KEY')
    const username = env.get('UMAMI_USERNAME')
    const password = env.get('UMAMI_PASSWORD')

    if (!apiKey && (!username || !password)) return null

    return {
      baseUrl: baseUrl.replace(/\/+$/, ''),
      websiteId,
      apiKey: apiKey || null,
      username: username || null,
      password: password || null,
    }
  }

  private async getAuthHeaders(config: UmamiApiConfig): Promise<Record<string, string>> {
    if (config.apiKey) {
      return {
        'x-umami-api-key': config.apiKey,
      }
    }

    if (!config.username || !config.password) return {}

    const token = await cache.getOrSet({
      key: `umami:auth:token:${config.baseUrl}:${config.username}`,
      ttl: '5m',
      factory: async () => {
        try {
          const loginRes = await axios.post<{ token?: string }>(
            `${config.baseUrl}/auth/login`,
            {
              username: config.username,
              password: config.password,
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          )

          return loginRes.data?.token || null
        } catch {
          return null
        }
      },
    })

    if (!token || typeof token !== 'string') return {}
    return {
      Authorization: `Bearer ${token}`,
    }
  }

  async fetchWebsiteStats(params: {
    startAt: number
    endAt: number
    unit: 'day' | 'month'
  }): Promise<WebsiteStatsResponse> {
    const config = this.getApiConfig()
    if (!config) throw new Error('Umami API is not configured')

    const statsUrl = new URL(
      `${config.baseUrl}/websites/${config.websiteId}/stats`.replace(/([^:]\/)\/+/g, '$1')
    )
    statsUrl.searchParams.set('startAt', String(params.startAt))
    statsUrl.searchParams.set('endAt', String(params.endAt))

    const pageviewsUrl = new URL(
      `${config.baseUrl}/websites/${config.websiteId}/pageviews`.replace(/([^:]\/)\/+/g, '$1')
    )
    pageviewsUrl.searchParams.set('startAt', String(params.startAt))
    pageviewsUrl.searchParams.set('endAt', String(params.endAt))
    pageviewsUrl.searchParams.set('unit', params.unit)

    const headers = await this.getAuthHeaders(config)
    if (!Object.keys(headers).length) {
      throw new Error('Missing Umami API authentication')
    }

    const [statsRes, pageviewsRes] = await Promise.all([
      axios.get(statsUrl.toString(), { headers }),
      axios.get(pageviewsUrl.toString(), { headers }),
    ])

    const stats = statsRes.data as any
    const pageviews = pageviewsRes.data as any
    return { stats, pageviews }
  }

  async fetchPathViewCount(pathOrUrl: string): Promise<number | null> {
    const config = this.getApiConfig()
    if (!config) return null

    const normalizedPath = (() => {
      try {
        return new URL(pathOrUrl, env.get('APP_URL')).pathname
      } catch {
        return pathOrUrl
      }
    })()

    const statsUrl = new URL(
      `${config.baseUrl}/websites/${config.websiteId}/stats`.replace(/([^:]\/)\/+/g, '$1')
    )
    statsUrl.searchParams.set('startAt', '0')
    statsUrl.searchParams.set('endAt', String(Date.now()))
    // Keep both keys for broader compatibility across Umami versions.
    statsUrl.searchParams.set('path', normalizedPath)
    statsUrl.searchParams.set('url', normalizedPath)

    const headers = await this.getAuthHeaders(config)
    if (!Object.keys(headers).length) return null

    const res = await axios.get(statsUrl.toString(), {
      headers,
    })
    const json = res.data as any
    const raw = json?.pageviews?.value ?? json?.pageviews ?? null
    const count = Number(raw)
    return Number.isFinite(count) ? count : null
  }

  async fetchAggregatePathViewCount(paths: string[]): Promise<number | null> {
    const uniquePaths = Array.from(new Set(paths.map((path) => path.trim()).filter(Boolean)))
    if (uniquePaths.length === 0) return null

    const counts = await Promise.all(uniquePaths.map((path) => this.fetchPathViewCount(path)))
    const valid = counts.filter((value): value is number => typeof value === 'number')
    if (valid.length === 0) return null
    return valid.reduce((total, value) => total + value, 0)
  }
}
