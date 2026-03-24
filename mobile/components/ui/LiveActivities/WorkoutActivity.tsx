import { Image, Text, VStack, HStack } from '@expo/ui/swift-ui';
import {
    font,
    foregroundStyle,
    padding,
    background,
    cornerRadius,
} from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity } from 'expo-widgets';
import { TrainingType } from '@shared/enums';
import { WorkoutTypesMap } from '@/constants/WorkoutTypes';

export type WorkoutActivityProps = {
    type: TrainingType;
    isPaused: boolean;
    durationSec: number;
    distanceKm: number;
    speedKmh: number;
};

const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;

    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s
            .toString()
            .padStart(2, '0')}`;
    }

    return `${m}:${s.toString().padStart(2, '0')}`;
};

const getTypeIcon = (type: TrainingType) => {
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

    const icon = getTypeIcon(props.type);
    const typeLabel = WorkoutTypesMap?.[props.type]?.name ?? 'Тренировка';
    const time = formatTime(props.durationSec);

    // @TODO https://github.com/expo/expo/issues/44123
    return {
        // 🔒 LOCK SCREEN (основной вид)
        banner: (
            <VStack spacing={12} modifiers={[padding({ all: 16 })]}>

                {/* HEADER */}
                <HStack spacing={8}>
                    <Image systemName={icon} />
                    <Text
                        modifiers={[
                            font({ size: 14, weight: 'medium' }),
                            foregroundStyle('#B0B0B0'),
                        ]}
                    >
                        {typeLabel}
                    </Text>
                </HStack>

                {/* TIMER (главный элемент) */}
                <Text
                    modifiers={[
                        font({ size: 44, weight: 'bold' }),
                        foregroundStyle('#FFFFFF'),
                    ]}
                >
                    {time}
                </Text>

                {/* PAUSE STATE */}
                {props.isPaused && (
                    <HStack
                        modifiers={[
                            background('#FFD60A'),
                            cornerRadius(12),
                            padding({ vertical: 6, horizontal: 12 }),
                        ]}
                    >
                        <Text
                            modifiers={[
                                font({ weight: 'bold', size: 14 }),
                                foregroundStyle('#000'),
                            ]}
                        >
                            Остановлено
                        </Text>
                    </HStack>
                )}

                {/* METRICS CARD */}
                <HStack
                    spacing={24}
                    modifiers={[
                        padding({ all: 12 }),
                        background('#1C1C1E'),
                        cornerRadius(20),
                    ]}
                >
                    {/* TIME */}
                    <VStack spacing={2}>
                        <Text modifiers={[font({ size: 12 }), foregroundStyle('#8E8E93')]}>
                            Время
                        </Text>
                        <Text
                            modifiers={[
                                font({ size: 18, weight: 'bold' }),
                                foregroundStyle('#fff'),
                            ]}
                        >
                            {time}
                        </Text>
                    </VStack>

                    {/* DISTANCE */}
                    <VStack spacing={2}>
                        <Text modifiers={[font({ size: 12 }), foregroundStyle('#8E8E93')]}>
                            Дистанция
                        </Text>
                        <Text
                            modifiers={[
                                font({ size: 18, weight: 'bold' }),
                                foregroundStyle('#fff'),
                            ]}
                        >
                            {props.distanceKm.toFixed(2)}
                        </Text>
                        <Text modifiers={[font({ size: 12 }), foregroundStyle('#8E8E93')]}>
                            км
                        </Text>
                    </VStack>

                    {/* SPEED */}
                    <VStack spacing={2}>
                        <Text modifiers={[font({ size: 12 }), foregroundStyle('#8E8E93')]}>
                            Скорость
                        </Text>
                        <Text
                            modifiers={[
                                font({ size: 18, weight: 'bold' }),
                                foregroundStyle('#fff'),
                            ]}
                        >
                            {props.speedKmh.toFixed(1)}
                        </Text>
                        <Text modifiers={[font({ size: 12 }), foregroundStyle('#8E8E93')]}>
                            км/ч
                        </Text>
                    </VStack>
                </HStack>
            </VStack>
        ),

        // 🟡 DYNAMIC ISLAND (compact)
        compactLeading: <Image systemName={icon} />,

        compactTrailing: (
            <Text modifiers={[foregroundStyle('#fff')]}>
                {time}
            </Text>
        ),

        minimal: <Image systemName={icon} />,

        // 🔳 EXPANDED ISLAND
        expandedLeading: (
            <VStack spacing={4} modifiers={[padding({ all: 12 })]}>
                <Image systemName={icon} />
                <Text modifiers={[font({ size: 12 }), foregroundStyle('#aaa')]}>
                    {typeLabel}
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
                    {time}
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
                    {props.distanceKm.toFixed(2)} км
                </Text>

                <Text modifiers={[foregroundStyle('#fff')]}>
                    {props.speedKmh.toFixed(1)} км/ч
                </Text>
            </HStack>
        ),
    };
};

export default createLiveActivity('WorkoutActivity', WorkoutActivity);