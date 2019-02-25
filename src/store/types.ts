export type Timer = {
    name: string,
    start: number,
    duration: number,
    timeout: NodeJS.Timeout,
    pause: () => void,
    paused: boolean,
    resume: () => void
}
