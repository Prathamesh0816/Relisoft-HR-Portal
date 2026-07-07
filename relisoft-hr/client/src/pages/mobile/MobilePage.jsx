import { useState } from 'react';
import { Smartphone, CheckCircle, Download, QrCode, Monitor, Apple, Chrome, Tablet, ArrowRight, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const features = [
  { title: 'Attendance Punch', description: 'Mark attendance with GPS and selfie verification', icon: Smartphone },
  { title: 'Leave Management', description: 'Apply for leaves, view balance, track approvals', icon: CheckCircle },
  { title: 'Payroll Access', description: 'View payslips, download tax statements', icon: Download },
  { title: 'Travel Requests', description: 'Submit and approve travel on the go', icon: ArrowRight },
  { title: 'Team Directory', description: 'Access organization chart and contact details', icon: Monitor },
  { title: 'Notifications', description: 'Real-time alerts for approvals and updates', icon: Star },
];

const screenshots = [
  { label: 'Dashboard', color: 'bg-relisoft-100' },
  { label: 'Attendance', color: 'bg-green-100' },
  { label: 'Leave', color: 'bg-relisoft-100' },
  { label: 'Payroll', color: 'bg-orange-100' },
];

const MobilePage = () => {
  const [selectedPlatform, setSelectedPlatform] = useState('ios');

  const handleDownload = (platform) => {
    toast.success(`${platform === 'ios' ? 'App Store' : 'Play Store'} opening...`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Mobile App</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-relisoft-100 rounded-2xl">
                <Smartphone size={32} className="text-relisoft-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">ReliSoft HR Mobile</h2>
                <p className="text-sm text-gray-500">Version 2.1.0</p>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setSelectedPlatform('ios')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${selectedPlatform === 'ios' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <Apple size={16} /> iOS
              </button>
              <button
                onClick={() => setSelectedPlatform('android')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${selectedPlatform === 'android' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <Chrome size={16} /> Android
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              {selectedPlatform === 'ios' ? 'iOS 14.0 or later. Compatible with iPhone, iPad, and iPod touch.' : 'Android 8.0 (Oreo) or later. Optimized for phones and tablets.'}
            </p>

            <button onClick={() => handleDownload(selectedPlatform)} className="btn-primary flex items-center gap-2">
              <Download size={18} /> Download for {selectedPlatform === 'ios' ? 'iOS' : 'Android'}
            </button>
          </div>

          <div className="card">
            <h2 className="card-header">Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Icon size={18} className="text-relisoft-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{feature.title}</h3>
                      <p className="text-xs text-gray-500">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <h2 className="card-header">Screenshots</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {screenshots.map((s, i) => (
                <div key={i} className={`${s.color} rounded-xl p-4 flex flex-col items-center justify-center h-32 border border-gray-200`}>
                  <Smartphone size={28} className="text-gray-600 mb-2" />
                  <p className="text-xs font-medium text-gray-700">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card text-center">
            <h3 className="card-header text-center">Download QR Code</h3>
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center">
              <QrCode size={120} className="text-gray-800 mb-3" />
              <p className="text-xs text-gray-500">Scan to download the app</p>
            </div>
          </div>

          <div className="card">
            <h3 className="card-header">Supported Platforms</h3>
            <div className="space-y-3">
              {[
                { icon: Apple, label: 'iOS 14.0+', desc: 'iPhone, iPad' },
                { icon: Chrome, label: 'Android 8.0+', desc: 'Phones, Tablets' },
                { icon: Tablet, label: 'Tablet', desc: 'iPadOS & Android tablets' },
              ].map((platform, i) => {
                const Icon = platform.icon;
                return (
                  <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <Icon size={20} className="text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{platform.label}</p>
                      <p className="text-xs text-gray-500">{platform.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <h3 className="card-header">Current Version</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">App Version</span>
                <span className="font-medium">2.1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Build Number</span>
                <span className="font-medium">2024.01.15</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Updated</span>
                <span className="font-medium">Jan 15, 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Size</span>
                <span className="font-medium">28 MB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobilePage;
