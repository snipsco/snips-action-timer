import dayjs from 'dayjs'
import { NluSlot, slotType } from 'hermes-javascript/types'

export type CustomSlot = NluSlot<slotType.custom>
export type DurationSlot = NluSlot<slotType.duration>

// Get a duration slot value in milliseconds
export function getDurationSlotValueInMs(slot: NluSlot<slotType.duration>) {
    if(!slot)
        return null

    const duration = slot.value
    const baseTime = dayjs().valueOf()
    const millisecondsDuration = Math.max(0,
        dayjs(baseTime)
            .add(duration.years, 'year')
            .add(duration.quarters * 3 + duration.months, 'month')
            .add(duration.weeks * 7, 'day')
            .add(duration.days, 'day')
            .add(duration.hours, 'hour')
            .add(duration.minutes, 'minute')
            .add(duration.seconds, 'second')
            .valueOf() - baseTime
    )

    if(2147483647 < millisecondsDuration) {
        throw new Error('durationTooLong')
    }

    return millisecondsDuration
}
