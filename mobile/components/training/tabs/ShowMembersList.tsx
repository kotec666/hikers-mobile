import React from 'react'
import { ScrollView, View } from 'react-native'
import PeopleListItem from '@/components/find-people/PeopleListItem'
import EyeSvg from '@/components/svg/EyeSvg'
import { Colors } from '@/constants/Colors'

const ShowMembersList = () => {
	const data = [
		{
			id: '1',
			username: 'kotec',
			name: 'Стив Джобс first',
			avatar: null,
			icon: <EyeSvg color={Colors['green-main']} opened={true} />
		},
		{
			id: '2',
			username: 'kotec',
			name: 'Джефф Безос',
			avatar: null,
			icon: <EyeSvg color={Colors['blue-00']} opened={false} />
		},
		{
			id: '3',
			username: 'kotec',
			name: 'Джефф Безос',
			avatar: null,
			icon: <EyeSvg color={Colors['orange-main']} opened={false} />
		},
		{
			id: '4',
			username: 'kotec',
			name: 'Джефф Безос',
			avatar: null,
			icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
		},
		{
			id: '5',
			username: 'kotec',
			name: 'Джефф Безос',
			avatar: null,
			icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
		},
		{
			id: '6',
			username: 'kotec',
			name: 'Джефф Безос',
			avatar: null,
			icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
		},
		{
			id: '7',
			username: 'kotec',
			name: 'Джефф Безос',
			avatar: null,
			icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
		},
		{
			id: '8',
			username: 'kotec',
			name: 'Джефф Безос',
			avatar: null,
			icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
		},
		{
			id: '9',
			username: 'kotec',
			name: 'Джефф Безос',
			avatar: null,
			icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
		},
		{
			id: '10',
			username: 'kotec',
			name: 'Джефф Безос',
			avatar: null,
			icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
		},
		{
			id: '11',
			username: 'kotec',
			name: 'Джефф Безос',
			avatar: null,
			icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
		},
		{
			id: '12',
			username: 'kotec',
			name: 'Джефф Безос',
			avatar: null,
			icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
		},
		{
			id: '13',
			username: 'kotec',
			name: 'Джефф Безос',
			avatar: null,
			icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
		},
		{
			id: '14',
			username: 'kotec',
			name: 'Джефф Безос',
			avatar: null,
			icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
		},
		{
			id: '15',
			username: 'kotec',
			name: 'Джефф Безос',
			avatar: null,
			icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
		},
		{
			id: '16',
			username: 'kotec',
			name: 'Джефф Безос',
			avatar: null,
			icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
		},
		{
			id: '17',
			username: 'kotec',
			name: 'Джефф Безос',
			avatar: null,
			icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
		},
		{
			id: '18',
			username: 'kotec',
			name: 'Джефф Безос',
			avatar: null,
			icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
		},
		{
			id: '19',
			username: 'kotec',
			name: 'Джефф Безос',
			avatar: null,
			icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
		},
		{
			id: '20',
			username: 'kotec',
			name: 'Джефф Безос last',
			avatar: null,
			icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
		}
	]

	return (
		<ScrollView>
			<View className="gap-4">
				{data.map((item) => (
					<PeopleListItem
						key={item.id}
						id={item.id}
						avatar={item.avatar}
						name={item.name}
						username={item.username}
						icon={{
							iconSvg: <EyeSvg color={Colors['blue-00']} opened={false} />,
							iconCb: () => {}
						}}
					/>
				))}
			</View>
		</ScrollView>
	)
}

export default ShowMembersList
