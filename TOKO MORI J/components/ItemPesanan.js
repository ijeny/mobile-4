import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { appColors } from "../theme/colors";

export default function ItemPesanan({ item, colors = appColors }) {
  const itemList = item.items && item.items.length ? item.items : null;
  const totalFromItems = itemList
    ? itemList.reduce((s, it) => s + (it.total || 0), 0)
    : item.total || 0;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {item.customer}
      </Text>

      {itemList ? (
        <View>
          {itemList.map((it, idx) => (
            <Text key={idx} style={[styles.itemText, { color: colors.text }]}>
              {it.produk} x{it.jumlah} — Rp {it.total}
            </Text>
          ))}
          <Text style={[styles.totalText, { color: colors.text }]}>
            Total: Rp {totalFromItems}
          </Text>
        </View>
      ) : (
        <Text style={[styles.itemText, { color: colors.text }]}>
          Total: Rp {item.total || 0}
        </Text>
      )}

      {item.date && (
        <Text style={[styles.dateText, { color: colors.muted }]}>
          Tanggal ambil: {item.date}
        </Text>
      )}

      <Text
        style={[
          styles.statusText,
          {
            color:
              item.status === "Selesai" ? colors.success : colors.danger,
          },
        ]}
      >
        {item.status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderWidth: 1,
    marginVertical: 8,
    borderRadius: 12,
  },
  title: {
    fontWeight: "bold",
    fontSize: 17,
    paddingBottom: 10,
  },
  itemText: {
    marginBottom: 4,
  },
  totalText: {
    marginTop: 6,
    fontWeight: "bold",
  },
  dateText: {
    marginTop: 10,
    fontSize: 13,
  },
  statusText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
  },
});
