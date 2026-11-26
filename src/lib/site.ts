export const SITE_HOST = "aniwiki.link";
export const SITE_URL = `https://www.${SITE_HOST}`;

const TITLE_SUFFIX = " - ANIWIKI";
export const TITLE_TEMPLATE = `%s${TITLE_SUFFIX}`;
export const pageTitle = (title: string) => title + TITLE_SUFFIX;
