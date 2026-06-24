import React from "react";
import { View, Text, StyleSheet, SectionList } from "react-native";
import ItemPesanan from "../components/ItemPesanan";
import { appColors } from "../theme/colors";

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

const formatDateKey = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const getSectionTitle = (dateKey) => {
  const todayKey = formatDateKey(new Date());

  if (dateKey === todayKey) {
    return "Pesanan Hari Ini";
  }

  return `Pesanan tanggal ${dateKey}`;
};

const formatDisplayDate = (dateKey) => {
  const [day, month, year] = dateKey.split("/").map(Number);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

export default function Selesai({ pesanan, colors = appColors }) {
  const grouped = pesanan
    .filter((item) => item.status === "Selesai")
    .slice()
    .sort((a, b) => parseDate(b.date) - parseDate(a.date))
    .reduce((sections, item) => {
      const dateKey = item.date || "Tanpa tanggal";
      const existingSection = sections.find(
        (section) => section.titleKey === dateKey,
      );

      if (existingSection) {
        existingSection.data.push(item);
        return sections;
      }

      sections.push({
        titleKey: dateKey,
        title:
          dateKey === "Tanpa tanggal"
            ? "Pesanan tanpa tanggal"
            : getSectionTitle(dateKey),
        subtitle: dateKey === "Tanpa tanggal" ? "" : formatDisplayDate(dateKey),
        data: [item],
      });

      return sections;
    }, []);

  return (
    <SectionList
      style={[styles.page, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.container}
      sections={grouped}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ItemPesanan item={item} colors={colors} />}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderTop}>
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>Riwayat</Text>
            </View>
            <Text style={[styles.sectionCount, { color: colors.muted }]}>
              {section.data.length} pesanan
            </Text>
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {section.title}
          </Text>
          {section.subtitle ? (
            <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>
              {section.subtitle}
            </Text>
          ) : null}
          <View
            style={[
              styles.sectionDivider,
              { backgroundColor: colors.border },
            ]}
          />
        </View>
      )}
      ListEmptyComponent={
        <Text style={[styles.emptyText, { color: colors.muted }]}>
          Belum ada pesanan selesai.
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  container: {
    padding: 20,
  },
  sectionHeader: {
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  sectionHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    color: appColors.white,
    fontSize: 12,
    fontWeight: "700",
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  sectionSubtitle: {
    marginTop: 2,
    fontSize: 13,
  },
  sectionDivider: {
    marginTop: 10,
    height: 1,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 24,
  },
});
