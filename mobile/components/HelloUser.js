import React from "react";
import { Text } from "react-native";

export default function HelloUser({ name }) {
  return (
    <Text style={{fontSize: 20, marginVertical: 5}}>
      Hello, {name}!
    </Text>
  );
}