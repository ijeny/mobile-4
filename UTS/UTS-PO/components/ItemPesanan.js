import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { appColors } from "../theme/colors";

export default function ItemPesanan({ item }) {
  const itemList = item.items && item.items.length ? item.items : null;
  const totalFromItems = itemList
    ? itemList.reduce((s, it) => s + (it.total || 0), 0)
    : item.total || 0;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{item.customer}</Text>

      {itemList ? (
        <View>
          {itemList.map((it, idx) => (
            <Text key={idx} style={styles.itemText}>
              {it.produk} x{it.jumlah} — Rp {it.total}
            </Text>
          ))}
          <Text style={styles.totalText}>Total: Rp {totalFromItems}</Text>
        </View>
      ) : (
        <Text style={styles.itemText}>Total: Rp {item.total || 0}</Text>
      )}

      {item.date && (
        <Text style={styles.dateText}>Tanggal ambil: {item.date}</Text>
      )}

      <Text
        style={[
          styles.statusText,
          {
            color:
              item.status === "Selesai" ? appColors.success : appColors.danger,
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
    backgroundColor: appColors.surface,
    borderColor: appColors.border,
  },
  title: {
    fontWeight: "bold",
    fontSize: 17,
    paddingBottom: 10,
    color: appColors.primaryText,
  },
  itemText: {
    color: appColors.primaryText,
    marginBottom: 4,
  },
  totalText: {
    marginTop: 6,
    fontWeight: "bold",
    color: appColors.primaryText,
  },
  dateText: {
    marginTop: 10,
    fontSize: 13,
    color: appColors.secondaryText,
  },
  statusText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
  },
});
