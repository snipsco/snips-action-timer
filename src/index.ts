import fs from 'fs'
import path from 'path'
import { withHermes } from 'hermes-javascript'
import bootstrap from './bootstrap'
import handlers from './handlers'
import { logger, errorMessage } from './utils'

const alarmWav = fs.readFileSync(path.resolve(__dirname, '../assets/alarm.wav'))

// Initialize hermes
export default function ({
    hermesOptions = {},
    bootstrapOptions = {}
} = {}) : Promise<() => void>{
    return new Promise((resolve, reject) => {
        withHermes(async (hermes, done) => {
            try {
                // Bootstrap config, locale, i18n…
                await bootstrap(bootstrapOptions)

                const dialog = hermes.dialog()
                const tts = hermes.tts()

                // Publish the alarm sound.
                tts.publish('register_sound', {
                    soundId: 'timer.alarm',
                    wavSound: alarmWav.toString('base64'),
                    wavSoundLen: alarmWav.length
                })

                dialog.flows([
                    {
                        intent: 'snips-assistant:SetTimer',
                        action: (msg, flow) => handlers.setTimer(msg, flow, hermes)
                    },
                    {
                        intent: 'snips-assistant:GetRemainingTime',
                        action: (msg, flow) => handlers.getRemainingTime(msg, flow, hermes)
                    },
                    {
                        intent: 'snips-assistant:CancelTimer',
                        action: (msg, flow) => handlers.cancelTimer(msg, flow, hermes)
                    },
                    {
                        intent: 'snips-assistant:PauseTimer',
                        action: (msg, flow) => handlers.pauseTimer(msg, flow, hermes)
                    },
                    {
                        intent: 'snips-assistant:ResumeTimer',
                        action: (msg, flow) => handlers.resumeTimer(msg, flow, hermes)
                    }
                ])

                resolve(done)
            } catch (error) {
                // Output initialization errors to stderr and exit
                const message = await errorMessage(error)
                logger.error(message)
                logger.error(error)
                // Exit
                done()
                // Reject
                reject(error)
            }
        }, hermesOptions)
    })
}