import React from "react";
import { View, Text } from "react-native";
import FormPesanan from "../components/FormPesanan";

export default function Beranda({ tambahPesanan, products, colors }) {
  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: colors.background }}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          marginBottom: 10,
          marginTop: 10,
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          color: colors.text,
        }}
      >
        Input Pre-Order
      </Text>

      <FormPesanan
        onTambah={tambahPesanan}
        products={products}
        colors={colors}
      />
    </View>
  );
}
