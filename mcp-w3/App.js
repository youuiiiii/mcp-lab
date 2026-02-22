import { StatusBar } from 'expo-status-bar';
import { StyleSheet, TextInput, View } from 'react-native';
import { useState } from "react";
import Counter from './component/Counter';
import Profile from './component/Profile';

export default function App() {

  const [count, setCount] = useState(0);
  const [name, setName] = useState("");

  const [passedName, setPassedName] = useState("Anonymous");
  const [passedAge, setPassedAge] = useState(0);

  const handleIncrement = () => {
    setCount(count + 1);
  }
  const handleDecrement = () => {
    setCount(count - 1);
  }

  const handlePassValue = () => {
    const finalName = name.trim() === "" ? "Anonymous" : name.trim();
    setPassedName(finalName);
    setPassedAge(count);
  };

  return (
    <View style={styles.container}>

      <TextInput
        style={styles.input}
        placeholder="Input nama..."
        value={name}
        onChangeText={setName}
      />

      <Profile name={passedName} age={passedAge} />

      <Counter
        value={count}
        handleDecrement={handleDecrement}
        handleIncrement={handleIncrement}
        handlePassValue={handlePassValue}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: 220,
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
});
