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
    { id: 'g17', title: ' supply Chains Shift: Vietnam Emerges as Manufacturing Hub', summary: 'Companies diversify away from China as Vietnam exports grow 22% year-on-year.', source: 'Nikkei Asia', date: '2026-07-01', image: '🏭', category: 'economy' },
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
}

export const localNews = {
  India: {
    _default: {
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
    },
    Maharashtra: {
      _default: {
        politics: [
          { id: 'mh1', title: 'Maharashtra Budget 2026: Infrastructure Gets 40% Allocation', summary: 'State government announces ₹15,000Cr for roads, metro, and water supply projects.', source: 'Lokmat', date: '2026-07-04', image: '🏛️', category: 'politics' },
          { id: 'mh2', title: 'Maharashtra Political Alliance Shifts Ahead of Elections', summary: 'Major parties realign as assembly elections approach later this year.', source: 'ABP Majha', date: '2026-07-02', image: '🤝', category: 'politics' },
          { id: 'mh3', title: 'Mumbai Coastal Road Project: Phase 2 Inaugurated', summary: 'The 10-km stretch reduces travel time from Marine Drive to Worli by 40 minutes.', source: 'Mumbai Mirror', date: '2026-06-30', image: '🏗️', category: 'politics' },
          { id: 'mh4', title: 'Maharashtra Proposes New IT Policy for Tier-2 Cities', summary: 'Nashik, Nagpur, and Aurangabad offered incentives to attract tech investments.', source: 'Business Line', date: '2026-06-28', image: '💻', category: 'politics' },
        ],
        weather: [
          { id: 'mh5', title: 'Mumbai Receives 300mm Rain in 24 Hours', summary: 'Schools closed, trains delayed as city grapples with waterlogging and road closures.', source: 'Indian Express', date: '2026-07-05', image: '🌧️', category: 'weather' },
          { id: 'mh6', title: 'Pune Temperature Drops to 18°C Post-Rains', summary: 'Citizens enjoy pleasant weather as southwest monsoon brings relief from summer heat.', source: 'Pune Mirror', date: '2026-07-03', image: '🌤️', category: 'weather' },
          { id: 'mh7', title: 'Nagpur Heatwave Warning: Temperatures to Hit 45°C', summary: 'District administration opens cooling centers and advises precautions for vulnerable groups.', source: 'The Hitavada', date: '2026-06-29', image: '🌡️', category: 'weather' },
        ],
        economy: [
          { id: 'mh8', title: 'Pune IT Exports Grow 18% in Q1 FY26', summary: 'Hinjawadi and Magarpatta clusters drive growth with over 500 new startups registered.', source: 'Pune Mirror', date: '2026-07-04', image: '💻', category: 'economy' },
          { id: 'mh9', title: 'Mumbai Real Estate: Luxury Housing Demand Surges', summary: 'Properties above ₹5Cr see 35% year-on-year growth in sales across South Mumbai.', source: 'Housing News', date: '2026-07-02', image: '🏢', category: 'economy' },
          { id: 'mh10', title: 'Maharashtra Leads India in FDI Inflows', summary: 'State attracts $12B in foreign direct investment during first half of 2026.', source: 'Economic Times', date: '2026-06-30', image: '💰', category: 'economy' },
          { id: 'mh11', title: 'Thane-Belapur Industrial Corridor Gets Green Signal', summary: 'New expressway and industrial zone to create 50,000 jobs in the region.', source: 'Navi Mumbai News', date: '2026-06-27', image: '🏭', category: 'economy' },
        ],
        sports: [
          { id: 'mh12', title: 'Pune Half Marathon: 25,000 Runners Participate', summary: 'International athletes join local runners for the annual event through city landmarks.', source: 'Indian Express', date: '2026-07-05', image: '🏃', category: 'sports' },
          { id: 'mh13', title: 'Mumbai Indians Win Record 7th IPL Title', summary: 'Hardik Pandya-led team defeats Chennai Super Kings by 8 wickets in the final.', source: 'Cricbuzz', date: '2026-07-01', image: '🏏', category: 'sports' },
          { id: 'mh14', title: 'Maharashtra Cricket Association to Build New Stadium', summary: 'State-of-the-art 50,000-capacity stadium approved for Pune with completion by 2028.', source: 'Indian Express', date: '2026-06-28', image: '🏟️', category: 'sports' },
        ],
      },
      Pune: {
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
          { id: 'pun11', title: 'Maharashtra Kabbadi Team Wins National Championship', summary: 'Pune-based players shine as Maharashtra defeats Tamil Nadu in the final at Shree Shiv Chhatrapati Sports Complex.', source: 'Lokmat', date: '2026-07-01', image: '🤼', category: 'sports' },
          { id: 'pun12', title: 'Pune International Marathon: World Record Attempt', summary: 'Elite athletes from 15 countries participate in the annual event organized by PMC.', source: 'Pune Mirror', date: '2026-06-28', image: '🏃', category: 'sports' },
        ],
      },
      Mumbai: {
        politics: [
          { id: 'mum1', title: 'Mumbai Coastal Road Phase 2 Inaugurated', summary: 'The 10-km underground tunnel connects Marine Drive to Worli, reducing travel time by 70%.', source: 'Times of India', date: '2026-07-05', image: '🚇', category: 'politics' },
          { id: 'mum2', title: 'BMC Presents ₹50,000Cr Budget for 2026-27', summary: 'Major allocations for infrastructure, health, and education with focus on eastern suburbs.', source: 'Mumbai Mirror', date: '2026-07-02', image: '📊', category: 'politics' },
          { id: 'mum3', title: 'Mumbai Trans Harbour Link: 70% Work Completed', summary: 'The 22-km sea bridge connecting Mumbai to Navi Mumbai is expected to open by mid-2027.', source: 'Indian Express', date: '2026-06-30', image: '🌉', category: 'politics' },
        ],
        weather: [
          { id: 'mum4', title: 'Mumbai Floods: City Receives 400mm Rain in Day', summary: 'Local trains suspended, schools closed as BMC declares holiday in low-lying wards.', source: 'NDTV', date: '2026-07-05', image: '🌊', category: 'weather' },
          { id: 'mum5', title: 'Mumbai Weather: Monsoon Active, More Rain Predicted', summary: 'IMD issues orange alert for next 48 hours with high tide warning for coastal areas.', source: 'Skymet', date: '2026-07-03', image: '⛈️', category: 'weather' },
          { id: 'mum6', title: 'Air Quality in Mumbai Improves to Moderate Levels', summary: 'AQI drops to 98 after consistent rainfall, providing relief from pollution.', source: 'SAFAR', date: '2026-07-01', image: '🌤️', category: 'weather' },
        ],
        economy: [
          { id: 'mum7', title: 'BSE Sensex Crosses 95,000 Mark', summary: 'Mumbai-based BSE hits new milestone driven by IT and banking sector rally.', source: 'Economic Times', date: '2026-07-04', image: '📈', category: 'economy' },
          { id: 'mum8', title: 'Mumbai Port Handles Record 80M Tons Cargo', summary: 'Expansion and modernization drive 15% growth in cargo handling capacity.', source: 'Business Line', date: '2026-07-02', image: '🚢', category: 'economy' },
          { id: 'mum9', title: 'Bandra Kurla Complex: New Office Space Demand Up 40%', summary: 'Rental rates in BKC cross ₹500/sqft as global firms expand Mumbai presence.', source: 'Mint', date: '2026-06-29', image: '🏢', category: 'economy' },
        ],
        sports: [
          { id: 'mum10', title: 'Mumbai Indians Clinch Record 7th IPL Title', summary: 'Captain Hardik Pandya leads from front with all-round performance in sold-out Wankhede.', source: 'ESPNcricinfo', date: '2026-07-04', image: '🏏', category: 'sports' },
          { id: 'mum11', title: 'Mumbai Marathon: 50,000 Participants Set Record', summary: 'Charity edition raises ₹25Cr for social causes with runners from 60 countries.', source: 'Indian Express', date: '2026-06-30', image: '🏃', category: 'sports' },
          { id: 'mum12', title: 'Mumbai City FC Lifts ISL Trophy', summary: '2-0 victory against ATK Mohun Bagan at the Mumbai Football Arena thrills home fans.', source: 'Sportskeeda', date: '2026-06-27', image: '⚽', category: 'sports' },
        ],
      },
    },
    Karnataka: {
      _default: {
        politics: [
          { id: 'kar1', title: 'Karnataka Assembly Passes Land Reforms Bill', summary: 'New legislation aims to streamline land acquisition for industrial corridors in the state.', source: 'Deccan Herald', date: '2026-07-04', image: '📜', category: 'politics' },
          { id: 'kar2', title: 'Bangalore Metro Phase 3 Gets Central Approval', summary: 'The 90-km network expansion will connect Electronics City to Kempegowda Airport.', source: 'Times of India', date: '2026-07-02', image: '🚇', category: 'politics' },
          { id: 'kar3', title: 'Karnataka Government Launches Startup Policy 2.0', summary: 'Revised policy offers tax breaks and funding support for deep-tech and biotech ventures.', source: 'YourStory', date: '2026-06-28', image: '🚀', category: 'politics' },
        ],
        weather: [
          { id: 'kar4', title: 'Bangalore Rains: City Records 120mm in 24 Hours', summary: 'Waterlogging in low-lying areas as IT corridor faces traffic disruptions.', source: 'Bangalore Mirror', date: '2026-07-05', image: '🌧️', category: 'weather' },
          { id: 'kar5', title: 'Coastal Karnataka on Alert for Heavy Rains', summary: 'Mangalore and Udupi districts warned of potential flooding as dams reach capacity.', source: 'The Hindu', date: '2026-07-01', image: '🌊', category: 'weather' },
        ],
        economy: [
          { id: 'kar6', title: 'Bangalore Silicon Valley: Tech Exports Grow 20%', summary: 'Bengaluru-based IT firms lead India\'s $250B tech export target for FY26.', source: 'Nasscom', date: '2026-07-04', image: '💻', category: 'economy' },
          { id: 'kar7', title: 'Mysuru Emerges as Alternative IT Hub', summary: 'Lower costs and improved infrastructure attract 50+ companies to set up centers.', source: 'Business Line', date: '2026-06-29', image: '🏢', category: 'economy' },
        ],
        sports: [
          { id: 'kar8', title: 'Bangalore FC Wins Durand Cup', summary: 'Local club defeats East Bengal 1-0 in a closely contested final at the Sree Kanteerava Stadium.', source: 'Sportskeeda', date: '2026-07-02', image: '⚽', category: 'sports' },
          { id: 'kar9', title: 'Karnataka Wins Ranji Trophy Title', summary: 'Karun Nair scores 150 in final as Karnataka defeat Mumbai by 8 wickets.', source: 'ESPNcricinfo', date: '2026-06-25', image: '🏏', category: 'sports' },
        ],
      },
    },
  },
  USA: {
    _default: {
      politics: [
        { id: 'us1', title: 'US Presidential Race 2026: Campaigns Intensify', summary: 'Both parties hold national conventions as election day approaches in November.', source: 'CNN', date: '2026-07-05', image: '🇺🇸', category: 'politics' },
        { id: 'us2', title: 'Senate Passes Comprehensive Immigration Reform', summary: 'Bipartisan bill includes border security funding and pathway to citizenship for Dreamers.', source: 'NPR', date: '2026-07-03', image: '📋', category: 'politics' },
        { id: 'us3', title: 'Supreme Court Ruling on Tech Liability Sparks Debate', summary: 'Social media platforms face new regulations regarding content moderation and user data.', source: 'Washington Post', date: '2026-07-01', image: '⚖️', category: 'politics' },
      ],
      weather: [
        { id: 'us4', title: 'California Wildfire Season: Early Blazes Contained', summary: 'Improved preparedness and early response limit damage compared to previous years.', source: 'LA Times', date: '2026-07-04', image: '🔥', category: 'weather' },
        { id: 'us5', title: 'Northeast US Braces for Winter Storm in July', summary: 'Unusual cold front brings snow to parts of New York and Vermont; rare July frost expected.', source: 'Weather Channel', date: '2026-07-02', image: '🌨️', category: 'weather' },
      ],
      economy: [
        { id: 'us6', title: 'US GDP Grows 3.2% in Q2 Beating Estimates', summary: 'Consumer spending and business investment drive stronger-than-expected economic expansion.', source: 'Bloomberg', date: '2026-07-05', image: '📊', category: 'economy' },
        { id: 'us7', title: 'Silicon Valley Layoffs Stabilize After Two Years', summary: 'Tech hiring shows signs of recovery with AI and cybersecurity roles leading demand.', source: 'TechCrunch', date: '2026-07-01', image: '💻', category: 'economy' },
      ],
      sports: [
        { id: 'us8', title: 'Super Bowl 2027: New Orleans to Host Spectacle', summary: 'Preparations begin for the big game with renovations underway at the Superdome.', source: 'ESPN', date: '2026-07-04', image: '🏈', category: 'sports' },
        { id: 'us9', title: 'US Soccer Star Christian Pulisic Transfers to Real Madrid', summary: 'Record $150M deal makes Pulisic the most expensive American soccer player in history.', source: 'Sky Sports', date: '2026-07-02', image: '⚽', category: 'sports' },
      ],
    },
    California: {
      _default: {
        politics: [
          { id: 'ca1', title: 'California Governor Signs Climate Disclosure Law', summary: 'Corporations must report carbon emissions across their entire supply chain from 2027.', source: 'SF Chronicle', date: '2026-07-05', image: '🌍', category: 'politics' },
          { id: 'ca2', title: 'CA Proposes $20B Affordable Housing Plan', summary: 'Bond measure on November ballot aims to build 100,000 units for low-income residents.', source: 'LA Times', date: '2026-07-02', image: '🏠', category: 'politics' },
        ],
        weather: [
          { id: 'ca3', title: 'California Drought Conditions Improve After Wet Winter', summary: 'Reservoirs at 120% of historical average; water restrictions eased across the state.', source: 'NOAA', date: '2026-07-03', image: '💧', category: 'weather' },
        ],
        economy: [
          { id: 'ca4', title: 'California AI Industry Boom Continues', summary: 'San Francisco and Bay Area add 50,000 new AI jobs as global tech giants expand presence.', source: 'TechCrunch', date: '2026-07-04', image: '🤖', category: 'economy' },
        ],
        sports: [
          { id: 'ca5', title: 'LA Lakers Win NBA Championship in 7 Games', summary: 'LeBron James wins Finals MVP at age 41 in what may be his final season.', source: 'ESPN', date: '2026-07-01', image: '🏀', category: 'sports' },
        ],
      },
      'San Francisco': {
        politics: [
          { id: 'sf1', title: 'SF Mayor Announces Downtown Revitalization Plan', summary: 'Tax incentives for businesses to return to office as city aims to fill 30% vacancy rate.', source: 'SF Chronicle', date: '2026-07-05', image: '🏙️', category: 'politics' },
          { id: 'sf2', title: 'San Francisco Bans Facial Recognition in Public Spaces', summary: 'City becomes largest in US to prohibit government use of real-time facial recognition.', source: 'NBC Bay Area', date: '2026-07-01', image: '📸', category: 'politics' },
        ],
        weather: [
          { id: 'sf3', title: 'SF Records Coolest July in 50 Years', summary: 'Karl the Fog makes persistent appearance as temperatures stay below 18°C all week.', source: 'Weather Channel', date: '2026-07-04', image: '🌁', category: 'weather' },
          { id: 'sf4', title: 'Bay Area Air Quality Alert Issued for Wildfire Smoke', summary: 'Light winds push smoke from inland fires toward coastal cities; advisory for sensitive groups.', source: 'KRON4', date: '2026-07-02', image: '🔥', category: 'weather' },
        ],
        economy: [
          { id: 'sf5', title: 'SF Tech IPOs: 5 Companies Go Public This Quarter', summary: 'AI and biotech startups lead a resurgence in San Francisco\'s IPO market raising $8B total.', source: 'TechCrunch', date: '2026-07-04', image: '📈', category: 'economy' },
          { id: 'sf6', title: 'Union Square Retail Recovery Gains Momentum', summary: 'Luxury brands return as foot traffic reaches 85% of pre-pandemic levels.', source: 'SF Business Times', date: '2026-07-01', image: '🛍️', category: 'economy' },
        ],
        sports: [
          { id: 'sf7', title: 'SF Giants Clinch NL West Division Title', summary: 'Oracle Park crowd erupts as Giants defeat Dodgers 5-3 in a thrilling 12-inning game.', source: 'ESPN', date: '2026-07-03', image: '⚾', category: 'sports' },
          { id: 'sf8', title: 'Golden State Warriors Draft Promising Rookie', summary: 'With the 5th pick, Warriors select a 19-year-old guard from Duke expected to fill Klay\'s shoes.', source: 'The Athletic', date: '2026-06-28', image: '🏀', category: 'sports' },
        ],
      },
    },
    'New York': {
      _default: {
        politics: [
          { id: 'ny1', title: 'New York State Legalizes Digital Asset Regulation', summary: 'New York becomes first state to create comprehensive licensing framework for crypto exchanges.', source: 'NY Times', date: '2026-07-04', image: '₿', category: 'politics' },
          { id: 'ny2', title: 'NYC Mayor Unveils $110B "City of Tomorrow" Plan', summary: 'Ambitious 10-year infrastructure plan includes new subway lines and flood barriers.', source: 'Daily News', date: '2026-07-01', image: '🏗️', category: 'politics' },
        ],
        weather: [
          { id: 'ny3', title: 'NYC Heatwave: Temperatures Hit 38°C with High Humidity', summary: 'Cooling centers open across all five boroughs as city issues heat emergency.', source: 'ABC7', date: '2026-07-05', image: '🌡️', category: 'weather' },
          { id: 'ny4', title: 'New York Braces for Hurricane Season', summary: 'Emergency management preps for potential storms with coastal evacuation drills.', source: 'NY Post', date: '2026-07-01', image: '🌀', category: 'weather' },
        ],
        economy: [
          { id: 'ny5', title: 'Wall Street Bonus Season: Record Payouts Expected', summary: 'Average bonus projected to rise 15% driven by strong M&A and trading revenues.', source: 'Bloomberg', date: '2026-07-04', image: '💰', category: 'economy' },
          { id: 'ny6', title: 'NYC Office Market Shows Recovery Signs', summary: 'Leasing activity up 25% as companies mandate return-to-work policies.', source: 'Crain\'s NY', date: '2026-07-01', image: '🏢', category: 'economy' },
        ],
        sports: [
          { id: 'ny7', title: 'Yankees vs Mets: Subway Series Thrills Fans', summary: 'Sweeping weekend series sees record attendance at both Yankee Stadium and Citi Field.', source: 'ESPN', date: '2026-07-03', image: '⚾', category: 'sports' },
          { id: 'ny8', title: 'New York City FC Wins MLS Eastern Conference', summary: 'Club leads standings with star striker scoring 25 goals this season.', source: 'MLS', date: '2026-06-30', image: '⚽', category: 'sports' },
        ],
      },
      'New York City': {
        politics: [
          { id: 'nyc1', title: 'Congestion Pricing Begins in Manhattan', summary: 'Vehicles entering below 60th Street charged $15; expected to reduce traffic by 20%.', source: 'NY Times', date: '2026-07-05', image: '🚗', category: 'politics' },
          { id: 'nyc2', title: 'NYC Council Votes to Expand Ferry Service', summary: 'New routes connecting Staten Island, Brooklyn, and Queens approved with 2028 launch.', source: 'AMNY', date: '2026-07-02', image: '⛴️', category: 'politics' },
        ],
        weather: [
          { id: 'nyc3', title: 'NYC Air Quality Drops as Canadian Wildfire Smoke Returns', summary: 'AQI reaches 150 (Unhealthy) as hazy skies blanket the city; masks recommended outdoors.', source: 'ABC7', date: '2026-07-04', image: '🌫️', category: 'weather' },
        ],
        economy: [
          { id: 'nyc4', title: 'Times Square Retail: Foot Traffic Returns to Pre-Pandemic Levels', summary: 'Broadway attendance up 90% and hotel occupancy at 88% as tourism fully rebounds.', source: 'NY Post', date: '2026-07-03', image: '🎭', category: 'economy' },
        ],
        sports: [
          { id: 'nyc5', title: 'New York Knicks Sign Superstar Free Agent', summary: 'Max contract deal brings All-NBA guard to Madison Square Garden for 2026-27 season.', source: 'ESPN', date: '2026-07-04', image: '🏀', category: 'sports' },
        ],
      },
    },
  },
  UAE: {
    _default: {
      politics: [
        { id: 'uae1', title: 'UAE Announces $30B Green Energy Investment Plan', summary: 'National strategy targets 50% clean energy by 2050 with major solar and hydrogen projects.', source: 'Gulf News', date: '2026-07-05', image: '🌱', category: 'politics' },
        { id: 'uae2', title: 'Dubai Expo City: New Business Free Zone Launched', summary: 'Special economic zone offers 100% ownership and tax exemptions for tech companies.', source: 'Khaleej Times', date: '2026-07-02', image: '🏗️', category: 'politics' },
      ],
      weather: [
        { id: 'uae3', title: 'UAE Temperature Hits 50°C; Cloud Seeding Operations Intensify', summary: 'NCMS deploys additional drones for cloud seeding to increase rainfall and lower temps.', source: 'National', date: '2026-07-04', image: '🌡️', category: 'weather' },
        { id: 'uae4', title: 'Dubai Records Heaviest Rainfall in 5 Years', summary: 'City flooded as automated cloud seeding generates 100mm rain in 48 hours.', source: 'Gulf Today', date: '2026-07-01', image: '🌧️', category: 'weather' },
      ],
      economy: [
        { id: 'uae5', title: 'Dubai Real Estate Market Hits All-Time High', summary: 'Property transactions cross AED 500B in 2026 driven by luxury and off-plan sales.', source: 'Arabian Business', date: '2026-07-05', image: '🏢', category: 'economy' },
        { id: 'uae6', title: 'ADNOC Signs $10B Green Hydrogen Deal with India', summary: 'Abu Dhabi to supply green hydrogen to India under 20-year agreement starting 2028.', source: 'Reuters', date: '2026-07-02', image: '🔋', category: 'economy' },
      ],
      sports: [
        { id: 'uae7', title: 'Dubai World Cup 2026: Record $50M Prize Money', summary: 'The richest horse race in the world attracts owners and trainers from 20 countries.', source: 'Sport360', date: '2026-07-03', image: '🏇', category: 'sports' },
        { id: 'uae8', title: 'UAE Wins ICC Cricket World Cup Qualifier', summary: 'Historic qualification for the 2027 World Cup as UAE defeats Scotland in final.', source: 'Cricbuzz', date: '2026-06-30', image: '🏏', category: 'sports' },
      ],
    },
    Dubai: {
      _default: {
        politics: [
          { id: 'db1', title: 'Dubai Ruler Approves 2040 Urban Master Plan', summary: 'Plan focuses on sustainable development with 60% of emirate designated as nature reserves.', source: 'Khaleej Times', date: '2026-07-05', image: '🏙️', category: 'politics' },
        ],
        weather: [
          { id: 'db2', title: 'Dubai Temperature Drops to 28°C After Unusual Rain', summary: 'Residents enjoy rare cool day as automated weather modification provides relief.', source: 'National', date: '2026-07-04', image: '🌤️', category: 'weather' },
        ],
        economy: [
          { id: 'db3', title: 'Dubai Tourism: 10 Million Visitors in H1 2026', summary: 'Hotel occupancy at 85% as city surpasses pre-pandemic tourist numbers.', source: 'Arabian Business', date: '2026-07-03', image: '🏖️', category: 'economy' },
          { id: 'db4', title: 'Dubai Silicon Oasis: 200+ Tech Startups Join Hub', summary: 'Global technology companies establish R&D centers in Dubais thriving tech ecosystem.', source: 'Gulf News', date: '2026-07-01', image: '💻', category: 'economy' },
        ],
        sports: [
          { id: 'db5', title: 'Dubai Tennis Championships: Top 10 Players Confirmed', summary: 'ATP and WTA events scheduled for February 2027 with record prize money announced.', source: 'Sport360', date: '2026-07-02', image: '🎾', category: 'sports' },
        ],
      },
    },
  },
  Singapore: {
    _default: {
      politics: [
        { id: 'sg1', title: 'Singapore and India Sign Digital Partnership Agreement', summary: 'UPI-PayNow linkage expanded to include real-time trade finance and cross-border payments.', source: 'Straits Times', date: '2026-07-05', image: '🤝', category: 'politics' },
        { id: 'sg2', title: 'Singapore Budget 2026: Focus on AI and Reskilling', summary: '$5B set aside for national AI strategy and workforce upskilling programs.', source: 'CNA', date: '2026-07-02', image: '📋', category: 'politics' },
      ],
      weather: [
        { id: 'sg3', title: 'Singapore Haze Warning as Indonesian Forest Fires Return', summary: 'PSI levels reach unhealthy 150 as prevailing winds bring smoke from Sumatra.', source: 'NEA', date: '2026-07-04', image: '🌫️', category: 'weather' },
        { id: 'sg4', title: 'Singapore Experiences Wettest June in Two Decades', summary: '430mm rainfall recorded; Flash floods in several areas prompt PUB advisories.', source: 'Straits Times', date: '2026-07-01', image: '🌧️', category: 'weather' },
      ],
      economy: [
        { id: 'sg5', title: 'Singapore Ranks Top for Ease of Doing Business Again', summary: 'World Bank report cites efficient regulations and robust digital infrastructure.', source: 'Business Times', date: '2026-07-05', image: '🏆', category: 'economy' },
        { id: 'sg6', title: 'Singapore Port Handles Record 40M TEU Containers', summary: 'Tuas Port expansion boosts capacity as Singapore maintains status as busiest transshipment hub.', source: 'Channel NewsAsia', date: '2026-07-02', image: '🚢', category: 'economy' },
      ],
      sports: [
        { id: 'sg7', title: 'Singapore Grand Prix 2026: Night Race Sold Out', summary: 'Formula 1 returns to Marina Bay Street Circuit with three-year contract extension announced.', source: 'ESPN', date: '2026-07-03', image: '🏎️', category: 'sports' },
        { id: 'sg8', title: 'Singapore Smash: Top Table Tennis Players Compete', summary: 'International table tennis tournament with $2M prize pool draws world champions to OCBC Arena.', source: 'ST Sport', date: '2026-06-29', image: '🏓', category: 'sports' },
      ],
    },
  },
  UK: {
    _default: {
      politics: [
        { id: 'uk1', title: 'UK Parliament Debates Digital Pound Legislation', summary: 'Bank of England moves closer to launching CBDC with privacy and security safeguards.', source: 'BBC', date: '2026-07-05', image: '💷', category: 'politics' },
        { id: 'uk2', title: 'UK and EU Sign New Post-Brexit Trade Agreement', summary: 'Reduced border checks and mutual recognition of standards agreed for goods and services.', source: 'Guardian', date: '2026-07-02', image: '🤝', category: 'politics' },
        { id: 'uk3', title: 'Scotland Independence Referendum Debate Intensifies', summary: 'First Minister sets potential 2027 date for second independence vote.', source: 'Scotsman', date: '2026-06-30', image: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', category: 'politics' },
      ],
      weather: [
        { id: 'uk4', title: 'UK Heatwave: Temperatures Reach 40°C in London', summary: 'Met Office issues extreme heat warning as rail network imposes speed restrictions.', source: 'BBC Weather', date: '2026-07-04', image: '🌡️', category: 'weather' },
        { id: 'uk5', title: 'Storm Brendan: Winds of 100mph Hit Northern Scotland', summary: 'Ferries cancelled and power outages reported as amber weather warning issued.', source: 'Met Office', date: '2026-07-01', image: '💨', category: 'weather' },
      ],
      economy: [
        { id: 'uk6', title: 'London Stock Exchange: Most Listings in Europe', summary: 'LSE surpasses EURONEXT with 45 IPOs raising $15B in first half of 2026.', source: 'Financial Times', date: '2026-07-05', image: '📈', category: 'economy' },
        { id: 'uk7', title: 'UK Inflation Falls to 2% Bank Target', summary: 'BOE considers rate cut as core inflation reaches acceptable level for first time in 3 years.', source: 'Reuters', date: '2026-07-02', image: '💹', category: 'economy' },
      ],
      sports: [
        { id: 'uk8', title: 'Wimbledon Final: British Player Reaches Final After 10 Years', summary: 'Home crowd favourite Jack Draper defeats world No. 1 in semifinal thriller at Centre Court.', source: 'BBC Sport', date: '2026-07-04', image: '🎾', category: 'sports' },
        { id: 'uk9', title: 'Premier League 2026-27: Fixtures Released', summary: 'Manchester City open title defense against Arsenal in blockbuster season opener.', source: 'Sky Sports', date: '2026-07-01', image: '⚽', category: 'sports' },
        { id: 'uk10', title: 'Ashes 2026: England Retain Urn After Drawn Series', summary: 'Ben Stokes\' heroic 150 at The Oval secures a 2-2 series draw against Australia.', source: 'ESPNcricinfo', date: '2026-06-28', image: '🏏', category: 'sports' },
      ],
    },
    England: {
      _default: {
        politics: [
          { id: 'en1', title: 'Greater London Authority Proposes ULEZ Expansion', summary: 'Expansion zone covers all London boroughs by 2028 to improve city-wide air quality.', source: 'Evening Standard', date: '2026-07-03', image: '🚗', category: 'politics' },
        ],
        weather: [
          { id: 'en2', title: 'Southern England Floods: 200 Homes Affected', summary: 'Heavy rainfall causes River Thames to burst banks in Berkshire and Oxfordshire.', source: 'BBC', date: '2026-07-05', image: '🌊', category: 'weather' },
        ],
        economy: [
          { id: 'en3', title: 'Cambridge-Milton Keynes-Oxford Arc Tech Hub Surges', summary: 'Investment pours into Golden Triangle region as UK tech corridor rivals Silicon Valley.', source: 'TechCrunch', date: '2026-07-02', image: '💻', category: 'economy' },
        ],
        sports: [
          { id: 'en4', title: 'The Ashes 2027: Historic Test at New London Stadium', summary: 'ECB announces purpose-built cricket stadium in East London for future Ashes Tests.', source: 'Telegraph', date: '2026-06-29', image: '🏟️', category: 'sports' },
        ],
      },
      London: {
        politics: [
          { id: 'ld1', title: 'London Mayor Announces Ultra Low Emission Success', summary: 'Data shows ULEZ reduced nitrogen dioxide by 50% in central London since introduction.', source: 'Evening Standard', date: '2026-07-05', image: '🌍', category: 'politics' },
          { id: 'ld2', title: 'Crossrail 2 Gets Government Green Light', summary: '£30B rail project connecting Surrey to Hertfordshire via central London approved for 2028 start.', source: 'Guardian', date: '2026-07-02', image: '🚇', category: 'politics' },
        ],
        weather: [
          { id: 'ld3', title: 'London Air Quality Improves After Clean Air Zone Expansion', summary: 'Mayor reports 30% reduction in PM2.5 levels across all 32 boroughs year-on-year.', source: 'BBC London', date: '2026-07-04', image: '🌤️', category: 'weather' },
        ],
        economy: [
          { id: 'ld4', title: 'Canary Wharf Transformation: 5,000 New Tech Jobs', summary: 'HSBC building repurposed as tech innovation hub attracting AI and fintech startups.', source: 'Financial Times', date: '2026-07-03', image: '🏢', category: 'economy' },
          { id: 'ld5', title: 'London Office Market Rebounds: Occupancy Hits 70%', summary: 'Return-to-office mandates and hybrid models drive strongest leasing activity since 2019.', source: 'Bloomberg', date: '2026-07-01', image: '🏙️', category: 'economy' },
        ],
        sports: [
          { id: 'ld6', title: 'Arsenal Wins Premier League Title', summary: 'Gunners clinch first league title in 22 years with a dramatic 3-2 win at the Emirates.', source: 'Sky Sports', date: '2026-07-04', image: '⚽', category: 'sports' },
          { id: 'ld7', title: 'London Stadium to Host 2029 World Athletics Championships', summary: 'Queen Elizabeth Olympic Park selected as venue for the premier track and field event.', source: 'BBC Sport', date: '2026-06-30', image: '🏃', category: 'sports' },
        ],
      },
    },
  },
}

export const categories = [
  { id: 'all', label: 'All', icon: '📰' },
  { id: 'politics', label: 'Politics', icon: '🏛️' },
  { id: 'weather', label: 'Weather', icon: '🌤️' },
  { id: 'economy', label: 'Economy', icon: '📈' },
  { id: 'sports', label: 'Sports', icon: '🏆' },
]

export const countries = Object.keys(localNews)

export const stateOptions = {
  India: ['Maharashtra', 'Karnataka'],
  USA: ['California', 'New York'],
  UAE: ['Dubai'],
  Singapore: [],
  UK: ['England'],
}

export const cityOptions = {
  'India/Maharashtra': ['Pune', 'Mumbai'],
  'India/Karnataka': [],
  'USA/California': ['San Francisco'],
  'USA/New York': ['New York City'],
  'UAE/Dubai': [],
  'UK/England': ['London'],
}
