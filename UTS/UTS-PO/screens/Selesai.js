import React from "react";
import { View, FlatList } from "react-native";
import ItemPesanan from "../components/ItemPesanan";

const parseDate = (d) => {
  if (!d) return 0;
  if (d instanceof Date) return d.getTime();
  if (typeof d === "number") return d;
  const s = String(d).trim();
  const parts = s.split(/[-\/\.]/);
  if (parts.length === 3) {
    const [p1, p2, p3] = parts.map(Number);
    if (p1 > 31) return new Date(p1, p2 - 1, p3).getTime();
    return new Date(p3, p2 - 1, p1).getTime();
  }
  const t = Date.parse(s);
  return isNaN(t) ? 0 : t;
};

export default function Selesai({ pesanan }) {
  const data = pesanan
    .filter((item) => item.status === "Selesai")
    .slice()
    .sort((a, b) => parseDate(a.date) - parseDate(b.date));

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ItemPesanan item={item} />}
      />
    </View>
  );
}
