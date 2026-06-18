import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function ItemPesanan({ item, onHapus, colors }) {
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
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        isPO && styles.cardPO,
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {item.customer}
      </Text>
      {itemList ? (
        <View>
          {itemList.map((it, idx) => (
            <Text key={idx} style={{ color: colors.text }}>
              {it.produk} x{it.jumlah} — Rp {it.total}
            </Text>
          ))}
          <Text
            style={{ marginTop: 6, fontWeight: "bold", color: colors.text }}
          >
            Total: Rp {totalFromItems}
          </Text>
        </View>
      ) : (
        <View>
          {legacyProduct && (
            <Text style={{ color: colors.text }}>{legacyProduct}</Text>
          )}
          {item.jumlah !== undefined && (
            <Text style={{ color: colors.text }}>Jumlah: {item.jumlah}</Text>
          )}
          <Text style={{ color: colors.text }}>
            Total: Rp {item.total || item.price || 0}
          </Text>
        </View>
      )}

      {item.date && (
        <Text style={[styles.dateText, { color: colors.muted }]}>
          Tanggal ambil: {item.date}
        </Text>
      )}

      <Text
        style={{
          color: item.status === "Selesai" ? "#22c55e" : "#ef4444",
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
    borderWidth: 1,
    marginVertical: 8,
    borderRadius: 5,
  },
  cardPO: {},
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
  },
  dateText: {
    marginTop: 8,
    fontSize: 13,
  },
});
