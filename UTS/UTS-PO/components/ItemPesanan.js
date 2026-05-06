import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function ItemPesanan({ item, onHapus }) {
  const isPO =
    item.isPO === true ||
    item.po === true ||
    item.jenis === "PO" ||
    item.type === "PO";
  const itemList = item.items && item.items.length ? item.items : null;
  const legacyProduct = item.product || null;

  const totalFromItems = itemList
    ? itemList.reduce((s, it) => s + (it.total || 0), 0)
    : item.total || 0;

  return (
    <View style={[styles.card, isPO && styles.cardPO]}>
      <Text style={styles.title}>{item.customer}</Text>
      {itemList ? (
        <View>
          {itemList.map((it, idx) => (
            <Text key={idx}>
              {it.produk} x{it.jumlah} — Rp {it.total}
            </Text>
          ))}
          <Text style={{ marginTop: 6, fontWeight: "bold" }}>
            Total: Rp {totalFromItems}
          </Text>
        </View>
      ) : (
        <View>
          {legacyProduct && <Text>{legacyProduct}</Text>}
          {item.jumlah !== undefined && <Text>Jumlah: {item.jumlah}</Text>}
          <Text>Total: Rp {item.total || item.price || 0}</Text>
        </View>
      )}

      {item.date && (
        <Text style={styles.dateText}>Tanggal ambil: {item.date}</Text>
      )}

      <Text
        style={{
          color: item.status === "Selesai" ? "green" : "red",
          marginTop: 6,
        }}
      >
        {item.status}
      </Text>

      {onHapus && (
        <TouchableOpacity style={styles.hapusButton} onPress={onHapus}>
          <Text style={styles.hapusButtonText}>Hapus Pesanan</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    paddingBottom: 25,
    backgroundColor: "#eee",
    marginVertical: 8,
    borderRadius: 5,
    gap: 9,
  },
  cardPO: {
    backgroundColor: "#c0e0e7",
  },
  title: {
    fontWeight: "bold",
    fontSize: 17,
    paddingBottom: 10,
  },
  hapusButton: {
    marginTop: 10,
    backgroundColor: "#B23B3B",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  hapusButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  dateText: {
    marginTop: 8,
    color: "#4b6570",
    fontSize: 13,
  },
});
