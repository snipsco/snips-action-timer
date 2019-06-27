import {
    INTENT_THRESHOLD,
    INTENT_FILTER_THRESHOLD,
    ASR_THRESHOLD
} from '../constants'
import { Handler, handler, HandlerMessages, config } from 'snips-toolkit'
import { IntentMessage } from 'hermes-javascript/types'

// Wrap handlers to gracefully capture errors
export const handlerWrapper = <MessageType extends HandlerMessages = IntentMessage>(
    wrappedHandler: Handler<MessageType>,
    { nested = false } = {}
): Handler<MessageType> => (
    handler.wrap<MessageType>(wrappedHandler, {
        asr: ASR_THRESHOLD,
        intent: nested ? INTENT_FILTER_THRESHOLD: INTENT_THRESHOLD
    })
)

// Bind intents that can stop dialogue rounds
export const dialogueRoundWrapper = <MessageType extends HandlerMessages = IntentMessage>(
    handler: Handler<MessageType>
): Handler<MessageType> => (
    async (message, flow, ...args) => {
        flow.continue(`${ config.get().assistantPrefix }:StopSilence`, handlerWrapper(() => {
            flow.end()
        }))
        flow.continue(`${ config.get().assistantPrefix }:Cancel`, handlerWrapper(() => {
            flow.end()
        }))
        return handlerWrapper(handler, { nested: true })(message, flow, ...args)
    }
)
