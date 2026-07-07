export const globalNews = {
  politics: [
    { id: 'g1', title: 'G20 Summit Kicks Off in New Delhi', summary: 'World leaders gather for the annual G20 summit focused on climate finance and global tax reform.', source: 'Reuters', date: '2026-07-05', image: '🌐', category: 'politics' },
    { id: 'g2', title: 'UN Climate Report Warns of Accelerating Ice Melt', summary: 'New data shows Arctic sea ice at record low, urging immediate carbon emission cuts.', source: 'BBC News', date: '2026-07-04', image: '🌍', category: 'politics' },
    { id: 'g3', title: 'IMF Urges Coordinated Action on Global Debt Crisis', summary: 'Developing nations face mounting debt pressures as IMF calls for restructuring framework.', source: 'Financial Times', date: '2026-07-03', image: '🏛️', category: 'politics' },
    { id: 'g4', title: 'US-China Trade Talks Resume in Geneva', summary: 'Both nations signal willingness to de-escalate tariffs ahead of presidential election.', source: 'AP News', date: '2026-07-02', image: '🤝', category: 'politics' },
    { id: 'g5', title: 'European Union Approves New Digital Tax Framework', summary: 'Tech giants face minimum 15% corporate tax across all member states from 2027.', source: 'Euronews', date: '2026-07-01', image: '🇪🇺', category: 'politics' },
    { id: 'g6', title: 'Middle East Peace Talks Mediated by India', summary: 'India steps in as neutral mediator for ongoing normalization discussions.', source: 'Al Jazeera', date: '2026-06-30', image: '🕊️', category: 'politics' },
  ],
  weather: [
    { id: 'g7', title: 'Record Heatwave Sweeps Across Europe', summary: 'Temperatures exceed 45°C in Spain, France, and Italy prompting health emergencies.', source: 'Weather Channel', date: '2026-07-05', image: '🌡️', category: 'weather' },
    { id: 'g8', title: 'Atlantic Hurricane Season Predicted Above Average', summary: 'NOAA forecasts 18-22 named storms with major implications for Caribbean and US coasts.', source: 'NOAA', date: '2026-07-04', image: '🌀', category: 'weather' },
    { id: 'g9', title: 'Southwest Monsoon Covers Entire India Ahead of Schedule', summary: 'Timely monsoon brings relief from heat, raises hopes for robust agricultural output.', source: 'IMD', date: '2026-07-03', image: '⛈️', category: 'weather' },
    { id: 'g10', title: 'Antarctic Ozone Hole Shows Signs of Recovery', summary: 'UNEP report indicates ozone layer healing due to sustained Montreal Protocol compliance.', source: 'UNEP', date: '2026-07-02', image: '🌤️', category: 'weather' },
    { id: 'g11', title: 'Category 5 Cyclone Approaches Southeast Asia', summary: 'Philippines, Vietnam, and Thailand brace for impact as evacuation efforts intensify.', source: 'WMO', date: '2026-07-01', image: '🌊', category: 'weather' },
    { id: 'g12', title: 'Severe Drought Threatens Food Security in East Africa', summary: 'Four consecutive failed rainy seasons push millions toward humanitarian crisis.', source: 'WFP', date: '2026-06-29', image: '🏜️', category: 'weather' },
  ],
  economy: [
    { id: 'g13', title: 'Global Markets Rally on Fed Rate Cut Signal', summary: 'S&P 500 hits all-time high as Federal Reserve hints at September rate reduction.', source: 'Bloomberg', date: '2026-07-05', image: '📈', category: 'economy' },
    { id: 'g14', title: 'Oil Prices Drop Below $70 on Demand Concerns', summary: 'OPEC+ considers output cut extension as global economic slowdown impacts energy demand.', source: 'CNBC', date: '2026-07-04', image: '🛢️', category: 'economy' },
    { id: 'g15', title: 'Bitcoin Crosses $100K Mark for First Time', summary: 'Institutional adoption and spot ETF approvals drive cryptocurrency to historic milestone.', source: 'CoinDesk', date: '2026-07-03', image: '₿', category: 'economy' },
    { id: 'g16', title: 'AI Industry Valuation Tops $3 Trillion Globally', summary: 'Generative AI leads investment surge with enterprises racing to adopt automation solutions.', source: 'McKinsey', date: '2026-07-02', image: '🤖', category: 'economy' },
    { id: 'g17', title: 'Supply Chains Shift: Vietnam Emerges as Manufacturing Hub', summary: 'Companies diversify away from China as Vietnam exports grow 22% year-on-year.', source: 'Nikkei Asia', date: '2026-07-01', image: '🏭', category: 'economy' },
    { id: 'g18', title: 'RBI Holds Repo Rate at 6.25% Amidst Inflation Watch', summary: 'Central banks globally adopt wait-and-watch approach as core inflation remains sticky.', source: 'Economic Times', date: '2026-06-30', image: '💹', category: 'economy' },
  ],
  sports: [
    { id: 'g19', title: 'FIFA World Cup 2026: Host Cities Announced', summary: '16 cities across USA, Canada, and Mexico to host the expanded 48-team tournament.', source: 'ESPN', date: '2026-07-05', image: '⚽', category: 'sports' },
    { id: 'g20', title: 'India Win T20 World Cup in Thrilling Final', summary: 'India defeat Australia by 5 wickets in a last-over finish to claim the T20 crown.', source: 'Cricbuzz', date: '2026-07-04', image: '🏏', category: 'sports' },
    { id: 'g21', title: 'Wimbledon 2026: Alcaraz and Swiatek Favourites', summary: 'Top seeds advance as grass court season reaches its pinnacle in London.', source: 'BBC Sport', date: '2026-07-03', image: '🎾', category: 'sports' },
    { id: 'g22', title: 'NBA Finals: Lakers vs Celtics Renew Historic Rivalry', summary: 'Game 7 scheduled as both teams split first six games in a high-scoring series.', source: 'NBA', date: '2026-07-02', image: '🏀', category: 'sports' },
    { id: 'g23', title: 'Olympics 2026: Milan Cortina Preparations on Track', summary: 'Winter Olympics venues ready with 90% of tickets sold for February games.', source: 'Olympics.com', date: '2026-07-01', image: '🏅', category: 'sports' },
    { id: 'g24', title: 'Formula 1 British GP: Rain Disrupts Qualifying', summary: 'Verstappen takes pole position ahead of Hamilton in wet-dry session at Silverstone.', source: 'Sky Sports', date: '2026-06-30', image: '🏎️', category: 'sports' },
  ],
};

const inDefault = {
  politics: [
    { id: 'in1', title: 'Parliament Passes Landmark Digital Privacy Bill', summary: 'The new legislation mandates data localization and imposes heavy fines for breaches.', source: 'The Hindu', date: '2026-07-05', image: '🇮🇳', category: 'politics' },
    { id: 'in2', title: 'India and Japan Sign Defence Cooperation Pact', summary: 'Joint military exercises and technology sharing agreement expanded for Indo-Pacific security.', source: 'Indian Express', date: '2026-07-04', image: '🤝', category: 'politics' },
    { id: 'in3', title: 'GST Council Meeting: Tax Rate Rationalization Discussed', summary: 'Fitment committee proposes merging 12% and 18% slabs to simplify tax structure.', source: 'Economic Times', date: '2026-07-02', image: '📋', category: 'politics' },
    { id: 'in4', title: 'National Elections 2026: EC Announces Schedule', summary: 'Seven-phase polling begins October 15 for 543 Lok Sabha seats across the country.', source: 'NDTV', date: '2026-06-30', image: '🗳️', category: 'politics' },
  ],
  weather: [
    { id: 'in5', title: 'Monsoon Covers Entire Country, 8% Above Normal', summary: 'IMD predicts above-average rainfall for July-September boosting kharif crop sowing.', source: 'Skymet', date: '2026-07-05', image: '🌧️', category: 'weather' },
    { id: 'in6', title: 'Delhi Records Hottest June in a Decade', summary: 'Temperature touches 47°C; government activates heat action plan across the capital.', source: 'Times of India', date: '2026-07-03', image: '🌡️', category: 'weather' },
    { id: 'in7', title: 'Chennai Braces for Heavy Rainfall Alert', summary: 'Coastal areas on high alert as depression in Bay of Bengal intensifies.', source: 'The News Minute', date: '2026-07-01', image: '🌊', category: 'weather' },
    { id: 'in8', title: 'Air Quality Improves in Northern Plains Post-Monsoon', summary: 'AQI drops below 100 in Delhi-NCR for first time in six months after pre-monsoon showers.', source: 'CPCB', date: '2026-06-28', image: '🌤️', category: 'weather' },
  ],
  economy: [
    { id: 'in9', title: 'India GDP Growth Rate Revised to 7.5% for FY26', summary: 'Strong manufacturing and services sector performance drive upward revision by NSO.', source: 'Business Standard', date: '2026-07-05', image: '📊', category: 'economy' },
    { id: 'in10', title: 'Startup Funding Rebounds: $4.5B Raised in Q2', summary: 'Fintech and edtech lead recovery as venture capital returns to Indian market.', source: 'YourStory', date: '2026-07-04', image: '🚀', category: 'economy' },
    { id: 'in11', title: 'Nifty 50 Crosses 28,000 Mark for First Time', summary: 'Broad-based rally led by IT, banking, and auto stocks amid strong FII inflows.', source: 'Mint', date: '2026-07-02', image: '📈', category: 'economy' },
    { id: 'in12', title: 'Real Estate: Housing Sales Surge 25% in Top Cities', summary: 'Mumbai, Pune, and Bangalore lead demand with affordable housing segment growing fastest.', source: 'MagicBricks', date: '2026-06-30', image: '🏗️', category: 'economy' },
  ],
  sports: [
    { id: 'in13', title: 'India vs England Test Series: India Lead 2-0', summary: 'Rohit Sharma scores double century in Chennai as India dominate the five-match series.', source: 'ESPNcricinfo', date: '2026-07-05', image: '🏏', category: 'sports' },
    { id: 'in14', title: 'Indian Football Team Qualifies for Asian Cup Quarters', summary: 'Historic win over Saudi Arabia secures knockout berth for the first time since 2011.', source: 'Sportskeeda', date: '2026-07-03', image: '⚽', category: 'sports' },
    { id: 'in15', title: 'Neeraj Chopra Wins Gold at Diamond League', summary: 'Olympic champion throws 89.75m in Stockholm, sets new season best.', source: 'Olympics.com', date: '2026-07-01', image: '🥇', category: 'sports' },
    { id: 'in16', title: 'Pro Kabaddi League Season 12 Begins in Pune', summary: '12 teams compete for the title with matches scheduled across 8 cities until December.', source: 'Star Sports', date: '2026-06-29', image: '🤼', category: 'sports' },
  ],
};

const mhDefault = {
  politics: [
    { id: 'mh1', title: 'Maharashtra Budget 2026: Infrastructure Gets 40% Allocation', summary: 'State government announces ₹15,000Cr for roads, metro, and water supply projects.', source: 'Lokmat', date: '2026-07-04', image: '🏛️', category: 'politics' },
    { id: 'mh2', title: 'Maharashtra Political Alliance Shifts Ahead of Elections', summary: 'Major parties realign as assembly elections approach later this year.', source: 'ABP Majha', date: '2026-07-02', image: '🤝', category: 'politics' },
    { id: 'mh3', title: 'Mumbai Coastal Road Project: Phase 2 Inaugurated', summary: 'The 10-km stretch reduces travel time from Marine Drive to Worli by 40 minutes.', source: 'Mumbai Mirror', date: '2026-06-30', image: '🏗️', category: 'politics' },
  ],
  weather: [
    { id: 'mh5', title: 'Mumbai Receives 300mm Rain in 24 Hours', summary: 'Schools closed, trains delayed as city grapples with waterlogging and road closures.', source: 'Indian Express', date: '2026-07-05', image: '🌧️', category: 'weather' },
    { id: 'mh6', title: 'Pune Temperature Drops to 18°C Post-Rains', summary: 'Citizens enjoy pleasant weather as southwest monsoon brings relief from summer heat.', source: 'Pune Mirror', date: '2026-07-03', image: '🌤️', category: 'weather' },
  ],
  economy: [
    { id: 'mh8', title: 'Pune IT Exports Grow 18% in Q1 FY26', summary: 'Hinjawadi and Magarpatta clusters drive growth with over 500 new startups registered.', source: 'Pune Mirror', date: '2026-07-04', image: '💻', category: 'economy' },
    { id: 'mh9', title: 'Mumbai Real Estate: Luxury Housing Demand Surges', summary: 'Properties above ₹5Cr see 35% year-on-year growth in sales across South Mumbai.', source: 'Housing News', date: '2026-07-02', image: '🏢', category: 'economy' },
    { id: 'mh10', title: 'Maharashtra Leads India in FDI Inflows', summary: 'State attracts $12B in foreign direct investment during first half of 2026.', source: 'Economic Times', date: '2026-06-30', image: '💰', category: 'economy' },
  ],
  sports: [
    { id: 'mh12', title: 'Pune Half Marathon: 25,000 Runners Participate', summary: 'International athletes join local runners for the annual event through city landmarks.', source: 'Indian Express', date: '2026-07-05', image: '🏃', category: 'sports' },
    { id: 'mh13', title: 'Mumbai Indians Win Record 7th IPL Title', summary: 'Hardik Pandya-led team defeats Chennai Super Kings by 8 wickets in the final.', source: 'Cricbuzz', date: '2026-07-01', image: '🏏', category: 'sports' },
  ],
};

const puneData = {
  politics: [
    { id: 'pun1', title: 'Pune Municipal Corporation Launches Smart City 2.0', summary: 'AI-powered traffic management, smart parking, and integrated command center unveiled.', source: 'Pune Mirror', date: '2026-07-05', image: '🏙️', category: 'politics' },
    { id: 'pun2', title: 'PCMC Budget: ₹500Cr Allocated for Pimpri-Chinchwad Development', summary: 'New flyovers, sewage treatment plants, and digital classrooms in the pipeline.', source: 'Times of India', date: '2026-07-03', image: '📋', category: 'politics' },
    { id: 'pun3', title: 'Pune Metro Phase 2: Hinjawadi Extension Opens', summary: 'Vanaz to Hinjawadi route reduces commute time from 90 to 25 minutes for IT corridor.', source: 'Hindustan Times', date: '2026-07-01', image: '🚇', category: 'politics' },
  ],
  weather: [
    { id: 'pun4', title: 'Pune Recorded 150mm Rain in 12 Hours', summary: 'Khadakwasla and Panshet dams reach 80% capacity; low-lying areas on alert.', source: 'Pune Mirror', date: '2026-07-05', image: '🌧️', category: 'weather' },
    { id: 'pun5', title: 'Pune Air Quality Improves Significantly Post-Monsoon', summary: 'AQI drops to 42 (Good) as rains wash away pollutants accumulated during summer.', source: 'SAFAR', date: '2026-07-02', image: '🌤️', category: 'weather' },
    { id: 'pun6', title: 'Pune Temperature Forecast: Pleasant 24-28°C This Week', summary: 'Citizens can expect comfortable weather with light drizzles predicted for weekend.', source: 'Skymet', date: '2026-07-01', image: '🌥️', category: 'weather' },
  ],
  economy: [
    { id: 'pun7', title: 'Pune Startup Ecosystem Raises $200M in Q2', summary: 'Fintech and healthtech lead investment in the citys growing startup landscape.', source: 'YourStory', date: '2026-07-04', image: '🚀', category: 'economy' },
    { id: 'pun8', title: 'Hinjawadi IT Park Adds 50 New Companies', summary: '30,000 new jobs created as global tech firms expand operations in Pune\'s IT hub.', source: 'Business Standard', date: '2026-07-02', image: '🏢', category: 'economy' },
    { id: 'pun9', title: 'Pune Real Estate: Property Registrations Up 22%', summary: 'Baner, Wakad, and Kharadi lead demand with affordable housing in high demand.', source: 'MagicBricks', date: '2026-06-30', image: '🏠', category: 'economy' },
  ],
  sports: [
    { id: 'pun10', title: 'Pune FC Wins I-League Title for First Time', summary: 'Local football club defeats Mohun Bagan 2-1 at the Balewadi Stadium before packed crowd.', source: 'Sportskeeda', date: '2026-07-04', image: '⚽', category: 'sports' },
    { id: 'pun11', title: 'Maharashtra Kabbadi Team Wins National Championship', summary: 'Pune-based players shine as Maharashtra defeats Tamil Nadu in the final.', source: 'Lokmat', date: '2026-07-01', image: '🤼', category: 'sports' },
    { id: 'pun12', title: 'Pune International Marathon: World Record Attempt', summary: 'Elite athletes from 15 countries participate in the annual event.', source: 'Pune Mirror', date: '2026-06-28', image: '🏃', category: 'sports' },
  ],
};

const mumbaiData = {
  politics: [
    { id: 'mum1', title: 'Mumbai Coastal Road Phase 2 Inaugurated', summary: 'The 10-km underground tunnel connects Marine Drive to Worli, reducing travel time by 70%.', source: 'Times of India', date: '2026-07-05', image: '🚇', category: 'politics' },
    { id: 'mum2', title: 'BMC Presents ₹50,000Cr Budget for 2026-27', summary: 'Major allocations for infrastructure, health, and education with focus on eastern suburbs.', source: 'Mumbai Mirror', date: '2026-07-02', image: '📊', category: 'politics' },
    { id: 'mum3', title: 'Mumbai Trans Harbour Link: 70% Work Completed', summary: 'The 22-km sea bridge connecting Mumbai to Navi Mumbai is expected to open by mid-2027.', source: 'Indian Express', date: '2026-06-30', image: '🌉', category: 'politics' },
  ],
  weather: [
    { id: 'mum4', title: 'Mumbai Floods: City Receives 400mm Rain in Day', summary: 'Local trains suspended, schools closed as BMC declares holiday in low-lying wards.', source: 'NDTV', date: '2026-07-05', image: '🌊', category: 'weather' },
    { id: 'mum5', title: 'Mumbai Weather: Monsoon Active, More Rain Predicted', summary: 'IMD issues orange alert for next 48 hours with high tide warning for coastal areas.', source: 'Skymet', date: '2026-07-03', image: '⛈️', category: 'weather' },
  ],
  economy: [
    { id: 'mum7', title: 'BSE Sensex Crosses 95,000 Mark', summary: 'Mumbai-based BSE hits new milestone driven by IT and banking sector rally.', source: 'Economic Times', date: '2026-07-04', image: '📈', category: 'economy' },
    { id: 'mum8', title: 'Mumbai Port Handles Record 80M Tons Cargo', summary: 'Expansion and modernization drive 15% growth in cargo handling capacity.', source: 'Business Line', date: '2026-07-02', image: '🚢', category: 'economy' },
  ],
  sports: [
    { id: 'mum10', title: 'Mumbai Indians Clinch Record 7th IPL Title', summary: 'Captain Hardik Pandya leads from front with all-round performance in sold-out Wankhede.', source: 'ESPNcricinfo', date: '2026-07-04', image: '🏏', category: 'sports' },
    { id: 'mum11', title: 'Mumbai Marathon: 50,000 Participants Set Record', summary: 'Charity edition raises ₹25Cr for social causes with runners from 60 countries.', source: 'Indian Express', date: '2026-06-30', image: '🏃', category: 'sports' },
  ],
};

export const localNews = {
  India: {
    _default: inDefault,
    Maharashtra: {
      _default: mhDefault,
      Pune: puneData,
      Mumbai: mumbaiData,
    },
  },
};
