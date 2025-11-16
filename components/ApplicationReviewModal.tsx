import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { UserProfile, EventData, Address } from '../types';
import { FormInput, FormSelect } from './FormControls';
import { allEventTypes, employmentTypes } from '../data/appData';

interface ApplicationReviewModalProps {
  profileData: Partial<UserProfile>;
  eventData: Partial<EventData>;
  onApprove: (profileData: Partial<UserProfile>, eventData: Partial<EventData>) => void;
  onCancel: () => void;
}

const ApplicationReviewModal: React.FC<ApplicationReviewModalProps> = ({
  profileData: initialProfileData,
  eventData: initialEventData,
  onApprove,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [profileData, setProfileData] = useState<Partial<UserProfile>>(initialProfileData);
  const [eventData, setEventData] = useState<Partial<EventData>>(initialEventData);

  const updateProfileField = <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const updateAddressField = (field: keyof Address, value: string) => {
    setProfileData(prev => ({
      ...prev,
      primaryAddress: {
        ...prev.primaryAddress,
        [field]: value,
      } as Address,
    }));
  };

  const updateEventField = <K extends keyof EventData>(field: K, value: EventData[K]) => {
    setEventData(prev => ({ ...prev, [field]: value }));
  };

  const handleApprove = () => {
    onApprove(profileData, eventData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#004b8d] border border-white/20 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#ff8400] to-[#edda26] p-6">
          <h2 className="text-2xl font-bold text-white">Review Your Application</h2>
          <p className="text-white/90 mt-1">Please review and edit any information before approving</p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Applicant Information Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] mb-4">
              Applicant Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="First Name"
                value={profileData.firstName || ''}
                onChange={(e) => updateProfileField('firstName', e.target.value)}
                required
              />
              <FormInput
                label="Last Name"
                value={profileData.lastName || ''}
                onChange={(e) => updateProfileField('lastName', e.target.value)}
                required
              />
              <FormInput
                label="Middle Name"
                value={profileData.middleName || ''}
                onChange={(e) => updateProfileField('middleName', e.target.value)}
              />
              <FormInput
                label="Suffix"
                value={profileData.suffix || ''}
                onChange={(e) => updateProfileField('suffix', e.target.value)}
              />
              <FormInput
                label="Mobile Number"
                value={profileData.mobileNumber || ''}
                onChange={(e) => updateProfileField('mobileNumber', e.target.value)}
                required
              />
              <FormInput
                label="Employment Start Date"
                type="date"
                value={profileData.employmentStartDate || ''}
                onChange={(e) => updateProfileField('employmentStartDate', e.target.value)}
                required
              />
              <FormSelect
                label="Employment Type"
                value={profileData.eligibilityType || ''}
                onChange={(e) => updateProfileField('eligibilityType', e.target.value)}
                options={employmentTypes}
                required
              />
              <FormInput
                label="Household Income"
                type="number"
                value={profileData.householdIncome?.toString() || ''}
                onChange={(e) => updateProfileField('householdIncome', parseFloat(e.target.value) || 0)}
                required
              />
              <FormInput
                label="Household Size"
                type="number"
                value={profileData.householdSize?.toString() || ''}
                onChange={(e) => updateProfileField('householdSize', parseInt(e.target.value) || 0)}
                required
              />
              <FormSelect
                label="Homeowner"
                value={profileData.homeowner || ''}
                onChange={(e) => updateProfileField('homeowner', e.target.value as 'Yes' | 'No')}
                options={['Yes', 'No']}
                required
              />
            </div>
          </div>

          {/* Address Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] mb-4">
              Primary Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <FormInput
                  label="Street Address"
                  value={profileData.primaryAddress?.street1 || ''}
                  onChange={(e) => updateAddressField('street1', e.target.value)}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <FormInput
                  label="Street Address Line 2"
                  value={profileData.primaryAddress?.street2 || ''}
                  onChange={(e) => updateAddressField('street2', e.target.value)}
                />
              </div>
              <FormInput
                label="City"
                value={profileData.primaryAddress?.city || ''}
                onChange={(e) => updateAddressField('city', e.target.value)}
                required
              />
              <FormInput
                label="State"
                value={profileData.primaryAddress?.state || ''}
                onChange={(e) => updateAddressField('state', e.target.value)}
                required
              />
              <FormInput
                label="ZIP Code"
                value={profileData.primaryAddress?.zip || ''}
                onChange={(e) => updateAddressField('zip', e.target.value)}
                required
              />
              <FormInput
                label="Country"
                value={profileData.primaryAddress?.country || ''}
                onChange={(e) => updateAddressField('country', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Event Details Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8400] to-[#edda26] mb-4">
              Disaster Event Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                label="Event Type"
                value={eventData.event || ''}
                onChange={(e) => updateEventField('event', e.target.value)}
                options={allEventTypes}
                required
              />
              {eventData.event === 'My disaster is not listed' && (
                <FormInput
                  label="Other Event Description"
                  value={eventData.otherEvent || ''}
                  onChange={(e) => updateEventField('otherEvent', e.target.value)}
                  required
                />
              )}
              <FormInput
                label="Event Name (if applicable)"
                value={eventData.eventName || ''}
                onChange={(e) => updateEventField('eventName', e.target.value)}
              />
              <FormInput
                label="Event Date"
                type="date"
                value={eventData.eventDate || ''}
                onChange={(e) => updateEventField('eventDate', e.target.value)}
                required
              />
              <FormInput
                label="Requested Amount"
                type="number"
                value={eventData.requestedAmount?.toString() || ''}
                onChange={(e) => updateEventField('requestedAmount', parseFloat(e.target.value) || 0)}
                required
              />
              <FormSelect
                label="Evacuated"
                value={eventData.evacuated || ''}
                onChange={(e) => updateEventField('evacuated', e.target.value as 'Yes' | 'No')}
                options={['Yes', 'No']}
                required
              />
              {eventData.evacuated === 'Yes' && (
                <>
                  <FormSelect
                    label="Evacuating from Primary Residence"
                    value={eventData.evacuatingFromPrimary || ''}
                    onChange={(e) => updateEventField('evacuatingFromPrimary', e.target.value as 'Yes' | 'No')}
                    options={['Yes', 'No']}
                    required
                  />
                  <FormSelect
                    label="Stayed with Family/Friend"
                    value={eventData.stayedWithFamilyOrFriend || ''}
                    onChange={(e) => updateEventField('stayedWithFamilyOrFriend', e.target.value as 'Yes' | 'No')}
                    options={['Yes', 'No']}
                    required
                  />
                  <FormInput
                    label="Evacuation Start Date"
                    type="date"
                    value={eventData.evacuationStartDate || ''}
                    onChange={(e) => updateEventField('evacuationStartDate', e.target.value)}
                    required
                  />
                  <FormInput
                    label="Number of Nights Evacuated"
                    type="number"
                    value={eventData.evacuationNights?.toString() || ''}
                    onChange={(e) => updateEventField('evacuationNights', parseInt(e.target.value) || 0)}
                    required
                  />
                </>
              )}
              <FormSelect
                label="Power Loss (more than 4 hours)"
                value={eventData.powerLoss || ''}
                onChange={(e) => updateEventField('powerLoss', e.target.value as 'Yes' | 'No')}
                options={['Yes', 'No']}
                required
              />
              {eventData.powerLoss === 'Yes' && (
                <FormInput
                  label="Days Without Power"
                  type="number"
                  value={eventData.powerLossDays?.toString() || ''}
                  onChange={(e) => updateEventField('powerLossDays', parseInt(e.target.value) || 0)}
                  required
                />
              )}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Additional Details
                </label>
                <textarea
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff8400]/50 min-h-[100px]"
                  value={eventData.additionalDetails || ''}
                  onChange={(e) => updateEventField('additionalDetails', e.target.value)}
                  placeholder="Any additional information about your situation"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="border-t border-white/20 p-6 bg-[#003a70]/50 flex gap-4 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-semibold transition-all duration-200"
          >
            Back to Chat
          </button>
          <button
            onClick={handleApprove}
            className="px-6 py-3 bg-gradient-to-r from-[#ff8400] to-[#edda26] hover:from-[#ff9400] hover:to-[#f0e036] rounded-lg text-white font-semibold transition-all duration-200 shadow-lg"
          >
            Approve & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationReviewModal;
