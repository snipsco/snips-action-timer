import {
    INTENT_THRESHOLD,
    INTENT_FILTER_THRESHOLD,
    ASR_THRESHOLD
} from '../constants'
import { errorMessage, logger, getAsrConfidence } from '../utils'
import { Handler, HandlerMessages, intentMessageGuard } from './types'
import { IntentMessage } from 'hermes-javascript'

// Wrap handlers to gracefully capture errors
export const handlerWrapper = <MessageType extends HandlerMessages = IntentMessage>(
    handler: Handler<MessageType>,
    { nested = false } = {}
): Handler<MessageType> => (
    async (message: MessageType, flow, ...args) => {
        logger.debug('message: %O', message)
        try {
            // Check the message thresholds
            if(
                intentMessageGuard(message) && (
                    message.intent.confidenceScore < (nested ? INTENT_FILTER_THRESHOLD: INTENT_THRESHOLD) ||
                    getAsrConfidence(message) < ASR_THRESHOLD
                )
            ) {
                throw new Error('intentNotRecognized')
            }
            // Run handler until completion
            const tts = await handler(message, flow, ...args)
            // And make the TTS speak
            return tts
        } catch (error) {
            // If an error occurs, end the flow gracefully
            flow.end()
            // And make the TTS output the proper error message
            logger.error(error)
            return await errorMessage(error)
        }
    }
)

// Bind intents that can stop dialogue rounds
export const dialogueRoundWrapper = <MessageType extends HandlerMessages = IntentMessage>(
    handler: Handler<MessageType>
): Handler<MessageType> => (
    async (message, flow, ...args) => {
        flow.continue('snips-assistant:Stop', handlerWrapper(() => {
            flow.end()
        }))
        flow.continue('snips-assistant:Silence', handlerWrapper(() => {
            flow.end()
        }))
        flow.continue('snips-assistant:Cancel', handlerWrapper(() => {
            flow.end()
        }))
        return handlerWrapper(handler, { nested: true })(message, flow, ...args)
    }
)
