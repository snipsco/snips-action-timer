import {
    logger,
    getSlotsByName,
    getDurationSlotValueInMs,
    hasDefaultName,
    timerNamesToSpeech,
    CustomSlot,
    DurationSlot
} from '../utils'
import { i18nFactory } from '../factories'
import { store } from '../store'
import { Handler } from './types'
import { createTimerFallback } from './createTimerFallback'

export const resumeTimerHandler: Handler = async function (msg, flow, hermes) {
    const i18n = i18nFactory.get()

    const nameSlot: CustomSlot = getSlotsByName(msg, 'timer_name', { onlyMostConfident: true })
    const name = nameSlot && nameSlot.value.value
    const durationSlot: DurationSlot = getSlotsByName(msg, 'duration', { onlyMostConfident: true })
    const duration = durationSlot && getDurationSlotValueInMs(durationSlot)
    const allTimersSlot = getSlotsByName(msg, 'all_timers', { onlyMostConfident: true })

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
        return i18n('resumeTimer.resumed', { context: 'all' })
    }

    if(store.resumeTimer(name, duration)) {
        flow.end()
        return i18n('resumeTimer.resumed', { name, context: name ? 'name' : null })
    }

    if(timers.length === 1) {
        if(!name) {
            flow.end()
            timers[0].resume()
            return i18n('resumeTimer.resumed', { name: timers[0].name, context: hasDefaultName(timers[0].name) ? null : 'name' })
        }

        flow.continue('snips-assistant:No', (_, flow) => {
            flow.end()
        })
        flow.continue('snips-assistant:Yes', (_, flow) => {
            flow.end()
            timers[0].resume()
            return i18n('resumeTimer.resumed', { name: timers[0].name, context: hasDefaultName(timers[0].name) ? null : 'name' })
        })

        return i18n('resumeTimer.singleTimer', {
            name: timers[0].name
        })
    } else {
        flow.continue('snips-assistant:ResumeTimer', (msg, flow) => {
            const nameSlot: CustomSlot = getSlotsByName(msg, 'timer_name', { onlyMostConfident: true })
            const name = nameSlot && nameSlot.value.value
            const durationSlot: DurationSlot = getSlotsByName(msg, 'duration', { onlyMostConfident: true })
            const duration = durationSlot && getDurationSlotValueInMs(durationSlot)
            const success = (name || duration) && store.resumeTimer(name, duration)
            flow.end()
            if(success) {
                return i18n('resumeTimer.resumed')
            }
            return i18n('notFound')
        })

        return i18n('resumeTimer.multipleTimers', {
            count: timers.length,
            timerNamesAnd: timerNamesToSpeech(timers),
            timerNamesOr: timerNamesToSpeech(timers, 'or')
        })
    }
}