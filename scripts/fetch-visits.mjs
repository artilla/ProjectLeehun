const account = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_ANALYTICS_API_TOKEN;

if (!account || !apiToken) {
	throw new Error('Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_ANALYTICS_API_TOKEN.');
}

const query = `
	query LeehunVisits($account: String!, $host: String!, $start: Time!, $end: Time!) {
		viewer {
			accounts(filter: { accountTag: $account }) {
				rumPageloadEventsAdaptiveGroups(
					limit: 1
					filter: { requestHost: $host, datetime_geq: $start, datetime_lt: $end }
				) {
					sum { visits }
				}
			}
		}
	}
`;

async function visitsBetween(start, end) {
	if (start.getTime() === end.getTime()) return 0;

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
				start: start.toISOString(),
				end: end.toISOString(),
			},
		}),
		signal: AbortSignal.timeout(15_000),
	});

	if (!response.ok) {
		throw new Error(`Cloudflare Analytics API returned HTTP ${response.status}.`);
	}

	const { data, errors } = await response.json();
	const groups = data?.viewer?.accounts?.[0]?.rumPageloadEventsAdaptiveGroups;
	if (errors?.length || !Array.isArray(groups)) {
		throw new Error('Cloudflare Analytics did not return visit data for the requested day.');
	}
	if (groups.length === 0) return 0;
	const visits = groups[0]?.sum?.visits;
	if (!Number.isSafeInteger(visits) || visits < 0) {
		throw new Error('Cloudflare Analytics returned an invalid visit total.');
	}
	return visits;
}

const now = new Date();
const dayMs = 24 * 60 * 60 * 1000;
const kstOffset = 9 * 60 * 60 * 1000;
const koreaDate = new Date(now.getTime() + kstOffset).toISOString().slice(0, 10);
const today = new Date(`${koreaDate}T00:00:00+09:00`);
const dayStarts = Array.from({ length: 30 }, (_, daysAgo) => new Date(today.getTime() - daysAgo * dayMs));
const dailyTotals = [];
const batchSize = 5;

// Cloudflare samples long queries more aggressively. Sum daily windows so the
// 30-day total includes the same count used for today.
for (let offset = 0; offset < dayStarts.length; offset += batchSize) {
	const batch = dayStarts.slice(offset, offset + batchSize).map((start, index) => {
		const end = offset + index === 0 ? now : new Date(start.getTime() + dayMs);
		return visitsBetween(start, end);
	});
	dailyTotals.push(...await Promise.all(batch));
}

console.log(JSON.stringify({
	asOf: now.toISOString(),
	today: dailyTotals[0],
	last30Days: dailyTotals.reduce((total, visits) => total + visits, 0),
}));
