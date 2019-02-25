import { Dialog, NluSlot } from 'hermes-javascript'

type CustomSlot = NluSlot<typeof Dialog.enums.slotType.custom>
type DurationSlot = NluSlot<typeof Dialog.enums.slotType.duration>

export function createTimerSlot(name: string): CustomSlot {
    return {
        slotName: 'timer_name',
        entity: 'timer_name',
        confidenceScore: 1,
        rawValue: name,
        value: {
            kind: Dialog.enums.slotType.custom,
            value: name
        },
        range: {
            end: 0,
            start: 1
        }
    }
}

export function createAllTimersSlot(): CustomSlot {
    return {
        slotName: 'all_timers',
        entity: 'all_timers',
        confidenceScore: 1,
        rawValue: 'all',
        value: {
            kind: Dialog.enums.slotType.custom,
            value: 'all'
        },
        range: {
            end: 0,
            start: 1
        }
    }
}

export function createDurationSlot(value: Partial<DurationSlot['value']>): DurationSlot {
    return {
        slotName: 'duration',
        entity: 'snips/duration',
        confidenceScore: 1,
        rawValue: 'five minutes',
        value: {
            kind: Dialog.enums.slotType.duration,
            years: 0,
            quarters: 0,
            months: 0,
            weeks: 0,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            precision: 'Exact',
            ...value
        },
        range: {
            end: 0,
            start: 1
        }
    }
}
