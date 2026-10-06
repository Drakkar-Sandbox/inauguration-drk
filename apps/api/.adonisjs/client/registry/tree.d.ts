/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  drive: {
    fs: {
      serve: typeof routes['drive.fs.serve']
    }
  }
  web: {
    accountManagement: {
      profile: {
        view: typeof routes['web.account_management.profile.view']
        update: typeof routes['web.account_management.profile.update']
        delete: typeof routes['web.account_management.profile.delete']
      }
      authentication: {
        login: typeof routes['web.account_management.authentication.login']
        logout: typeof routes['web.account_management.authentication.logout']
      }
      password: {
        forgot: typeof routes['web.account_management.password.forgot']
        reset: typeof routes['web.account_management.password.reset']
        update: typeof routes['web.account_management.password.update']
      }
    }
  }
  inauguration: {
    backoffice: {
      guests: {
        list: typeof routes['inauguration.backoffice.guests.list']
        create: typeof routes['inauguration.backoffice.guests.create']
        import: typeof routes['inauguration.backoffice.guests.import']
        export: typeof routes['inauguration.backoffice.guests.export']
        qrSheet: typeof routes['inauguration.backoffice.guests.qr_sheet']
        view: typeof routes['inauguration.backoffice.guests.view']
        update: typeof routes['inauguration.backoffice.guests.update']
        delete: typeof routes['inauguration.backoffice.guests.delete']
        qrPng: typeof routes['inauguration.backoffice.guests.qr_png']
        qrSvg: typeof routes['inauguration.backoffice.guests.qr_svg']
      }
      staff: {
        list: typeof routes['inauguration.backoffice.staff.list']
      }
      dashboard: {
        view: typeof routes['inauguration.backoffice.dashboard.view']
      }
      handoffs: {
        list: typeof routes['inauguration.backoffice.handoffs.list']
        update: typeof routes['inauguration.backoffice.handoffs.update']
      }
      conversations: {
        list: typeof routes['inauguration.backoffice.conversations.list']
        view: typeof routes['inauguration.backoffice.conversations.view']
      }
    }
    kiosk: {
      checkin: typeof routes['inauguration.kiosk.checkin']
      search: typeof routes['inauguration.kiosk.search']
      speech: {
        cues: typeof routes['inauguration.kiosk.speech.cues']
        current: typeof routes['inauguration.kiosk.speech.current']
        trigger: typeof routes['inauguration.kiosk.speech.trigger']
        reset: typeof routes['inauguration.kiosk.speech.reset']
      }
    }
    invitations: {
      view: typeof routes['inauguration.invitations.view']
      respond: typeof routes['inauguration.invitations.respond']
      consent: typeof routes['inauguration.invitations.consent']
      updatePlusOne: typeof routes['inauguration.invitations.update_plus_one']
      deletePlusOne: typeof routes['inauguration.invitations.delete_plus_one']
      calendar: typeof routes['inauguration.invitations.calendar']
      qrCode: typeof routes['inauguration.invitations.qr_code']
    }
  }
}
