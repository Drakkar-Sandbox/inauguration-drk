/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'drive.fs.serve': {
    methods: ["GET","HEAD"],
    pattern: '/uploads/*',
    tokens: [{"old":"/uploads/*","type":0,"val":"uploads","end":""},{"old":"/uploads/*","type":2,"val":"*","end":""}],
    types: placeholder as Registry['drive.fs.serve']['types'],
  },
  'web.account_management.profile.view': {
    methods: ["GET","HEAD"],
    pattern: '/web/account-management/profile',
    tokens: [{"old":"/web/account-management/profile","type":0,"val":"web","end":""},{"old":"/web/account-management/profile","type":0,"val":"account-management","end":""},{"old":"/web/account-management/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['web.account_management.profile.view']['types'],
  },
  'web.account_management.profile.update': {
    methods: ["PUT"],
    pattern: '/web/account-management/profile',
    tokens: [{"old":"/web/account-management/profile","type":0,"val":"web","end":""},{"old":"/web/account-management/profile","type":0,"val":"account-management","end":""},{"old":"/web/account-management/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['web.account_management.profile.update']['types'],
  },
  'web.account_management.profile.delete': {
    methods: ["DELETE"],
    pattern: '/web/account-management/profile',
    tokens: [{"old":"/web/account-management/profile","type":0,"val":"web","end":""},{"old":"/web/account-management/profile","type":0,"val":"account-management","end":""},{"old":"/web/account-management/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['web.account_management.profile.delete']['types'],
  },
  'inauguration.backoffice.guests.list': {
    methods: ["GET","HEAD"],
    pattern: '/backoffice/guests',
    tokens: [{"old":"/backoffice/guests","type":0,"val":"backoffice","end":""},{"old":"/backoffice/guests","type":0,"val":"guests","end":""}],
    types: placeholder as Registry['inauguration.backoffice.guests.list']['types'],
  },
  'inauguration.backoffice.guests.create': {
    methods: ["POST"],
    pattern: '/backoffice/guests',
    tokens: [{"old":"/backoffice/guests","type":0,"val":"backoffice","end":""},{"old":"/backoffice/guests","type":0,"val":"guests","end":""}],
    types: placeholder as Registry['inauguration.backoffice.guests.create']['types'],
  },
  'inauguration.backoffice.guests.import': {
    methods: ["POST"],
    pattern: '/backoffice/guests/import',
    tokens: [{"old":"/backoffice/guests/import","type":0,"val":"backoffice","end":""},{"old":"/backoffice/guests/import","type":0,"val":"guests","end":""},{"old":"/backoffice/guests/import","type":0,"val":"import","end":""}],
    types: placeholder as Registry['inauguration.backoffice.guests.import']['types'],
  },
  'inauguration.backoffice.guests.export': {
    methods: ["GET","HEAD"],
    pattern: '/backoffice/guests/export.csv',
    tokens: [{"old":"/backoffice/guests/export.csv","type":0,"val":"backoffice","end":""},{"old":"/backoffice/guests/export.csv","type":0,"val":"guests","end":""},{"old":"/backoffice/guests/export.csv","type":0,"val":"export.csv","end":""}],
    types: placeholder as Registry['inauguration.backoffice.guests.export']['types'],
  },
  'inauguration.backoffice.guests.qr_sheet': {
    methods: ["GET","HEAD"],
    pattern: '/backoffice/guests/qr-sheet',
    tokens: [{"old":"/backoffice/guests/qr-sheet","type":0,"val":"backoffice","end":""},{"old":"/backoffice/guests/qr-sheet","type":0,"val":"guests","end":""},{"old":"/backoffice/guests/qr-sheet","type":0,"val":"qr-sheet","end":""}],
    types: placeholder as Registry['inauguration.backoffice.guests.qr_sheet']['types'],
  },
  'inauguration.backoffice.guests.view': {
    methods: ["GET","HEAD"],
    pattern: '/backoffice/guests/:id',
    tokens: [{"old":"/backoffice/guests/:id","type":0,"val":"backoffice","end":""},{"old":"/backoffice/guests/:id","type":0,"val":"guests","end":""},{"old":"/backoffice/guests/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['inauguration.backoffice.guests.view']['types'],
  },
  'inauguration.backoffice.guests.update': {
    methods: ["PUT"],
    pattern: '/backoffice/guests/:id',
    tokens: [{"old":"/backoffice/guests/:id","type":0,"val":"backoffice","end":""},{"old":"/backoffice/guests/:id","type":0,"val":"guests","end":""},{"old":"/backoffice/guests/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['inauguration.backoffice.guests.update']['types'],
  },
  'inauguration.backoffice.guests.delete': {
    methods: ["DELETE"],
    pattern: '/backoffice/guests/:id',
    tokens: [{"old":"/backoffice/guests/:id","type":0,"val":"backoffice","end":""},{"old":"/backoffice/guests/:id","type":0,"val":"guests","end":""},{"old":"/backoffice/guests/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['inauguration.backoffice.guests.delete']['types'],
  },
  'inauguration.backoffice.guests.qr_png': {
    methods: ["GET","HEAD"],
    pattern: '/backoffice/guests/:id/qr.png',
    tokens: [{"old":"/backoffice/guests/:id/qr.png","type":0,"val":"backoffice","end":""},{"old":"/backoffice/guests/:id/qr.png","type":0,"val":"guests","end":""},{"old":"/backoffice/guests/:id/qr.png","type":1,"val":"id","end":""},{"old":"/backoffice/guests/:id/qr.png","type":0,"val":"qr.png","end":""}],
    types: placeholder as Registry['inauguration.backoffice.guests.qr_png']['types'],
  },
  'inauguration.backoffice.guests.qr_svg': {
    methods: ["GET","HEAD"],
    pattern: '/backoffice/guests/:id/qr.svg',
    tokens: [{"old":"/backoffice/guests/:id/qr.svg","type":0,"val":"backoffice","end":""},{"old":"/backoffice/guests/:id/qr.svg","type":0,"val":"guests","end":""},{"old":"/backoffice/guests/:id/qr.svg","type":1,"val":"id","end":""},{"old":"/backoffice/guests/:id/qr.svg","type":0,"val":"qr.svg","end":""}],
    types: placeholder as Registry['inauguration.backoffice.guests.qr_svg']['types'],
  },
  'inauguration.backoffice.staff.list': {
    methods: ["GET","HEAD"],
    pattern: '/backoffice/staff',
    tokens: [{"old":"/backoffice/staff","type":0,"val":"backoffice","end":""},{"old":"/backoffice/staff","type":0,"val":"staff","end":""}],
    types: placeholder as Registry['inauguration.backoffice.staff.list']['types'],
  },
  'inauguration.backoffice.dashboard.view': {
    methods: ["GET","HEAD"],
    pattern: '/backoffice/dashboard',
    tokens: [{"old":"/backoffice/dashboard","type":0,"val":"backoffice","end":""},{"old":"/backoffice/dashboard","type":0,"val":"dashboard","end":""}],
    types: placeholder as Registry['inauguration.backoffice.dashboard.view']['types'],
  },
  'inauguration.backoffice.handoffs.list': {
    methods: ["GET","HEAD"],
    pattern: '/backoffice/handoffs',
    tokens: [{"old":"/backoffice/handoffs","type":0,"val":"backoffice","end":""},{"old":"/backoffice/handoffs","type":0,"val":"handoffs","end":""}],
    types: placeholder as Registry['inauguration.backoffice.handoffs.list']['types'],
  },
  'inauguration.backoffice.handoffs.update': {
    methods: ["PATCH"],
    pattern: '/backoffice/handoffs/:id',
    tokens: [{"old":"/backoffice/handoffs/:id","type":0,"val":"backoffice","end":""},{"old":"/backoffice/handoffs/:id","type":0,"val":"handoffs","end":""},{"old":"/backoffice/handoffs/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['inauguration.backoffice.handoffs.update']['types'],
  },
  'inauguration.backoffice.conversations.list': {
    methods: ["GET","HEAD"],
    pattern: '/backoffice/conversations',
    tokens: [{"old":"/backoffice/conversations","type":0,"val":"backoffice","end":""},{"old":"/backoffice/conversations","type":0,"val":"conversations","end":""}],
    types: placeholder as Registry['inauguration.backoffice.conversations.list']['types'],
  },
  'inauguration.backoffice.conversations.view': {
    methods: ["GET","HEAD"],
    pattern: '/backoffice/conversations/:id',
    tokens: [{"old":"/backoffice/conversations/:id","type":0,"val":"backoffice","end":""},{"old":"/backoffice/conversations/:id","type":0,"val":"conversations","end":""},{"old":"/backoffice/conversations/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['inauguration.backoffice.conversations.view']['types'],
  },
  'inauguration.kiosk.checkin': {
    methods: ["POST"],
    pattern: '/kiosk/checkin',
    tokens: [{"old":"/kiosk/checkin","type":0,"val":"kiosk","end":""},{"old":"/kiosk/checkin","type":0,"val":"checkin","end":""}],
    types: placeholder as Registry['inauguration.kiosk.checkin']['types'],
  },
  'inauguration.kiosk.search': {
    methods: ["GET","HEAD"],
    pattern: '/kiosk/guests/search',
    tokens: [{"old":"/kiosk/guests/search","type":0,"val":"kiosk","end":""},{"old":"/kiosk/guests/search","type":0,"val":"guests","end":""},{"old":"/kiosk/guests/search","type":0,"val":"search","end":""}],
    types: placeholder as Registry['inauguration.kiosk.search']['types'],
  },
  'inauguration.kiosk.speech.cues': {
    methods: ["GET","HEAD"],
    pattern: '/kiosk/speech/cues',
    tokens: [{"old":"/kiosk/speech/cues","type":0,"val":"kiosk","end":""},{"old":"/kiosk/speech/cues","type":0,"val":"speech","end":""},{"old":"/kiosk/speech/cues","type":0,"val":"cues","end":""}],
    types: placeholder as Registry['inauguration.kiosk.speech.cues']['types'],
  },
  'inauguration.kiosk.speech.current': {
    methods: ["GET","HEAD"],
    pattern: '/kiosk/speech/current',
    tokens: [{"old":"/kiosk/speech/current","type":0,"val":"kiosk","end":""},{"old":"/kiosk/speech/current","type":0,"val":"speech","end":""},{"old":"/kiosk/speech/current","type":0,"val":"current","end":""}],
    types: placeholder as Registry['inauguration.kiosk.speech.current']['types'],
  },
  'inauguration.kiosk.speech.trigger': {
    methods: ["POST"],
    pattern: '/kiosk/speech/trigger',
    tokens: [{"old":"/kiosk/speech/trigger","type":0,"val":"kiosk","end":""},{"old":"/kiosk/speech/trigger","type":0,"val":"speech","end":""},{"old":"/kiosk/speech/trigger","type":0,"val":"trigger","end":""}],
    types: placeholder as Registry['inauguration.kiosk.speech.trigger']['types'],
  },
  'inauguration.kiosk.speech.reset': {
    methods: ["POST"],
    pattern: '/kiosk/speech/reset',
    tokens: [{"old":"/kiosk/speech/reset","type":0,"val":"kiosk","end":""},{"old":"/kiosk/speech/reset","type":0,"val":"speech","end":""},{"old":"/kiosk/speech/reset","type":0,"val":"reset","end":""}],
    types: placeholder as Registry['inauguration.kiosk.speech.reset']['types'],
  },
  'web.account_management.authentication.login': {
    methods: ["POST"],
    pattern: '/web/account-management/authentication/login',
    tokens: [{"old":"/web/account-management/authentication/login","type":0,"val":"web","end":""},{"old":"/web/account-management/authentication/login","type":0,"val":"account-management","end":""},{"old":"/web/account-management/authentication/login","type":0,"val":"authentication","end":""},{"old":"/web/account-management/authentication/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['web.account_management.authentication.login']['types'],
  },
  'web.account_management.authentication.logout': {
    methods: ["DELETE"],
    pattern: '/web/account-management/authentication/logout',
    tokens: [{"old":"/web/account-management/authentication/logout","type":0,"val":"web","end":""},{"old":"/web/account-management/authentication/logout","type":0,"val":"account-management","end":""},{"old":"/web/account-management/authentication/logout","type":0,"val":"authentication","end":""},{"old":"/web/account-management/authentication/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['web.account_management.authentication.logout']['types'],
  },
  'web.account_management.password.forgot': {
    methods: ["POST"],
    pattern: '/web/account-management/password/forgot',
    tokens: [{"old":"/web/account-management/password/forgot","type":0,"val":"web","end":""},{"old":"/web/account-management/password/forgot","type":0,"val":"account-management","end":""},{"old":"/web/account-management/password/forgot","type":0,"val":"password","end":""},{"old":"/web/account-management/password/forgot","type":0,"val":"forgot","end":""}],
    types: placeholder as Registry['web.account_management.password.forgot']['types'],
  },
  'web.account_management.password.reset': {
    methods: ["POST"],
    pattern: '/web/account-management/password/reset',
    tokens: [{"old":"/web/account-management/password/reset","type":0,"val":"web","end":""},{"old":"/web/account-management/password/reset","type":0,"val":"account-management","end":""},{"old":"/web/account-management/password/reset","type":0,"val":"password","end":""},{"old":"/web/account-management/password/reset","type":0,"val":"reset","end":""}],
    types: placeholder as Registry['web.account_management.password.reset']['types'],
  },
  'web.account_management.password.update': {
    methods: ["PUT"],
    pattern: '/web/account-management/password',
    tokens: [{"old":"/web/account-management/password","type":0,"val":"web","end":""},{"old":"/web/account-management/password","type":0,"val":"account-management","end":""},{"old":"/web/account-management/password","type":0,"val":"password","end":""}],
    types: placeholder as Registry['web.account_management.password.update']['types'],
  },
  'inauguration.invitations.view': {
    methods: ["GET","HEAD"],
    pattern: '/invitations/:token',
    tokens: [{"old":"/invitations/:token","type":0,"val":"invitations","end":""},{"old":"/invitations/:token","type":1,"val":"token","end":""}],
    types: placeholder as Registry['inauguration.invitations.view']['types'],
  },
  'inauguration.invitations.respond': {
    methods: ["POST"],
    pattern: '/invitations/:token/rsvp',
    tokens: [{"old":"/invitations/:token/rsvp","type":0,"val":"invitations","end":""},{"old":"/invitations/:token/rsvp","type":1,"val":"token","end":""},{"old":"/invitations/:token/rsvp","type":0,"val":"rsvp","end":""}],
    types: placeholder as Registry['inauguration.invitations.respond']['types'],
  },
  'inauguration.invitations.consent': {
    methods: ["POST"],
    pattern: '/invitations/:token/consent',
    tokens: [{"old":"/invitations/:token/consent","type":0,"val":"invitations","end":""},{"old":"/invitations/:token/consent","type":1,"val":"token","end":""},{"old":"/invitations/:token/consent","type":0,"val":"consent","end":""}],
    types: placeholder as Registry['inauguration.invitations.consent']['types'],
  },
  'inauguration.invitations.update_plus_one': {
    methods: ["PUT"],
    pattern: '/invitations/:token/plus-one',
    tokens: [{"old":"/invitations/:token/plus-one","type":0,"val":"invitations","end":""},{"old":"/invitations/:token/plus-one","type":1,"val":"token","end":""},{"old":"/invitations/:token/plus-one","type":0,"val":"plus-one","end":""}],
    types: placeholder as Registry['inauguration.invitations.update_plus_one']['types'],
  },
  'inauguration.invitations.delete_plus_one': {
    methods: ["DELETE"],
    pattern: '/invitations/:token/plus-one',
    tokens: [{"old":"/invitations/:token/plus-one","type":0,"val":"invitations","end":""},{"old":"/invitations/:token/plus-one","type":1,"val":"token","end":""},{"old":"/invitations/:token/plus-one","type":0,"val":"plus-one","end":""}],
    types: placeholder as Registry['inauguration.invitations.delete_plus_one']['types'],
  },
  'inauguration.invitations.calendar': {
    methods: ["GET","HEAD"],
    pattern: '/invitations/:token/calendar.ics',
    tokens: [{"old":"/invitations/:token/calendar.ics","type":0,"val":"invitations","end":""},{"old":"/invitations/:token/calendar.ics","type":1,"val":"token","end":""},{"old":"/invitations/:token/calendar.ics","type":0,"val":"calendar.ics","end":""}],
    types: placeholder as Registry['inauguration.invitations.calendar']['types'],
  },
  'inauguration.invitations.qr_code': {
    methods: ["GET","HEAD"],
    pattern: '/invitations/:token/qr.png',
    tokens: [{"old":"/invitations/:token/qr.png","type":0,"val":"invitations","end":""},{"old":"/invitations/:token/qr.png","type":1,"val":"token","end":""},{"old":"/invitations/:token/qr.png","type":0,"val":"qr.png","end":""}],
    types: placeholder as Registry['inauguration.invitations.qr_code']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
