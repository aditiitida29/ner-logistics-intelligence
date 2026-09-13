import { Language } from '../types';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Platform Titles
    appTitle: 'NER Logistics Intelligence',
    appSubtitle: 'AI-Powered Accessibility & Logistics Monitoring Platform',
    commandCenter: 'Command & Operations Center',
    
    // Navigation
    navDashboard: 'Main Dashboard',
    navLiveMap: 'Live GIS Map',
    navRouteIntel: 'Route Intelligence',
    navVehicleTracking: 'Vehicle Tracking',
    navIncidents: 'Incidents & Field Reports',
    navAlerts: 'Alert Center',
    navDeliveries: 'Logistics / Deliveries',
    navDistricts: 'District Intelligence',
    navAnalytics: 'Analytics & Trends',
    navSettings: 'Settings',
    
    // Common Actions
    login: 'Login',
    logout: 'Logout',
    useDemoAccount: 'Use Demo Account',
    searchPlaceholder: 'Search districts, vehicles, incidents, routes...',
    analyzeRoute: 'Analyze Route',
    submitReport: 'Submit Incident',
    markAllRead: 'Mark All as Read',
    activateEmergency: 'ACTIVATE EMERGENCY MODE',
    deactivateEmergency: 'Deactivate Emergency Mode',
    liveSimulation: 'Live Simulation',
    demoMode: 'Demo Mode',
    offlineMode: 'OFFLINE MODE',
    useMyLocation: 'Use My Location',
    exportReport: 'Export Report',
    refreshData: 'Refresh',

    // KPIs
    networkAccessibility: 'Network Accessibility',
    activeVehicles: 'Active Vehicles',
    activeIncidents: 'Active Incidents',
    atRiskRoutes: 'At-Risk Routes',
    delayedDeliveries: 'Delayed Deliveries',
    emergencyCorridors: 'Emergency Corridors',
    
    // Statuses
    accessible: 'Accessible',
    caution: 'Caution',
    highRisk: 'High Risk',
    blocked: 'Blocked',
    moving: 'Moving',
    delayed: 'Delayed',
    stopped: 'Stopped',
    atRisk: 'At Risk',
    delivered: 'Delivered',
    inTransit: 'In Transit',

    // Regions
    entireNER: 'Entire NER',
    arunachalPradesh: 'Arunachal Pradesh',
    assam: 'Assam',
    manipur: 'Manipur',
    meghalaya: 'Meghalaya',
    mizoram: 'Mizoram',
    nagaland: 'Nagaland',
    sikkim: 'Sikkim',
    tripura: 'Tripura',

    // Sections
    aiInsights: 'AI Operational Insights & Recommendations',
    recentAlerts: 'Active Priority Alerts',
    accessibilityTrend: 'Accessibility Trend (7 Days)',
    incidentDistribution: 'Incident Distribution by Type',
    logisticsStatus: 'Logistics Pipeline Health',
    districtConnectivity: 'District Road Connectivity Scores'
  },
  hi: {
    // Platform Titles
    appTitle: 'पूर्वोत्तर लॉजिस्टिक्स इंटेलिजेंस',
    appSubtitle: 'एआई-संचालित सुगमता एवं लॉजिस्टिक्स निगरानी मंच',
    commandCenter: 'कमांड और परिचालन केंद्र',

    // Navigation
    navDashboard: 'मुख्य डैशबोर्ड',
    navLiveMap: 'लाइव जीआईएस मानचित्र',
    navRouteIntel: 'रूट इंटेलिजेंस',
    navVehicleTracking: 'वाहन ट्रैकिंग',
    navIncidents: 'घटनाएं एवं फील्ड रिपोर्ट',
    navAlerts: 'अलर्ट केंद्र',
    navDeliveries: 'लॉजिस्टिक्स एवं आपूर्ति',
    navDistricts: 'जिला खुफिया विश्लेषण',
    navAnalytics: 'विश्लेषण एवं रुझान',
    navSettings: 'सेटिंग्स',

    // Common Actions
    login: 'लॉग इन करें',
    logout: 'लॉग आउट',
    useDemoAccount: 'डेमो खाते का उपयोग करें',
    searchPlaceholder: 'जिले, वाहन, घटनाएं, मार्ग खोजें...',
    analyzeRoute: 'मार्ग का विश्लेषण करें',
    submitReport: 'घटना रिपोर्ट दर्ज करें',
    markAllRead: 'सभी पढ़े हुए चिह्नित करें',
    activateEmergency: 'आपातकालीन मोड सक्रिय करें',
    deactivateEmergency: 'आपातकालीन मोड बंद करें',
    liveSimulation: 'लाइव सिमुलेशन',
    demoMode: 'डेमो मोड',
    offlineMode: 'ऑफलाइन मोड',
    useMyLocation: 'मेरी स्थिति का उपयोग करें',
    exportReport: 'रिपोर्ट निर्यात करें',
    refreshData: 'ताज़ा करें',

    // KPIs
    networkAccessibility: 'नेटवर्क सुगमता',
    activeVehicles: 'सक्रिय वाहन',
    activeIncidents: 'सक्रिय घटनाएं',
    atRiskRoutes: 'जोखिम भरे मार्ग',
    delayedDeliveries: 'विलंबित डिलीवरी',
    emergencyCorridors: 'आपातकालीन गलियारे',

    // Statuses
    accessible: 'सुगम',
    caution: 'सावधानी',
    highRisk: 'उच्च जोखिम',
    blocked: 'अवरुद्ध',
    moving: 'गतिशील',
    delayed: 'विलंबित',
    stopped: 'रुका हुआ',
    atRisk: 'जोखिम में',
    delivered: 'वितरित',
    inTransit: 'पारगमन में',

    // Regions
    entireNER: 'संपूर्ण पूर्वोत्तर (NER)',
    arunachalPradesh: 'अरुणाचल प्रदेश',
    assam: 'असम',
    manipur: 'मणिपुर',
    meghalaya: 'मेघालय',
    mizoram: 'मिजोरम',
    nagaland: 'नागालैंड',
    sikkim: 'सिक्किम',
    tripura: 'त्रिपुरा',

    // Sections
    aiInsights: 'एआई परिचालन अंतर्दृष्टि एवं सुझाव',
    recentAlerts: 'सक्रिय प्राथमिकता अलर्ट',
    accessibilityTrend: 'सुगमता रुझान (७ दिन)',
    incidentDistribution: 'प्रकार अनुसार घटना वितरण',
    logisticsStatus: 'लॉजिस्टिक्स पाइपलाइन स्थिति',
    districtConnectivity: 'जिला सड़क कनेक्टिविटी स्कोर'
  },
  as: {
    // Platform Titles
    appTitle: 'উত্তৰ-পূব লজিষ্টিকছ ইন্টেলিজেন্স',
    appSubtitle: 'কৃত্ৰিম বুদ্ধিমত্তা চালিত প্ৰৱেশাধিকাৰ আৰু যোগান নিৰীক্ষণ প্লেটফৰ্ম',
    commandCenter: 'কমাণ্ড আৰু পৰিচালনা কেন্দ্ৰ',

    // Navigation
    navDashboard: 'মুখ্য ডেচব’ৰ্ড',
    navLiveMap: 'লাইভ জিআইএছ মেপ',
    navRouteIntel: 'পথ বুদ্ধিমত্তা (ৰুট)',
    navVehicleTracking: 'বাহন ট্ৰেকিং',
    navIncidents: 'ঘটনা আৰু ফিল্ড ৰিপৰ্ট',
    navAlerts: 'সতৰ্কতা কেন্দ্ৰ',
    navDeliveries: 'যোগান আৰু বিতৰণ',
    navDistricts: 'জিলা বুদ্ধিমত্তা',
    navAnalytics: 'বিশ্লেষণ আৰু প্ৰৱণতা',
    navSettings: 'ছেটিংছ',

    // Common Actions
    login: 'লগ ইন কৰক',
    logout: 'লগ আউট',
    useDemoAccount: 'ডেমো একাউণ্ট ব্যৱহাৰ কৰক',
    searchPlaceholder: 'জিলা, বাহন, ঘটনা বা পথ বিচাৰক...',
    analyzeRoute: 'পথ বিশ্লেষণ কৰক',
    submitReport: 'ঘটনাৰ তথ্য দাখিল কৰক',
    markAllRead: 'সকলো পঢ়া বুলি চিহ্নিত কৰক',
    activateEmergency: 'জৰুৰীকালীন মোড সক্ৰিয় কৰক',
    deactivateEmergency: 'জৰুৰীকালীন মোড বন্ধ কৰক',
    liveSimulation: 'লাইভ ছিমুলেচন',
    demoMode: 'ডেমো মোড',
    offlineMode: 'অফলাইন মোড',
    useMyLocation: 'মোৰ স্থান ব্যৱহাৰ কৰক',
    exportReport: 'ৰিপৰ্ট ডাউনল’ড কৰক',
    refreshData: 'পুনৰ সতেজ কৰক',

    // KPIs
    networkAccessibility: 'নেটৱৰ্ক সুগমতা',
    activeVehicles: 'সক্ৰিয় বাহন',
    activeIncidents: 'সক্ৰিয় ঘটনাসমূহ',
    atRiskRoutes: 'বিপদাপন্ন পথ',
    delayedDeliveries: 'পলম হোৱা যোগান',
    emergencyCorridors: 'জৰুৰীকালীন কৰিডৰ',

    // Statuses
    accessible: 'সুচল',
    caution: 'সতৰ্কতা',
    highRisk: 'অত্যধিক বিপদাপন্ন',
    blocked: 'অৱৰুদ্ধ',
    moving: 'গতিশীল',
    delayed: 'পলম হোৱা',
    stopped: 'বন্ধ',
    atRisk: 'বিপদত থকা',
    delivered: 'বিতৰিত',
    inTransit: 'পথত থকা',

    // Regions
    entireNER: 'সমগ্ৰ উত্তৰ-পূব (NER)',
    arunachalPradesh: 'অৰুণাচল প্ৰদেশ',
    assam: 'অসম',
    manipur: 'মণিপুৰ',
    meghalaya: 'মেঘালয়',
    mizoram: 'মিজোৰাম',
    nagaland: 'নাগালেণ্ড',
    sikkim: 'ছিকিম',
    tripura: 'ত্ৰিপুৰা',

    // Sections
    aiInsights: 'এআই কাৰ্য্যকৰী পৰ্য্যবেক্ষণ আৰু পৰামৰ্শ',
    recentAlerts: 'সক্ৰিয় সতৰ্কতাবাণী',
    accessibilityTrend: 'সুগমতাৰ প্ৰৱণতা (৭ দিন)',
    incidentDistribution: 'ধৰণ অনুসৰি ঘটনা বিভাজন',
    logisticsStatus: 'লজিষ্টিক পাইপলাইন স্বাস্থ্য',
    districtConnectivity: 'জিলা পথ সংযোগ নম্বৰ'
  }
};
