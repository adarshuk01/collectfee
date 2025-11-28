import React, { useState } from 'react';
import CommonHeader from '../common/CommonHeader';
import ToggleSwitch from '../common/ToggleSwitch';

function Notification() {
  const [whatsapp, setWhatsapp] = useState(false);
  const [email, setEmail] = useState(false);
  const [eventNotify, setEventNotify] = useState(false);

  return (
    <div className="space-y-4">
      <CommonHeader title="Notification" />

      <div className="space-y-6 ">
        <div className="flex justify-between items-center">
          <p>WhatsApp Notification</p>
          <ToggleSwitch enabled={whatsapp} setEnabled={setWhatsapp} />
        </div>

        <div className="flex justify-between items-center">
          <p>Email Notification</p>
          <ToggleSwitch enabled={email} setEnabled={setEmail} />
        </div>

        <div className="flex justify-between items-center">
          <p>New Event</p>
          <ToggleSwitch enabled={eventNotify} setEnabled={setEventNotify} />
        </div>
      </div>
    </div>
  );
}

export default Notification;
