// Data Generation Layer for MI-Meridian-V2
// Generates synthetic marketing mix modeling data, model results, optimization, and MTA results.

export const CHANNELS = [
  { name: 'Meta Ads', key: 'meta_ads', avgCPM: 28, avgROI: 1.9 },
  { name: 'Google Ads', key: 'google_ads', avgCPM: 45, avgROI: 2.8 },
  { name: 'LinkedIn Ads', key: 'linkedin_ads', avgCPM: 35, avgROI: 1.6 },
  { name: 'TikTok Ads', key: 'tiktok_ads', avgCPM: 12, avgROI: 1.2 },
  { name: 'Amazon Ads', key: 'amazon_ads', avgCPM: 22, avgROI: 2.1 },
  { name: 'YouTube Ads', key: 'youtube_ads', avgCPM: 18, avgROI: 1.8 },
  { name: 'Bing Ads', key: 'bing_ads', avgCPM: 15, avgROI: 1.1 },
  { name: 'X Ads', key: 'x_ads', avgCPM: 10, avgROI: 0.8 },
];

export const GEOS = [
  { name: 'New York', key: 'new_york', population: 20200000 },
  { name: 'Los Angeles', key: 'los_angeles', population: 13200000 },
  { name: 'Chicago', key: 'chicago', population: 9500000 },
  { name: 'Houston', key: 'houston', population: 7100000 },
  { name: 'Phoenix', key: 'phoenix', population: 4900000 },
  { name: 'Philadelphia', key: 'philadelphia', population: 6200000 },
  { name: 'San Antonio', key: 'san_antonio', population: 2600000 },
  { name: 'San Diego', key: 'san_diego', population: 3300000 },
  { name: 'Dallas', key: 'dallas', population: 7600000 },
  { name: 'San Francisco', key: 'san_francisco', population: 4700000 },
  { name: 'Seattle', key: 'seattle', population: 4000000 },
  { name: 'Denver', key: 'denver', population: 2900000 },
  { name: 'Boston', key: 'boston', population: 4900000 },
  { name: 'Atlanta', key: 'atlanta', population: 6100000 },
  { name: 'Miami', key: 'miami', population: 6200000 },
];

// --- Helpers ---

function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function normalRandom(rng) {
  // Box-Muller transform
  const u1 = rng();
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function hillFunction(x, ec, slope) {
  const xp = Math.pow(x, slope);
  const ecp = Math.pow(ec, slope);
  return xp / (xp + ecp);
}

function generateWeeks(start, n) {
  const weeks = [];
  const startDate = new Date(start);
  for (let i = 0; i < n; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i * 7);
    weeks.push(d.toISOString().slice(0, 10));
  }
  return weeks;
}

// --- Main Functions ---

export function generateSyntheticData(profile, lookbackYears) {
  let numWeeks, numGeos, numChannels, channels, geos;

  if (lookbackYears) {
    numWeeks = lookbackYears * 52;
    geos = [...GEOS];
    channels = [...CHANNELS];
    numGeos = geos.length;
    numChannels = channels.length;
  } else {
    if (profile === 'fully_compliant') {
      numWeeks = 156;
      numGeos = 15;
    } else if (profile === 'partially_compliant') {
      numWeeks = 78;
      numGeos = 3;
    } else {
      // non_compliant
      numWeeks = 26;
      numGeos = 1;
    }
    geos = GEOS.slice(0, numGeos);
    channels = [...CHANNELS];
    numChannels = channels.length;
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - numWeeks * 7);
  const startStr = startDate.toISOString().slice(0, 10);
  const weeks = generateWeeks(startStr, numWeeks);

  const rng = seededRandom(42);
  const rows = [];

  // Holiday weeks (approximate: week 48-52 for winter holidays, week 20-21 for Memorial Day)
  const holidayWeeks = new Set();
  for (let w = 0; w < numWeeks; w++) {
    const weekOfYear = Math.floor(((w % 52) / 52) * 52);
    if (weekOfYear >= 47 || weekOfYear <= 1 || weekOfYear === 20 || weekOfYear === 21) {
      holidayWeeks.add(w);
    }
  }

  for (let g = 0; g < numGeos; g++) {
    const geo = geos[g];
    const popScale = geo.population / 10000000;

    for (let w = 0; w < numWeeks; w++) {
      // Seasonality: sine wave peaking in Q4
      const weekOfYear = (w % 52) / 52;
      const seasonality = 1 + 0.3 * Math.sin(2 * Math.PI * (weekOfYear - 0.25));

      // Trend: slight upward over time
      const trend = 1 + 0.001 * w;

      // Holiday boost
      const holidayBoost = holidayWeeks.has(w) ? 1.4 : 1.0;

      for (let c = 0; c < numChannels; c++) {
        const channel = channels[c];
        const baseSpend = (channel.avgCPM * 1000 * popScale) / numChannels;
        const noise = 1 + 0.2 * normalRandom(rng);

        const spend = Math.max(0, baseSpend * seasonality * trend * holidayBoost * noise);
        const impressions = Math.round((spend / channel.avgCPM) * 1000 * (1 + 0.1 * normalRandom(rng)));
        const kpi = Math.max(0, spend * channel.avgROI * (1 + 0.15 * normalRandom(rng)) * seasonality);

        rows.push({
          geo: geo.key,
          geoName: geo.name,
          week: weeks[w],
          weekIndex: w,
          channel: channel.key,
          channelName: channel.name,
          spend: Math.round(spend * 100) / 100,
          impressions: Math.max(0, impressions),
          kpi: Math.round(kpi * 100) / 100,
        });
      }
    }
  }

  // Compute channel stats
  const channelStats = channels.map((ch) => {
    const chRows = rows.filter((r) => r.channel === ch.key);
    const totalSpend = chRows.reduce((s, r) => s + r.spend, 0);
    const totalKPI = chRows.reduce((s, r) => s + r.kpi, 0);
    const totalImpressions = chRows.reduce((s, r) => s + r.impressions, 0);
    return {
      ...ch,
      totalSpend: Math.round(totalSpend),
      totalKPI: Math.round(totalKPI),
      totalImpressions,
      avgSpendPerWeek: Math.round(totalSpend / numWeeks),
      effectiveROI: Math.round((totalKPI / totalSpend) * 100) / 100,
    };
  });

  // Compute geo stats
  const geoStats = geos.map((geo) => {
    const geoRows = rows.filter((r) => r.geo === geo.key);
    const totalSpend = geoRows.reduce((s, r) => s + r.spend, 0);
    const totalKPI = geoRows.reduce((s, r) => s + r.kpi, 0);
    return {
      ...geo,
      totalSpend: Math.round(totalSpend),
      totalKPI: Math.round(totalKPI),
      weeksOfData: numWeeks,
    };
  });

  // First party data placeholder
  const firstPartyData = {
    hasData: profile === 'fully_compliant' || !!lookbackYears,
    conversionEvents: Math.round(rows.length * 0.03),
    uniqueUsers: Math.round(geos.reduce((s, g) => s + g.population, 0) * 0.01),
    avgSessionDuration: 4.2,
    bounceRate: 0.38,
  };

  const totalSpend = rows.reduce((s, r) => s + r.spend, 0);
  const totalKPI = rows.reduce((s, r) => s + r.kpi, 0);

  const summary = {
    totalRows: rows.length,
    totalSpend: Math.round(totalSpend),
    totalKPI: Math.round(totalKPI),
    avgWeeklySpend: Math.round(totalSpend / numWeeks),
    avgWeeklyKPI: Math.round(totalKPI / numWeeks),
    overallROI: Math.round((totalKPI / totalSpend) * 100) / 100,
    dateRange: { start: weeks[0], end: weeks[weeks.length - 1] },
  };

  return {
    profile: profile || 'custom',
    rows,
    weeks,
    numWeeks,
    numGeos,
    numChannels,
    channels: channelStats,
    geos: geoStats,
    firstPartyData,
    summary,
  };
}

export function validateData(data) {
  const issues = [];
  const errors = [];
  const warnings = [];
  let passedChecks = 0;
  const totalChecks = 5;

  // Check 1: Geo-level minimum 104 weeks
  if (data.numGeos > 1) {
    if (data.numWeeks >= 104) {
      passedChecks++;
    } else {
      errors.push({
        check: 'geo_level_weeks',
        message: `Geo-level data requires minimum 104 weeks. Found ${data.numWeeks} weeks.`,
        severity: 'error',
      });
      issues.push(`Geo-level data has only ${data.numWeeks} weeks (minimum 104 required)`);
    }
  } else {
    passedChecks++; // Not applicable for single geo
  }

  // Check 2: National minimum 156 weeks
  if (data.numGeos === 1) {
    if (data.numWeeks >= 156) {
      passedChecks++;
    } else {
      errors.push({
        check: 'national_weeks',
        message: `National-level data requires minimum 156 weeks. Found ${data.numWeeks} weeks.`,
        severity: 'error',
      });
      issues.push(`National data has only ${data.numWeeks} weeks (minimum 156 required)`);
    }
  } else {
    passedChecks++;
  }

  // Check 3: Geo count
  if (data.numGeos >= 5) {
    passedChecks++;
  } else if (data.numGeos >= 2) {
    warnings.push({
      check: 'geo_count',
      message: `Only ${data.numGeos} geos provided. Recommend 5+ for robust geo-level modeling.`,
      severity: 'warning',
    });
    issues.push(`Low geo count: ${data.numGeos} (recommend 5+)`);
    passedChecks++; // Still passes, just a warning
  } else {
    warnings.push({
      check: 'geo_count',
      message: `Single geo detected. National-level modeling only.`,
      severity: 'warning',
    });
    passedChecks++;
  }

  // Check 4: Channels <= 20
  if (data.numChannels <= 20) {
    passedChecks++;
  } else {
    errors.push({
      check: 'channel_count',
      message: `Too many channels: ${data.numChannels}. Maximum supported is 20.`,
      severity: 'error',
    });
    issues.push(`Channel count ${data.numChannels} exceeds maximum of 20`);
  }

  // Check 5: Data-to-effects ratio >= 5
  const numEffects = data.numChannels * 3; // Each channel has ~3 parameters
  const numDataPoints = data.rows ? data.rows.length : data.numWeeks * data.numGeos;
  const ratio = numDataPoints / numEffects;
  if (ratio >= 5) {
    passedChecks++;
  } else {
    errors.push({
      check: 'data_effects_ratio',
      message: `Data-to-effects ratio is ${ratio.toFixed(1)} (minimum 5 required). Need more data or fewer channels.`,
      severity: 'error',
    });
    issues.push(`Insufficient data-to-effects ratio: ${ratio.toFixed(1)} (minimum 5)`);
  }

  const overallStatus = errors.length === 0 ? (warnings.length === 0 ? 'PASS' : 'PASS_WITH_WARNINGS') : 'FAIL';
  const canProceed = errors.length === 0;

  const summary = canProceed
    ? `Data validation passed (${passedChecks}/${totalChecks} checks). ${warnings.length > 0 ? warnings.length + ' warning(s).' : 'No issues found.'}`
    : `Data validation failed. ${errors.length} error(s) must be resolved before modeling.`;

  return {
    overallStatus,
    issues,
    errors,
    warnings,
    passedChecks,
    totalChecks,
    canProceed,
    summary,
  };
}

export function generateModelResults(data, config = {}) {
  const rng = seededRandom(config.seed || 123);
  const { useMTAPriors, connectFirstParty } = config;
  const ciMultiplier = useMTAPriors ? 0.7 : 1.0;

  // Channel ROI
  const channelROI = data.channels.map((ch) => {
    const baseROI = ch.avgROI || ch.effectiveROI || 1.5;
    const roi = baseROI * (1 + 0.1 * normalRandom(rng));
    const ciWidth = 0.4 * ciMultiplier;
    const totalSpend = ch.totalSpend || 100000;
    const totalChannelSpend = data.channels.reduce((s, c) => s + (c.totalSpend || 100000), 0);
    const spendShare = totalSpend / totalChannelSpend;
    const contribution = roi * spendShare;
    const totalContribution = data.channels.reduce((s, c) => {
      const r = (c.avgROI || 1.5) * ((c.totalSpend || 100000) / totalChannelSpend);
      return s + r;
    }, 0);

    return {
      channel: ch.key,
      channelName: ch.name,
      roi: Math.round(roi * 100) / 100,
      roi_lower: Math.round((roi - ciWidth) * 100) / 100,
      roi_upper: Math.round((roi + ciWidth) * 100) / 100,
      mROI: Math.round(roi * 0.85 * 100) / 100,
      spendShare: Math.round(spendShare * 1000) / 1000,
      contributionShare: Math.round((contribution / totalContribution) * 1000) / 1000,
    };
  });

  // Add organic channel if connectFirstParty
  if (connectFirstParty && data.firstPartyData && data.firstPartyData.hasData) {
    channelROI.push({
      channel: 'organic',
      channelName: 'Organic',
      roi: 0,
      roi_lower: 0,
      roi_upper: 0,
      mROI: 0,
      spendShare: 0,
      contributionShare: Math.round(0.15 * 1000) / 1000,
    });
  }

  // Response curves: 50 points per channel
  const responseCurves = data.channels.map((ch) => {
    const ec = ch.avgCPM * 500;
    const slope = 1.5 + 0.5 * rng();
    const maxSpend = (ch.totalSpend || 100000) * 2;
    const points = [];
    for (let i = 0; i < 50; i++) {
      const x = (i / 49) * maxSpend;
      const y = hillFunction(x, ec, slope) * ch.avgROI * maxSpend * 0.5;
      points.push({ spend: Math.round(x), response: Math.round(y * 100) / 100 });
    }
    return { channel: ch.key, channelName: ch.name, ec, slope: Math.round(slope * 100) / 100, points };
  });

  // Adstock curves
  const adstockCurves = data.channels.map((ch) => {
    const alpha = 0.3 + 0.5 * rng();
    const points = [];
    for (let i = 0; i < 12; i++) {
      points.push({ lag: i, weight: Math.round(Math.pow(alpha, i) * 1000) / 1000 });
    }
    return { channel: ch.key, channelName: ch.name, alpha: Math.round(alpha * 1000) / 1000, points };
  });

  // Saturation curves
  const saturationCurves = data.channels.map((ch) => {
    const ec = ch.avgCPM * 400 + 2000 * rng();
    const slope = 1.2 + 1.0 * rng();
    const points = [];
    for (let i = 0; i < 50; i++) {
      const x = (i / 49) * ec * 3;
      const y = hillFunction(x, ec, slope);
      points.push({ spend: Math.round(x), saturation: Math.round(y * 1000) / 1000 });
    }
    return { channel: ch.key, channelName: ch.name, ec: Math.round(ec), slope: Math.round(slope * 100) / 100, points };
  });

  // KPI breakdown (weekly)
  const kpiBreakdown = [];
  const numWeeks = data.numWeeks || 52;
  for (let w = 0; w < numWeeks; w++) {
    const weekDate = data.weeks ? data.weeks[w] : `week_${w}`;
    const seasonality = 1 + 0.3 * Math.sin(2 * Math.PI * ((w % 52) / 52 - 0.25));
    const baseKPI = (data.summary ? data.summary.avgWeeklyKPI : 50000) * seasonality;
    const channelContributions = {};
    data.channels.forEach((ch) => {
      channelContributions[ch.key] = Math.round((baseKPI / data.channels.length) * (ch.avgROI / 1.5) * (1 + 0.1 * normalRandom(rng)));
    });
    const baseline = Math.round(baseKPI * 0.25);
    kpiBreakdown.push({
      week: weekDate,
      weekIndex: w,
      totalKPI: Math.round(baseKPI),
      baseline,
      channelContributions,
    });
  }

  // Diagnostics
  const diagnostics = {
    rHat: { value: 1.01 + 0.005 * normalRandom(rng), threshold: 1.1, status: 'PASS' },
    effectiveSampleSize: { value: Math.round(900 + 50 * normalRandom(rng)), threshold: 400, status: 'PASS' },
    posteriorPredictiveP: { value: Math.round((0.48 + 0.02 * normalRandom(rng)) * 100) / 100, threshold: 0.05, status: 'PASS' },
  };
  diagnostics.rHat.value = Math.round(diagnostics.rHat.value * 1000) / 1000;
  diagnostics.rHat.status = diagnostics.rHat.value < diagnostics.rHat.threshold ? 'PASS' : 'FAIL';
  diagnostics.effectiveSampleSize.status = diagnostics.effectiveSampleSize.value > diagnostics.effectiveSampleSize.threshold ? 'PASS' : 'FAIL';
  diagnostics.posteriorPredictiveP.status =
    diagnostics.posteriorPredictiveP.value > diagnostics.posteriorPredictiveP.threshold &&
    diagnostics.posteriorPredictiveP.value < 1 - diagnostics.posteriorPredictiveP.threshold
      ? 'PASS'
      : 'FAIL';

  return {
    channelROI,
    responseCurves,
    adstockCurves,
    saturationCurves,
    kpiBreakdown,
    diagnostics,
  };
}

export function generateOptimizationResults(modelResults, budget, scenario) {
  const { channelROI } = modelResults;

  // Sort channels by mROI descending for allocation
  const sorted = [...channelROI].filter((c) => c.channel !== 'organic').sort((a, b) => b.mROI - a.mROI);

  const totalCurrentSpend = sorted.reduce((s, c) => s + c.spendShare * budget, 0) || budget;
  const currentROI = sorted.reduce((s, c) => s + c.roi * c.spendShare, 0);

  // Allocate budget based on mROI and scenario
  let scenarioMultiplier = 1.0;
  if (scenario === 'aggressive') scenarioMultiplier = 1.3;
  else if (scenario === 'conservative') scenarioMultiplier = 0.8;
  else if (scenario === 'balanced') scenarioMultiplier = 1.0;

  const totalMROI = sorted.reduce((s, c) => s + c.mROI, 0);

  const channels = sorted.map((ch) => {
    const mROIShare = ch.mROI / totalMROI;
    const optimizedSpend = budget * mROIShare * scenarioMultiplier;
    const currentSpend = budget * ch.spendShare;
    const change = currentSpend > 0 ? (optimizedSpend - currentSpend) / currentSpend : 0;

    return {
      channel: ch.channel,
      channelName: ch.channelName,
      currentSpend: Math.round(currentSpend),
      optimizedSpend: Math.round(optimizedSpend),
      change: Math.round(change * 1000) / 1000,
      roi: ch.roi,
      mROI: ch.mROI,
      expectedReturn: Math.round(optimizedSpend * ch.mROI),
    };
  });

  const optimizedROI = channels.reduce((s, c) => s + c.roi * (c.optimizedSpend / budget), 0);
  const uplift = currentROI > 0 ? (optimizedROI - currentROI) / currentROI : 0;

  return {
    scenario: scenario || 'balanced',
    budget: Math.round(budget),
    channels,
    uplift: Math.round(uplift * 1000) / 1000,
    optimizedROI: Math.round(optimizedROI * 100) / 100,
    currentROI: Math.round(currentROI * 100) / 100,
  };
}

export function generateMTAResults(channelNames, modelType = 'linear', lookbackWindow = 30) {
  const rng = seededRandom(77);

  const channels = channelNames.map((name, idx) => {
    const touchpoints = Math.round(5000 + 45000 * rng());

    let conversions;
    const baseConversions = touchpoints * 0.02;

    switch (modelType) {
      case 'linear': {
        // Equal weight across all touchpoints
        conversions = Math.round(baseConversions * (1 + 0.1 * normalRandom(rng)));
        break;
      }
      case 'time_decay': {
        // 0.7 decay weight -- more recent get more credit
        const decayWeight = 0.7;
        const positionFactor = Math.pow(decayWeight, channelNames.length - 1 - idx);
        conversions = Math.round(baseConversions * positionFactor * (1 + 0.1 * normalRandom(rng)));
        break;
      }
      case 'position_based': {
        // 40/20/40 -- first and last get 40%, middle get 20%
        let posWeight;
        if (idx === 0) posWeight = 0.4;
        else if (idx === channelNames.length - 1) posWeight = 0.4;
        else posWeight = 0.2 / Math.max(1, channelNames.length - 2);
        conversions = Math.round(baseConversions * posWeight * channelNames.length * (1 + 0.1 * normalRandom(rng)));
        break;
      }
      case 'data_driven': {
        // Correlation-weighted
        const correlationWeight = 0.5 + 0.5 * rng();
        conversions = Math.round(baseConversions * correlationWeight * 2 * (1 + 0.1 * normalRandom(rng)));
        break;
      }
      case 'first_touch': {
        // 100% credit to first
        conversions = idx === 0 ? Math.round(baseConversions * channelNames.length * (1 + 0.1 * normalRandom(rng))) : 0;
        break;
      }
      case 'last_touch': {
        // 100% credit to last
        conversions = idx === channelNames.length - 1 ? Math.round(baseConversions * channelNames.length * (1 + 0.1 * normalRandom(rng))) : 0;
        break;
      }
      default: {
        conversions = Math.round(baseConversions * (1 + 0.1 * normalRandom(rng)));
      }
    }

    conversions = Math.max(0, conversions);
    const revenue = Math.round(conversions * 85);
    const cost = touchpoints * 0.5;
    const roi = cost > 0 ? Math.round((revenue / cost) * 100) / 100 : 0;
    const contribution = conversions; // Will be normalized below

    return {
      name,
      touchpoints,
      conversions,
      revenue,
      roi,
      contribution,
    };
  });

  // Normalize contribution to percentages
  const totalConversions = channels.reduce((s, c) => s + c.conversions, 0);
  channels.forEach((ch) => {
    ch.contribution = totalConversions > 0 ? Math.round((ch.conversions / totalConversions) * 1000) / 1000 : 0;
  });

  const totalRevenue = channels.reduce((s, c) => s + c.revenue, 0);

  return {
    channels,
    totalConversions,
    totalRevenue,
    model: modelType,
    lookbackWindow,
  };
}

// --- Collinearity detection & MTA-prior identification demo ---
//
// Why this exists: an MMM identifies a channel's individual ROI by observing
// the KPI move when that channel's spend moves *independently* of the others.
// When two channels rise and fall together (collinear), the aggregate data can
// only identify their COMBINED effect, not the split between them. MTA, which
// works on user-level paths, can see the split because at the person level the
// channels are separable. Feeding MTA's split in as informative priors lets the
// MMM resolve the individual ROIs: the data pins the sum, the prior pins the split.

function pearson(a, b) {
  const n = Math.min(a.length, b.length);
  if (n < 2) return 0;
  let sa = 0, sb = 0;
  for (let i = 0; i < n; i++) { sa += a[i]; sb += b[i]; }
  const ma = sa / n, mb = sb / n;
  let cov = 0, va = 0, vb = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - ma, db = b[i] - mb;
    cov += da * db; va += da * da; vb += db * db;
  }
  if (va === 0 || vb === 0) return 0;
  return cov / Math.sqrt(va * vb);
}

// Build per-channel weekly total-spend series from pipeline rows, then compute
// pairwise spend correlation and an approximate VIF for each channel.
// VIF_j = 1 / (1 - R²_j); we approximate R²_j with the max pairwise r² (the
// strongest single collinearity), which is enough to flag the problem clearly.
export function detectCollinearity(pipelineData, threshold = 0.8) {
  const rows = pipelineData?.rows || [];
  if (!rows.length) return { channels: [], pairs: [], hasCollinearity: false };

  // Aggregate spend by channel -> week
  const byChannel = {};
  const weekSet = new Set();
  for (const r of rows) {
    const ch = r.channelName || r.channel;
    const wk = r.week || r.date;
    const spend = Number(r.spend) || 0;
    if (!ch || !wk) continue;
    weekSet.add(wk);
    byChannel[ch] = byChannel[ch] || {};
    byChannel[ch][wk] = (byChannel[ch][wk] || 0) + spend;
  }
  const weeks = [...weekSet].sort();
  const channelNames = Object.keys(byChannel);
  if (channelNames.length < 2 || weeks.length < 2) {
    return { channels: [], pairs: [], hasCollinearity: false };
  }

  // Dense series aligned on the week axis
  const series = {};
  for (const ch of channelNames) {
    series[ch] = weeks.map((w) => byChannel[ch][w] || 0);
  }

  // Pairwise correlations
  const pairs = [];
  for (let i = 0; i < channelNames.length; i++) {
    for (let j = i + 1; j < channelNames.length; j++) {
      const r = pearson(series[channelNames[i]], series[channelNames[j]]);
      pairs.push({ a: channelNames[i], b: channelNames[j], r: Math.round(r * 1000) / 1000 });
    }
  }
  pairs.sort((p, q) => Math.abs(q.r) - Math.abs(p.r));

  // Per-channel approximate VIF from strongest pairwise r
  const channels = channelNames.map((ch) => {
    let maxR2 = 0;
    for (const p of pairs) {
      if (p.a === ch || p.b === ch) maxR2 = Math.max(maxR2, p.r * p.r);
    }
    const vif = maxR2 >= 0.999 ? 999 : Math.round((1 / (1 - maxR2)) * 10) / 10;
    return { channel: ch, maxCorr: Math.round(Math.sqrt(maxR2) * 1000) / 1000, vif };
  });
  channels.sort((a, b) => b.vif - a.vif);

  const hasCollinearity = pairs.some((p) => Math.abs(p.r) >= threshold);
  return { channels, pairs, hasCollinearity, threshold, weeksUsed: weeks.length };
}

// For the most-collinear pair, produce the "before vs after MTA priors" ROI
// credible intervals. BEFORE: the data identifies the pair's COMBINED ROI well
// but not the split, so each channel gets a wide interval centered near the
// midpoint (the model is guessing the split). AFTER: MTA supplies the split,
// so each channel's interval is narrow and separated, while the two posterior
// means still sum to the same well-identified combined effect.
export function buildIdentificationDemo(pipelineData, mtaResults, threshold = 0.8) {
  const collinearity = detectCollinearity(pipelineData, threshold);
  const top = collinearity.pairs[0];
  if (!top || Math.abs(top.r) < threshold) return null;

  const chA = top.a;
  const chB = top.b;

  // Combined ROI is well-identified by the data. Derive a stable value from the
  // channels' avgROI when available, else a sensible default.
  const findROI = (name) => {
    const c = (pipelineData?.channels || []).find(
      (x) => x.name === name || x.channelName === name || x.key === name
    );
    return c?.avgROI || c?.effectiveROI || null;
  };
  const baseA = findROI(chA) || 2.4;
  const baseB = findROI(chB) || 1.6;
  const combined = Math.round((baseA + baseB) * 100) / 100; // well-identified sum

  // MTA split: prefer real MTA contribution shares for these channels if present.
  const mtaFor = (name) =>
    (mtaResults?.channels || []).find((m) => m.name === name || m.channel === name);
  const mtaA = mtaFor(chA);
  const mtaB = mtaFor(chB);
  let shareA;
  if (mtaA && mtaB && (mtaA.contribution + mtaB.contribution) > 0) {
    shareA = mtaA.contribution / (mtaA.contribution + mtaB.contribution);
  } else {
    shareA = baseA / (baseA + baseB); // fall back to the underlying truth
  }
  const shareB = 1 - shareA;

  // BEFORE: data can't split -> wide, overlapping intervals centered near the
  // midpoint of the combined effect (model has no information about the split).
  const mid = combined / 2;
  const wide = combined * 0.42; // large uncertainty on each individual channel
  const before = [
    { channel: chA, roi: round2(mid), lower: round2(Math.max(0, mid - wide)), upper: round2(mid + wide) },
    { channel: chB, roi: round2(mid), lower: round2(Math.max(0, mid - wide)), upper: round2(mid + wide) },
  ];

  // AFTER: MTA pins the split -> narrow, separated intervals whose means sum to
  // the same combined effect.
  const meanA = combined * shareA;
  const meanB = combined * shareB;
  const narrow = combined * 0.08;
  const after = [
    { channel: chA, roi: round2(meanA), lower: round2(Math.max(0, meanA - narrow)), upper: round2(meanA + narrow) },
    { channel: chB, roi: round2(meanB), lower: round2(Math.max(0, meanB - narrow)), upper: round2(meanB + narrow) },
  ];

  return {
    pair: { a: chA, b: chB, r: top.r },
    vif: collinearity.channels.find((c) => c.channel === chA)?.vif,
    combined,
    split: { a: round2(shareA), b: round2(shareB) },
    mtaDriven: !!(mtaA && mtaB),
    before,
    after,
    ciBeforeWidth: round2(wide * 2),
    ciAfterWidth: round2(narrow * 2),
  };
}

function round2(x) {
  return Math.round(x * 100) / 100;
}
