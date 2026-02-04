import React from 'react';
import { useAppRating } from '../../context/AppRatingContext';
import { AppRatingModal } from './AppRatingModal';

/**
 * Global App Rating Wrapper Component
 * 
 * This component should be placed at the root of your app (typically in App.tsx)
 * to provide app-wide rating functionality. It automatically shows the rating modal
 * when triggered by user actions throughout the app.
 */
export const AppRatingWrapper: React.FC = () => {
  const { shouldShowRating, dismissRating } = useAppRating();

  return (
    <AppRatingModal
      visible={shouldShowRating}
      onClose={dismissRating}
    />
  );
};