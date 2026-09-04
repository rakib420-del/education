import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  // Read locale from cookie or default to Bangla
  const cookieStore = cookies();
  const locale = cookieStore.get('locale')?.value || 'bn';
  const validLocales = ['bn', 'en'];
  const resolvedLocale = validLocales.includes(locale) ? locale : 'bn';

  return {
    locale: resolvedLocale,
    messages: (await import(`../../messages/${resolvedLocale}.json`)).default,
  };
});
