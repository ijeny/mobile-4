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
  colors = appColors,
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Admin Produk</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        Tambahkan produk baru agar muncul di dropdown order.
      </Text>

      <TextInput
        placeholder="Nama produk"
        placeholderTextColor={colors.muted}
        value={namaProduk}
        onChangeText={setNamaProduk}
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
      />

      <TextInput
        placeholder="Harga produk"
        placeholderTextColor={colors.muted}
        value={hargaProduk}
        onChangeText={setHargaProduk}
        keyboardType="numeric"
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={handleTambahProduk}
      >
        <Text style={styles.buttonText}>
          {editingId ? "Simpan Perubahan" : "Tambah Produk"}
        </Text>
      </TouchableOpacity>

      {editingId && (
        <TouchableOpacity
          style={[
            styles.buttonGhost,
            { borderColor: colors.primary },
          ]}
          onPress={handleBatalEdit}
        >
          <Text style={[styles.buttonGhostText, { color: colors.primary }]}>
            Batal Edit
          </Text>
        </TouchableOpacity>
      )}

      <Text style={[styles.listTitle, { color: colors.text }]}>
        Daftar Produk
      </Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.cardName, { color: colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.cardPrice, { color: colors.success }]}>
              Rp {item.price}
            </Text>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={[
                  styles.smallButton,
                  { backgroundColor: colors.primary },
                ]}
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
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  button: {
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
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 18,
  },
  buttonGhostText: {
    fontWeight: "bold",
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  card: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  cardName: {
    fontWeight: "600",
  },
  cardPrice: {
    marginTop: 4,
  },
  cardActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  smallButton: {
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
