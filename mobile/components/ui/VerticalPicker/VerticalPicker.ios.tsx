import React, { useMemo } from 'react'
import { Host, Picker, Text } from '@expo/ui/swift-ui'
import { pickerStyle, tag, tint } from '@expo/ui/swift-ui/modifiers'
import { VerticalPickerProps } from './VerticalPicker.types'

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
		<Host matchContents colorScheme="dark">
			<Picker
				modifiers={[pickerStyle('menu'), tint('white')]}
				selection={selectedKey}
				onSelectionChange={handleSelectionChange}
			>
				{items.map((item) => {
					const key = mapOptionToKey(item)
					return (
						<Text key={key} modifiers={[tag(key)]}>
							{mapOptionToLabel(item)}
						</Text>
					)
				})}
			</Picker>
		</Host>
	)
}

export default VerticalPicker
