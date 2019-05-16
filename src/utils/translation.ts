import { i18n } from 'snips-toolkit'
import { Timer } from '../store/types'

// Joins a list of strings with comma separators and the last element with 'and' or 'or'.
export function joinTerms (list: string[], keyword: 'and' | 'or' = 'and') {
    return i18n.joinTerms(list, 'joins.' + keyword)
}

// Milliseconds to proper speech
export function durationToSpeech (duration: number) {
    if(duration < 0)
        duration = 0

    if(duration < 1000) {
        // ms
        return duration + ' ' + i18n.translate('time.millisecond', { count: duration })
    } else if(duration < 1000 * 60) {
        // s
        const seconds = Math.floor(duration / 1000)
        return seconds + ' ' + i18n.translate('time.second', { count: seconds })
    } else if(duration < 1000 * 60 * 60) {
        // min
        const minutes = Math.floor(duration / (1000 * 60))
        const seconds = Math.floor((duration % (1000 * 60)) / 1000)
        return (
            minutes + ' ' + i18n.translate('time.minute', { count: minutes }) +
            (seconds > 0 ? ` ${seconds} ${i18n.translate('time.second', { count: seconds })}` : '')
        )
    } else if(duration < 1000 * 60 * 60 * 24) {
        // hours
        const hours = Math.floor(duration / (1000 * 60 * 60))
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((duration % (1000 * 60)) / 1000)
        return (
            hours + ' ' + i18n.translate('time.hour', { count: hours }) +
            (minutes > 0 ? ` ${minutes} ${i18n.translate('time.minute', { count: minutes })}` : '') +
            (seconds > 0 ? ` ${seconds} ${i18n.translate('time.second', { count: seconds })}` : '')
        )
    } else {
        // days
        const days = Math.floor(duration / (1000 * 60 * 60 * 24))
        const hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((duration % (1000 * 60)) / 1000)
        return (
            days + ' ' + i18n.translate('time.day', { count: days }) +
            (hours > 0 ? ` ${hours} ${i18n.translate('time.hour', { count: hours })}` : '') +
            (minutes > 0 ? ` ${minutes} ${i18n.translate('time.minute', { count: minutes })}` : '') +
            (seconds > 0 ? ` ${seconds} ${i18n.translate('time.second', { count: seconds })}` : '')
        )
    }
}

export function timerNamesToSpeech (timers: Timer[], keyword: 'and' | 'or' = 'and') {
    const timersMap = new Map<string, Timer[]>()
    timers.forEach(timer => {
        if(!timersMap.has(timer.name)) {
            timersMap.set(timer.name, [])
        }
        timersMap.get(timer.name).push(timer)
    })
    const timerDescriptions = Array.from(timersMap).reduce((descs: string[], [ name, timers ]) => {
        const useDefaultDescription = (name === i18n.translate('defaultName'))
        if(timers.length === 1) {
            return [
                ...descs,
                useDefaultDescription
                    ? i18n.translate('defaultTimerDescription', { duration: durationToSpeech(timers[0].duration) })
                    : i18n.translate('namedTimerDescription', { duration: durationToSpeech(timers[0].duration), name: timers[0].name })
            ]
        }
        return [
            ...descs,
            ...timers.map(timer => (
                useDefaultDescription
                    ? i18n.translate('defaultTimerDescription', { duration: durationToSpeech(timer.duration) })
                    : i18n.translate('namedTimerDescription', { duration: durationToSpeech(timer.duration), name: timer.name })
            ))
        ]
    }, [])
    return joinTerms(timerDescriptions, keyword)
}

export function hasDefaultName(timerName: string) {
    return timerName === i18n.translate('defaultName')
}
