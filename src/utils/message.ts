import dayjs from 'dayjs'
import { IntentMessage, NluSlot, slotType } from 'hermes-javascript'

function geometricMean (dataSet: number[]) {
    return Math.pow(dataSet.reduce((accumulator, element) => accumulator * element, 1), 1/dataSet.length)
}

type GetSlotsByNameReturn<T, S extends slotType> =
    T extends undefined ? NluSlot<S>[] :
    T extends true ? NluSlot<S> :
    NluSlot<S>[]

export type CustomSlot = NluSlot<slotType.custom>
export type DurationSlot = NluSlot<slotType.duration>

// Helper to filter slots given their name, and potentially a lower threshold for the confidence level.
// You can also use the onlyMostConfident boolean to return only a single slot with the highest confidence.
// If no slot match the criterias, then returns null.
export const getSlotsByName = <S extends slotType = slotType, T extends boolean = undefined>(
    message: IntentMessage,
    slotName: string,
    { threshold = 0, onlyMostConfident = undefined } : { threshold?: number, onlyMostConfident?: T } = {}
) : GetSlotsByNameReturn<T, S> => {
    if(onlyMostConfident) {
        return message.slots.reduce((acc, slot) => {
            if(slot.slotName === slotName && slot.confidenceScore > threshold) {
                if(!acc || acc.confidenceScore < slot.confidenceScore)
                    return slot
            }
            return acc as any
        }, null)
    }
    return message.slots.filter(slot => slot.slotName === slotName && slot.confidenceScore > threshold) as any
}

export function getAsrConfidence(message: IntentMessage) {
    if(!message.asrTokens || message.asrTokens.length < 1)
        return 1
    return geometricMean(message.asrTokens[0].map(token => token.confidence))
}

// Get a duration slot value in milliseconds
export function getDurationSlotValueInMs(slot: DurationSlot) {
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
}
