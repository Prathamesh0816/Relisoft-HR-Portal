const timezoneData = [
  {
    offset: 'UTC-11', region: 'Pacific', color: '#0891b2',
    tz: 'Pacific/Pago_Pago',
    cities: [{ name: 'Pago Pago', flag: '🇦🇸', country: 'American Samoa' }],
  },
  {
    offset: 'UTC-10', region: 'Pacific', color: '#0d9488',
    tz: 'Pacific/Honolulu',
    cities: [{ name: 'Honolulu', flag: '🇺🇸', country: 'USA (Hawaii)' }, { name: 'Papeete', flag: '🇵🇫', country: 'French Polynesia' }],
  },
  {
    offset: 'UTC-9', region: 'Americas', color: '#2563eb',
    tz: 'America/Anchorage',
    cities: [{ name: 'Anchorage', flag: '🇺🇸', country: 'USA (Alaska)' }, { name: 'Fairbanks', flag: '🇺🇸', country: 'USA (Alaska)' }],
  },
  {
    offset: 'UTC-8', region: 'Americas', color: '#2563eb', abbr: 'PST',
    tz: 'America/Los_Angeles',
    cities: [{ name: 'Los Angeles', flag: '🇺🇸', country: 'USA (Pacific)' }, { name: 'San Francisco', flag: '🇺🇸', country: 'USA (Pacific)' }, { name: 'Seattle', flag: '🇺🇸', country: 'USA (Pacific)' }, { name: 'Portland', flag: '🇺🇸', country: 'USA (Pacific)' }, { name: 'Vancouver', flag: '🇨🇦', country: 'Canada (Pacific)' }, { name: 'Tijuana', flag: '🇲🇽', country: 'Mexico (Baja California)' }],
  },
  {
    offset: 'UTC-7', region: 'Americas', color: '#2563eb', abbr: 'MST',
    tz: 'America/Denver',
    cities: [{ name: 'Denver', flag: '🇺🇸', country: 'USA (Mountain)' }, { name: 'Salt Lake City', flag: '🇺🇸', country: 'USA (Mountain)' }, { name: 'Calgary', flag: '🇨🇦', country: 'Canada (Mountain)' }, { name: 'Edmonton', flag: '🇨🇦', country: 'Canada (Mountain)' }, { name: 'Phoenix', flag: '🇺🇸', country: 'USA (Mountain/No DST)' }],
  },
  {
    offset: 'UTC-6', region: 'Americas', color: '#2563eb', abbr: 'CST',
    tz: 'America/Chicago',
    cities: [{ name: 'Chicago', flag: '🇺🇸', country: 'USA (Central)' }, { name: 'Dallas', flag: '🇺🇸', country: 'USA (Central)' }, { name: 'Houston', flag: '🇺🇸', country: 'USA (Central)' }, { name: 'Minneapolis', flag: '🇺🇸', country: 'USA (Central)' }, { name: 'Winnipeg', flag: '🇨🇦', country: 'Canada (Central)' }, { name: 'Mexico City', flag: '🇲🇽', country: 'Mexico' }, { name: 'San Jose', flag: '🇨🇷', country: 'Costa Rica' }],
  },
  {
    offset: 'UTC-5', region: 'Americas', color: '#2563eb', abbr: 'EST',
    tz: 'America/New_York',
    cities: [{ name: 'New York', flag: '🇺🇸', country: 'USA (Eastern)' }, { name: 'Washington DC', flag: '🇺🇸', country: 'USA (Eastern)' }, { name: 'Miami', flag: '🇺🇸', country: 'USA (Eastern)' }, { name: 'Boston', flag: '🇺🇸', country: 'USA (Eastern)' }, { name: 'Atlanta', flag: '🇺🇸', country: 'USA (Eastern)' }, { name: 'Toronto', flag: '🇨🇦', country: 'Canada (Eastern)' }, { name: 'Ottawa', flag: '🇨🇦', country: 'Canada (Eastern)' }, { name: 'Montreal', flag: '🇨🇦', country: 'Canada (Eastern)' }],
  },
  {
    offset: 'UTC-4', region: 'Americas', color: '#7c3aed', abbr: 'AST',
    tz: 'America/Halifax',
    cities: [{ name: 'Halifax', flag: '🇨🇦', country: 'Canada (Atlantic)' }, { name: 'Santiago', flag: '🇨🇱', country: 'Chile' }, { name: 'Caracas', flag: '🇻🇪', country: 'Venezuela' }, { name: 'La Paz', flag: '🇧🇴', country: 'Bolivia' }, { name: 'San Juan', flag: '🇵🇷', country: 'Puerto Rico' }],
  },
  {
    offset: 'UTC-3:30', region: 'Americas', color: '#7c3aed', abbr: 'NST',
    tz: 'America/St_Johns',
    cities: [{ name: "St. John's", flag: '🇨🇦', country: 'Canada (Newfoundland)' }],
  },
  {
    offset: 'UTC-3', region: 'Americas', color: '#7c3aed', abbr: 'BRT',
    tz: 'America/Sao_Paulo',
    cities: [{ name: 'São Paulo', flag: '🇧🇷', country: 'Brazil' }, { name: 'Rio de Janeiro', flag: '🇧🇷', country: 'Brazil' }, { name: 'Brasilia', flag: '🇧🇷', country: 'Brazil' }, { name: 'Buenos Aires', flag: '🇦🇷', country: 'Argentina' }, { name: 'Montevideo', flag: '🇺🇾', country: 'Uruguay' }, { name: 'Cayenne', flag: '🇬🇫', country: 'French Guiana' }],
  },
  {
    offset: 'UTC-2', region: 'Americas', color: '#7c3aed',
    tz: 'America/Noronha',
    cities: [{ name: 'Fernando de Noronha', flag: '🇧🇷', country: 'Brazil' }],
  },
  {
    offset: 'UTC-1', region: 'Europe & Africa', color: '#1d4ed8',
    tz: 'Atlantic/Azores',
    cities: [{ name: 'Azores', flag: '🇵🇹', country: 'Portugal' }, { name: 'Praia', flag: '🇨🇻', country: 'Cape Verde' }],
  },
  {
    offset: 'UTC+0', region: 'Europe & Africa', color: '#1d4ed8', abbr: 'GMT',
    tz: 'Europe/London',
    cities: [{ name: 'London', flag: '🇬🇧', country: 'UK' }, { name: 'Dublin', flag: '🇮🇪', country: 'Ireland' }, { name: 'Lisbon', flag: '🇵🇹', country: 'Portugal' }, { name: 'Reykjavik', flag: '🇮🇸', country: 'Iceland' }, { name: 'Accra', flag: '🇬🇭', country: 'Ghana' }, { name: 'Dakar', flag: '🇸🇳', country: 'Senegal' }, { name: 'Casablanca', flag: '🇲🇦', country: 'Morocco' }],
  },
  {
    offset: 'UTC+1', region: 'Europe & Africa', color: '#1d4ed8', abbr: 'CET',
    tz: 'Europe/Berlin',
    cities: [{ name: 'Berlin', flag: '🇩🇪', country: 'Germany' }, { name: 'Paris', flag: '🇫🇷', country: 'France' }, { name: 'Rome', flag: '🇮🇹', country: 'Italy' }, { name: 'Madrid', flag: '🇪🇸', country: 'Spain' }, { name: 'Amsterdam', flag: '🇳🇱', country: 'Netherlands' }, { name: 'Brussels', flag: '🇧🇪', country: 'Belgium' }, { name: 'Vienna', flag: '🇦🇹', country: 'Austria' }, { name: 'Warsaw', flag: '🇵🇱', country: 'Poland' }, { name: 'Prague', flag: '🇨🇿', country: 'Czech Republic' }, { name: 'Oslo', flag: '🇳🇴', country: 'Norway' }, { name: 'Stockholm', flag: '🇸🇪', country: 'Sweden' }, { name: 'Copenhagen', flag: '🇩🇰', country: 'Denmark' }, { name: 'Zurich', flag: '🇨🇭', country: 'Switzerland' }, { name: 'Lagos', flag: '🇳🇬', country: 'Nigeria' }, { name: 'Kinshasa', flag: '🇨🇩', country: 'DR Congo' }, { name: 'Luanda', flag: '🇦🇴', country: 'Angola' }],
  },
  {
    offset: 'UTC+2', region: 'Europe & Africa', color: '#1d4ed8', abbr: 'EET',
    tz: 'Europe/Helsinki',
    cities: [{ name: 'Helsinki', flag: '🇫🇮', country: 'Finland' }, { name: 'Athens', flag: '🇬🇷', country: 'Greece' }, { name: 'Bucharest', flag: '🇷🇴', country: 'Romania' }, { name: 'Sofia', flag: '🇧🇬', country: 'Bulgaria' }, { name: 'Tallinn', flag: '🇪🇪', country: 'Estonia' }, { name: 'Riga', flag: '🇱🇻', country: 'Latvia' }, { name: 'Vilnius', flag: '🇱🇹', country: 'Lithuania' }, { name: 'Kyiv', flag: '🇺🇦', country: 'Ukraine' }, { name: 'Cairo', flag: '🇪🇬', country: 'Egypt' }, { name: 'Johannesburg', flag: '🇿🇦', country: 'South Africa' }, { name: 'Cape Town', flag: '🇿🇦', country: 'South Africa' }, { name: 'Harare', flag: '🇿🇼', country: 'Zimbabwe' }, { name: 'Jerusalem', flag: '🇮🇱', country: 'Israel' }, { name: 'Kaliningrad', flag: '🇷🇺', country: 'Russia (Kaliningrad)' }],
  },
  {
    offset: 'UTC+3', region: 'Europe & Africa', color: '#d97706', abbr: 'MSK',
    tz: 'Europe/Moscow',
    cities: [{ name: 'Moscow', flag: '🇷🇺', country: 'Russia' }, { name: 'St. Petersburg', flag: '🇷🇺', country: 'Russia' }, { name: 'Istanbul', flag: '🇹🇷', country: 'Turkey' }, { name: 'Riyadh', flag: '🇸🇦', country: 'Saudi Arabia' }, { name: 'Baghdad', flag: '🇮🇶', country: 'Iraq' }, { name: 'Doha', flag: '🇶🇦', country: 'Qatar' }, { name: 'Kuwait City', flag: '🇰🇼', country: 'Kuwait' }, { name: 'Nairobi', flag: '🇰🇪', country: 'Kenya' }, { name: 'Minsk', flag: '🇧🇾', country: 'Belarus' }],
  },
  {
    offset: 'UTC+3:30', region: 'Middle East', color: '#d97706', abbr: 'IRST',
    tz: 'Asia/Tehran',
    cities: [{ name: 'Tehran', flag: '🇮🇷', country: 'Iran' }],
  },
  {
    offset: 'UTC+4', region: 'Middle East', color: '#d97706', abbr: 'GST',
    tz: 'Asia/Dubai',
    cities: [{ name: 'Dubai', flag: '🇦🇪', country: 'UAE' }, { name: 'Abu Dhabi', flag: '🇦🇪', country: 'UAE' }, { name: 'Muscat', flag: '🇴🇲', country: 'Oman' }, { name: 'Baku', flag: '🇦🇿', country: 'Azerbaijan' }, { name: 'Tbilisi', flag: '🇬🇪', country: 'Georgia' }, { name: 'Yerevan', flag: '🇦🇲', country: 'Armenia' }, { name: 'Samara', flag: '🇷🇺', country: 'Russia (Samara)' }],
  },
  {
    offset: 'UTC+4:30', region: 'South Asia', color: '#982cc7', abbr: 'AFT',
    tz: 'Asia/Kabul',
    cities: [{ name: 'Kabul', flag: '🇦🇫', country: 'Afghanistan' }],
  },
  {
    offset: 'UTC+5', region: 'South Asia', color: '#982cc7', abbr: 'PKT',
    tz: 'Asia/Karachi',
    cities: [{ name: 'Karachi', flag: '🇵🇰', country: 'Pakistan' }, { name: 'Lahore', flag: '🇵🇰', country: 'Pakistan' }, { name: 'Islamabad', flag: '🇵🇰', country: 'Pakistan' }, { name: 'Yekaterinburg', flag: '🇷🇺', country: 'Russia (Yekaterinburg)' }, { name: 'Tashkent', flag: '🇺🇿', country: 'Uzbekistan' }, { name: 'Maldives', flag: '🇲🇻', country: 'Maldives' }],
  },
  {
    offset: 'UTC+5:30', region: 'South Asia', color: '#982cc7', abbr: 'IST',
    tz: 'Asia/Kolkata',
    major: true,
    cities: [{ name: 'Mumbai', flag: '🇮🇳', country: 'India' }, { name: 'New Delhi', flag: '🇮🇳', country: 'India' }, { name: 'Bangalore', flag: '🇮🇳', country: 'India' }, { name: 'Chennai', flag: '🇮🇳', country: 'India' }, { name: 'Kolkata', flag: '🇮🇳', country: 'India' }, { name: 'Hyderabad', flag: '🇮🇳', country: 'India' }, { name: 'Pune', flag: '🇮🇳', country: 'India' }, { name: 'Ahmedabad', flag: '🇮🇳', country: 'India' }, { name: 'Colombo', flag: '🇱🇰', country: 'Sri Lanka' }],
  },
  {
    offset: 'UTC+5:45', region: 'South Asia', color: '#982cc7', abbr: 'NPT',
    tz: 'Asia/Kathmandu',
    cities: [{ name: 'Kathmandu', flag: '🇳🇵', country: 'Nepal' }],
  },
  {
    offset: 'UTC+6', region: 'South Asia', color: '#982cc7', abbr: 'BST',
    tz: 'Asia/Dhaka',
    cities: [{ name: 'Dhaka', flag: '🇧🇩', country: 'Bangladesh' }, { name: 'Omsk', flag: '🇷🇺', country: 'Russia (Omsk)' }, { name: 'Almaty', flag: '🇰🇿', country: 'Kazakhstan' }],
  },
  {
    offset: 'UTC+6:30', region: 'Southeast Asia', color: '#059669', abbr: 'MMT',
    tz: 'Asia/Yangon',
    cities: [{ name: 'Yangon', flag: '🇲🇲', country: 'Myanmar' }],
  },
  {
    offset: 'UTC+7', region: 'Southeast Asia', color: '#059669', abbr: 'ICT',
    tz: 'Asia/Bangkok',
    cities: [{ name: 'Bangkok', flag: '🇹🇭', country: 'Thailand' }, { name: 'Hanoi', flag: '🇻🇳', country: 'Vietnam' }, { name: 'Ho Chi Minh City', flag: '🇻🇳', country: 'Vietnam' }, { name: 'Jakarta', flag: '🇮🇩', country: 'Indonesia (Western)' }, { name: 'Krasnoyarsk', flag: '🇷🇺', country: 'Russia (Krasnoyarsk)' }, { name: 'Novosibirsk', flag: '🇷🇺', country: 'Russia (Novosibirsk)' }],
  },
  {
    offset: 'UTC+8', region: 'East Asia & Pacific', color: '#059669', abbr: 'SGT',
    tz: 'Asia/Singapore',
    cities: [{ name: 'Singapore', flag: '🇸🇬', country: 'Singapore' }, { name: 'Kuala Lumpur', flag: '🇲🇾', country: 'Malaysia' }, { name: 'Beijing', flag: '🇨🇳', country: 'China' }, { name: 'Shanghai', flag: '🇨🇳', country: 'China' }, { name: 'Hong Kong', flag: '🇭🇰', country: 'Hong Kong' }, { name: 'Taipei', flag: '🇹🇼', country: 'Taiwan' }, { name: 'Manila', flag: '🇵🇭', country: 'Philippines' }, { name: 'Perth', flag: '🇦🇺', country: 'Australia (Western)' }, { name: 'Irkutsk', flag: '🇷🇺', country: 'Russia (Irkutsk)' }, { name: 'Ulaanbaatar', flag: '🇲🇳', country: 'Mongolia' }, { name: 'Denpasar', flag: '🇮🇩', country: 'Indonesia (Central/Bali)' }],
  },
  {
    offset: 'UTC+9', region: 'East Asia & Pacific', color: '#059669', abbr: 'JST',
    tz: 'Asia/Tokyo',
    cities: [{ name: 'Tokyo', flag: '🇯🇵', country: 'Japan' }, { name: 'Seoul', flag: '🇰🇷', country: 'South Korea' }, { name: 'Pyongyang', flag: '🇰🇵', country: 'North Korea' }, { name: 'Yakutsk', flag: '🇷🇺', country: 'Russia (Yakutsk)' }],
  },
  {
    offset: 'UTC+9:30', region: 'Australia & Oceania', color: '#dc2626', abbr: 'ACST',
    tz: 'Australia/Adelaide',
    cities: [{ name: 'Adelaide', flag: '🇦🇺', country: 'Australia (Central)' }, { name: 'Darwin', flag: '🇦🇺', country: 'Australia (Central/NT)' }, { name: 'Alice Springs', flag: '🇦🇺', country: 'Australia (Central)' }],
  },
  {
    offset: 'UTC+10', region: 'Australia & Oceania', color: '#dc2626', abbr: 'AEST',
    tz: 'Australia/Sydney',
    cities: [{ name: 'Sydney', flag: '🇦🇺', country: 'Australia (Eastern)' }, { name: 'Melbourne', flag: '🇦🇺', country: 'Australia (Eastern)' }, { name: 'Brisbane', flag: '🇦🇺', country: 'Australia (Eastern)' }, { name: 'Canberra', flag: '🇦🇺', country: 'Australia (Eastern)' }, { name: 'Vladivostok', flag: '🇷🇺', country: 'Russia (Vladivostok)' }, { name: 'Port Moresby', flag: '🇵🇬', country: 'Papua New Guinea' }],
  },
  {
    offset: 'UTC+10:30', region: 'Australia & Oceania', color: '#dc2626',
    tz: 'Australia/Lord_Howe',
    cities: [{ name: 'Lord Howe Island', flag: '🇦🇺', country: 'Australia' }],
  },
  {
    offset: 'UTC+11', region: 'Australia & Oceania', color: '#dc2626', abbr: 'MAGT',
    tz: 'Asia/Magadan',
    cities: [{ name: 'Magadan', flag: '🇷🇺', country: 'Russia (Magadan)' }, { name: 'Noumea', flag: '🇳🇨', country: 'New Caledonia' }, { name: 'Honiara', flag: '🇸🇧', country: 'Solomon Islands' }],
  },
  {
    offset: 'UTC+12', region: 'Australia & Oceania', color: '#dc2626', abbr: 'NZST',
    tz: 'Pacific/Auckland',
    cities: [{ name: 'Auckland', flag: '🇳🇿', country: 'New Zealand' }, { name: 'Wellington', flag: '🇳🇿', country: 'New Zealand' }, { name: 'Suva', flag: '🇫🇯', country: 'Fiji' }, { name: 'Kamchatka', flag: '🇷🇺', country: 'Russia (Kamchatka)' }],
  },
  {
    offset: 'UTC+12:45', region: 'Australia & Oceania', color: '#dc2626', abbr: 'CHAST',
    tz: 'Pacific/Chatham',
    cities: [{ name: 'Chatham Islands', flag: '🇳🇿', country: 'New Zealand' }],
  },
  {
    offset: 'UTC+13', region: 'Australia & Oceania', color: '#dc2626',
    tz: 'Pacific/Apia',
    cities: [{ name: 'Apia', flag: '🇼🇸', country: 'Samoa' }, { name: "Nuku'alofa", flag: '🇹🇴', country: 'Tonga' }],
  },
  {
    offset: 'UTC+14', region: 'Australia & Oceania', color: '#dc2626',
    tz: 'Pacific/Kiritimati',
    cities: [{ name: 'Kiritimati', flag: '🇰🇮', country: 'Kiribati (Line Islands)' }],
  },
]

export const regions = [
  {
    name: 'Americas',
    color: '#2563eb',
    offsets: ['UTC-9', 'UTC-8', 'UTC-7', 'UTC-6', 'UTC-5', 'UTC-4', 'UTC-3:30', 'UTC-3', 'UTC-2'],
  },
  {
    name: 'Europe & Africa',
    color: '#1d4ed8',
    offsets: ['UTC-1', 'UTC+0', 'UTC+1', 'UTC+2', 'UTC+3'],
  },
  {
    name: 'Middle East',
    color: '#d97706',
    offsets: ['UTC+3:30', 'UTC+4', 'UTC+4:30'],
  },
  {
    name: 'South Asia',
    color: '#982cc7',
    offsets: ['UTC+5', 'UTC+5:30', 'UTC+5:45', 'UTC+6'],
  },
  {
    name: 'Southeast Asia',
    color: '#059669',
    offsets: ['UTC+6:30', 'UTC+7', 'UTC+8'],
  },
  {
    name: 'East Asia & Pacific',
    color: '#0891b2',
    offsets: ['UTC+9', 'UTC+9:30', 'UTC+10', 'UTC+10:30', 'UTC+11'],
  },
  {
    name: 'Oceania',
    color: '#dc2626',
    offsets: ['UTC+12', 'UTC+12:45', 'UTC+13', 'UTC+14'],
  },
]

export default timezoneData
