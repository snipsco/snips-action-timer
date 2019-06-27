import { i18n, config } from 'snips-toolkit'
import { Hermes } from 'hermes-javascript'
import { FlowContinuation } from 'hermes-javascript/types'
import { setTimerHandler } from './setTimer'

export const createTimerFallback = function(flow: FlowContinuation, hermes: Hermes) {
    flow.continue(`${ config.get().assistantPrefix }:No`, (_, flow) => {
        flow.end()
    })
    flow.continue(`${ config.get().assistantPrefix }:Cancel`, (_, flow) => {
        flow.end()
    })
    flow.continue(`${ config.get().assistantPrefix }:StopSilence`, (_, flow) => {
        flow.end()
    })
    flow.continue(`${ config.get().assistantPrefix }:Yes`, (_, flow) => {
        flow.continue(`${ config.get().assistantPrefix }:SetTimer`, (msg, flow) => setTimerHandler(msg, flow, hermes))
        return i18n.translate('setTimer.ask')
    })

    return i18n.translate('noTimers')
}