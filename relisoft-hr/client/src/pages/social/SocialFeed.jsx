import { useState } from 'react'
import {
  MessageSquare, Heart, Share2, Image as ImageIcon, Send,
  Bell, Cake, Award, Calendar, Filter, ThumbsUp,
  MessageCircle, Bookmark, MoreHorizontal, Users,
  Megaphone, Sparkles, Clock, ChevronDown, PartyPopper,
  Briefcase, Plane, Globe, Laptop, Building2, Star
} from 'lucide-react'

const initialPosts = [
  {
    id: 1,
    user: 'Priya Sharma',
    role: 'HR Director',
    avatar: 'PS',
    time: '2 hours ago',
    content: '🎉 Q3 Town Hall is TODAY at 3 PM in the main conference room! Agenda: quarterly results, product launch, team awards. Lunch will be served! See you all there!',
    likes: 38,
    comments: 12,
    liked: false,
    type: 'event',
  },
  {
    id: 2,
    user: 'HR Team',
    role: 'ReliSoft',
    avatar: 'HR',
    time: '3 hours ago',
    content: '🎂 Happy Birthday Ananya Reddy! Wishing you a fantastic day filled with joy and celebration! Join us in the breakout area at 4 PM for cake!',
    likes: 67,
    comments: 23,
    liked: true,
    type: 'greeting',
  },
  {
    id: 3,
    user: 'Sneha Gupta',
    role: 'HR Executive',
    avatar: 'SG',
    time: '5 hours ago',
    content: '🎊 This Friday is Fun Friday - Holi Celebration Theme! Wear your colorful outfits, we will have gulal, music, and snacks in the cafeteria from 3 PM onwards. Let us celebrate the festival of colors together! 🌈',
    likes: 52,
    comments: 18,
    liked: false,
    type: 'event',
  },
  {
    id: 4,
    user: 'Rahul Verma',
    role: 'Product Manager',
    avatar: 'RV',
    time: '1 day ago',
    content: '🏏 ReliSoft Cricket Tournament 2026 registrations are now open! Team size: 8 members. Matches on weekends. Winners get trophy + cash prize! Register by July 18th via the Sports Club portal.',
    likes: 45,
    comments: 14,
    liked: false,
    type: 'event',
  },
  {
    id: 5,
    user: 'Arun Kumar',
    role: 'Finance Lead',
    avatar: 'AK',
    time: '1 day ago',
    content: 'Shoutout to the entire backend team for shipping the new microservices architecture ahead of schedule! Your dedication is truly inspiring. 🚀🌟',
    likes: 42,
    comments: 12,
    liked: true,
    type: 'recognition',
  },
  {
    id: 6,
    user: 'Priya Sharma',
    role: 'HR Director',
    avatar: 'PS',
    time: '2 days ago',
    content: '🔥 Client Visit Update: The Alpha Corp team is visiting our Mumbai office next Monday (July 13). Please ensure your desks are clean and project dashboards are updated. Meeting room bookings are in the calendar.',
    likes: 29,
    comments: 8,
    liked: false,
    type: 'announcement',
  },
  {
    id: 7,
    user: 'Vikram Joshi',
    role: 'DevOps Engineer',
    avatar: 'VJ',
    time: '2 days ago',
    content: '🇺🇸 Just landed in San Francisco for the onshore deployment. 3 team members from the backend team will be joining me next week for the client go-live. Exciting times ahead! #OnshoreWork',
    likes: 34,
    comments: 9,
    liked: false,
    type: 'post',
  },
  {
    id: 8,
    user: 'Neha Patel',
    role: 'Marketing Lead',
    avatar: 'NP',
    time: '3 days ago',
    content: '🪷 Happy Ganesh Chaturthi to everyone celebrating! May Lord Ganesha bring wisdom, prosperity, and happiness to all. The virtual darshan link has been shared on the portal. #Festival #GaneshChaturthi',
    likes: 71,
    comments: 16,
    liked: true,
    type: 'event',
  },
  {
    id: 9,
    user: 'Rohan Desai',
    role: 'Junior Developer',
    avatar: 'RD',
    time: '3 days ago',
    content: '🌴 Fun Friday - Beach Theme was incredible! Thanks to the HR team for organizing the sand art competition and beach music. Check out the photos from the event!',
    likes: 48,
    comments: 11,
    liked: false,
    type: 'post',
  },
  {
    id: 10,
    user: 'IT Desk',
    role: 'IT Support',
    avatar: 'IT',
    time: '4 days ago',
    content: '🇮🇳 Our offshore team in Pune is now fully operational with the new collaboration tools. Stand-up meetings will be at 10 AM IST sharp. Welcome aboard the new offshore members! #OffshoreWork #GlobalTeam',
    likes: 25,
    comments: 7,
    liked: false,
    type: 'post',
  },
  {
    id: 11,
    user: 'Divya Singh',
    role: 'Sales Executive',
    avatar: 'DS',
    time: '4 days ago',
    content: '🎯 Weekly Sales Review Meeting scheduled for Friday 11 AM. Please come prepared with your pipeline updates and Q3 forecasts. Join via the usual Teams link.',
    likes: 15,
    comments: 5,
    liked: false,
    type: 'announcement',
  },
  {
    id: 12,
    user: 'Karthik Nair',
    role: 'Operations Manager',
    avatar: 'KN',
    time: '5 days ago',
    content: '🎊 A huge congratulations to the entire team for achieving ISO 27001 certification! This is a testament to our commitment to security and quality. Let us celebrate with a team lunch this Friday!',
    likes: 89,
    comments: 27,
    liked: true,
    type: 'recognition',
  },
  {
    id: 13,
    user: 'Ananya Reddy',
    role: 'UI/UX Designer',
    avatar: 'AR',
    time: '5 days ago',
    content: '🎨 Design Review Meeting - New Portal UI: We are presenting the new design system for the employee portal tomorrow at 2 PM. All stakeholders please join. Major revamp incoming!',
    likes: 22,
    comments: 9,
    liked: false,
    type: 'post',
  },
  {
    id: 14,
    user: 'Neha Patel',
    role: 'Marketing Lead',
    avatar: 'NP',
    time: '6 days ago',
    content: '✈️ Heads up: Client visit from Beta Technologies next Wednesday. We will be showcasing the new product demo. Please block your calendars and prepare the demo environment.',
    likes: 18,
    comments: 4,
    liked: false,
    type: 'announcement',
  },
]

const initialComments = {
  1: [
    { user: 'Amit Singh', avatar: 'AS', text: 'Can not wait for the town hall! 🎉' },
    { user: 'Sneha Gupta', avatar: 'SG', text: 'Looking forward to the awards ceremony!' },
  ],
  2: [
    { user: 'Rahul Verma', avatar: 'RV', text: 'Happy birthday Ananya! 🎂🎉' },
    { user: 'Priya Sharma', avatar: 'PS', text: 'Hope you have a wonderful day Ananya! 🎈' },
  ],
  3: [
    { user: 'Vikram Joshi', avatar: 'VJ', text: 'Holi celebration at work! Count me in! 🎊' },
    { user: 'Divya Singh', avatar: 'DS', text: 'Love the Fun Friday tradition! 🌈' },
  ],
  8: [
    { user: 'Priya Sharma', avatar: 'PS', text: 'Ganpati Bappa Morya! 🙏' },
    { user: 'Sneha Gupta', avatar: 'SG', text: 'Beautiful message Neha! 💛' },
  ],
  12: [
    { user: 'Neha Patel', avatar: 'NP', text: 'Well deserved everyone! 🏆' },
    { user: 'Rahul Verma', avatar: 'RV', text: 'This is huge! Great work team! 🎉' },
  ],
}

const filters = [
  { label: 'All Posts', icon: MessageSquare, key: 'all' },
  { label: 'Events', icon: Calendar, key: 'event' },
  { label: 'Announcements', icon: Megaphone, key: 'announcement' },
  { label: 'Recognition', icon: Award, key: 'recognition' },
  { label: 'Greetings', icon: Cake, key: 'greeting' },
]

const birthdays = [
  { name: 'Ananya Reddy', date: 'Today 🎂', avatar: 'AR' },
  { name: 'Karthik Nair', date: 'Tomorrow', avatar: 'KN' },
  { name: 'Divya Singh', date: 'This Saturday', avatar: 'DS' },
  { name: 'Rohan Desai', date: 'Next Monday', avatar: 'RD' },
]

const upcomingEvents = [
  { name: 'Q3 Town Hall', date: 'Today, 3 PM', icon: Calendar, color: 'var(--moss)' },
  { name: 'Fun Friday - Holi', date: 'This Friday, 3 PM', icon: PartyPopper, color: 'var(--gold)' },
  { name: 'Client Visit - Alpha Corp', date: 'Next Monday', icon: Briefcase, color: '#6366f1' },
  { name: 'Cricket Tournament', date: 'Jul 18-19', icon: Award, color: '#10b981' },
  { name: 'Onshore Deployment - SF', date: 'Jul 20', icon: Plane, color: '#f59e0b' },
]

const announcements = [
  '🎉 Q3 Town Hall TODAY at 3 PM - Main Conference Room',
  '🎊 Holi Fun Friday this week - Wear colorful outfits!',
  '🏏 Cricket Tournament registrations open until Jul 18',
  '🇺🇸 Onshore team in San Francisco - Go-live next week',
  '🔥 Client Visit: Alpha Corp on Monday, July 13',
  '🪷 Happy Ganesh Chaturthi! Virtual darshan link on portal',
]

const teamOnline = [
  { name: 'Priya Sharma', status: 'In a meeting' },
  { name: 'Rahul Verma', status: 'Available' },
  { name: 'Sneha Gupta', status: 'Available' },
  { name: 'Vikram Joshi', status: 'Onshore - SF' },
  { name: 'Arun Kumar', status: 'Available' },
  { name: 'Neha Patel', status: 'In a call' },
]

const typeBadges = {
  announcement: { bg: 'bg-relisoft-100', text: 'text-relisoft-600', icon: Megaphone, label: 'Announcement' },
  recognition: { bg: 'bg-amber-100', text: 'text-amber-600', icon: Award, label: 'Recognition' },
  event: { bg: 'bg-green-100', text: 'text-green-600', icon: Calendar, label: 'Event' },
  greeting: { bg: 'bg-pink-100', text: 'text-pink-600', icon: Cake, label: 'Greeting' },
  post: { bg: 'bg-gray-100', text: 'text-gray-600', icon: MessageSquare, label: 'Post' },
}

export default function SocialFeed() {
  const [posts, setPosts] = useState(initialPosts)
  const [comments, setComments] = useState(initialComments)
  const [activeFilter, setActiveFilter] = useState('all')
  const [newPost, setNewPost] = useState('')
  const [showComments, setShowComments] = useState({})
  const [commentInputs, setCommentInputs] = useState({})

  const filteredPosts = activeFilter === 'all' ? posts : posts.filter(p => p.type === activeFilter)

  const handleLike = (postId) => {
    setPosts(posts.map(p =>
      p.id === postId ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked } : p
    ))
  }

  const handlePost = () => {
    if (!newPost.trim()) return
    const post = {
      id: Date.now(),
      user: 'You',
      role: 'Employee',
      avatar: 'Yo',
      time: 'Just now',
      content: newPost,
      likes: 0,
      comments: 0,
      liked: false,
      type: 'post',
    }
    setPosts([post, ...posts])
    setNewPost('')
  }

  const handleComment = (postId) => {
    const text = commentInputs[postId]
    if (!text?.trim()) return
    const newComment = { user: 'You', avatar: 'Yo', text }
    setComments({
      ...comments,
      [postId]: [...(comments[postId] || []), newComment],
    })
    setPosts(posts.map(p =>
      p.id === postId ? { ...p, comments: p.comments + 1 } : p
    ))
    setCommentInputs({ ...commentInputs, [postId]: '' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex border-b border-gray-100 overflow-x-auto">
                {filters.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setActiveFilter(f.key)}
                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
                      activeFilter === f.key
                        ? 'text-relisoft-600 border-relisoft-500 bg-relisoft-50/50'
                        : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <f.icon className="h-4 w-4" />
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="p-4 border-b border-gray-100">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-relisoft-500 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    Yo
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="What's on your mind? Share updates, celebrations, birthdays..."
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-relisoft-500 focus:border-transparent"
                      onKeyDown={(e) => e.key === 'Enter' && handlePost()}
                    />
                    <div className="flex items-center justify-between mt-3">
                      <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-relisoft-600 transition-colors">
                        <ImageIcon className="h-4 w-4" />
                        <span>Photo</span>
                      </button>
                      <button
                        onClick={handlePost}
                        disabled={!newPost.trim()}
                        className="flex items-center gap-2 px-4 py-1.5 bg-relisoft-500 text-white rounded-lg text-sm font-medium hover:bg-relisoft-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-4 w-4" />
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {filteredPosts.map((post) => {
                  const badge = typeBadges[post.type] || typeBadges.post
                  const BadgeIcon = badge.icon
                  return (
                    <div key={post.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                          style={{ background: post.type === 'greeting' ? 'var(--gold)' : post.type === 'event' ? '#10b981' : 'var(--moss)', color: '#fff', opacity: 0.9 }}>
                          {post.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900 text-sm">{post.user}</span>
                            <span className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-medium ${badge.bg} ${badge.text}`}>
                              <BadgeIcon className="h-3 w-3" />
                              {badge.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                            <span>{post.role}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.time}</span>
                          </div>
                        </div>
                        <button className="p-1 rounded-lg text-gray-300 hover:bg-gray-100 hover:text-gray-500 transition-colors">
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed mb-3 ml-13">{post.content}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mb-2 ml-13">
                        <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {post.likes} likes</span>
                        <span className="mx-1">·</span>
                        <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {post.comments} comments</span>
                      </div>
                      <div className="flex items-center gap-1 ml-13 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            post.liked
                              ? 'text-relisoft-600 bg-relisoft-50'
                              : 'text-gray-500 hover:bg-gray-100'
                          }`}
                        >
                          <ThumbsUp className={`h-4 w-4 ${post.liked ? 'fill-relisoft-500 text-relisoft-500' : ''}`} />
                          Like
                        </button>
                        <button
                          onClick={() => setShowComments({ ...showComments, [post.id]: !showComments[post.id] })}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                          <MessageCircle className="h-4 w-4" />
                          Comment
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors">
                          <Share2 className="h-4 w-4" />
                          Share
                        </button>
                      </div>

                      {showComments[post.id] && (
                        <div className="ml-13 mt-3 pt-3 border-t border-gray-100 space-y-3">
                          {comments[post.id]?.map((c, j) => (
                            <div key={j} className="flex items-start gap-2">
                              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 flex-shrink-0">
                                {c.avatar}
                              </div>
                              <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1">
                                <span className="text-xs font-semibold text-gray-900">{c.user}</span>
                                <p className="text-sm text-gray-600">{c.text}</p>
                              </div>
                            </div>
                          ))}
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-relisoft-100 flex items-center justify-center text-xs font-semibold text-relisoft-600 flex-shrink-0">
                              Yo
                            </div>
                            <div className="flex-1 flex items-center gap-2">
                              <input
                                type="text"
                                value={commentInputs[post.id] || ''}
                                onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                                placeholder="Write a comment..."
                                className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-relisoft-500 focus:border-transparent"
                                onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                              />
                              <button
                                onClick={() => handleComment(post.id)}
                                className="p-1.5 text-relisoft-500 hover:bg-relisoft-50 rounded-lg transition-colors"
                              >
                                <Send className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="h-5 w-5 text-relisoft-500" />
                <h3 className="font-semibold text-gray-900 text-sm">Bulletin Board</h3>
              </div>
              <div className="space-y-3">
                {announcements.map((ann, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-relisoft-50 rounded-xl border border-relisoft-100">
                    <Megaphone className="h-4 w-4 text-relisoft-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{ann}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5" style={{ color: 'var(--moss)' }} />
                <h3 className="font-semibold text-gray-900 text-sm">Upcoming Events</h3>
              </div>
              <div className="space-y-3">
                {upcomingEvents.map((ev, i) => {
                  const EvIcon = ev.icon
                  return (
                    <div key={i} className="flex items-start gap-3 p-2.5 bg-gray-50 rounded-xl">
                      <div className="p-2 rounded-lg" style={{ background: ev.color + '20' }}>
                        <EvIcon className="h-3.5 w-3.5" style={{ color: ev.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{ev.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{ev.date}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Cake className="h-5 w-5 text-pink-500" />
                <h3 className="font-semibold text-gray-900 text-sm">Birthdays & Anniversaries</h3>
              </div>
              <div className="space-y-3">
                {birthdays.map((b, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center text-sm font-semibold text-pink-600">
                      {b.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{b.name}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-pink-400" />
                        {b.date}
                      </p>
                    </div>
                    <button className="text-xs px-3 py-1.5 bg-pink-50 text-pink-600 rounded-lg font-medium hover:bg-pink-100 transition-colors">
                      Wish
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-relisoft-500" />
                <h3 className="font-semibold text-gray-900 text-sm">Team Online</h3>
              </div>
              <div className="space-y-3">
                {teamOnline.map((member, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-700">{member.name}</span>
                      <p className="text-xs text-gray-400">{member.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
