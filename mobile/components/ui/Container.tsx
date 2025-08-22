import { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { cn } from '@/helpers/cn';

export interface Props extends PropsWithChildren {
	className?: string;
}

export function Container({ children, className }: Props) {
	return <View className={cn('px-[16px]', className)}>{children}</View>;
}
