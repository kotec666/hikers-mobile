
export const debounce = (func: Function, wait: number = 500) => {
    let timeout: string | number | NodeJS.Timeout | undefined

    return (...args: any[]) => {
        clearTimeout(timeout)
         timeout = setTimeout(() => { func.apply(this, args); }, wait);
    }
}