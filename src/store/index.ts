import { i18n } from 'snips-toolkit'
import { Timer } from './types'

const timers: Timer[] = []

function initTimer(duration: number, onExpiration: (name: string, duration?: number) => void, name: string) {
    const onTimeout = (duration: number) => () => {
        const index = timers.findIndex(t => t === timer)
        if(index >= 0)
            timers.splice(index, 1)
        onExpiration(name, duration)
    }

    const timer = {
        name,
        start: Date.now(),
        duration,
        timeout: setTimeout(onTimeout(duration), duration),
        pause() {
            clearTimeout(this.timeout)
            this.paused = true
            this.duration = Math.trunc(((this.start + this.duration) - Date.now()) / 1000) * 1000
        },
        paused: false,
        resume() {
            if(!this.paused)
                return
            this.paused = false
            this.state = Date.now()
            this.timeout = setTimeout(onTimeout(this.duration), this.duration)
        }
    }
    return timer
}

function getTimer(name: string, duration?: number) {
    const filteredTimers =  timers.filter(timer =>
        (name || duration) &&
        (!name || timer.name === name) &&
        (!duration || timer.duration === duration)
    )
    if((duration && filteredTimers.length >= 1) || filteredTimers.length === 1)
        return filteredTimers[0]
    return null
}

function getTimers() {
    return [...timers]
}

function getPausedTimers() {
    return timers.filter(timer => timer.paused)
}

function getActiveTimers() {
    return timers.filter(timer => !timer.paused)
}

function createTimer(duration: number, name: string, onExpiration: (timer: Timer) => void) {
    name = name || i18n.translate('defaultName')

    const timer = initTimer(duration, () => {
        onExpiration(timer)
    }, name)
    timers.push(timer)
    return timer
}

function getRemainingTime (name?: string, duration?: number) {
    const timer = (name || duration) && getTimer(name, duration)
    if(!timer || timer.paused) {
        return getActiveTimers().map(timer => ({
            ...timer,
            remaining: (timer.start + timer.duration) - Date.now()
        }))
    } else {
        return {
            ...timer,
            remaining: (timer.start + timer.duration) - Date.now()
        }
    }
}

function deleteTimer (name: string, duration?: number) {
    const timer = getTimer(name, duration)
    if(timer) {
        clearTimeout(timer.timeout)
        timers.splice(timers.indexOf(timer), 1)
        return true
    }
    return false
}

function pauseTimer (name: string, duration?: number) {
    const timer = getTimer(name, duration)
    if(timer) {
        if(!timer.paused)
            timer.pause()
        return true
    }
    return false
}

function resumeTimer (name: string, duration?: number) {
    const timer = getTimer(name, duration)
    if(timer) {
        if(timer.paused)
            timer.resume()
        return true
    }
    return false
}

export const store = {
    getTimer,
    getTimers,
    getPausedTimers,
    getActiveTimers,
    createTimer,
    getRemainingTime,
    deleteTimer,
    pauseTimer,
    resumeTimer
}
