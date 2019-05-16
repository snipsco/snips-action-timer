import { i18n, logger, message, Handler }  from 'snips-toolkit'
import {
    getDurationSlotValueInMs,
    durationToSpeech,
    hasDefaultName,
    joinTerms,
    CustomSlot,
    DurationSlot
} from '../utils'
import { store } from '../store'
import { createTimerFallback } from './createTimerFallback'

const { getSlotsByName } = message

export const getRemainingTimeHandler: Handler = async function (msg, flow, hermes) {
    const nameSlot: CustomSlot = getSlotsByName(msg, 'timer_name', { onlyMostConfident: true })
    const name = nameSlot && nameSlot.value.value
    const durationSlot: DurationSlot = getSlotsByName(msg, 'duration', { onlyMostConfident: true })
    const duration = durationSlot && getDurationSlotValueInMs(durationSlot)

    logger.debug('name %s', name)
    logger.debug('duration %d', duration)

    const activeTimers = (name || duration) ? store.getRemainingTime(name, duration) : store.getRemainingTime()

    if(!(activeTimers instanceof Array)) {
        flow.end()
        return i18n.translate('getRemainingTime.found', {
            name,
            duration: durationToSpeech(activeTimers.remaining),
            context: name ? 'name' : null
        })
    } else if(activeTimers.length < 1) {
       return createTimerFallback(flow, hermes)
    } else if(activeTimers.length === 1) {
        // Found a single timer
        flow.end()
        return i18n.translate('getRemainingTime.singleTimer', {
            name: activeTimers[0].name,
            duration: durationToSpeech(activeTimers[0].remaining),
            context: hasDefaultName(activeTimers[0].name) ? null : 'name'
        })
    } else {
        // Found multiple timers
        const timersRecap = activeTimers.map(timer => (
            i18n.translate('getRemainingTime.timerRecap', {
                name: timer.name,
                duration: durationToSpeech(timer.remaining),
                context: timer.name ? name : null
            })
        ))

        flow.end()
        return i18n.translate('getRemainingTime.multipleTimers', {
            count: activeTimers.length,
            timersRecap: joinTerms(timersRecap)
        })
    }
}