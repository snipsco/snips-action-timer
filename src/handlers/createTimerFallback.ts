import { i18n } from 'snips-toolkit'
import { Hermes } from 'hermes-javascript'
import { FlowContinuation } from 'hermes-javascript/types'
import { setTimerHandler } from './setTimer'

export const createTimerFallback = function(flow: FlowContinuation, hermes: Hermes) {
    flow.continue('snips-assistant:No', (_, flow) => {
        flow.end()
    })
    flow.continue('snips-assistant:Cancel', (_, flow) => {
        flow.end()
    })
    flow.continue('snips-assistant:StopSilence', (_, flow) => {
        flow.end()
    })
    flow.continue('snips-assistant:Yes', (_, flow) => {
        flow.continue('snips-assistant:SetTimer', (msg, flow) => setTimerHandler(msg, flow, hermes))
        return i18n.translate('setTimer.ask')
    })

    return i18n.translate('noTimers')
}