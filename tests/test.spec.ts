import { Test } from 'snips-toolkit'
import {
    createTimerSlot,
    createDurationSlot,
    createAllTimersSlot
} from './utils'
import { store } from '../dist'

const { Session, Tools: { getMessageKey, getMessageOptions } } = Test

// i18n output is mocked when running the tests.
const DEFAULT_NAME = '{"key":"defaultName"}'

describe('Timer app', () => {
    it('should set a new Timer (Pizza, duration omitted then 5 minutes)', async () => {
        const session = new Session()
        await session.start({
            intentName: 'snips-assistant:SetTimer',
            input: 'Start a timer called Pizza for five minutes',
            slots: [
                createTimerSlot('Pizza')
            ]
        })
        const whichDurationMsg = await session.continue({
            intentName: 'snips-assistant:ElicitTimerDuration',
            input: 'For 5 minutes',
            slots: [
                createDurationSlot({ minutes: 5 })
            ]
        })
        expect(getMessageKey(whichDurationMsg)).toBe('setTimer.askDuration')
        await session.end()

        const timer = store.getTimer('Pizza')
        expect(timer.name).toBe('Pizza')
        expect(timer.duration).toBe(1000 * 60 * 5)
    })

    it('should set a new Timer (10 minutes)', async () => {
        const session = new Session()
        await session.start({
            intentName: 'snips-assistant:SetTimer',
            input: 'Start a timer for 10 minutes',
            slots: [
                createDurationSlot({ minutes: 10 })
            ]
        })
        await session.end()

        const timer = store.getTimer(DEFAULT_NAME)
        expect(timer.name).toBe(DEFAULT_NAME)
        expect(timer.duration).toBe(1000 * 60 * 10)
    })

    it('should get the 2 timers status', async () => {
        const session = new Session()
        await session.start({
            intentName: 'snips-assistant:GetRemainingTime',
            input: 'What is the status of my timers?'
        })
        const message = await session.end()
        if(!message.text)
            throw new Error('end session message.text is empty')
        const { key, options } = JSON.parse(message.text)
        expect(key).toBe('getRemainingTime.multipleTimers')
        expect(options.count).toBe(2)
    })

    it('should pause the Pizza timer', async () => {
        const session = new Session()
        await session.start({
            intentName: 'snips-assistant:PauseTimer',
            input: 'Pause the timer called Pizza',
            slots: [
                createTimerSlot('Pizza')
            ]
        })
        const message = await session.end()
        expect(getMessageKey(message)).toBe('pauseTimer.paused')

        const timer = store.getTimer('Pizza')
        expect(timer.paused).toBe(true)
    })

    it('should resume the Pizza timer', async () => {
        const session = new Session()
        await session.start({
            intentName: 'snips-assistant:ResumeTimer',
            input: 'Pause the timer called Pizza',
            slots: [
                createTimerSlot('Pizza')
            ]
        })
        const message = await session.end()
        expect(getMessageKey(message)).toBe('resumeTimer.resumed')

        const timer = store.getTimer('Pizza')
        expect(timer.paused).toBe(false)
    })

    it('should prompt for which timer to pause, then pause the timer called Timer', async () => {
        const session = new Session()
        await session.start({
            intentName: 'snips-assistant:PauseTimer',
            input: 'Pause my timer'
        })
        const whichTimerMsg = await session.continue({
            intentName: 'snips-assistant:PauseTimer',
            input: DEFAULT_NAME,
            slots: [
                createTimerSlot(DEFAULT_NAME)
            ]
        })
        expect(getMessageKey(whichTimerMsg)).toBe('pauseTimer.multipleTimers')
        const endMsg = await session.end()
        expect(getMessageKey(endMsg)).toBe('pauseTimer.paused')

        const timer = store.getTimer(DEFAULT_NAME)
        expect(timer.paused).toBe(true)
    })

    it('should prompt for resuming the timer called Timer (wrong slot name)', async () => {
        const session = new Session()
        await session.start({
            intentName: 'snips-assistant:ResumeTimer',
            input: 'Resume my timer called Something',
            slots: [
                createTimerSlot('Something')
            ]
        })
        const whichTimerMsg = await session.continue({
            intentName: 'snips-assistant:No',
            input: 'No'
        })
        expect(getMessageKey(whichTimerMsg)).toBe('resumeTimer.singleTimer')
        const endMsg = await session.end()
        expect(endMsg.text).toBe('')

        const timer = store.getTimer(DEFAULT_NAME)
        expect(timer.paused).toBe(true)
    })

    it('should resume the timer called Timer (no slots)', async () => {
        const session = new Session()
        await session.start({
            intentName: 'snips-assistant:ResumeTimer',
            input: 'Resume my timer'
        })
        const endMsg = await session.end()
        expect(getMessageKey(endMsg)).toBe('resumeTimer.resumed')

        const timer = store.getTimer(DEFAULT_NAME)
        expect(timer.paused).toBe(false)
    })

    it('should prompt for which timer to Cancel (no slots), wrong match', async () => {
        const session = new Session()
        await session.start({
            intentName: 'snips-assistant:CancelTimer',
            input: 'Cancel my timer'
        })
        const whichTimerMsg = await session.continue({
            intentName: 'snips-assistant:CancelTimer',
            input: 'My timer called Toto',
            slots: [
                createTimerSlot('Toto')
            ]
        })
        expect(getMessageKey(whichTimerMsg)).toBe('cancelTimer.multipleTimers')
        const endMsg = await session.end()
        expect(getMessageKey(endMsg)).toBe('notFound')

        expect(store.getTimer('Pizza')).toBeDefined()
        expect(store.getTimer(DEFAULT_NAME)).toBeDefined()
    })

    it('should prompt for which timer to Cancel (no slots), then cancel the Pizza timer', async () => {
        const session = new Session()
        await session.start({
            intentName: 'snips-assistant:CancelTimer',
            input: 'Cancel my timer'
        })
        const whichTimerMsg = await session.continue({
            intentName: 'snips-assistant:CancelTimer',
            input: 'My timer called Pizza',
            slots: [
                createTimerSlot('Pizza')
            ]
        })
        expect(getMessageKey(whichTimerMsg)).toBe('cancelTimer.multipleTimers')
        const endMsg = await session.end()
        expect(getMessageKey(endMsg)).toBe('cancelTimer.canceled')

        const timer = store.getTimer('Pizza')
        expect(timer).toBeNull()
    })

    it('should cancel all the timers', async () => {
        expect(store.getTimers().length).toBeGreaterThan(0)
        const session = new Session()
        await session.start({
            intentName: 'snips-assistant:CancelTimer',
            input: 'Cancel all my timers',
            slots: [
                createAllTimersSlot()
            ]
        })
        const endMsg = await session.end()
        expect(getMessageKey(endMsg)).toBe('cancelTimer.canceled')
        expect(getMessageOptions(endMsg)).toEqual({context: 'all'})
        expect(store.getTimers().length).toBe(0)
    })

    it('should create multiple timers with the same name and different durations and allow cancelling one of them by duration', async () => {
        expect(store.getTimers().length).toBe(0)

        for(let i = 0; i < 5; i++) {
            const minutes = i === 0 ? 2 : i + 1
            const session = new Session()
            await session.start({
                intentName: 'snips-assistant:SetTimer',
                input: 'Start a timer for '+ minutes + ' minutes',
                slots: [
                    createTimerSlot('Test'),
                    // 2 timers that are set for 2 minutes
                    createDurationSlot({ minutes })
                ]
            })
            await session.end()
            const timersArray = store.getTimers()
            expect(timersArray.length).toBe(i + 1)
            expect(timersArray[i].name).toBe('Test')
        }

        const session = new Session()
        await session.start({
            intentName: 'snips-assistant:CancelTimer',
            input: 'Cancel my timer'
        })
        const whichTimerMsg = await session.continue({
            intentName: 'snips-assistant:CancelTimer',
            input: 'My three minutes timer',
            slots: [
                createDurationSlot({ minutes: 2 })
            ]
        })
        expect(getMessageKey(whichTimerMsg)).toBe('cancelTimer.multipleTimers')
        const endMsg = await session.end()
        expect(getMessageKey(endMsg)).toBe('cancelTimer.canceled')
        const timersArray = store.getTimers()
        expect(timersArray.length).toBe(4)
    })

    afterAll(() => {
        // Cancel all timers to remove pending listeners
        store.getTimers().forEach(timer =>
            store.deleteTimer(timer.name, timer.duration)
        )
    })
})
