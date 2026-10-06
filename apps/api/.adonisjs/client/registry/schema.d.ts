/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'drive.fs.serve': {
    methods: ["GET","HEAD"]
    pattern: '/uploads/*'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { '*': ParamValue[] }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'web.account_management.profile.view': {
    methods: ["GET","HEAD"]
    pattern: '/web/account-management/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/web/account_management/profile/controllers/view.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/web/account_management/profile/controllers/view.controller').default['handle']>>>
    }
  }
  'web.account_management.profile.update': {
    methods: ["PUT"]
    pattern: '/web/account-management/profile'
    types: {
      body: ExtractBody<InferInput<(typeof import('#src/features/web/account_management/profile/controllers/update.controller').default)['payloadSchema']>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#src/features/web/account_management/profile/controllers/update.controller').default)['payloadSchema']>>
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/web/account_management/profile/controllers/update.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/web/account_management/profile/controllers/update.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'web.account_management.profile.delete': {
    methods: ["DELETE"]
    pattern: '/web/account-management/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/web/account_management/profile/controllers/delete.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/web/account_management/profile/controllers/delete.controller').default['handle']>>>
    }
  }
  'inauguration.backoffice.guests.list': {
    methods: ["GET","HEAD"]
    pattern: '/backoffice/guests'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#src/features/inauguration/backoffice/guests/controllers/list.controller').default)['payloadSchema']>>
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/backoffice/guests/controllers/list.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/backoffice/guests/controllers/list.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'inauguration.backoffice.guests.create': {
    methods: ["POST"]
    pattern: '/backoffice/guests'
    types: {
      body: ExtractBody<InferInput<(typeof import('#src/features/inauguration/backoffice/guests/controllers/create.controller').default)['payloadSchema']>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#src/features/inauguration/backoffice/guests/controllers/create.controller').default)['payloadSchema']>>
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/backoffice/guests/controllers/create.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/backoffice/guests/controllers/create.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'inauguration.backoffice.guests.import': {
    methods: ["POST"]
    pattern: '/backoffice/guests/import'
    types: {
      body: ExtractBody<InferInput<(typeof import('#src/features/inauguration/backoffice/guests/controllers/import.controller').default)['payloadSchema']>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#src/features/inauguration/backoffice/guests/controllers/import.controller').default)['payloadSchema']>>
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/backoffice/guests/controllers/import.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/backoffice/guests/controllers/import.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'inauguration.backoffice.guests.export': {
    methods: ["GET","HEAD"]
    pattern: '/backoffice/guests/export.csv'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/backoffice/guests/controllers/export.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/backoffice/guests/controllers/export.controller').default['handle']>>>
    }
  }
  'inauguration.backoffice.guests.qr_sheet': {
    methods: ["GET","HEAD"]
    pattern: '/backoffice/guests/qr-sheet'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#src/features/inauguration/backoffice/guests/controllers/qr_sheet.controller').default)['payloadSchema']>>
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/backoffice/guests/controllers/qr_sheet.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/backoffice/guests/controllers/qr_sheet.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'inauguration.backoffice.guests.view': {
    methods: ["GET","HEAD"]
    pattern: '/backoffice/guests/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/backoffice/guests/controllers/view.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/backoffice/guests/controllers/view.controller').default['handle']>>>
    }
  }
  'inauguration.backoffice.guests.update': {
    methods: ["PUT"]
    pattern: '/backoffice/guests/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#src/features/inauguration/backoffice/guests/controllers/update.controller').default)['payloadSchema']>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#src/features/inauguration/backoffice/guests/controllers/update.controller').default)['payloadSchema']>>
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/backoffice/guests/controllers/update.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/backoffice/guests/controllers/update.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'inauguration.backoffice.guests.delete': {
    methods: ["DELETE"]
    pattern: '/backoffice/guests/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/backoffice/guests/controllers/delete.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/backoffice/guests/controllers/delete.controller').default['handle']>>>
    }
  }
  'inauguration.backoffice.guests.qr_png': {
    methods: ["GET","HEAD"]
    pattern: '/backoffice/guests/:id/qr.png'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/backoffice/guests/controllers/qr_png.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/backoffice/guests/controllers/qr_png.controller').default['handle']>>>
    }
  }
  'inauguration.backoffice.guests.qr_svg': {
    methods: ["GET","HEAD"]
    pattern: '/backoffice/guests/:id/qr.svg'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/backoffice/guests/controllers/qr_svg.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/backoffice/guests/controllers/qr_svg.controller').default['handle']>>>
    }
  }
  'inauguration.backoffice.staff.list': {
    methods: ["GET","HEAD"]
    pattern: '/backoffice/staff'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/backoffice/staff/controllers/list.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/backoffice/staff/controllers/list.controller').default['handle']>>>
    }
  }
  'inauguration.backoffice.dashboard.view': {
    methods: ["GET","HEAD"]
    pattern: '/backoffice/dashboard'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/backoffice/dashboard/controllers/view.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/backoffice/dashboard/controllers/view.controller').default['handle']>>>
    }
  }
  'inauguration.backoffice.handoffs.list': {
    methods: ["GET","HEAD"]
    pattern: '/backoffice/handoffs'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#src/features/inauguration/backoffice/handoffs/controllers/list.controller').default)['payloadSchema']>>
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/backoffice/handoffs/controllers/list.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/backoffice/handoffs/controllers/list.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'inauguration.backoffice.handoffs.update': {
    methods: ["PATCH"]
    pattern: '/backoffice/handoffs/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#src/features/inauguration/backoffice/handoffs/controllers/update.controller').default)['payloadSchema']>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#src/features/inauguration/backoffice/handoffs/controllers/update.controller').default)['payloadSchema']>>
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/backoffice/handoffs/controllers/update.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/backoffice/handoffs/controllers/update.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'inauguration.backoffice.conversations.list': {
    methods: ["GET","HEAD"]
    pattern: '/backoffice/conversations'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#src/features/inauguration/backoffice/conversations/controllers/list.controller').default)['payloadSchema']>>
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/backoffice/conversations/controllers/list.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/backoffice/conversations/controllers/list.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'inauguration.backoffice.conversations.view': {
    methods: ["GET","HEAD"]
    pattern: '/backoffice/conversations/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/backoffice/conversations/controllers/view.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/backoffice/conversations/controllers/view.controller').default['handle']>>>
    }
  }
  'inauguration.kiosk.checkin': {
    methods: ["POST"]
    pattern: '/kiosk/checkin'
    types: {
      body: ExtractBody<InferInput<(typeof import('#src/features/inauguration/kiosk/checkin/controllers/checkin.controller').default)['payloadSchema']>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#src/features/inauguration/kiosk/checkin/controllers/checkin.controller').default)['payloadSchema']>>
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/kiosk/checkin/controllers/checkin.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/kiosk/checkin/controllers/checkin.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'inauguration.kiosk.search': {
    methods: ["GET","HEAD"]
    pattern: '/kiosk/guests/search'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#src/features/inauguration/kiosk/checkin/controllers/search.controller').default)['payloadSchema']>>
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/kiosk/checkin/controllers/search.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/kiosk/checkin/controllers/search.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'inauguration.kiosk.speech.cues': {
    methods: ["GET","HEAD"]
    pattern: '/kiosk/speech/cues'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/kiosk/speech/controllers/cues.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/kiosk/speech/controllers/cues.controller').default['handle']>>>
    }
  }
  'inauguration.kiosk.speech.current': {
    methods: ["GET","HEAD"]
    pattern: '/kiosk/speech/current'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/kiosk/speech/controllers/current.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/kiosk/speech/controllers/current.controller').default['handle']>>>
    }
  }
  'inauguration.kiosk.speech.trigger': {
    methods: ["POST"]
    pattern: '/kiosk/speech/trigger'
    types: {
      body: ExtractBody<InferInput<(typeof import('#src/features/inauguration/kiosk/speech/controllers/trigger.controller').default)['payloadSchema']>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#src/features/inauguration/kiosk/speech/controllers/trigger.controller').default)['payloadSchema']>>
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/kiosk/speech/controllers/trigger.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/kiosk/speech/controllers/trigger.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'inauguration.kiosk.speech.reset': {
    methods: ["POST"]
    pattern: '/kiosk/speech/reset'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/kiosk/speech/controllers/reset.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/kiosk/speech/controllers/reset.controller').default['handle']>>>
    }
  }
  'inauguration.kiosk.leif.greeting': {
    methods: ["POST"]
    pattern: '/kiosk/leif/greeting'
    types: {
      body: ExtractBody<InferInput<(typeof import('#src/features/inauguration/leif/kiosk/controllers/greeting.controller').default)['payloadSchema']>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#src/features/inauguration/leif/kiosk/controllers/greeting.controller').default)['payloadSchema']>>
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/leif/kiosk/controllers/greeting.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/leif/kiosk/controllers/greeting.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'inauguration.kiosk.leif.start_session': {
    methods: ["POST"]
    pattern: '/kiosk/leif/sessions'
    types: {
      body: ExtractBody<InferInput<(typeof import('#src/features/inauguration/leif/kiosk/controllers/start_session.controller').default)['payloadSchema']>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#src/features/inauguration/leif/kiosk/controllers/start_session.controller').default)['payloadSchema']>>
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/leif/kiosk/controllers/start_session.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/leif/kiosk/controllers/start_session.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'inauguration.kiosk.leif.message': {
    methods: ["POST"]
    pattern: '/kiosk/leif/sessions/:id/message'
    types: {
      body: ExtractBody<InferInput<(typeof import('#src/features/inauguration/leif/kiosk/controllers/message.controller').default)['payloadSchema']>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#src/features/inauguration/leif/kiosk/controllers/message.controller').default)['payloadSchema']>>
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/leif/kiosk/controllers/message.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/leif/kiosk/controllers/message.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'inauguration.kiosk.leif.handoff': {
    methods: ["POST"]
    pattern: '/kiosk/leif/sessions/:id/handoff'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/leif/kiosk/controllers/handoff.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/leif/kiosk/controllers/handoff.controller').default['handle']>>>
    }
  }
  'inauguration.kiosk.leif.end_session': {
    methods: ["POST"]
    pattern: '/kiosk/leif/sessions/:id/end'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/leif/kiosk/controllers/end_session.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/leif/kiosk/controllers/end_session.controller').default['handle']>>>
    }
  }
  'web.account_management.authentication.login': {
    methods: ["POST"]
    pattern: '/web/account-management/authentication/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#src/features/web/account_management/authentication/controllers/login.controller').default)['payloadSchema']>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#src/features/web/account_management/authentication/controllers/login.controller').default)['payloadSchema']>>
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/web/account_management/authentication/controllers/login.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/web/account_management/authentication/controllers/login.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'web.account_management.authentication.logout': {
    methods: ["DELETE"]
    pattern: '/web/account-management/authentication/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/web/account_management/authentication/controllers/logout.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/web/account_management/authentication/controllers/logout.controller').default['handle']>>>
    }
  }
  'web.account_management.password.forgot': {
    methods: ["POST"]
    pattern: '/web/account-management/password/forgot'
    types: {
      body: ExtractBody<InferInput<(typeof import('#src/features/web/account_management/password/controllers/forgot.controller').default)['payloadSchema']>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#src/features/web/account_management/password/controllers/forgot.controller').default)['payloadSchema']>>
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/web/account_management/password/controllers/forgot.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/web/account_management/password/controllers/forgot.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'web.account_management.password.reset': {
    methods: ["POST"]
    pattern: '/web/account-management/password/reset'
    types: {
      body: ExtractBody<InferInput<(typeof import('#src/features/web/account_management/password/controllers/reset.controller').default)['payloadSchema']>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#src/features/web/account_management/password/controllers/reset.controller').default)['payloadSchema']>>
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/web/account_management/password/controllers/reset.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/web/account_management/password/controllers/reset.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'web.account_management.password.update': {
    methods: ["PUT"]
    pattern: '/web/account-management/password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#src/features/web/account_management/password/controllers/update.controller').default)['payloadSchema']>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#src/features/web/account_management/password/controllers/update.controller').default)['payloadSchema']>>
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/web/account_management/password/controllers/update.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/web/account_management/password/controllers/update.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'inauguration.invitations.view': {
    methods: ["GET","HEAD"]
    pattern: '/invitations/:token'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/invitation/controllers/view.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/invitation/controllers/view.controller').default['handle']>>>
    }
  }
  'inauguration.invitations.respond': {
    methods: ["POST"]
    pattern: '/invitations/:token/rsvp'
    types: {
      body: ExtractBody<InferInput<(typeof import('#src/features/inauguration/invitation/controllers/respond.controller').default)['payloadSchema']>>
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#src/features/inauguration/invitation/controllers/respond.controller').default)['payloadSchema']>>
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/invitation/controllers/respond.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/invitation/controllers/respond.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'inauguration.invitations.consent': {
    methods: ["POST"]
    pattern: '/invitations/:token/consent'
    types: {
      body: ExtractBody<InferInput<(typeof import('#src/features/inauguration/invitation/controllers/consent.controller').default)['payloadSchema']>>
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#src/features/inauguration/invitation/controllers/consent.controller').default)['payloadSchema']>>
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/invitation/controllers/consent.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/invitation/controllers/consent.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'inauguration.invitations.update_plus_one': {
    methods: ["PUT"]
    pattern: '/invitations/:token/plus-one'
    types: {
      body: ExtractBody<InferInput<(typeof import('#src/features/inauguration/invitation/controllers/update_plus_one.controller').default)['payloadSchema']>>
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#src/features/inauguration/invitation/controllers/update_plus_one.controller').default)['payloadSchema']>>
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/invitation/controllers/update_plus_one.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/invitation/controllers/update_plus_one.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'inauguration.invitations.delete_plus_one': {
    methods: ["DELETE"]
    pattern: '/invitations/:token/plus-one'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/invitation/controllers/delete_plus_one.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/invitation/controllers/delete_plus_one.controller').default['handle']>>>
    }
  }
  'inauguration.invitations.calendar': {
    methods: ["GET","HEAD"]
    pattern: '/invitations/:token/calendar.ics'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/invitation/controllers/calendar.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/invitation/controllers/calendar.controller').default['handle']>>>
    }
  }
  'inauguration.invitations.qr_code': {
    methods: ["GET","HEAD"]
    pattern: '/invitations/:token/qr.png'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/invitation/controllers/qr_code.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/invitation/controllers/qr_code.controller').default['handle']>>>
    }
  }
  'inauguration.invitations.leif.message': {
    methods: ["POST"]
    pattern: '/invitations/:token/leif/message'
    types: {
      body: ExtractBody<InferInput<(typeof import('#src/features/inauguration/leif/signup/controllers/message.controller').default)['payloadSchema']>>
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#src/features/inauguration/leif/signup/controllers/message.controller').default)['payloadSchema']>>
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/leif/signup/controllers/message.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/leif/signup/controllers/message.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'inauguration.leif.tts': {
    methods: ["POST"]
    pattern: '/leif/tts'
    types: {
      body: ExtractBody<InferInput<(typeof import('#src/features/inauguration/leif/voice/controllers/tts.controller').default)['payloadSchema']>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#src/features/inauguration/leif/voice/controllers/tts.controller').default)['payloadSchema']>>
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/leif/voice/controllers/tts.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/leif/voice/controllers/tts.controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'inauguration.leif.stt': {
    methods: ["POST"]
    pattern: '/leif/stt'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#src/features/inauguration/leif/voice/controllers/stt.controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#src/features/inauguration/leif/voice/controllers/stt.controller').default['handle']>>>
    }
  }
}
