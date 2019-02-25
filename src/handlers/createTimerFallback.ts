import { i18nFactory } from '../factories'
import { setTimerHandler } from './setTimer'
import { Hermes, FlowContinuation } from 'hermes-javascript'

export const createTimerFallback = function(flow: FlowContinuation, hermes: Hermes) {
    const i18n = i18nFactory.get()

    flow.continue('snips-assistant:No', (_, flow) => {
        flow.end()
    })
    flow.continue('snips-assistant:Cancel', (_, flow) => {
        flow.end()
    })
    flow.continue('snips-assistant:Stop', (_, flow) => {
        flow.end()
    })
    flow.continue('snips-assistant:Silence', (_, flow) => {
        flow.end()
    })
    flow.continue('snips-assistant:Yes', (_, flow) => {
        flow.continue('snips-assistant:SetTimer', (msg, flow) => setTimerHandler(msg, flow, hermes))
        return i18n('setTimer.ask')
    })

    return i18n('noTimers')
}