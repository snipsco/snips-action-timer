import { i18n, logger, message, Handler }  from 'snips-toolkit'
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

const { getSlotsByName } = message

export const cancelTimerHandler: Handler = async function (msg, flow, hermes: Hermes) {
    const nameSlot: CustomSlot = getSlotsByName(msg, 'timer_name', { onlyMostConfident: true })
    const name = nameSlot && nameSlot.value.value
    const durationSlot: DurationSlot = getSlotsByName(msg, 'duration', { onlyMostConfident: true })
    const duration = durationSlot && getDurationSlotValueInMs(durationSlot)
    const allTimersSlot = getSlotsByName(msg, 'all_timers', { onlyMostConfident: true })

    logger.debug('name %s', name)
    logger.debug('duration %d', duration)

    const timers = store.getTimers()

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
                store.deleteTimer(timer.name, timer.duration)
            }
        })
        return i18n.translate('cancelTimer.canceled', { context: 'all' })
    }

    if(store.deleteTimer(name, duration)) {
        flow.end()
        return i18n.translate('cancelTimer.canceled', { name, context: name ? 'name' : null })
    }

    if(timers.length === 1) {
        if(!name) {
            flow.end()
            store.deleteTimer(timers[0].name, timers[0].duration)
            return i18n.translate('cancelTimer.canceled', { name: timers[0].name, context: hasDefaultName(timers[0].name) ? null : 'name' })
        }

        flow.continue('snips-assistant:No', (_, flow) => {
            flow.end()
        })
        flow.continue('snips-assistant:Yes', (_, flow) => {
            flow.end()
            store.deleteTimer(timers[0].name, timers[0].duration)
            return i18n.translate('cancelTimer.canceled', { name: timers[0].name, context: hasDefaultName(timers[0].name) ? null : 'name' })
        })

        return i18n.translate('cancelTimer.singleTimer', {
            name: timers[0].name
        })
    } else {
        flow.continue('snips-assistant:CancelTimer', (msg, flow) => {
            const nameSlot: CustomSlot = getSlotsByName(msg, 'timer_name', { onlyMostConfident: true })
            const name = nameSlot && nameSlot.value.value
            const durationSlot: DurationSlot = getSlotsByName(msg, 'duration', { onlyMostConfident: true })
            const duration = durationSlot && getDurationSlotValueInMs(durationSlot)
            const success = (name || duration) && store.deleteTimer(name, duration)
            flow.end()
            if(success)
                return i18n.translate('cancelTimer.canceled')
            return i18n.translate('notFound')
        })

        return i18n.translate('cancelTimer.multipleTimers', {
            count: timers.length,
            timerNamesAnd: timerNamesToSpeech(timers),
            timerNamesOr: timerNamesToSpeech(timers, 'or')
        })
    }
}