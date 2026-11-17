import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE, sitePath } from '../consts';

export async function GET(context) {
	const posts = (await getCollection('blog')).sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: new URL(sitePath('/'), context.site),
		items: posts.map((post) => ({
			...post.data,
			link: new URL(sitePath(`/blog/${post.id}/`), context.site).href,
		})),
	});
}
