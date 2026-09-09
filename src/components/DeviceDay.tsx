import { DATE_SOURCE, localDateKey } from '../lib/dates'

export function DeviceDay({
  now,
}: {
  now?: Date
}) {
  const d = now ?? new Date()
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone
  return (
    <p className="device-day" data-date-source={DATE_SOURCE} title={zone}>
      Device day · {localDateKey(d)}
    </p>
  )
}
