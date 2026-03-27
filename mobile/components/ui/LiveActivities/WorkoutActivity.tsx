import { Image, Text, VStack, HStack } from '@expo/ui/swift-ui';
import {
    font,
    foregroundStyle,
    padding,
    background,
    cornerRadius,
    layoutPriority,
} from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity } from 'expo-widgets';
import { TrainingType } from '@shared/enums';

export type WorkoutActivityProps = {
    icon: 'figure.walk' | 'figure.run' | 'bicycle';
    typeLabel: string;
    isPaused: boolean;
    formattedDistance: string;   // уже содержит число + единицу (например, "1.07 миль")
    formattedTime: string;
    formattedSpeed: string;       // уже содержит число + единицу (например, "7.5 миль/ч")
    unitDistance?: string;        // для подписи, например "мил."
    unitSpeed?: string;           // для подписи, например "мил/ч"
};

export const getActivityTypeIcon = (type: TrainingType) => {
    switch (type) {
        case TrainingType.WALK:
            return 'figure.walk';
        case TrainingType.RUN:
            return 'figure.run';
        case TrainingType.BICYCLE:
            return 'bicycle';
        default:
            return 'figure.walk';
    }
};

const WorkoutActivity = (props: WorkoutActivityProps) => {
    'widget';
    return {
        banner: (
            <VStack spacing={8} modifiers={[padding({ all: 16 })]}>
                <HStack spacing={6} modifiers={[background('#FFD60A')]}>
                    {props.isPaused ? (
                        <Text
                            modifiers={[
                                font({ size: 14, weight: 'bold' }),
                                foregroundStyle('#000'),
                            ]}
                        >
                            Остановлено
                        </Text>
                    ) : (
                        <Text
                            modifiers={[
                                font({ size: 18, weight: 'bold' }),
                                foregroundStyle('#8E8E93'),
                            ]}
                        >
                            {props.typeLabel}
                        </Text>
                    )}
                </HStack>

                <VStack spacing={8}>
                    <HStack
                        spacing={10}
                        modifiers={[
                            padding({ vertical: 18, horizontal: 20 }),
                        ]}
                    >
                        <VStack spacing={4} modifiers={[layoutPriority(1)]}>
                            <Text
                                modifiers={[
                                    font({ size: 28, weight: 'bold' }),
                                    foregroundStyle('#fff'),
                                ]}
                            >
                                {props.formattedTime}
                            </Text>
                            <Text
                                modifiers={[
                                    font({ size: 12 }),
                                    foregroundStyle('#8E8E93'),
                                ]}
                            >
                                Время
                            </Text>
                        </VStack>

                        <VStack spacing={4} modifiers={[layoutPriority(1)]}>
                            <Text
                                modifiers={[
                                    font({ size: 28, weight: 'bold' }),
                                    foregroundStyle('#fff'),
                                ]}
                            >
                                {props.formattedDistance.split(' ')[0]}
                            </Text>
                            <Text modifiers={[font({ size: 12 }), foregroundStyle('#8E8E93')]}>
                                Дистанция (мил.)
                            </Text>
                        </VStack>

                        {/* SPEED */}
                        <VStack spacing={4} modifiers={[layoutPriority(1)]}>
                            <Text
                                modifiers={[
                                    font({ size: 28, weight: 'bold' }),
                                    foregroundStyle('#fff'),
                                ]}
                            >
                                {props.formattedSpeed.split(' ')[0]}
                            </Text>
                            <Text modifiers={[font({ size: 12 }), foregroundStyle('#8E8E93')]}>
                                Скорость (мил/ч)
                            </Text>
                        </VStack>
                    </HStack>
                </VStack>
            </VStack>
        ),

        compactLeading: <Image systemName={props.icon} />,

        compactTrailing: (
            <Text modifiers={[foregroundStyle('#fff')]}>
                {props.formattedTime}
            </Text>
        ),

        minimal: <Image systemName={props.icon} />,

        expandedLeading: (
            <VStack spacing={2} modifiers={[padding({ all: 8 })]}>
                <Image systemName={props.icon} />
                <Text
                    modifiers={[font({ size: 12 }), foregroundStyle('#aaa')]}
                >
                    {props.typeLabel}
                </Text>
            </VStack>
        ),

        expandedTrailing: (
            <VStack spacing={4} modifiers={[padding({ all: 12 })]}>
                <Text
                    modifiers={[
                        font({ size: 24, weight: 'bold' }),
                        foregroundStyle('#fff'),
                    ]}
                >
                    {props.formattedTime}
                </Text>

                {props.isPaused && (
                    <Text modifiers={[foregroundStyle('#FFD60A')]}>
                        Пауза
                    </Text>
                )}
            </VStack>
        ),

        expandedBottom: (
            <HStack
                spacing={24}
                modifiers={[
                    padding({ all: 12 }),
                    background('#1C1C1E'),
                    cornerRadius(16),
                ]}
            >
                <Text modifiers={[foregroundStyle('#fff')]}>
                    {props.formattedDistance}
                </Text>

                <Text modifiers={[foregroundStyle('#fff')]}>
                    {props.formattedSpeed}
                </Text>
            </HStack>
        ),
    };
};

export default createLiveActivity('WorkoutActivity', WorkoutActivity);