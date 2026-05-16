import { create } from 'zustand'
import { IActivity } from '@/api/activities'

interface IEditActivitiesStore {
	newActivitiesOrder: IActivity[]
	setNewActivitiesOrder: (activities: IActivity[]) => void
}

export const useEditActivitiesStore = create<IEditActivitiesStore>((set) => ({
	newActivitiesOrder: [],
	setNewActivitiesOrder: (activities) => {
		set({
			newActivitiesOrder: activities
		})
	}
}))

// export const editActivitiesStore = useEditActivitiesStore
