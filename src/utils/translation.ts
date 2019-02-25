import { i18nFactory } from '../factories/i18nFactory'
import { Timer } from '../store/types'

// Outputs an error message based on the error object, or a default message if not found.
export async function errorMessage (error: Error): Promise<string> {
    let i18n = i18nFactory.get()

    if(!i18n) {
        await i18nFactory.init()
        i18n = i18nFactory.get()
    }

    if(i18n) {
        return i18n([`error.${error.message}`, 'error.unspecific'])
    } else {
        return 'Oops, something went wrong.'
    }
}

// Takes an array from the i18n and returns a random item.
export function randomTranslation (key: string | string[], opts: {[key: string]: any}): string {
    const i18n = i18nFactory.get()
    const possibleValues = i18n(key, { returnObjects: true, ...opts })
    if(typeof possibleValues === 'string')
        return possibleValues
    const randomIndex = Math.floor(Math.random() * possibleValues.length)
    return possibleValues[randomIndex]
}

// Joins a list of strings with comma separators and the last element with 'and' or 'or'.
export function joinTerms (list: string[], keyword: 'and' | 'or' = 'and') {
    if(!list || list.length < 2)
        return list && list[0] || ''

    const i18n = i18nFactory.get()
    let joinedString = ''
    for (let i = 0; i < list.length; i++) {
        const element = list[i]

        if(i === (list.length - 1)) {
            joinedString += ' ' + i18n('joins.' + keyword + 'Something', { something: element }) + ' '
            continue
        } else if(i > 0) {
            joinedString += ', '
        }

        joinedString += element
    }
    return joinedString
}

// Milliseconds to proper speech
export function durationToSpeech (duration: number) {
    const i18n = i18nFactory.get()

    if(duration < 1000) {
        // ms
        return duration + ' ' + i18n('time.millisecond', { count: duration })
    } else if(duration < 1000 * 60) {
        // s
        const seconds = Math.floor(duration / 1000)
        return seconds + ' ' + i18n('time.second', { count: seconds })
    } else if(duration < 1000 * 60 * 60) {
        // min
        const minutes = Math.floor(duration / (1000 * 60))
        const seconds = Math.floor((duration % (1000 * 60)) / 1000)
        return (
            minutes + ' ' + i18n('time.minute', { count: minutes }) +
            (seconds > 0 ? ` ${seconds} ${i18n('time.second', { count: seconds })}` : '')
        )
    } else if(duration < 1000 * 60 * 60 * 24) {
        // hours
        const hours = Math.floor(duration / (1000 * 60 * 60))
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((duration % (1000 * 60)) / 1000)
        return (
            hours + ' ' + i18n('time.hour', { count: hours }) +
            (minutes > 0 ? ` ${minutes} ${i18n('time.minute', { count: minutes })}` : '') +
            (seconds > 0 ? ` ${seconds} ${i18n('time.second', { count: seconds })}` : '')
        )
    } else {
        // days
        const days = Math.floor(duration / (1000 * 60 * 60 * 24))
        const hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((duration % (1000 * 60)) / 1000)
        return (
            days + ' ' + i18n('time.day', { count: days }) +
            (hours > 0 ? ` ${hours} ${i18n('time.hour', { count: hours })}` : '') +
            (minutes > 0 ? ` ${minutes} ${i18n('time.minute', { count: minutes })}` : '') +
            (seconds > 0 ? ` ${seconds} ${i18n('time.second', { count: seconds })}` : '')
        )
    }
}

export function timerNamesToSpeech (timers: Timer[], keyword: 'and' | 'or' = 'and') {
    const i18n = i18nFactory.get()
    const timersMap = new Map<string, Timer[]>()
    timers.forEach(timer => {
        if(!timersMap.has(timer.name)) {
            timersMap.set(timer.name, [])
        }
        timersMap.get(timer.name).push(timer)
    })
    const timerDescriptions = Array.from(timersMap).reduce((descs: string[], [ name, timers ]) => {
        const useDefaultDescription = (name === i18n('defaultName'))
        if(timers.length === 1) {
            return [
                ...descs,
                useDefaultDescription ?
                    i18n('defaultTimerDescription', { duration: durationToSpeech(timers[0].duration) }) :
                i18n('namedTimerDescription', { duration: durationToSpeech(timers[0].duration), name: timers[0].name })
            ]
        }
        return [
            ...descs,
            ...timers.map(timer => (
                useDefaultDescription ?
                    i18n('defaultTimerDescription', { duration: durationToSpeech(timer.duration) }) :
                i18n('namedTimerDescription', { duration: durationToSpeech(timer.duration), name: timer.name })
            ))
        ]
    }, [])
    return joinTerms(timerDescriptions, keyword)
}

export function hasDefaultName(timerName: string) {
    const i18n = i18nFactory.get()
    return timerName === i18n('defaultName')
}
