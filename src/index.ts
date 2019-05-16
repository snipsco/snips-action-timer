import fs from 'fs'
import path from 'path'
import { Hermes, Done } from 'hermes-javascript'
import { ASSETS_PATH } from './constants'
import { config, i18n, logger } from 'snips-toolkit'
import handlers from './handlers'

export * from './store'

// Enables deep printing of objects.
process.env.DEBUG_DEPTH = undefined
// Replace 'error' with '*' to log everything
logger.enable('error')

export default async function ({
    hermes,
    done
}: {
    hermes: Hermes,
    done: Done
}) {
    try {
        const alarmWav = fs.readFileSync(path.resolve(ASSETS_PATH, 'alarm.wav'))

        config.init()
        await i18n.init(config.get().locale)

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
    } catch (error) {
        // Output initialization errors to stderr and exit
        const message = await i18n.errorMessage(error)
        logger.error(message)
        logger.error(error)
        // Exit
        done()
    }
}
