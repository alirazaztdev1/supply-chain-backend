export const formatNumber = (value: any, decimals = 2) => {
	if (value == null) {
		return parseFloat('0').toFixed(decimals)
	} else if (value == 0) {
		return parseFloat('0').toFixed(decimals)
	} else return parseFloat(value).toFixed(decimals)
}

export function getCurrentMonthRange(): { startMonth: Date; endMonth: Date } {
	const date = new Date()
	const year = date.getFullYear()
	const month = date.getMonth()
	const startMonth = new Date(year, month, 1)
	const endMonth = new Date(year, month + 1, 1)
	return { startMonth, endMonth }
}

export function getCurrentWeekRange(): { startWeek: Date; endWeek: Date } {
	const date = new Date()
	const year = date.getFullYear()
	const month = date.getMonth()
	const dayOfWeek = date.getDay()
	const startWeek = new Date(year, month, date.getDate() - dayOfWeek)
	const endWeek = new Date(year, month, startWeek.getDate() + 7)
	return { startWeek, endWeek }
}

export function getCurrentDayRange(): { startDay: Date; endDay: Date } {
	const date = new Date()
	const year = date.getFullYear()
	const month = date.getMonth()
	const day = date.getDate()
	const startDay = new Date(year, month, day)
	const endDay = new Date(year, month, day + 1)
	return { startDay, endDay }
}
