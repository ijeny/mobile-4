import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Beranda from "./screens/Beranda";
import AdminProduk from "./screens/AdminProduk";
import Pesanan from "./screens/Pesanan";
import Selesai from "./screens/Selesai";
import {
  createOrder,
  createProduct,
  deleteOrder,
  deleteProduct,
  defaultProducts,
  fetchOrders,
  fetchProducts,
  initializeDatabase,
  markOrderAsCompleted,
  updateOrder,
  updateProduct,
} from "./lib/database";

const Tab = createBottomTabNavigator();
const THEME_KEY = "@uts_po_theme";
const LEGACY_ORDER_KEY = "@uts_po_pesanan";
const LEGACY_PRODUCT_KEY = "@uts_po_produk";

const appThemes = {
  light: {
    background: "#FAFBFC",
    card: "#FFFFFF",
    surface: "#F0F4F8",
    text: "#0B1929",
    muted: "#626F86",
    primary: "#0C2E55",
    secondary: "#2E7D8F",
    accent: "#E74C3C",
    border: "#DDE7F0",
    tabActive: "#0C2E55",
    tabInactive: "#7A8FA3",
    success: "#27AE60",
    warning: "#F39C12",
  },
  dark: {
    background: "#0A0E1A",
    card: "#131B2F",
    surface: "#1A2540",
    text: "#ECF0F7",
    muted: "#8B94A8",
    primary: "#60A5FA",
    secondary: "#34D399",
    accent: "#F87171",
    border: "#2D3E56",
    tabActive: "#60A5FA",
    tabInactive: "#6B7A8A",
    success: "#10B981",
    warning: "#F59E0B",
  },
};

const navigationTheme = (colors) => ({
  dark: colors.background === appThemes.dark.background,
  colors: {
    primary: colors.primary,
    background: colors.background,
    card: colors.card,
    text: colors.text,
    border: colors.border,
    notification: colors.secondary,
  },
});

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
      console.log("STEP 1");

      const [savedPesanan, savedProducts, savedTheme] = await Promise.all([
        AsyncStorage.getItem(LEGACY_ORDER_KEY),
        AsyncStorage.getItem(LEGACY_PRODUCT_KEY),
        AsyncStorage.getItem(THEME_KEY),
      ]);

      console.log("STEP 2");

      const parsedLegacyOrders = savedPesanan ? JSON.parse(savedPesanan) : [];

      const parsedLegacyProducts = savedProducts
        ? JSON.parse(savedProducts)
        : [];

      console.log("STEP 3");

      await initializeDatabase({
        legacyOrders: parsedLegacyOrders,
        legacyProducts: parsedLegacyProducts,
      });

      console.log("STEP 4");

      const [loadedOrders, loadedProducts] = await Promise.all([
        fetchOrders(),
        fetchProducts(),
      ]);

      console.log("STEP 5");

      setPesanan(loadedOrders);
      setProducts(loadedProducts);

      if (savedTheme === "dark" || savedTheme === "light") {
        setThemeMode(savedTheme);
      }
    } catch (error) {
      console.log("ERROR NIH:", error);
    } finally {
      setIsHydrated(true);
    }
  };

  loadData();
}, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const saveTheme = async () => {
      try {
        await AsyncStorage.setItem(THEME_KEY, themeMode);
      } catch (error) {
        console.log("Gagal menyimpan tema ke AsyncStorage:", error);
      }
    };

    saveTheme();
  }, [themeMode, isHydrated]);

  const refreshProducts = async () => {
    setProducts(await fetchProducts());
  };

  const refreshOrders = async () => {
    setPesanan(await fetchOrders());
  };

  const toggleTheme = () => {
    setThemeMode((currentMode) => (currentMode === "dark" ? "light" : "dark"));
  };

  const tambahPesanan = async (dataBaru) => {
    await createOrder(dataBaru);
    await refreshOrders();
  };

  const tambahProduk = async (produkBaru) => {
    await createProduct(produkBaru);
    await refreshProducts();
  };

  const updateProduk = async (productId, dataBaru) => {
    await updateProduct(productId, dataBaru);
    await refreshProducts();
  };

  const editPesanan = async (orderId, dataBaru) => {
    await updateOrder(orderId, dataBaru);
    await refreshOrders();
  };

  const deleteProduk = async (productId) => {
    await deleteProduct(productId);
    await refreshProducts();
  };

  const tandaiSelesai = async (id) => {
    await markOrderAsCompleted(id);
    await refreshOrders();
  };

  const hapusPesanan = async (id) => {
    await deleteOrder(id);
    await refreshOrders();
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
    <NavigationContainer theme={navigationTheme(colors)}>
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
            <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
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
          name="Toko Miiko"
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
              themeMode={themeMode}
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
              themeMode={themeMode}
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
              themeMode={themeMode}
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
              themeMode={themeMode}
              colors={colors}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
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
