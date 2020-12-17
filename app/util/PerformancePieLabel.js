import React from 'react'
import { Text } from 'react-native-svg'
import COLORS from '../styles/color';

const PerformancePieLabel = ({ slices, height, width }) => {
    return slices.map((slice, index) => {
        const { labelCentroid, pieCentroid, data } = slice;
        return (
            <Text
                key={index}
                x={pieCentroid[ 0 ]}
                y={pieCentroid[ 1 ]}
                fill={COLORS.white}
                textAnchor={'middle'}
                alignmentBaseline={'middle'}
                fontSize={11.5}
                strokeWidth={0.2}
            >
                {data.value}
            </Text>
        )
    })
}

export default PerformancePieLabel;