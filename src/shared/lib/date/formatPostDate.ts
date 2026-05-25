export function formatPostDate (dateValue: string | number | Date | null | undefined) {
  if (!dateValue) {
    return ''
  }

  return new Date(dateValue).toLocaleString()
}
