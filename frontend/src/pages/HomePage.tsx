import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Truck, MapPin, MessageSquare, AlertTriangle, ArrowRight, Radio, DollarSign, TrendingUp, Zap, Clock, CheckCircle } from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      title: 'Resource Exchange & Rental',
      description: 'Share, borrow, or rent equipment and resources between agencies. Build a collaborative ecosystem where no resource goes unused during emergencies.',
      icon: <Truck size={28} className="text-white" />,
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Real-Time Emergency Alerts',
      description: 'Send and receive geo-targeted emergency alerts instantly. Keep all nearby agencies informed during critical situations.',
      icon: <AlertTriangle size={28} className="text-white" />,
      gradient: 'from-red-500 to-red-600'
    },
    {
      title: 'Agency Communication Hub',
      description: 'Direct messaging system with context-aware communications. Coordinate seamlessly with other response teams in real-time.',
      icon: <MessageSquare size={28} className="text-white" />,
      gradient: 'from-green-500 to-green-600'
    },
    {
      title: 'Interactive Location Map',
      description: 'Visualize nearby agencies, available resources, and ongoing operations on a dynamic interactive map interface.',
      icon: <MapPin size={28} className="text-white" />,
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Resource Requests',
      description: 'Make formal requests for resources from nearby agencies. Track approval status and coordinate pickup or delivery.',
      icon: <Radio size={28} className="text-white" />,
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Real-Time Tracking (Coming Soon)',
      description: 'Track your resources in real-time during deployment. Monitor asset locations and optimize response efficiency.',
      icon: <TrendingUp size={28} className="text-white" />,
      gradient: 'from-indigo-500 to-indigo-600'
    }
  ];

  const benefits = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Faster Response Times',
      description: 'Access nearby resources instantly instead of waiting for distant supplies'
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: 'Cost Efficiency',
      description: 'Rent equipment as needed rather than purchasing redundant resources'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Stronger Collaboration',
      description: 'Build lasting relationships with agencies in your region'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure Platform',
      description: 'Role-based access control ensures data security and accountability'
    }
  ];

  const stats = [
    { value: '500+', label: 'Rescue Agencies' },
    { value: '10K+', label: 'Resources Shared' },
    { value: '24/7', label: 'Real-Time Support' },
    { value: '50+', label: 'Cities Connected' }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/50 to-transparent" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left z-10">
              <div className="inline-flex items-center px-4 py-2 bg-accent-500/20 backdrop-blur-sm rounded-full border border-accent-400/30 mb-6">
                <Zap className="w-4 h-4 text-accent-400 mr-2" />
                <span className="text-accent-300 text-sm font-medium">Emergency Response Platform</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                Connect. Share.
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-accent-300">
                  Save Lives.
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                <span className="font-semibold text-white">RescueConnect</span> is the ultimate platform for rescue agencies to exchange resources, share equipment on rent, locate nearby agencies, make instant resource requests, and communicate in real-time during emergencies.
              </p>

              {/* Key Features List */}
              <div className="grid sm:grid-cols-2 gap-3 mb-8 text-left">
                {['Resource Exchange & Rental', 'Real-Time Alerts', 'Agency Location Map', 'Instant Communication'].map((item, idx) => (
                  <div key={idx} className="flex items-center text-gray-200">
                    <CheckCircle className="w-5 h-5 text-accent-400 mr-2 flex-shrink-0" />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to={isAuthenticated ? "/dashboard" : "/register"} className="w-full sm:w-auto">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white shadow-xl shadow-accent-500/30 group"
                  >
                    {isAuthenticated ? "Go to Dashboard" : "Register Your Agency"}
                    <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to={isAuthenticated ? "/map" : "/login"} className="w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 hover:border-white/50"
                  >
                    {isAuthenticated ? "View Resource Map" : "Sign In"}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative lg:block hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-accent-500/20 to-primary-500/20 rounded-3xl blur-3xl" />
              <img
                className="relative rounded-3xl shadow-2xl ring-1 ring-white/10 transform hover:scale-105 transition-transform duration-500"
                src="https://images.pexels.com/photos/36031/firefighter-fire-portrait-training.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Emergency responders coordinating rescue operations"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all">
                <div className="text-3xl lg:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase mb-3">
              Platform Features
            </h2>
            <h3 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
              Everything You Need for
              <span className="block text-primary-600">Emergency Coordination</span>
            </h3>
            <p className="mt-4 max-w-3xl mx-auto text-xl text-gray-600">
              A comprehensive platform designed specifically for rescue agencies to optimize resource utilization and response coordination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group relative bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-200 transform hover:-translate-y-2"
              >
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Why Choose RescueConnect?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform your emergency response capabilities with our integrated platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                  {benefit.icon}
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h4>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              How RescueConnect Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple, efficient, and built for emergency situations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Register & Connect', desc: 'Create your agency profile and connect with nearby rescue organizations' },
              { step: '02', title: 'Share Resources', desc: 'List your available equipment and browse resources from other agencies' },
              { step: '03', title: 'Coordinate & Respond', desc: 'Make requests, communicate in real-time, and save lives together' }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-6xl font-bold text-primary-100 mb-4">{item.step}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
                {idx < 2 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-primary-300 w-8 h-8" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto text-center py-20 px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
            Ready to Transform Your
            <span className="block text-accent-400">Emergency Response?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join the growing network of rescue agencies using RescueConnect to save lives, share resources, and coordinate more effectively during emergencies.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={isAuthenticated ? "/dashboard" : "/register"}>
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white shadow-xl shadow-accent-500/30 group"
              >
                {isAuthenticated ? "Go to Dashboard" : "Get Started Today"}
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20"
              >
                Contact Sales
              </Button>
            </Link>
          </div>

          <p className="mt-8 text-sm text-gray-400">
            Trusted by emergency response agencies nationwide
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;