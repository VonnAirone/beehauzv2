import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  ScrollView, 
  TouchableOpacity,
  NativeScrollEvent,
  NativeSyntheticEvent
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, ArrowRight } from 'lucide-react-native';
import { OnboardingScreen1 } from './OnboardingScreen1';
import { OnboardingScreen2 } from './OnboardingScreen2';
import { OnboardingScreen3 } from './OnboardingScreen3';
import { Button } from '../../components/common';
import { typography } from '../../styles/typography';
import { colors } from '../../styles/colors';

const { width } = Dimensions.get('window');

interface OnboardingContainerProps {
  onComplete: () => void;
}

export const OnboardingContainer: React.FC<OnboardingContainerProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const pages = [
    { component: OnboardingScreen1 },
    { component: OnboardingScreen2 },
    { component: OnboardingScreen3 },
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentIndex(index);
  };

  const goToNext = () => {
    if (currentIndex < pages.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    } else {
      onComplete();
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      scrollViewRef.current?.scrollTo({
        x: prevIndex * width,
        animated: true,
      });
      setCurrentIndex(prevIndex);
    }
  };

  const goToPage = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * width,
      animated: true,
    });
    setCurrentIndex(index);
  };

  const isLastPage = currentIndex === pages.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={onComplete}
        >
          <Text style={[typography.textStyles.body, styles.skipText]}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Pages */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {pages.map((page, index) => (
          <View key={index} style={styles.page}>
            <page.component />
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {/* Page Indicators */}
        <View style={styles.indicatorContainer}>
          {pages.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.indicator,
                currentIndex === index && styles.activeIndicator,
              ]}
              onPress={() => goToPage(index)}
            />
          ))}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          {currentIndex > 0 && (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={goToPrevious}
            >
              <Text style={[typography.textStyles.body, styles.backText]}>Back</Text>
            </TouchableOpacity>
          )}

          <View style={styles.nextButtonWrapper}>
            <Button
              title={isLastPage ? "Get Started" : "Next"}
              onPress={goToNext}
              style={styles.nextButton}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    color: colors.gray[600],
    fontFamily: 'Figtree_500Medium',
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width: width,
    flex: 1,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[300],
  },
  activeIndicator: {
    backgroundColor: colors.primary,
    width: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backText: {
    color: colors.gray[600],
    fontFamily: 'Figtree_500Medium',
  },
  nextButtonWrapper: {
    flex: 1,
    marginLeft: 16,
  },
  nextButton: {
    minWidth: 120,
  },
});