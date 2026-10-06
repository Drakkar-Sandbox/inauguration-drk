import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'web.account_management.profile.view': { paramsTuple?: []; params?: {} }
    'web.account_management.profile.update': { paramsTuple?: []; params?: {} }
    'web.account_management.profile.delete': { paramsTuple?: []; params?: {} }
    'inauguration.backoffice.guests.list': { paramsTuple?: []; params?: {} }
    'inauguration.backoffice.guests.create': { paramsTuple?: []; params?: {} }
    'inauguration.backoffice.guests.import': { paramsTuple?: []; params?: {} }
    'inauguration.backoffice.guests.export': { paramsTuple?: []; params?: {} }
    'inauguration.backoffice.guests.qr_sheet': { paramsTuple?: []; params?: {} }
    'inauguration.backoffice.guests.view': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'inauguration.backoffice.guests.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'inauguration.backoffice.guests.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'inauguration.backoffice.guests.qr_png': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'inauguration.backoffice.guests.qr_svg': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'inauguration.backoffice.staff.list': { paramsTuple?: []; params?: {} }
    'inauguration.backoffice.dashboard.view': { paramsTuple?: []; params?: {} }
    'inauguration.backoffice.handoffs.list': { paramsTuple?: []; params?: {} }
    'inauguration.backoffice.handoffs.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'inauguration.backoffice.conversations.list': { paramsTuple?: []; params?: {} }
    'inauguration.backoffice.conversations.view': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'inauguration.kiosk.checkin': { paramsTuple?: []; params?: {} }
    'inauguration.kiosk.search': { paramsTuple?: []; params?: {} }
    'inauguration.kiosk.speech.cues': { paramsTuple?: []; params?: {} }
    'inauguration.kiosk.speech.current': { paramsTuple?: []; params?: {} }
    'inauguration.kiosk.speech.trigger': { paramsTuple?: []; params?: {} }
    'inauguration.kiosk.speech.reset': { paramsTuple?: []; params?: {} }
    'web.account_management.authentication.login': { paramsTuple?: []; params?: {} }
    'web.account_management.authentication.logout': { paramsTuple?: []; params?: {} }
    'web.account_management.password.forgot': { paramsTuple?: []; params?: {} }
    'web.account_management.password.reset': { paramsTuple?: []; params?: {} }
    'web.account_management.password.update': { paramsTuple?: []; params?: {} }
    'inauguration.invitations.view': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'inauguration.invitations.respond': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'inauguration.invitations.consent': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'inauguration.invitations.update_plus_one': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'inauguration.invitations.delete_plus_one': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'inauguration.invitations.calendar': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'inauguration.invitations.qr_code': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
  }
  GET: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'web.account_management.profile.view': { paramsTuple?: []; params?: {} }
    'inauguration.backoffice.guests.list': { paramsTuple?: []; params?: {} }
    'inauguration.backoffice.guests.export': { paramsTuple?: []; params?: {} }
    'inauguration.backoffice.guests.qr_sheet': { paramsTuple?: []; params?: {} }
    'inauguration.backoffice.guests.view': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'inauguration.backoffice.guests.qr_png': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'inauguration.backoffice.guests.qr_svg': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'inauguration.backoffice.staff.list': { paramsTuple?: []; params?: {} }
    'inauguration.backoffice.dashboard.view': { paramsTuple?: []; params?: {} }
    'inauguration.backoffice.handoffs.list': { paramsTuple?: []; params?: {} }
    'inauguration.backoffice.conversations.list': { paramsTuple?: []; params?: {} }
    'inauguration.backoffice.conversations.view': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'inauguration.kiosk.search': { paramsTuple?: []; params?: {} }
    'inauguration.kiosk.speech.cues': { paramsTuple?: []; params?: {} }
    'inauguration.kiosk.speech.current': { paramsTuple?: []; params?: {} }
    'inauguration.invitations.view': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'inauguration.invitations.calendar': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'inauguration.invitations.qr_code': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
  }
  HEAD: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'web.account_management.profile.view': { paramsTuple?: []; params?: {} }
    'inauguration.backoffice.guests.list': { paramsTuple?: []; params?: {} }
    'inauguration.backoffice.guests.export': { paramsTuple?: []; params?: {} }
    'inauguration.backoffice.guests.qr_sheet': { paramsTuple?: []; params?: {} }
    'inauguration.backoffice.guests.view': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'inauguration.backoffice.guests.qr_png': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'inauguration.backoffice.guests.qr_svg': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'inauguration.backoffice.staff.list': { paramsTuple?: []; params?: {} }
    'inauguration.backoffice.dashboard.view': { paramsTuple?: []; params?: {} }
    'inauguration.backoffice.handoffs.list': { paramsTuple?: []; params?: {} }
    'inauguration.backoffice.conversations.list': { paramsTuple?: []; params?: {} }
    'inauguration.backoffice.conversations.view': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'inauguration.kiosk.search': { paramsTuple?: []; params?: {} }
    'inauguration.kiosk.speech.cues': { paramsTuple?: []; params?: {} }
    'inauguration.kiosk.speech.current': { paramsTuple?: []; params?: {} }
    'inauguration.invitations.view': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'inauguration.invitations.calendar': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'inauguration.invitations.qr_code': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
  }
  PUT: {
    'web.account_management.profile.update': { paramsTuple?: []; params?: {} }
    'inauguration.backoffice.guests.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'web.account_management.password.update': { paramsTuple?: []; params?: {} }
    'inauguration.invitations.update_plus_one': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
  }
  DELETE: {
    'web.account_management.profile.delete': { paramsTuple?: []; params?: {} }
    'inauguration.backoffice.guests.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'web.account_management.authentication.logout': { paramsTuple?: []; params?: {} }
    'inauguration.invitations.delete_plus_one': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
  }
  POST: {
    'inauguration.backoffice.guests.create': { paramsTuple?: []; params?: {} }
    'inauguration.backoffice.guests.import': { paramsTuple?: []; params?: {} }
    'inauguration.kiosk.checkin': { paramsTuple?: []; params?: {} }
    'inauguration.kiosk.speech.trigger': { paramsTuple?: []; params?: {} }
    'inauguration.kiosk.speech.reset': { paramsTuple?: []; params?: {} }
    'web.account_management.authentication.login': { paramsTuple?: []; params?: {} }
    'web.account_management.password.forgot': { paramsTuple?: []; params?: {} }
    'web.account_management.password.reset': { paramsTuple?: []; params?: {} }
    'inauguration.invitations.respond': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'inauguration.invitations.consent': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
  }
  PATCH: {
    'inauguration.backoffice.handoffs.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}