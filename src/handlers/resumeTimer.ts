import { i18n, logger, message, Handler, config }  from 'snips-toolkit'
import { Hermes } from 'hermes-javascript'
import {
    getDurationSlotValueInMs,
    hasDefaultName,
    timerNamesToSpeech,
    CustomSlot,
    DurationSlot
} from '../utils'
import { store } from '../store'
import { createTimerFallback } from './createTimerFallback'

export const resumeTimerHandler: Handler = async function (msg, flow, hermes: Hermes) {
    const nameSlot: CustomSlot = message.getSlotsByName(msg, 'timer_name', { onlyMostConfident: true })
    const name = nameSlot && nameSlot.value.value
    const durationSlot: DurationSlot = message.getSlotsByName(msg, 'duration', { onlyMostConfident: true })
    const duration = durationSlot && getDurationSlotValueInMs(durationSlot)
    const allTimersSlot = message.getSlotsByName(msg, 'all_timers', { onlyMostConfident: true })

    logger.debug('name %s', name)
    logger.debug('duration %d', duration)

    const timers = store.getPausedTimers()

    if(timers.length < 1) {
        return createTimerFallback(flow, hermes)
    }

    if(allTimersSlot) {
        flow.end()
        timers.forEach(timer => {
            if(
                (!name || timer.name === name) &&
                (!duration || timer.duration === duration)
            ) {
                store.resumeTimer(timer.name, timer.duration)
            }
        })
        return i18n.translate('resumeTimer.resumed', { context: 'all' })
    }

    if(store.resumeTimer(name, duration)) {
        flow.end()
        return i18n.translate('resumeTimer.resumed', { name, context: name ? 'name' : null })
    }

    if(timers.length === 1) {
        if(!name) {
            flow.end()
            timers[0].resume()
            return i18n.translate('resumeTimer.resumed', { name: timers[0].name, context: hasDefaultName(timers[0].name) ? null : 'name' })
        }

        flow.continue(`${ config.get().assistantPrefix }:No`, (_, flow) => {
            flow.end()
        })
        flow.continue(`${ config.get().assistantPrefix }:Yes`, (_, flow) => {
            flow.end()
            timers[0].resume()
            return i18n.translate('resumeTimer.resumed', { name: timers[0].name, context: hasDefaultName(timers[0].name) ? null : 'name' })
        })

        return i18n.translate('resumeTimer.singleTimer', {
            name: timers[0].name
        })
    } else {
        flow.continue(`${ config.get().assistantPrefix }:ResumeTimer`, (msg, flow) => {
            const nameSlot: CustomSlot = message.getSlotsByName(msg, 'timer_name', { onlyMostConfident: true })
            const name = nameSlot && nameSlot.value.value
            const durationSlot: DurationSlot = message.getSlotsByName(msg, 'duration', { onlyMostConfident: true })
            const duration = durationSlot && getDurationSlotValueInMs(durationSlot)
            const success = (name || duration) && store.resumeTimer(name, duration)
            flow.end()
            if(success) {
                return i18n.translate('resumeTimer.resumed')
            }
            return i18n.translate('notFound')
        })

        return i18n.translate('resumeTimer.multipleTimers', {
            count: timers.length,
            timerNamesAnd: timerNamesToSpeech(timers),
            timerNamesOr: timerNamesToSpeech(timers, 'or')
        })
    }
}