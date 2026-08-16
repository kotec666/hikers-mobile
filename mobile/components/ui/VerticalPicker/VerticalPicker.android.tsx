import React, { useMemo } from 'react'
import { VerticalPickerProps } from './VerticalPicker.types'
import PopupMenuItem from '@/components/ui/Popup/PopupMenuItem'
import { Pressable, Text, View } from 'react-native'
import PopupMenu from '@/components/ui/Popup/PopupMenu'
import CheckmarkSvg from '@/components/svg/CheckmarkSvg'
import { fontFamily } from '@/constants/Fonts'
import ChevronSelectorVerticalSvg from '@/components/svg/ChevronSelectorVerticalSvg'

const VerticalPicker = <T,>({
	items,
	value,
	onChange,
	mapOptionToLabel,
	mapOptionToKey = mapOptionToLabel
}: VerticalPickerProps<T>) => {
	const keyToItem = useMemo(() => {
		const map = new Map<string, T>()
		items.forEach((item) => map.set(mapOptionToKey(item), item))
		return map
	}, [items, mapOptionToKey])

	const selectedKey = value != null ? mapOptionToKey(value) : undefined

	const handleSelectionChange = (key: string) => {
		onChange(keyToItem.get(key) ?? null)
	}

	return (
		<PopupMenu
			menuWidth={230}
			menuHeight={300}
			trigger={({ open }) => (
				<Pressable onPress={open} className="flex-row items-center">
					<Text className="text-base text-gray-ab mr-2" style={{ fontFamily: fontFamily.medium }}>
						{value ? mapOptionToLabel(value) : ''}
					</Text>
					<ChevronSelectorVerticalSvg />
				</Pressable>
			)}
		>
			{items.map((item) => {
				const key = mapOptionToKey(item)
				return (
					<PopupMenuItem key={key} onPress={() => handleSelectionChange(key)}>
						<View className="flex-row items-center gap-3">
							<CheckmarkSvg size={18} color={selectedKey === key ? 'white' : 'transparent'} />
							<Text className="text-white text-base">{mapOptionToLabel(item)}</Text>
						</View>
					</PopupMenuItem>
				)
			})}
		</PopupMenu>
	)
}

export default VerticalPicker
