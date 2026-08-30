import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { EmptyState, MoneyText, RoundIcon, ui } from "@/components/budget-ui";
import { CategoryId, formatDate, TransactionKind } from "@/lib/budget-data";
import { useBudget } from "@/lib/budget-store";
import { haptic } from "@/lib/haptics";
import { ScreenContainer } from "@/components/screen-container";

import Animated, { FadeInDown } from "react-native-reanimated";
import { AnimatedPressable } from "@/components/animated-pressable";

const filters: { id: "all" | TransactionKind; label: "all" | "income" | "expense" }[] = [{ id: "all", label: "all" }, { id: "expense", label: "expense" }, { id: "income", label: "income" }];

export default function TransactionsScreen() {
  const { settings, transactions, t, categoryName } = useBudget();
  const { category } = useLocalSearchParams<{ category?: CategoryId }>();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | TransactionKind>("all");
  const language = settings.language;
  const filtered = useMemo(() => transactions.filter((item) => (filter === "all" || item.kind === filter) && (!category || item.categoryId === category) && `${item.title} ${categoryName(item.categoryId)}`.toLowerCase().includes(query.toLowerCase())), [category, categoryName, filter, query, transactions]);

  return (
    <ScreenContainer className="px-5">
      <View style={styles.header}><View><Text style={styles.title}>{t("transactions")}</Text><Text style={styles.subtitle}>{t("thisMonth")}</Text></View><AnimatedPressable onPress={() => { haptic.light(); router.push({ pathname: "/transaction", params: { kind: "expense" } } as never); }} style={({ pressed }: { pressed: boolean }) => [styles.addButton, pressed && styles.pressed]}><MaterialIcons name="add" size={22} color="#FFFFFF" /></AnimatedPressable></View>
      <View style={styles.controlRow}><View style={styles.search}><MaterialIcons name="search" size={20} color={"var(--color-muted)"} /><TextInput placeholder={t("search")} placeholderTextColor="var(--color-muted)" value={query} onChangeText={setQuery} style={styles.searchInput} /></View><View style={styles.filters}>{filters.map((item) => <AnimatedPressable key={item.id} onPress={() => { haptic.selection(); setFilter(item.id); }} style={({ pressed }: { pressed: boolean }) => [styles.filter, filter === item.id && styles.filterActive, pressed && styles.pressed]}><Text style={[styles.filterText, filter === item.id && styles.filterTextActive]}>{t(item.label)}</Text></AnimatedPressable>)}</View></View>
      {category ? <View style={styles.categoryFilter}><MaterialIcons name="label" size={15} color={"var(--color-primary)"} /><Text style={styles.categoryFilterText}>{categoryName(category)}</Text><Pressable onPress={() => router.setParams({ category: undefined } as never)} hitSlop={8}><MaterialIcons name="close" size={17} color={"var(--color-primary)"} /></Pressable></View> : null}
      <FlatList data={filtered} keyExtractor={(item) => item.id} showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent} ListEmptyComponent={<EmptyState icon="receipt-long" title={t("noTransactions")} body={t("noTransactionsBody")} />} renderItem={({ item, index }) => <Animated.View entering={FadeInDown.duration(300).delay(Math.min(index * 30, 300)).springify()}><AnimatedPressable onPress={() => router.push({ pathname: "/transaction", params: { id: item.id } } as never)} style={({ pressed }: { pressed: boolean }) => [styles.transaction, pressed && styles.pressed]}><RoundIcon icon={item.kind === "income" ? "south-west" : "north-east"} color={item.kind === "income" ? "var(--color-success)" : "var(--color-error)"} background={item.kind === "income" ? "#E7F7F1" : "#FDEBEC"} /><View style={styles.main}><Text style={styles.transactionTitle}>{item.title}</Text><Text style={styles.transactionSub}>{formatDate(item.date, language)} · {categoryName(item.categoryId)}</Text></View><MoneyText amount={item.amount} language={language} type={item.kind} style={styles.amount} /></AnimatedPressable></Animated.View>} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 14, marginBottom: 18 },
  title: { color: "var(--color-foreground)", fontSize: 28, fontWeight: "800", letterSpacing: -0.7 },
  subtitle: { color: "var(--color-muted)", marginTop: 2, fontSize: 13 },
  addButton: { width: 44, height: 44, backgroundColor: "var(--color-primary)", borderRadius: 16, alignItems: "center", justifyContent: "center" },
  controlRow: { gap: 14 },
  search: { height: 50, borderRadius: 16, backgroundColor: "var(--color-surface)", borderWidth: 1, borderColor: "var(--color-border)", flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 8 },
  searchInput: { flex: 1, color: "var(--color-foreground)", fontSize: 14, height: "100%" },
  filters: { flexDirection: "row", gap: 8, marginTop: 14 },
  categoryFilter: { marginTop: 10, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#F1F5F9", borderRadius: 14, paddingHorizontal: 10, paddingVertical: 7 },
  categoryFilterText: { color: "var(--color-primary)", fontSize: 12, fontWeight: "800" },
  filter: { paddingHorizontal: 15, paddingVertical: 9, borderRadius: 99, backgroundColor: "var(--color-surface)", borderWidth: 1, borderColor: "var(--color-border)" },
  filterActive: { backgroundColor: "#F1F5F9", borderColor: "var(--color-border)" },
  filterText: { color: "var(--color-muted)", fontSize: 13, fontWeight: "700" },
  filterTextActive: { color: "var(--color-primary)" },
  listContent: { paddingTop: 14, paddingBottom: 28 },
  transaction: { minHeight: 70, backgroundColor: "var(--color-surface)", borderWidth: 1, borderColor: "var(--color-border)", borderRadius: 20, marginBottom: 9, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", gap: 11 },
  main: { flex: 1 },
  transactionTitle: { color: "var(--color-foreground)", fontSize: 15, fontWeight: "700" },
  transactionSub: { color: "var(--color-muted)", fontSize: 12, marginTop: 3 },
  amount: { fontSize: 14, textAlign: "right" },
  pressed: { opacity: 0.72 },
});
