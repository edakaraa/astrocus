import React, { useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "../context/AppContext";
import { BADGES, getBadgeLabel } from "../shared/constants";
import { t } from "../shared/i18n";
import { SubScreenScaffold } from "../components/layout/SubScreenScaffold";
import { SubScreenTopBar } from "../components/layout/TabScreenTopBar";
import { BadgeItem } from "../components/badges/BadgeItem";
import theme from "../theme";

export const BadgesScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, earnedBadgeIds, user } = useAppContext();
  const earnedSet = useMemo(() => new Set(earnedBadgeIds), [earnedBadgeIds]);

  const data = useMemo(
    () =>
      BADGES.map((badge) => {
        const label = getBadgeLabel(badge, language);
        return {
          id: badge.id,
          title: label.name,
          description: label.description,
          isUnlocked: earnedSet.has(badge.id),
        };
      }),
    [earnedSet, language],
  );

  const unlockedCount = data.filter((item) => item.isUnlocked).length;

  if (!user) {
    return null;
  }

  const listHeader = (
    <SubScreenTopBar
      title={t(language, "badgesScreenTitle")}
      stardustAmount={user.totalStardust}
      backAccessibilityLabel={t(language, "back")}
      onBack={() => router.back()}
      rightMeta={`${unlockedCount}/${BADGES.length}`}
    />
  );

  return (
    <SubScreenScaffold>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={listHeader}
        columnWrapperStyle={styles.columnWrap}
        contentContainerStyle={[
          styles.list,
          {
            paddingBottom: Math.max(insets.bottom, theme.spacing.xl),
          },
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <BadgeItem
              id={item.id}
              title={item.title}
              description={item.description}
              isUnlocked={item.isUnlocked}
            />
          </View>
        )}
      />
    </SubScreenScaffold>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  columnWrap: {
    gap: theme.spacing.md,
  },
  gridItem: {
    flex: 1,
  },
});
