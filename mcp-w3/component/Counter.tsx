import { Button, Text, View } from "react-native";

interface iCounter {
    value: number;
    handleIncrement: () => void;
    handleDecrement: () => void;
    handlePassValue: () => void;
}

const Counter = ({
    handleIncrement,
    handleDecrement,
    value,
    handlePassValue
}: iCounter) => {
    return (
        <View>
            <Text>{value}</Text>
            <Button title="Increment" onPress={handleIncrement} />
            <Button title="Decrement" onPress={handleDecrement} />
            <Button title="Pass Value" onPress={handlePassValue} />
        </View>
    )
}

export default Counter;
