import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import Beranda from "./screens/Beranda";
import AdminProduk from "./screens/AdminProduk";
import Pesanan from "./screens/Pesanan";
import Selesai from "./screens/Selesai";
import {
  createOrder,
  createProduct,
  defaultProducts,
  deleteOrder,
  deleteProduct,
  fetchOrders,
  fetchProducts,
  getSetting,
  initializeDatabase,
  markOrderAsCompleted,
  setSetting,
  updateOrder,
  updateProduct,
} from "./lib/database";
import { appThemes } from "./theme/colors";

const Tab = createBottomTabNavigator();
const THEME_SETTING_KEY = "themeMode";

const navigationTheme = (colors, themeMode) => {
  const baseTheme = themeMode === "dark" ? DarkTheme : DefaultTheme;
  return {
    ...baseTheme,
    dark: themeMode === "dark",
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.secondary,
    },
  };
};

export default function App() {
  const [pesanan, setPesanan] = useState([]);
  const [products, setProducts] = useState(defaultProducts);
  const [themeMode, setThemeMode] = useState("light");
  const [isHydrated, setIsHydrated] = useState(false);

  const colors = useMemo(
    () => appThemes[themeMode] ?? appThemes.light,
    [themeMode],
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        await initializeDatabase();

        const [savedProducts, savedPesanan, savedThemeMode] = await Promise.all([
          fetchProducts(),
          fetchOrders(),
          getSetting(THEME_SETTING_KEY),
        ]);

        setProducts(savedProducts);
        setPesanan(savedPesanan);

        if (savedThemeMode === "light" || savedThemeMode === "dark") {
          setThemeMode(savedThemeMode);
        }
      } catch (error) {
        console.log("Gagal memuat data dari SQLite:", error);
      } finally {
        setIsHydrated(true);
      }
    };

    loadData();
  }, []);

  const refreshProducts = async () => {
    setProducts(await fetchProducts());
  };

  const refreshOrders = async () => {
    setPesanan(await fetchOrders());
  };

  const toggleTheme = async () => {
    const nextThemeMode = themeMode === "dark" ? "light" : "dark";
    setThemeMode(nextThemeMode);

    try {
      await setSetting(THEME_SETTING_KEY, nextThemeMode);
    } catch (error) {
      console.log("Gagal menyimpan tema ke SQLite:", error);
    }
  };

  const tambahPesanan = async (dataBaru) => {
    try {
      await createOrder(dataBaru);
      await refreshOrders();
    } catch (error) {
      console.log("Gagal menyimpan pesanan ke SQLite:", error);
    }
  };

  const editPesanan = async (id, dataBaru) => {
    try {
      await updateOrder(id, dataBaru);
      await refreshOrders();
    } catch (error) {
      console.log("Gagal memperbarui pesanan di SQLite:", error);
    }
  };

  const tambahProduk = async (produkBaru) => {
    try {
      await createProduct(produkBaru);
      await refreshProducts();
    } catch (error) {
      console.log("Gagal menyimpan produk ke SQLite:", error);
    }
  };

  const updateProduk = async (productId, dataBaru) => {
    try {
      await updateProduct(productId, dataBaru);
      await refreshProducts();
    } catch (error) {
      console.log("Gagal memperbarui produk di SQLite:", error);
    }
  };

  const deleteProduk = async (productId) => {
    try {
      await deleteProduct(productId);
      await refreshProducts();
    } catch (error) {
      console.log("Gagal menghapus produk dari SQLite:", error);
    }
  };

  const tandaiSelesai = async (id) => {
    try {
      await markOrderAsCompleted(id);
      await refreshOrders();
    } catch (error) {
      console.log("Gagal menandai pesanan selesai di SQLite:", error);
    }
  };

  const hapusPesanan = async (id) => {
    try {
      await deleteOrder(id);
      await refreshOrders();
    } catch (error) {
      console.log("Gagal menghapus pesanan dari SQLite:", error);
    }
  };

  if (!isHydrated) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Memuat aplikasi...
        </Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar
        backgroundColor={colors.statusBar}
        barStyle={colors.statusBarStyle}
        translucent={false}
      />
      <NavigationContainer theme={navigationTheme(colors, themeMode)}>
        <Tab.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.card },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text },
            tabBarStyle: {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
            },
            tabBarActiveTintColor: colors.tabActive,
            tabBarInactiveTintColor: colors.tabInactive,
            headerRight: () => (
              <TouchableOpacity
                onPress={toggleTheme}
                style={styles.themeButton}
              >
                <Ionicons
                  name={themeMode === "dark" ? "sunny" : "moon"}
                  size={20}
                  color={colors.text}
                />
              </TouchableOpacity>
            ),
          }}
        >
          <Tab.Screen
            name="Toko Mori J"
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={size} color={color} />
              ),
            }}
          >
            {(props) => (
              <Beranda
                {...props}
                tambahPesanan={tambahPesanan}
                products={products}
                colors={colors}
              />
            )}
          </Tab.Screen>

          <Tab.Screen
            name="Admin Produk"
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="settings" size={size} color={color} />
              ),
            }}
          >
            {(props) => (
              <AdminProduk
                {...props}
                products={products}
                tambahProduk={tambahProduk}
                updateProduk={updateProduk}
                deleteProduk={deleteProduk}
                colors={colors}
              />
            )}
          </Tab.Screen>

          <Tab.Screen
            name="Pesanan Masuk"
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="list" size={size} color={color} />
              ),
            }}
          >
            {(props) => (
              <Pesanan
                {...props}
                pesanan={pesanan}
                tandaiSelesai={tandaiSelesai}
                hapusPesanan={hapusPesanan}
                editPesanan={editPesanan}
                products={products}
                colors={colors}
              />
            )}
          </Tab.Screen>

          <Tab.Screen
            name="Pesanan Selesai"
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="checkmark-circle" size={size} color={color} />
              ),
            }}
          >
            {(props) => (
              <Selesai
                {...props}
                pesanan={pesanan}
                hapusPesanan={hapusPesanan}
                colors={colors}
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
  },
  themeButton: {
    marginRight: 14,
    padding: 6,
  },
});
