import React from "react";
import { View, Text } from "react-native";
import FormPesanan from "../components/FormPesanan";

export default function Beranda({ tambahPesanan, products }) {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          marginBottom: 10,
          marginTop: 10,
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          color: "#003049",
        }}
      >
        Input Pre-Order
      </Text>

      <FormPesanan onTambah={tambahPesanan} products={products} />
    </View>
  );
}
