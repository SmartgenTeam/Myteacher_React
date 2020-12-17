import React from 'react'
import { Text } from 'react-native-svg'
import COLORS from '../styles/color';

const PieLabel = ({ slices, height, width }) => {
    return slices.map((slice, index) => {
        const { labelCentroid, pieCentroid, data } = slice;
        return (
            <Text
                key={index}
                x={pieCentroid[ 0 ]}
                y={pieCentroid[ 1 ]}
                fill={COLORS.black}
                textAnchor={'middle'}
                alignmentBaseline={'middle'}
                fontSize={12}
                strokeWidth={0.2}
            >
                {data.amount}
            </Text>
        )
    })
}

export default PieLabel;