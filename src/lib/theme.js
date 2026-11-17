export const THEME_KEY = 'aniwiki-theme';

// 첫 화면이 깜빡이지 않도록 layout <head>의 인라인 스크립트가 그리기 전에 <html data-theme>을 정한다(저장값 → 시스템 설정)
export const themeInitScript = `try{var t=localStorage.getItem('${THEME_KEY}');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t}catch(e){}`;
