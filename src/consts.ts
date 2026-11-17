export const SITE_TITLE = '이훈의 블로그';
export const SITE_DESCRIPTION = '이훈의 개인 블로그입니다.';

export function sitePath(path: `/${string}`) {
	return import.meta.env.BASE_URL.replace(/\/$/, '') + path;
}
