
import uuid from 'uuid/v4'
import { Dialog, Hermes, IntentNotRecognizedMessage, IntentMessage } from 'hermes-javascript'
import { getSlotsByName, getDurationSlotValueInMs, logger, CustomSlot, DurationSlot } from '../utils'
import { store } from '../store'
import { i18nFactory } from '../factories'
import { durationToSpeech, hasDefaultName } from '../utils/translation'
import { dialogueRoundWrapper } from './wrappers'
import { Handler } from './types'
import { Timer } from '../store/types'

export const setTimerHandler: Handler = async function (msg, flow, hermes: Hermes, { providedName = null } = {}) {
    const i18n = i18nFactory.get()
    const dialog = hermes.dialog()

    const siteId = msg.siteId

    const nameSlot: CustomSlot = getSlotsByName(msg, 'timer_name', { onlyMostConfident: true })
    const durationSlot: DurationSlot = getSlotsByName(msg, 'duration', { onlyMostConfident: true })

    const name = providedName || nameSlot && nameSlot.value.value
    const duration = durationSlot && getDurationSlotValueInMs(durationSlot)

    logger.debug('name %s', name)
    logger.debug('duration %d', duration)

    if(duration === null || duration === undefined) {
        // Duration slot was not provided - loop once to get it
        flow.continue('snips-assistant:ElicitTimerDuration', dialogueRoundWrapper((msg, flow) =>
            setTimerHandler(msg, flow, hermes, { providedName: name })
        ))
        return i18n('setTimer.askDuration')
    }

    // On timer expiration
    const onTimerExpiration = (timer: Timer) => {
        logger.debug('timer ' + timer.name + ' expired. (duration: ' + timer.duration + ')')

        const messageId = uuid()

        // Start a session with filters on intents 'Stop / Silence and AddTime'
        dialog.publish('start_session', {
            init: {
                type: Dialog.enums.initType.action,
                text: '[[sound:timer.alarm]] ' + i18n('timerIsUp.announce', {
                    name: timer.name,
                    context: hasDefaultName(timer.name) ? null : 'name'
                }),
                intentFilter: [
                    'snips-assistant:StopSilence',
                    'snips-assistant:ElicitSnooze'
                ],
                canBeEnqueued: true,
                sendIntentNotRecognized: true
            },
            customData: messageId,
            siteId: siteId
        })

        const sessionHandler = dialogueRoundWrapper((_: IntentMessage | IntentNotRecognizedMessage, flow) => {
            flow.continue('snips-assistant:ElicitSnooze', (msg, flow) => {
                // Create the timer again with the updated duration
                const durationSlot: DurationSlot = getSlotsByName(msg, 'duration', { onlyMostConfident: true })
                const duration = getDurationSlotValueInMs(durationSlot)
                logger.debug('duration %d', duration)
                store.createTimer(duration, name, onTimerExpiration)
                flow.end()
                return i18n('timerIsUp.addTime', {
                    time: durationToSpeech(duration),
                    name: timer.name,
                    context: hasDefaultName(timer.name) ? null : 'name'
                })
            })

            // Loop on intentNotRecognized
            flow.notRecognized(sessionHandler)

            // Speak
            return (
                '[[sound:timer.alarm]] ' +
                i18n('timerIsUp.announce', { name: timer.name, context: hasDefaultName(timer.name) ? null : 'name' })
            )
        })
        dialog.sessionFlow(messageId, sessionHandler)
    }

    // Create the timer
    const timer = store.createTimer(duration, name, onTimerExpiration)

    // End the flow
    flow.end()

    // Return speech
    return i18n('setTimer.created', {
        duration: durationToSpeech(duration),
        name: timer.name,
        context: name ? 'name' : null
    })
}