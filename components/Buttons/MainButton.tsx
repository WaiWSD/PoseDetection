import React, { useContext } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Button,
    TouchableOpacity,
    TouchableNativeFeedback,
    Platform,
    Pressable,
    ViewStyle,
    TextStyle
} from 'react-native';

const MainButton: React.FC<{
    style?: ViewStyle | {},
    buttonStyle?: ViewStyle | {},
    buttonText?: TextStyle | {},
    onPress: () => void,
    children: any
}> = ({
    style,
    buttonStyle,
    buttonText,
    onPress,
    children
    }) => {
        // let ButtonComponent = TouchableOpacity; // .jsx need capital head

        // if (Platform.OS === 'android' && Platform.Version >= 21) {
        //     ButtonComponent = TouchableNativeFeedback;
        // }

        return (
            <View style={{ ...styles.buttonContainer, ...style }}>
                <Pressable onPress={onPress} style={{ width: '100%' }}>
                    <View style={{ ...styles.button, ...buttonStyle }}>
                        <Text style={{
                            fontSize: 25,
                            ...styles.buttonText,
                            ...buttonText,
                        }}>{children}</Text>
                    </View>
                </Pressable>
            </View>
        );
    };

const styles = StyleSheet.create({
    buttonContainer: {
        borderRadius: 12, // make TouchableNativeFeedback ripple effect match the shape of button
        overflow: 'hidden',
        backgroundColor: "grey",
        marginVertical: 7,
    },
    button: {
        // backgroundColor: Colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 30,
        alignItems: 'center',
        width: '100%',
    },
    buttonText: {
        color: 'white',
        // fontFamily: 'open-sans',
        textAlign: 'center',
        textAlignVertical: 'center',
    },
});

export default MainButton;