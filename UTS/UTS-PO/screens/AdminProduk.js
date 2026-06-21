import React, { useState } from "react";
import { appColors } from "../theme/colors";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";

export default function AdminProduk({
  products,
  tambahProduk,
  updateProduk,
  deleteProduk,
}) {
  const [namaProduk, setNamaProduk] = useState("");
  const [hargaProduk, setHargaProduk] = useState("");
  const [editingId, setEditingId] = useState(null);

  const handleTambahProduk = () => {
    const nama = namaProduk.trim();
    const harga = parseInt(hargaProduk, 10);

    if (!nama || Number.isNaN(harga) || harga <= 0) {
      Alert.alert(
        "Input belum lengkap",
        "Isi nama produk dan harga yang valid.",
      );
      return;
    }

    const sudahAda = products.some(
      (item) => item.name.toLowerCase() === nama.toLowerCase(),
    );

    if (!editingId && sudahAda) {
      Alert.alert("Produk sudah ada", "Nama produk harus berbeda.");
      return;
    }

    if (
      editingId &&
      products.some(
        (item) =>
          item.id !== editingId &&
          item.name.toLowerCase() === nama.toLowerCase(),
      )
    ) {
      Alert.alert("Produk sudah ada", "Nama produk harus berbeda.");
      return;
    }

    if (editingId) {
      updateProduk(editingId, { name: nama, price: harga });
      setEditingId(null);
      Alert.alert("Berhasil", "Produk sudah diperbarui.");
    } else {
      tambahProduk({ name: nama, price: harga });
      Alert.alert("Berhasil", "Produk baru sudah ditambahkan ke dropdown.");
    }

    setNamaProduk("");
    setHargaProduk("");
  };

  const handleEditProduk = (item) => {
    setEditingId(item.id);
    setNamaProduk(item.name);
    setHargaProduk(String(item.price));
  };

  const handleBatalEdit = () => {
    setEditingId(null);
    setNamaProduk("");
    setHargaProduk("");
  };

  const handleHapusProduk = (item) => {
    Alert.alert("Hapus produk", `Hapus ${item.name}?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => deleteProduk(item.id),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Produk</Text>
      <Text style={styles.subtitle}>
        Tambahkan produk baru agar muncul di dropdown order.
      </Text>

      <TextInput
        placeholder="Nama produk"
        value={namaProduk}
        onChangeText={setNamaProduk}
        style={styles.input}
      />

      <TextInput
        placeholder="Harga produk"
        value={hargaProduk}
        onChangeText={setHargaProduk}
        keyboardType="numeric"
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleTambahProduk}>
        <Text style={styles.buttonText}>
          {editingId ? "Simpan Perubahan" : "Tambah Produk"}
        </Text>
      </TouchableOpacity>

      {editingId && (
        <TouchableOpacity style={styles.buttonGhost} onPress={handleBatalEdit}>
          <Text style={styles.buttonGhostText}>Batal Edit</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.listTitle}>Daftar Produk</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardName}>{item.name}</Text>
            <Text style={styles.cardPrice}>Rp {item.price}</Text>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.smallButton}
                onPress={() => handleEditProduk(item)}
              >
                <Text style={styles.smallButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallButton, styles.deleteButton]}
                onPress={() => handleHapusProduk(item)}
              >
                <Text style={styles.smallButtonText}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
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
    fontSize: 22,
    fontWeight: "bold",
    color: appColors.primaryText,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 16,
    color: appColors.secondaryText,
  },
  input: {
    backgroundColor: appColors.surface,
    borderWidth: 1,
    borderColor: appColors.border,
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: appColors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 18,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  buttonGhost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: appColors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 18,
  },
  buttonGhostText: {
    color: appColors.primary,
    fontWeight: "bold",
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: appColors.primaryText,
  },
  card: {
    backgroundColor: appColors.surface,
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: appColors.border,
  },
  cardName: {
    fontWeight: "600",
    color: appColors.primaryText,
  },
  cardPrice: {
    marginTop: 4,
    color: appColors.success,
  },
  cardActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  smallButton: {
    backgroundColor: appColors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: appColors.danger,
  },
  smallButtonText: {
    color: appColors.white,
    fontWeight: "600",
  },
});
