import { StyleSheet, Text, TextInput, View } from "react-native";

interface CustomProps {
  input: string;
  onChange: (val: string) => void;
}

export const CustomTextInput = ({ input, onChange }: CustomProps) => {
  console.log(input);

  return (
    <View style={styles.inputContainer}>
      <Text>Name</Text>
      <TextInput
        placeholder="Input your name"
        style={styles.input}
        value={input}
        onChangeText={onChange}
      />
    </View>
  );
};

export const NIMInput = ({ input, onChange }: CustomProps) => {
  console.log(input);

  return (
    <View style={styles.inputContainer}>
      <Text>NIM</Text>
      <TextInput
        placeholder="Input your NIM/Student ID"
        style={styles.input}
        value={input}
        onChangeText={onChange}
        keyboardType="numeric"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    width: 200,
  },
  input: {
    borderColor: "black",
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
  },
});
