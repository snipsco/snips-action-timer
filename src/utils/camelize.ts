export const camelize = (string: string) => string.replace(/_\w/g, snakePart =>
    snakePart[1].toUpperCase()
)
export const camelizeKeys = (obj: {[ key: string ]: any }) => {
    const clone: {[ key: string ]: any } = {}
    for(let key in obj){
        clone[camelize(key)] = obj[key]
    }
    return clone
}

