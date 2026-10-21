'use client';

import React from 'react';
import {
  useBulkRegistration,
  BulkPaymentActiveView,
  BulkUploadBanner,
  BulkPicForm,
  BulkParticipantsTable,
  BulkCheckoutSection,
} from './bulk';

export default function TrailrunBulkRegister() {
  const {
    picData,
    handlePicChange,
    participants,
    parsing,
    fileName,
    parseError,
    regeneratingBibs,
    handleFileUpload,
    handleRegenerateBibs,
    handleRemoveParticipant,
    validCount,
    invalidCount,
    routeCalculations,
    paymentMethod,
    setPaymentMethod,
    submitting,
    submitError,
    handleSubmitBulk,
    paymentData,
    setPaymentData,
    paymentStatus,
    setPaymentStatus,
    checkingStatus,
    checkStatus,
    cancellingPayment,
    handleCancelPayment,
    timeLeft,
  } = useBulkRegistration();

  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease-out]">
      {paymentData ? (
        /* =========================================================================
            VIEW A: PAYMENT DATA ACTIVE (LIGHT THEME)
        ========================================================================= */
        <BulkPaymentActiveView
          paymentData={paymentData}
          paymentStatus={paymentStatus}
          checkingStatus={checkingStatus}
          cancellingPayment={cancellingPayment}
          timeLeft={timeLeft}
          onCheckStatus={checkStatus}
          onCancelPayment={handleCancelPayment}
          onReset={() => {
            setPaymentData(null);
            setPaymentStatus('pending');
          }}
        />
      ) : (
        /* =========================================================================
            VIEW B: EXCEL DOWNLOAD, UPLOAD, PREVIEW, AND CHECKOUT
        ========================================================================= */
        <div className="space-y-8">
          {/* 1. Step Guidance & Download Template Banner */}
          <BulkUploadBanner groupName={picData.group_name} />

          {/* 2. PIC / Coordinator Info & File Dropzone */}
          <BulkPicForm
            picData={picData}
            onPicChange={handlePicChange}
            fileName={fileName}
            parsing={parsing}
            parseError={parseError}
            onFileUpload={handleFileUpload}
          />

          {/* 3. Preview Table of Uploaded Participants */}
          {participants.length > 0 && (
            <BulkParticipantsTable
              participants={participants}
              validCount={validCount}
              invalidCount={invalidCount}
              regeneratingBibs={regeneratingBibs}
              routeCalculations={routeCalculations}
              onRegenerateBibs={handleRegenerateBibs}
              onRemoveParticipant={handleRemoveParticipant}
            />
          )}

          {/* 4. Payment Selection & Checkout (Visible if participants exist) */}
          {participants.length > 0 && (
            <BulkCheckoutSection
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              routeCalculations={routeCalculations}
              validCount={validCount}
              invalidCount={invalidCount}
              submitting={submitting}
              submitError={submitError}
              onSubmit={handleSubmitBulk}
            />
          )}
        </div>
      )}
    </div>
  );
}
