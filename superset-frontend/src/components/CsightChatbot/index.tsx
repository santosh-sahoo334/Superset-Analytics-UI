/* eslint-disable */
// @ts-nocheck
import React, { useState } from 'react';
import { HTTP } from '../CsightCommon/config/http-common';
import { useToast } from '../CsightCommon/context/ToastContext';

const ChatBot = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const openCindy = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const { data } = await HTTP.post('/security/cindy-handoff');

      // Create a hidden form and POST to CindyEveryOps /auth/handoff
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `${data.cindy_url}`;
      form.target = '_blank';
      form.style.display = 'none';

      const fields = {
        access_token: data.handoff_token,
        refresh_token: data.refresh_token,
        platform: data.platform,
        realm: data.realm,
        platform_base_url: data.platform_base_url,
      };

      for (const [name, value] of Object.entries(fields)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value || '';
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.msg ||
        'Please re-login to use Cindy';
      showToast(msg, 'error', 'Cindy');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed right-0 bottom-0 p-3"
      style={{ zIndex: 10000000 }}
    >
      <img
        src="/static/assets/images/layout/images/ai-icon.svg"
        className="cursor-pointer"
        onClick={openCindy}
        alt="Open Cindy"
        height={82}
        width={82}
        style={{ opacity: isLoading ? 0.5 : 1 }}
      />
    </div>
  );
};

export default ChatBot;
