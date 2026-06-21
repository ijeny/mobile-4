import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Beranda from "./screens/Beranda";
import AdminProduk from "./screens/AdminProduk";
import Pesanan from "./screens/Pesanan";
import Selesai from "./screens/Selesai";

const Tab = createBottomTabNavigator();
const STORAGE_KEY = "@uts_po_pesanan";
const PRODUCT_STORAGE_KEY = "@uts_po_produk";

const defaultProducts = [
  { id: "prod-burnt-cheesecake", name: "Burnt Cheesecake", price: 50000 },
  { id: "prod-brownies", name: "Brownies", price: 40000 },
  { id: "prod-goguma-ppang", name: "Goguma Ppang", price: 30000 },
  { id: "prod-tiramisu", name: "Tiramisu", price: 45000 },
  { id: "prod-matcha-tart", name: "Matcha Tart", price: 35000 },
];

const normalizeProducts = (list) =>
  list.map((item, index) => ({
    id: item.id || `prod-${index}-${item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name: item.name,
    price: item.price,
  }));

export default function App() {
  const [pesanan, setPesanan] = useState([]);
  const [products, setProducts] = useState(defaultProducts);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedPesanan, savedProducts] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(PRODUCT_STORAGE_KEY),
        ]);

        if (savedPesanan) {
          setPesanan(JSON.parse(savedPesanan));
        }

        if (savedProducts) {
          const parsedProducts = JSON.parse(savedProducts);
          if (Array.isArray(parsedProducts) && parsedProducts.length > 0) {
            setProducts(normalizeProducts(parsedProducts));
          }
        }
      } catch (error) {
        console.log("Gagal memuat data dari AsyncStorage:", error);
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

    const savePesanan = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pesanan));
      } catch (error) {
        console.log("Gagal menyimpan pesanan ke AsyncStorage:", error);
      }
    };

    savePesanan();
  }, [pesanan, isHydrated]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const saveProducts = async () => {
      try {
        await AsyncStorage.setItem(
          PRODUCT_STORAGE_KEY,
          JSON.stringify(products),
        );
      } catch (error) {
        console.log("Gagal menyimpan produk ke AsyncStorage:", error);
      }
    };

    saveProducts();
  }, [products, isHydrated]);

  const tambahPesanan = (dataBaru) => {
    setPesanan((prevPesanan) => [...prevPesanan, dataBaru]);
  };

const editPesanan = (id, dataBaru) => {
  setPesanan((prevPesanan) =>
    prevPesanan.map((item) =>
      item.id === id
        ? {
            ...item,
            ...dataBaru,
          }
        : item,
    ),
  );
};
  const tambahProduk = (produkBaru) => {
    setProducts((prevProducts) => {
      const namaBaru = produkBaru.name.trim();
      const sudahAda = prevProducts.some(
        (item) => item.name.toLowerCase() === namaBaru.toLowerCase(),
      );

      if (sudahAda) {
        return prevProducts;
      }

      return [
        ...prevProducts,
        {
          id: `prod-${Date.now()}-${namaBaru.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          name: namaBaru,
          price: produkBaru.price,
        },
      ];
    });
  };

  const updateProduk = (productId, dataBaru) => {
    setProducts((prevProducts) =>
      prevProducts.map((item) =>
        item.id === productId
          ? {
              ...item,
              name: dataBaru.name.trim(),
              price: dataBaru.price,
            }
          : item,
      ),
    );
  };

  const deleteProduk = (productId) => {
    setProducts((prevProducts) =>
      prevProducts.filter((item) => item.id !== productId),
    );
  };

  const tandaiSelesai = (id) => {
    setPesanan((prevPesanan) =>
      prevPesanan.map((item) =>
        item.id === id ? { ...item, status: "Selesai" } : item,
      ),
    );
  };

  const hapusPesanan = (id) => {
    setPesanan((prevPesanan) => prevPesanan.filter((item) => item.id !== id));
  };

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#0C2C55" },
          headerTintColor: "#fff",
          tabBarActiveTintColor: "#0C2C55",
          tabBarInactiveTintColor: "#629FAD",
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
/>          )}
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
            <Selesai {...props} pesanan={pesanan} hapusPesanan={hapusPesanan} />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
