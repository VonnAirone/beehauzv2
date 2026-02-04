import React from 'react';
import { View, StyleSheet, FlatList, FlatListProps } from 'react-native';
import { useGridColumns } from '../../hooks/useResponsive';

interface ResponsiveGridProps<T> extends Omit<FlatListProps<T>, 'renderItem' | 'numColumns'> {
  renderItem: (item: T, index: number) => React.ReactElement;
  gap?: number;
}

export const ResponsiveGrid = <T,>({
  data,
  renderItem,
  gap = 16,
  ...props
}: ResponsiveGridProps<T>) => {
  const columns = useGridColumns();

  const renderGridItem = ({ item, index }: { item: T; index: number }) => {
    const isLastInRow = (index + 1) % columns === 0;
    
    return (
      <View
        style={[
          styles.gridItem,
          {
            width: `${100 / columns}%`,
            paddingRight: isLastInRow ? 0 : gap / 2,
            paddingLeft: index % columns === 0 ? 0 : gap / 2,
            marginBottom: gap,
          },
        ]}
      >
        {renderItem(item, index)}
      </View>
    );
  };

  return (
    <FlatList
      {...props}
      data={data}
      renderItem={renderGridItem}
      key={columns} // Force re-render when columns change
      numColumns={1} // We handle columns manually for better responsive control
      contentContainerStyle={[styles.container, props.contentContainerStyle]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    flexDirection: 'column',
  },
});
