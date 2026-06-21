import React from "react";
import { View, Text, StyleSheet } from "react-native";
import FormPesanan from "../components/FormPesanan";
import { appColors } from "../theme/colors";

export default function Beranda({ tambahPesanan, products, colors = appColors }) {
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
    textAlign: "center",
  },
});
