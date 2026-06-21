import React from "react";
import { View, Text, StyleSheet } from "react-native";
import FormPesanan from "../components/FormPesanan";
import { appColors } from "../theme/colors";

export default function Beranda({ tambahPesanan, products }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Input Pre-Order</Text>

      <FormPesanan onTambah={tambahPesanan} products={products} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: appColors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
    textAlign: "center",
    color: appColors.primaryText,
  },
});
