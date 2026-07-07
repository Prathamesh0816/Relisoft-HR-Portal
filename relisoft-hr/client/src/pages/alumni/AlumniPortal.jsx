import { useState } from 'react'
import {
  Users, Search, MapPin, Calendar, Mail, Linkedin,
  MessageSquare, Heart, Award, Star, ArrowRight,
  BookOpen, GraduationCap, Globe, ChevronDown,
  Briefcase, Clock, ThumbsUp
} from 'lucide-react'

const alumniList = [
  {
    name: 'Ananya Reddy',
    role: 'Senior Software Engineer',
    company: 'Google',
    location: 'Bangalore, India',
    tenure: '2018 - 2022',
    avatar: 'AR',
    linkedIn: '#',
    bio: 'Led the backend team at ReliSoft HR before joining Google.',
  },
  {
    name: 'Rahul Verma',
    role: 'Product Manager',
    company: 'Microsoft',
    location: 'Hyderabad, India',
    tenure: '2019 - 2023',
    avatar: 'RV',
    linkedIn: '#',
    bio: 'Drove product strategy for the HRMS platform.',
  },
  {
    name: 'Sneha Gupta',
    role: 'UX Designer',
    company: 'Adobe',
    location: 'Noida, India',
    tenure: '2020 - 2023',
    avatar: 'SG',
    linkedIn: '#',
    bio: 'Designed the user experience for multiple HR modules.',
  },
  {
    name: 'Vikram Joshi',
    role: 'Engineering Manager',
    company: 'Amazon',
    location: 'Bangalore, India',
    tenure: '2017 - 2022',
    avatar: 'VJ',
    linkedIn: '#',
    bio: 'Scaled the engineering team from 10 to 50 members.',
  },
  {
    name: 'Neha Patel',
    role: 'Marketing Lead',
    company: 'Flipkart',
    location: 'Mumbai, India',
    tenure: '2019 - 2023',
    avatar: 'NP',
    linkedIn: '#',
    bio: 'Built the brand presence and led marketing campaigns.',
  },
  {
    name: 'Amit Singh',
    role: 'Data Scientist',
    company: 'Uber',
    location: 'Bangalore, India',
    tenure: '2020 - 2024',
    avatar: 'AS',
    linkedIn: '#',
    bio: 'Developed analytics and ML models for HR insights.',
  },
]

const successStories = [
  {
    name: 'Priya Sharma',
    role: 'CHRO at TechCorp',
    period: '2015 - 2021',
    quote: 'ReliSoft HR was where I learned the intricacies of HR technology. The experience shaped my career.',
    avatar: 'PS',
  },
  {
    name: 'Arun Kumar',
    role: 'CTO at InnovateInc',
    period: '2016 - 2022',
    quote: 'Building the ReliSoft platform from ground up was the most rewarding experience of my career.',
    avatar: 'AK',
  },
]

const events = [
  { title: 'Annual Alumni Meet 2026', date: 'Dec 15, 2026', location: 'Bangalore', attendees: 120 },
  { title: 'Virtual Networking Session', date: 'Aug 20, 2026', location: 'Online', attendees: 45 },
  { title: 'Alumni Mentorship Program', date: 'Ongoing', location: 'Hybrid', attendees: 30 },
]

export default function AlumniPortal() {
  const [search, setSearch] = useState('')
  const [reconnected, setReconnected] = useState({})

  const filteredAlumni = alumniList.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.company.toLowerCase().includes(search.toLowerCase()) ||
    a.role.toLowerCase().includes(search.toLowerCase())
  )

  const handleReconnect = (id) => {
    setReconnected({ ...reconnected, [id]: true })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-relisoft-500 via-relisoft-600 to-relisoft-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Alumni Portal</h1>
              <p className="text-relisoft-200">Stay connected with the ReliSoft HR family</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            {[
              { icon: Users, label: 'Total Alumni', value: '486' },
              { icon: Briefcase, label: 'Placed at Top Firms', value: '200+' },
              { icon: Globe, label: 'Countries', value: '12' },
              { icon: Star, label: 'Engagement Rate', value: '78%' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <stat.icon className="h-5 w-5 text-relisoft-200 mb-2" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-relisoft-200 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-relisoft-500" />
              Alumni Directory
            </h2>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search alumni by name, company..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-relisoft-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAlumni.map((alum) => (
              <div key={alum.name} className="group bg-gray-50 rounded-xl p-5 border border-gray-100 hover:border-relisoft-200 hover:shadow-md transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-relisoft-100 flex items-center justify-center text-lg font-semibold text-relisoft-600 flex-shrink-0">
                    {alum.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm">{alum.name}</h3>
                    <p className="text-xs text-gray-500">{alum.role}</p>
                    <p className="text-xs text-relisoft-600 font-medium">{alum.company}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a href={alum.linkedIn} className="p-1.5 text-gray-400 hover:text-relisoft-600 hover:bg-relisoft-50 rounded-lg transition-colors">
                      <Linkedin className="h-4 w-4" />
                    </a>
                    <a href={`mailto:${alum.name.toLowerCase().replace(' ', '.')}@relisofttechnologies.com`} className="p-1.5 text-gray-400 hover:text-relisoft-600 hover:bg-relisoft-50 rounded-lg transition-colors">
                      <Mail className="h-4 w-4" />
                    </a>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{alum.bio}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {alum.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {alum.tenure}
                  </span>
                </div>
                <button
                  onClick={() => handleReconnect(alum.name)}
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                    reconnected[alum.name]
                      ? 'bg-green-50 text-green-600 border border-green-200'
                      : 'bg-relisoft-500 text-white hover:bg-relisoft-600 shadow-sm'
                  }`}
                >
                  {reconnected[alum.name] ? (
                    <span className="flex items-center justify-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      Reconnect Sent
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1">
                      <Heart className="h-4 w-4" />
                      Reconnect
                    </span>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Success Stories
            </h2>
            <div className="space-y-6">
              {successStories.map((story, i) => (
                <div key={i} className="flex items-start gap-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-lg font-semibold text-amber-600 flex-shrink-0">
                    {story.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{story.name}</span>
                      <span className="text-xs text-gray-400">| {story.period}</span>
                    </div>
                    <p className="text-xs text-relisoft-600 font-medium mb-2">{story.role}</p>
                    <p className="text-sm text-gray-600 italic">"{story.quote}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-relisoft-500" />
              Alumni Events
            </h2>
            <div className="space-y-4">
              {events.map((event, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-relisoft-200 transition-all">
                  <div className="w-12 h-12 bg-relisoft-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-relisoft-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{event.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {event.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-400">{event.attendees} attending</span>
                      <button className="text-xs text-relisoft-600 font-medium hover:text-relisoft-700 flex items-center gap-1">
                        RSVP <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
