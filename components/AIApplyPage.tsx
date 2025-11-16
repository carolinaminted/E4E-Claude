import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { UserProfile, EventData, ChatMessage, MessageRole, Page } from '../types';
import type { Fund } from '../data/fundData';
import { createApplicationCoachSession, checkApplicationCompleteness } from '../services/geminiService';
import { logEvent as logTokenEvent, estimateTokens } from '../services/tokenTracker';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';
import ApplicationReviewModal from './ApplicationReviewModal';

interface AIApplyPageProps {
  userProfile: UserProfile;
  activeFund: Fund | null;
  applicationDraft: Partial<{ profileData: Partial<UserProfile>; eventData: Partial<EventData> }> | null;
  updateApplicationDraft: (draft: Partial<{ profileData: Partial<UserProfile>; eventData: Partial<EventData> }>) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  navigate: (page: Page) => void;
}

const AIApplyPage: React.FC<AIApplyPageProps> = ({
  userProfile,
  activeFund,
  applicationDraft,
  updateApplicationDraft,
  updateUserProfile,
  navigate,
}) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [sessionId] = useState(`ai-apply-${Math.random().toString(36).substr(2, 9)}`);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      role: 'model' as MessageRole,
      content: `Hello ${userProfile.firstName}! I'm your Application Coach. I'm here to help you create your disaster relief application through a simple conversation. Can you tell me about the situation you're facing?`,
    };
    setMessages([welcomeMessage]);
  }, [userProfile.firstName]);

  const handleSendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    // Add user message to chat
    const newUserMessage: ChatMessage = {
      role: 'user' as MessageRole,
      content: userMessage,
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Create chat session with current history
      const chatHistory = [...messages, newUserMessage];
      const chatSession = createApplicationCoachSession(userProfile, activeFund, chatHistory);

      // Track input tokens
      const inputTokens = estimateTokens(userMessage);

      // Send message and get response
      const response = await chatSession.sendMessage(userMessage);

      // Track output tokens
      const outputTokens = estimateTokens(response.text);
      logTokenEvent({
        feature: 'AI Assistant',
        model: 'gemini-2.5-flash',
        inputTokens,
        outputTokens,
        sessionId,
      });

      // Check if the AI called any function tools
      if (response.functionCalls && response.functionCalls.length > 0) {
        for (const functionCall of response.functionCalls) {
          if (functionCall.name === 'updateUserProfile') {
            // Update user profile with extracted data
            const updates = functionCall.args as Partial<UserProfile>;
            updateUserProfile(updates);

            // Also update draft profile data
            updateApplicationDraft({
              ...applicationDraft,
              profileData: {
                ...applicationDraft?.profileData,
                ...updates,
              },
            });
          } else if (functionCall.name === 'startOrUpdateApplicationDraft') {
            // Update event data in draft
            const eventUpdates = functionCall.args as Partial<EventData>;
            updateApplicationDraft({
              ...applicationDraft,
              eventData: {
                ...applicationDraft?.eventData,
                ...eventUpdates,
              },
            });
          }
        }

        // Send a follow-up to get the text response after function calls
        const followUpResponse = await chatSession.sendMessage('');
        const aiMessage: ChatMessage = {
          role: 'model' as MessageRole,
          content: followUpResponse.text,
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Add AI response to chat
        const aiMessage: ChatMessage = {
          role: 'model' as MessageRole,
          content: response.text,
        };
        setMessages(prev => [...prev, aiMessage]);
      }

      // Check if application is complete
      const currentProfileData = {
        ...userProfile,
        ...applicationDraft?.profileData,
      };
      const currentEventData = applicationDraft?.eventData || {};

      const completeness = checkApplicationCompleteness(currentProfileData, currentEventData);

      // If the AI mentions "ready for review" and we have all required fields, show the modal
      if (response.text.toLowerCase().includes('ready for review') && completeness.isComplete) {
        setTimeout(() => {
          setShowReviewModal(true);
        }, 500);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'error' as MessageRole,
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, userProfile, activeFund, applicationDraft, updateApplicationDraft, updateUserProfile, sessionId]);

  const handleApprove = useCallback((profileData: Partial<UserProfile>, eventData: Partial<EventData>) => {
    // Update the application draft with reviewed data
    updateApplicationDraft({
      profileData,
      eventData: {
        ...eventData,
        expenses: [], // Initialize empty expenses array
      },
    });

    // Update user profile with any changes
    updateUserProfile(profileData);

    // Close modal
    setShowReviewModal(false);

    // Navigate to apply page (which will then go to expenses page)
    navigate('apply');
  }, [updateApplicationDraft, updateUserProfile, navigate]);

  const handleCancelReview = useCallback(() => {
    setShowReviewModal(false);
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#004b8d]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#ff8400] to-[#edda26] p-4 md:p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Application Coach</h1>
            <p className="text-white/90 text-sm md:text-base mt-1">
              Let's create your application together through conversation
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-medium">AI Active</span>
          </div>
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow messages={messages} isLoading={isLoading} />
      </div>

      {/* Chat Input */}
      <div className="p-4 bg-[#003a70] border-t border-white/20">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <ApplicationReviewModal
          profileData={{
            ...userProfile,
            ...applicationDraft?.profileData,
          }}
          eventData={applicationDraft?.eventData || {}}
          onApprove={handleApprove}
          onCancel={handleCancelReview}
        />
      )}
    </div>
  );
};

export default AIApplyPage;
