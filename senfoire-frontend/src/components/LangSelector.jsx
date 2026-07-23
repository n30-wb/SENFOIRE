import { useI18n } from '../context/I18nContext';

const flags = { fr: '🇫🇷', wo: '🇸🇳', en: '🇬🇧' };

export default function LangSelector({ className = '' }) {
  const { lang, changeLang } = useI18n();

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Object.entries(flags).map(([code, flag]) => (
        <button
          key={code}
          onClick={() => changeLang(code)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all cursor-pointer ${
            lang === code
              ? 'bg-white/20 scale-110 shadow-lg'
              : 'bg-white/5 hover:bg-white/10 opacity-60 hover:opacity-100'
          }`}
          title={code.toUpperCase()}
        >
          {flag}
        </button>
      ))}
    </div>
  );
}
