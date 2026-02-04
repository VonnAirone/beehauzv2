import { useState } from 'react';
import { Alert } from 'react-native';
import { surveyService, SurveySubmissionData } from '../../services/surveyService';

export type ServiceSurveyType = 'laundry' | 'delivery';
export type ServiceSurveyResponse = 'not-interested' | 'maybe' | 'very-interested';

export const useServiceSurvey = (isAuthenticated: boolean) => {
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [surveyType, setSurveyType] = useState<ServiceSurveyType>('laundry');
  const [anonymousEmail, setAnonymousEmail] = useState('');

  const openSurvey = async (type: ServiceSurveyType) => {
    try {
      const checkResult = await surveyService.hasUserRespondedToService(type);

      if (checkResult.success && checkResult.hasResponded) {
        const serviceTypeDisplay = type === 'laundry' ? 'laundry services' : 'delivery services';
        Alert.alert(
          'Already Submitted',
          `Thank you! We've already received your feedback about ${serviceTypeDisplay}. We appreciate your interest!`,
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }
    } catch (error) {
      if (__DEV__) console.warn('Error checking previous survey response:', error);
    }

    setSurveyType(type);
    setShowSurveyModal(true);
  };

  const closeSurvey = () => {
    setShowSurveyModal(false);
  };

  const submitSurveyResponse = async (response: ServiceSurveyResponse) => {
    if (!isAuthenticated && !anonymousEmail.trim()) {
      Alert.alert(
        'Email Required',
        'Please provide your email address to submit the survey.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    const emailForSubmission = !isAuthenticated ? anonymousEmail.trim() : undefined;

    setShowSurveyModal(false);
    setAnonymousEmail('');

    const serviceType = surveyType === 'laundry'
      ? 'laundry services'
      : 'food and grocery delivery services';

    if (!isAuthenticated && emailForSubmission) {
      try {
        const duplicateCheck = await surveyService.hasUserRespondedToService(
          surveyType,
          emailForSubmission
        );
        if (duplicateCheck.success && duplicateCheck.hasResponded) {
          const serviceTypeDisplay = surveyType === 'laundry'
            ? 'laundry services'
            : 'delivery services';
          Alert.alert(
            'Already Submitted',
            `Thank you! We've already received your feedback about ${serviceTypeDisplay} from this email address.`,
            [{ text: 'OK', style: 'default' }]
          );
          return;
        }
      } catch (error) {
        if (__DEV__) console.warn('Error checking duplicate survey:', error);
      }
    }

    try {
      const surveyData: SurveySubmissionData = {
        service_type: surveyType,
        response_level: response,
        user_email: emailForSubmission,
      };

      const result = await surveyService.submitSurveyResponse(surveyData);

      if (!result.success && __DEV__) {
        console.warn('Failed to save survey response:', result.error);
      }
    } catch (error) {
      if (__DEV__) console.error('Error saving survey response:', error);
    }

    setTimeout(() => {
      if (response === 'not-interested') {
        Alert.alert(
          'Thanks for your feedback!',
          'We appreciate your honesty. We\'ll focus on other features that better serve your needs.',
          [{ text: 'OK', style: 'default' }]
        );
      } else if (response === 'maybe') {
        Alert.alert(
          'Thanks!',
          `We'll consider your feedback as we develop ${serviceType}. We'll make sure to create something that truly adds value.`,
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        Alert.alert(
          'Fantastic!',
          `We'll prioritize ${serviceType} and notify you when it's available. Your enthusiasm helps us build better features!`,
          [{ text: 'OK', style: 'default' }]
        );
      }
    }, 300);
  };

  return {
    showSurveyModal,
    surveyType,
    anonymousEmail,
    setAnonymousEmail,
    openSurvey,
    closeSurvey,
    submitSurveyResponse,
  };
};
