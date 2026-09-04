import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import bnMessages from '../../messages/bn.json';
import enMessages from '../../messages/en.json';

const messagesMap: Record<string, any> = {
  bn: bnMessages,
  en: enMessages,
};

export default getRequestConfig(async () => {
  const cookieStore = cookies();
  const locale = cookieStore.get('locale')?.value || 'bn';
  const resolvedLocale = locale === 'en' ? 'en' : 'bn';

  return {
    locale: resolvedLocale,
    messages: messagesMap[resolvedLocale] || bnMessages,
  };
});
