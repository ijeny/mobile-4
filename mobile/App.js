import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View } from 'react-native';
import HelloUser from './components/HelloUser';
import Counter from './components/Conter';

export default function App() {
  const [name, setName] = useState("mori");
  const [count, setCount] = useState(0);
  return (
    <View style={styles.container}>
      <HelloUser name={name} />
      <Button
        style={styles.button}
        title="Ganti Nama"
        onPress={() => setName("mori imut") }
      />
      <Counter value={count} />
        <Button
          style={styles.button}
          title="Tambah"
          onPress={() => setCount(count + 1)}
        />
      <View style={styles.button}>
        <Button
          style={styles.button}
          title="Kurang"
          onPress={() => setCount(count - 1)}
        />
      </View>
      <StatusBar style="auto" />
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
  button: {
    marginTop: 10,
  }
});
