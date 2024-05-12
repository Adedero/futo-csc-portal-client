export function useDate(date) {
    let updatedAt = new Date(date)
    return `${updatedAt.getDate()}/${updatedAt.getMonth() + 1}/${updatedAt.getFullYear()}`
}