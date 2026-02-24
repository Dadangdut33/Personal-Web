import { MediaDto } from '#dto/media.dto'
import { getRequestFingerprint, mapRequestToQueryParams, returnError } from '#lib/utils'
import ActivityLogService from '#services/activity_log.service'
import MediaService from '#services/media.service'
import PermissionCheckService from '#services/permission_check.service'
import { PaginationMeta } from '#types/app'
import { mediaUploadAPIValidator } from '#validators/media'

import cache from '@adonisjs/cache/services/main'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'

@inject()
export default class MediaController {
  constructor(
    protected mediaSvc: MediaService,
    protected permChecker: PermissionCheckService,
    protected activityLogSvc: ActivityLogService
  ) {}

  async viewList({ request, bouncer, inertia, auth }: HttpContext) {
    await bouncer.with('MediaPolicy').authorize('view')

    const q = mapRequestToQueryParams(request)
    const dataQ = await this.mediaSvc.indexByUser(auth.user!, q)

    return inertia.render('dashboard/media/list', {
      data: MediaDto.collect(dataQ.all()),
      meta: dataQ.getMeta() as PaginationMeta,
    })
  }

  async destroy({ response, params, bouncer, auth, request }: HttpContext) {
    try {
      await bouncer.with('MediaPolicy').authorize('delete')

      const id = params.id
      await bouncer.with('MediaPolicy').authorize('accessByTag', id)

      await this.mediaSvc.delete(id)
      await this.activityLogSvc.log(
        auth.user!.id,
        'delete_media',
        `Deleted media with id:\n\`\`\`\n${id}\n\`\`\``,
        getRequestFingerprint(request)
      )

      return response.status(200).json({
        status: 'success',
        message: 'Successfully deleted media.',
      })
    } catch (error) {
      return returnError(response, error, 'MEDIA_DELETE', {})
    }
  }

  async bulkDestroy({ response, request, bouncer, auth }: HttpContext) {
    try {
      await bouncer.with('MediaPolicy').authorize('delete')

      const { ids } = request.only(['ids'])
      if (!ids || !Array.isArray(ids)) return response.badRequest('Invalid ids provided')

      await bouncer.with('MediaPolicy').authorize('accessBulkByTag', ids)

      await this.mediaSvc.deleteBulk(ids)
      await this.activityLogSvc.log(
        auth.user!.id,
        'bulk_delete_media',
        `Deleted media ids:\n\`\`\`\n${ids.map((id) => `- ${id}`).join('\n')}\n\`\`\``,
        getRequestFingerprint(request)
      )

      return response.status(200).json({
        status: 'success',
        message: 'Successfully deleted selected media.',
      })
    } catch (error) {
      return returnError(response, error, 'MEDIA_BULK_DELETE', {})
    }
  }

  async redirectMediaAPI({ request, response, params }: HttpContext) {
    // must be a valid signed URL
    // ex to make: router.builder().params({ id: xxx }).makeSigned('api.v1.media.redirect')
    if (!request.hasValidSignature()) {
      return response.badRequest('Invalid or expired URL')
    }

    try {
      const { id } = params
      if (!id) return response.abort(404)

      const url = await cache.getOrSet({
        key: 'media-' + id,
        ttl: '1h',
        factory: async () => {
          return await this.mediaSvc.getMediaURLById(id)
        },
        onFactoryError(error) {
          logger.error(error, 'MEDIA_PROXY_FACTORY_ERROR ' + id)
        },
      })

      if (!url) return response.abort(404)

      return response.redirect(url)
    } catch (error) {
      return returnError(response, error, `MEDIA_PROXY`, { logErrors: true })
    }
  }

  async getMediaListAPI({ request, response, bouncer, auth }: HttpContext) {
    try {
      await bouncer.with('MediaPolicy').authorize('view')

      const q = mapRequestToQueryParams(request)
      const dataQ = await this.mediaSvc.indexByUser(auth.user!, q)

      return response.status(200).json({
        status: 'success',
        data: MediaDto.collect(dataQ.all()),
        meta: dataQ.getMeta(),
      })
    } catch (error) {
      return returnError(response, error, 'MEDIA_LIST', {})
    }
  }

  async uploadMediaAPI({ request, response, bouncer, auth }: HttpContext) {
    try {
      await bouncer.with('MediaPolicy').authorize('create', request)

      const userId = auth.user!.id
      const payload = await request.validateUsing(mediaUploadAPIValidator)
      const onDupe = payload.tags?.includes('blog-content') ? 'use_old' : 'add'

      const media = await this.mediaSvc.upload(payload.file, {
        keyPrefix: `${userId}/uploads`,
        tags: payload.tags,
        onDupe,
      })

      await this.activityLogSvc.log(
        userId,
        'upload_media',
        `Uploaded media with id:\n\`\`\`\n${media.id}\n\`\`\``,
        getRequestFingerprint(request)
      )

      return response.status(201).json({
        status: 'success',
        message: 'File uploaded successfully.',
        data: new MediaDto(media),
      })
    } catch (error) {
      return returnError(response, error, 'MEDIA_UPLOAD', { logValidation: true })
    }
  }

  async deleteMediaAPI({ request, response, bouncer, auth }: HttpContext) {
    try {
      await bouncer.with('MediaPolicy').authorize('delete')

      const { id } = request.only(['id'])
      if (!id) return response.badRequest('Media id is required')

      await bouncer.with('MediaPolicy').authorize('accessByTag', id)

      await this.mediaSvc.delete(id)
      await this.activityLogSvc.log(
        auth.user!.id,
        'delete_media',
        `Deleted media with id:\n\`\`\`\n${id}\n\`\`\``,
        getRequestFingerprint(request)
      )

      return response.status(200).json({
        status: 'success',
        message: 'Successfully deleted media.',
      })
    } catch (error) {
      return returnError(response, error, 'MEDIA_DELETE', {})
    }
  }
}
