import { IntentMessage, FlowContinuation, FlowActionReturn, IntentNotRecognizedMessage, SessionStartedMessage } from 'hermes-javascript'

export type HandlerMessages = IntentMessage | IntentNotRecognizedMessage | SessionStartedMessage
export type Handler<MessageType extends HandlerMessages = IntentMessage> = (
    message: MessageType,
    flow: FlowContinuation,
    ...args: any[]
) => FlowActionReturn

export function intentMessageGuard(msg: HandlerMessages): msg is IntentMessage {
    return !!msg['intent']
}
