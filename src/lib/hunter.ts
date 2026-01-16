// Hunter.io API integration for email enrichment

const HUNTER_API_BASE = 'https://api.hunter.io/v2';

interface HunterEmailFinderResponse {
  data: {
    first_name: string;
    last_name: string;
    email: string;
    score: number;
    domain: string;
    position: string;
    twitter: string | null;
    linkedin_url: string | null;
    phone_number: string | null;
    company: string;
    sources: Array<{
      domain: string;
      uri: string;
      extracted_on: string;
    }>;
  };
  meta: {
    params: Record<string, string>;
  };
}

interface HunterDomainSearchResponse {
  data: {
    domain: string;
    disposable: boolean;
    webmail: boolean;
    accept_all: boolean;
    pattern: string;
    organization: string;
    emails: Array<{
      value: string;
      type: string;
      confidence: number;
      first_name: string;
      last_name: string;
      position: string;
      linkedin: string | null;
      twitter: string | null;
      phone_number: string | null;
    }>;
  };
  meta: {
    results: number;
    limit: number;
    offset: number;
  };
}

interface EnrichmentResult {
  success: boolean;
  email?: string;
  linkedin_url?: string;
  phone?: string;
  confidence?: number;
  error?: string;
}

export class HunterClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Find email for a specific person at a company
  async findEmail(
    firstName: string,
    lastName: string,
    domain: string
  ): Promise<EnrichmentResult> {
    try {
      const params = new URLSearchParams({
        domain,
        first_name: firstName,
        last_name: lastName,
        api_key: this.apiKey,
      });

      const response = await fetch(
        `${HUNTER_API_BASE}/email-finder?${params.toString()}`
      );

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.errors?.[0]?.details || 'Failed to find email',
        };
      }

      const data: HunterEmailFinderResponse = await response.json();

      return {
        success: true,
        email: data.data.email,
        linkedin_url: data.data.linkedin_url || undefined,
        phone: data.data.phone_number || undefined,
        confidence: data.data.score,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Search for all emails at a domain
  async searchDomain(domain: string, limit = 10): Promise<HunterDomainSearchResponse['data']['emails']> {
    try {
      const params = new URLSearchParams({
        domain,
        limit: limit.toString(),
        api_key: this.apiKey,
      });

      const response = await fetch(
        `${HUNTER_API_BASE}/domain-search?${params.toString()}`
      );

      if (!response.ok) {
        return [];
      }

      const data: HunterDomainSearchResponse = await response.json();
      return data.data.emails || [];
    } catch {
      return [];
    }
  }

  // Verify if an email is valid
  async verifyEmail(email: string): Promise<{ valid: boolean; score: number }> {
    try {
      const params = new URLSearchParams({
        email,
        api_key: this.apiKey,
      });

      const response = await fetch(
        `${HUNTER_API_BASE}/email-verifier?${params.toString()}`
      );

      if (!response.ok) {
        return { valid: false, score: 0 };
      }

      const data = await response.json();
      return {
        valid: data.data.status === 'valid',
        score: data.data.score || 0,
      };
    } catch {
      return { valid: false, score: 0 };
    }
  }

  // Get account info (remaining searches)
  async getAccountInfo(): Promise<{ remaining: number; total: number } | null> {
    try {
      const params = new URLSearchParams({
        api_key: this.apiKey,
      });

      const response = await fetch(
        `${HUNTER_API_BASE}/account?${params.toString()}`
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return {
        remaining: data.data.requests?.searches?.available || 0,
        total: data.data.requests?.searches?.used || 0,
      };
    } catch {
      return null;
    }
  }
}

// Domain mappings for VC firms - comprehensive list
export const VC_DOMAINS: Record<string, string> = {
  // Tier 1 VCs
  'Andreessen Horowitz': 'a16z.com',
  'a16z': 'a16z.com',
  'Sequoia Capital': 'sequoiacap.com',
  'Sequoia': 'sequoiacap.com',
  'Benchmark': 'benchmark.com',
  'Lightspeed Venture Partners': 'lsvp.com',
  'Lightspeed': 'lsvp.com',
  'Accel': 'accel.com',
  'Greylock Partners': 'greylock.com',
  'Greylock': 'greylock.com',
  'Bessemer Venture Partners': 'bvp.com',
  'Bessemer': 'bvp.com',
  'Index Ventures': 'indexventures.com',
  'NEA': 'nea.com',
  'General Catalyst': 'generalcatalyst.com',
  'Kleiner Perkins': 'kleinerperkins.com',
  'First Round Capital': 'firstround.com',
  'Union Square Ventures': 'usv.com',
  'Founders Fund': 'foundersfund.com',
  'Khosla Ventures': 'khoslaventures.com',
  'GGV Capital': 'ggvc.com',
  'Battery Ventures': 'battery.com',
  'Redpoint Ventures': 'redpoint.com',
  'Spark Capital': 'sparkcapital.com',
  'IVP': 'ivp.com',
  'Norwest Venture Partners': 'nvp.com',
  'Norwest': 'nvp.com',
  'Menlo Ventures': 'menlovc.com',
  'CRV': 'crv.com',
  'Scale Venture Partners': 'scalevp.com',
  'Insight Partners': 'insightpartners.com',
  'Tiger Global Management': 'tigerglobal.com',
  'Tiger Global': 'tigerglobal.com',
  'Coatue Management': 'coatue.com',
  'Coatue': 'coatue.com',
  'Thrive Capital': 'thrivecap.com',
  '8VC': '8vc.com',
  'Craft Ventures': 'craftventures.com',
  'Floodgate': 'floodgate.com',
  'Y Combinator': 'ycombinator.com',
  '500 Global': '500.co',
  '500 Startups': '500.co',
  'Matrix Partners': 'matrixpartners.com',
  'Emergence Capital': 'emcap.com',
  'Ribbit Capital': 'ribbitcap.com',
  'Felicis Ventures': 'felicis.com',
  'Felicis': 'felicis.com',
  'SV Angel': 'svangel.com',
  'Foundation Capital': 'foundationcap.com',
  'Sutter Hill Ventures': 'shv.com',
  'Canaan Partners': 'canaan.com',
  'Bain Capital Ventures': 'baincapitalventures.com',
  'Cowboy Ventures': 'cowboy.vc',
  'Forerunner Ventures': 'forerunnerventures.com',
  'Homebrew': 'homebrew.co',
  'Uncork Capital': 'uncorkcapital.com',
  'Pear VC': 'pear.vc',
  'Initialized Capital': 'initialized.com',
  'Social Capital': 'socialcapital.com',
  'Lowercarbon Capital': 'lowercarboncapital.com',
  'DBL Partners': 'dblpartners.vc',
  'Haun Ventures': 'haun.co',
  'Variant': 'variant.fund',
  'Paradigm': 'paradigm.xyz',
  'Polychain Capital': 'polychain.capital',
  'Electric Capital': 'electriccapital.com',
  'Multicoin Capital': 'multicoin.capital',

  // Growth & Crossover
  'QED Investors': 'qedinvestors.com',
  'SoftBank Vision Fund': 'softbank.com',
  'SoftBank': 'softbank.com',
  'DST Global': 'dst.global',
  'Altimeter Capital': 'altimetercap.com',
  'D1 Capital Partners': 'd1cap.com',
  'D1 Capital': 'd1cap.com',
  'Lone Pine Capital': 'lonepinecapital.com',
  'Viking Global Investors': 'vikingglobal.com',
  'Viking Global': 'vikingglobal.com',
  'Greenoaks Capital': 'greenoakscap.com',
  'Durable Capital Partners': 'durablecap.com',
  'Durable Capital': 'durablecap.com',
  'Addition': 'addition.com',
  'Dragoneer Investment Group': 'dragoneer.com',
  'Dragoneer': 'dragoneer.com',
  'Iconiq Capital': 'iconiqcapital.com',
  'ICONIQ': 'iconiqcapital.com',

  // Major VCs
  'RRE Ventures': 'rre.com',
  'Venrock': 'venrock.com',
  'Upfront Ventures': 'upfront.com',
  'True Ventures': 'trueventures.com',
  'Global Founders Capital': 'globalfounders.vc',
  'DCVC': 'dcvc.com',
  'Data Collective': 'dcvc.com',
  'Madrona Venture Group': 'madrona.com',
  'Madrona': 'madrona.com',
  'Shasta Ventures': 'shastaventures.com',
  'Canvas Ventures': 'canvas.vc',
  'FirstMark Capital': 'firstmarkcap.com',
  'FirstMark': 'firstmarkcap.com',
  'Slow Ventures': 'slow.co',
  'Greycroft Partners': 'greycroft.com',
  'Greycroft': 'greycroft.com',
  'Two Sigma Ventures': 'twosigmaventures.com',
  'Revolution': 'revolution.com',
  'Volition Capital': 'volitioncapital.com',
  'OpenView Partners': 'openviewpartners.com',
  'OpenView': 'openviewpartners.com',
  'High Alpha': 'highalpha.com',
  'Foundry Group': 'foundrygroup.com',
  'Techstars': 'techstars.com',
  'Primary Venture Partners': 'primary.vc',

  // Private Equity & Growth Equity
  'Warburg Pincus': 'warburgpincus.com',
  'TPG': 'tpg.com',
  'TPG Capital': 'tpg.com',
  'Thoma Bravo': 'thomabravo.com',
  'General Atlantic': 'generalatlantic.com',
  'Silver Lake': 'silverlake.com',
  'Advent International': 'adventinternational.com',
  'Francisco Partners': 'franciscopartners.com',
  'Summit Partners': 'summitpartners.com',
  'TA Associates': 'ta.com',
  'Hellman & Friedman': 'hf.com',
  'Leonard Green': 'leonardgreen.com',
  'GTCR': 'gtcr.com',
  'Madison Dearborn': 'mdcp.com',
  'Madison Dearborn Partners': 'mdcp.com',
  'Berkshire Partners': 'berkshirepartners.com',
  'JMI Equity': 'jmi.com',
  'Spectrum Equity': 'spectrumequity.com',
  'KKR': 'kkr.com',
  'Carlyle Group': 'carlyle.com',
  'Carlyle': 'carlyle.com',
  'Providence Equity': 'provequity.com',
  'Providence Equity Partners': 'provequity.com',
  'Charlesbank': 'charlesbank.com',
  'Charlesbank Capital Partners': 'charlesbank.com',

  // Institutional Investors
  'Fidelity Investments': 'fidelity.com',
  'T. Rowe Price': 'troweprice.com',
  'Wellington Management': 'wellington.com',
  'Baillie Gifford': 'bailliegifford.com',
  'Temasek': 'temasek.com.sg',
  'GIC': 'gic.com.sg',
  'Canada Pension Plan': 'cppinvestments.com',
  'CPP Investments': 'cppinvestments.com',
  'Ontario Teachers Pension Plan': 'otpp.com',
  'OTPP': 'otpp.com',

  // Additional Top VCs
  'SignalFire': 'signalfire.com',
  'Costanoa Ventures': 'costanoavc.com',
  'Costanoa': 'costanoavc.com',
  'NFX': 'nfx.com',
  'Mayfield': 'mayfield.com',
  'Mayfield Fund': 'mayfield.com',
  'Susa Ventures': 'susaventures.com',
  'Boldstart Ventures': 'boldstart.vc',
  'Boldstart': 'boldstart.vc',
  'Precursor Ventures': 'precursorvc.com',
  'NextView Ventures': 'nextviewventures.com',
  'Lerer Hippeau': 'lererhippeau.com',
  'Eniac Ventures': 'eniac.vc',
  'Founder Collective': 'foundercollective.com',
  'Sapphire Ventures': 'sapphireventures.com',
  'USVP': 'usvp.com',
  'US Venture Partners': 'usvp.com',
  'Maveron': 'maveron.com',
  'Plug and Play': 'plugandplaytechcenter.com',

  // Enterprise & B2B Specialists
  'Work-Bench': 'work-bench.com',
  'Amplify Partners': 'amplifypartners.com',
  'Unusual Ventures': 'unusual.vc',
  'Wing Venture Capital': 'wing.vc',
  'Wing': 'wing.vc',
  'Storm Ventures': 'stormventures.com',
  'Tenaya Capital': 'tenayacapital.com',

  // Fintech Specialists
  'Nyca Partners': 'nyca.com',
  'FinCapital': 'fincapital.com',
  'Clocktower Technology Ventures': 'clocktower.com',
  'Fin VC': 'fin.vc',

  // Consumer & Retail
  'Kirsten Green': 'forerunnerventures.com',
  'Forerunner': 'forerunnerventures.com',
  'Female Founders Fund': 'femalefoundersfund.com',
  'F3': 'femalefoundersfund.com',
  'XYZ Ventures': 'xyz.vc',

  // Deep Tech & AI
  'Lux Capital': 'luxcapital.com',
  'Playground Global': 'playground.global',
  'In-Q-Tel': 'iqt.org',
  'IQT': 'iqt.org',
  'Prime Movers Lab': 'primemoverslab.com',
  'Radical Ventures': 'radical.vc',
  'Eclipse Ventures': 'eclipse.vc',
  'Gradient Ventures': 'gradient.google',

  // Healthcare & Life Sciences
  'ARCH Venture Partners': 'archventure.com',
  'OrbiMed': 'orbimed.com',
  'Versant Ventures': 'versantventures.com',
  'Flagship Pioneering': 'flagshippioneering.com',
  'Third Rock Ventures': 'thirdrockventures.com',
  'GV': 'gv.com',
  'Google Ventures': 'gv.com',

  // Regional VCs
  'Andreessen Horowitz Bio': 'a16z.com',
  'a16z bio': 'a16z.com',
  'Obvious Ventures': 'obvious.com',
  'Collaborative Fund': 'collaborativefund.com',
  'Sound Ventures': 'sound.ventures',
  'Seven Seven Six': 'sevensevensix.com',
  '776': 'sevensevensix.com',
  'Alexis Ohanian': 'sevensevensix.com',

  // International
  'Atomico': 'atomico.com',
  'Balderton Capital': 'balderton.com',
  'Northzone': 'northzone.com',
  'Creandum': 'creandum.com',
  'EQT Ventures': 'eqtventures.com',
  'Hillhouse Capital': 'hillhousecap.com',
  'Qumra Capital': 'qumracapital.com',
  'Pitango': 'pitango.com',
  'JVP': 'jvpvc.com',
  'Viola Ventures': 'viola-group.com',

  // Corporate VCs
  'Intel Capital': 'intelcapital.com',
  'Microsoft Ventures': 'm12.vc',
  'M12': 'm12.vc',
  'Salesforce Ventures': 'salesforceventures.com',
  'Cisco Investments': 'cisco.com',
  'Dell Technologies Capital': 'delltechnologiescapital.com',
  'Samsung NEXT': 'samsungnext.com',
  'Qualcomm Ventures': 'qualcommventures.com',
  'Comcast Ventures': 'comcastventures.com',
};

// Helper to extract domain from firm name
export function getDomainForFirm(firmName: string): string | null {
  // Direct lookup
  if (VC_DOMAINS[firmName]) {
    return VC_DOMAINS[firmName];
  }

  // Try partial match
  const normalizedFirm = firmName.toLowerCase();
  for (const [key, domain] of Object.entries(VC_DOMAINS)) {
    if (normalizedFirm.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedFirm)) {
      return domain;
    }
  }

  return null;
}

// Parse name into first and last
export function parseName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) {
    return { firstName: '', lastName: '' };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}
