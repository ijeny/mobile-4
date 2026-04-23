import React from "react";
import { Text } from "react-native";

export default function Counter({ value }) {
  return (
    <Text style={{fontSize: 20, marginVertical: 5}}>
      jumlah: {value}
    </Text>
  );
}