import { handlerWrapper } from './wrappers'
import { setTimerHandler } from './setTimer'
import { getRemainingTimeHandler } from './getRemainingTime'
import { cancelTimerHandler } from './cancelTimer'
import { pauseTimerHandler } from './pauseTimer'
import { resumeTimerHandler } from './resumeTimer'

// Add handlers here, and wrap them.
export default {
    setTimer: handlerWrapper(setTimerHandler),
    getRemainingTime: handlerWrapper(getRemainingTimeHandler),
    cancelTimer: handlerWrapper(cancelTimerHandler),
    pauseTimer: handlerWrapper(pauseTimerHandler),
    resumeTimer: handlerWrapper(resumeTimerHandler)
}