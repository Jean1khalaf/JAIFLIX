import { cookies } from 'next/headers';

export async function getLocale(): Promise<'en'|'ar'> {
  const value = (await cookies()).get('jaiflix_locale')?.value;
  return value === 'ar' ? 'ar' : 'en';
}

export const messages = {
  en: {
    home:'Home', movies:'Movies', series:'Series', myList:'My list',
    search:'Search movies, series...', trending:'Trending now', popularMovies:'Popular movies',
    binge:'Binge-worthy series', streamingToday:'Streaming today', explore:'EXPLORE',
    popularNow:'Popular now', results:'Movies and series', noResults:'No results found. Try another title.',
    find:'Find your next favorite', searchHint:'Use the search box above.',
    personal:'PERSONAL', saved:'Saved for later', empty:'Your list is empty. Add titles with the + button.',
    add:'Add to list', upcoming:'Upcoming', movie:'Movie', seriesType:'Series',
    viewTitle:'View title', moreInfo:'More info', trailer:'Watch trailer', close:'Close',
    topCast:'Top cast', playbackOff:'Full-length playback is not connected. Add a licensed video provider in your deployment settings to watch full movies and episodes.',
    playbackSetup:'Playback setup', playbackHelp:'TMDB supplies movie and series information, posters and trailers; it does not provide full-length video streams.',
    trailerOnly:'Only the official trailer is available until a licensed playback provider is configured.',
    language:'العربية', titles:'titles', today:'TVmaze schedule'
  },
  ar: {
    home:'الرئيسية', movies:'الأفلام', series:'المسلسلات', myList:'قائمتي',
    search:'ابحث عن الأفلام والمسلسلات...', trending:'الأكثر رواجاً', popularMovies:'الأفلام الشائعة',
    binge:'مسلسلات تستحق المشاهدة', streamingToday:'يعرض اليوم', explore:'استكشف',
    popularNow:'الأكثر شعبية الآن', results:'الأفلام والمسلسلات', noResults:'لم يتم العثور على نتائج. جرّب عنواناً آخر.',
    find:'اعثر على عملك المفضل القادم', searchHint:'استخدم مربع البحث أعلاه.',
    personal:'شخصي', saved:'المحفوظات للمشاهدة لاحقاً', empty:'قائمتك فارغة. أضف العناوين باستخدام زر +.',
    add:'أضف إلى قائمتي', upcoming:'قريباً', movie:'فيلم', seriesType:'مسلسل',
    viewTitle:'عرض التفاصيل', moreInfo:'معلومات أكثر', trailer:'مشاهدة الإعلان', close:'إغلاق',
    topCast:'طاقم التمثيل', playbackOff:'لم يتم ربط خدمة تشغيل كاملة. أضف مزود فيديو مرخّصاً في إعدادات النشر لمشاهدة الأفلام والحلقات كاملة.',
    playbackSetup:'إعداد التشغيل', playbackHelp:'يوفر TMDB معلومات الأفلام والمسلسلات والملصقات والإعلانات الترويجية، لكنه لا يوفر بث الفيديو الكامل.',
    trailerOnly:'الإعلان الترويجي فقط متاح حالياً إلى أن يتم إعداد مزود تشغيل مرخّص.',
    language:'English', titles:'عنوان', today:'جدول TVmaze'
  }
} as const;
