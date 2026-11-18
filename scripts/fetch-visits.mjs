const account = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_ANALYTICS_API_TOKEN;

if (!account || !apiToken) {
	throw new Error('Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_ANALYTICS_API_TOKEN.');
}

const query = `
	query LeehunVisits($account: String!, $host: String!, $today: Time!, $start: Time!, $end: Time!) {
		viewer {
			accounts(filter: { accountTag: $account }) {
				today: rumPageloadEventsAdaptiveGroups(
					limit: 1
					filter: { requestHost: $host, datetime_geq: $today, datetime_lt: $end }
				) {
					sum { visits }
				}
				last30Days: rumPageloadEventsAdaptiveGroups(
					limit: 1
					filter: { requestHost: $host, datetime_geq: $start, datetime_lt: $end }
				) {
					sum { visits }
				}
			}
		}
	}
`;

const now = new Date();
const kstOffset = 9 * 60 * 60 * 1000;
const koreaDate = new Date(now.getTime() + kstOffset).toISOString().slice(0, 10);
const today = new Date(`${koreaDate}T00:00:00+09:00`);
const start = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);

const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
	method: 'POST',
	headers: {
		Authorization: `Bearer ${apiToken}`,
		'Content-Type': 'application/json',
	},
	body: JSON.stringify({
		query,
		variables: {
			account,
			host: 'www.leehun.com',
			today: today.toISOString(),
			start: start.toISOString(),
			end: now.toISOString(),
		},
	}),
	signal: AbortSignal.timeout(15_000),
});

if (!response.ok) {
	throw new Error(`Cloudflare Analytics API returned HTTP ${response.status}.`);
}

const { data, errors } = await response.json();
const analytics = data?.viewer?.accounts?.[0];
if (errors?.length || !analytics) {
	throw new Error('Cloudflare Analytics query failed. Check the account and Analytics Read permission.');
}

function visitsIn(groups) {
	if (!Array.isArray(groups)) {
		throw new Error('Cloudflare Analytics did not return visit data.');
	}
	if (groups.length === 0) return 0;
	const visits = groups[0]?.sum?.visits;
	if (!Number.isSafeInteger(visits) || visits < 0) {
		throw new Error('Cloudflare Analytics returned an invalid visit total.');
	}
	return visits;
}

console.log(JSON.stringify({
	asOf: now.toISOString(),
	today: visitsIn(analytics.today),
	last30Days: visitsIn(analytics.last30Days),
}));
