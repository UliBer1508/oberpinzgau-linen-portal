import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export function Footer() {
  let buildDate = '';
  try {
    buildDate = format(new Date(__BUILD_DATE__), 'dd.MM.yyyy', { locale: de });
  } catch {
    buildDate = '';
  }

  return (
    <footer className="border-t border-sidebar-border/50 px-4 py-3 mb-16 md:mb-0">
      <p className="text-center text-[11px] text-muted-foreground">
        © 2026 Steinbock Chalets · v{__APP_VERSION__}
        {buildDate && <> · Build {buildDate}</>}
        {__BUILD_COMMIT__ && __BUILD_COMMIT__ !== 'dev' && (
          <> · {__BUILD_COMMIT__}</>
        )}
      </p>
    </footer>
  );
}
