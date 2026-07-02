import React, { createContext, useContext, useEffect, useState } from "react";

/**
 * Cosmic Hora — lightweight i18n system.
 * Supports English (en), Hindi (hi), Telugu (te).
 * Falls back to English when a key is missing.
 * Report-type slugs use a separate translation map so dynamic DB content
 * (title/tagline/description) can be shown in the seeker's chosen language.
 */

export const LANGS = [
  { code: "en", label: "English", short: "EN" },
  { code: "hi", label: "हिन्दी", short: "हि" },
  { code: "te", label: "తెలుగు", short: "తె" },
];

const DICT = {
  en: {
    // Navigation
    nav_home: "Home", nav_reports: "Reports", nav_services: "Services",
    nav_pricing: "Pricing", nav_journal: "Journal", nav_about: "About",
    nav_contact: "Contact", nav_dashboard: "Dashboard", nav_admin: "Admin",
    nav_signin: "Sign in", nav_signout: "Sign out", nav_begin: "Begin",

    // Footer
    footer_tagline: "Ancient Vedic wisdom, crafted anew for the modern seeker.",
    footer_explore: "Explore", footer_company: "Company", footer_legal: "Legal",
    footer_book: "Book an astrologer",
    footer_rights: "All rights reserved.",
    footer_madewith: "Made with reverence for the sky.",

    // Home / Hero
    hero_eyebrow: "Ancient Wisdom · Modern Craft",
    hero_line1: "The cosmos,",
    hero_line2: "translated",
    hero_line3: "for you",
    hero_body: "AI-crafted Vedic astrology reports, prepared with the care of a seasoned scholar and delivered to your inbox within minutes. No queues. No noise. Just the sky, whispering.",
    hero_cta_reports: "Explore Reports",
    hero_cta_how: "How it works",
    hero_stat_rating: "4.9 rating",
    hero_stat_delivered: "12,000+ readings delivered",
    hero_stat_types: "15 report types",
    hero_featured: "Featured Report",
    hero_featured_title: "Complete Horoscope",
    hero_featured_sub: "A definitive lifetime reading in the sidereal tradition.",

    // How it works
    ritual_eyebrow: "The Ritual",
    ritual_title: "Four gentle steps between you and the stars.",
    ritual_1_t: "Choose a report", ritual_1_d: "From Complete Horoscope to Muhurta — 15 traditions await.",
    ritual_2_t: "Share your birth details", ritual_2_d: "Name, date, time and place. Handled with reverence.",
    ritual_3_t: "Complete payment", ritual_3_d: "Encrypted checkout, receipt sent instantly.",
    ritual_4_t: "Receive your PDF", ritual_4_d: "Delivered to your inbox and dashboard within minutes.",

    // Reports section
    library_eyebrow: "Our Library",
    library_title: "Reports, meticulously composed.",
    library_view_all: "View all reports",
    library_order: "Order",

    // Testimonials
    tst_eyebrow: "What Seekers Say",
    tst_title: "In their own words.",

    // CTA
    cta_title: "Your chart awaits.",
    cta_body: "Begin with a single reading — no subscription, no strings.",
    cta_choose: "Choose your report",
    cta_speak: "Speak with an astrologer",

    // Reports listing
    reports_title: "Every kind of reading, one library.",
    reports_sub: "Choose from fifteen traditions of Vedic astrology, each composed with rigour and delivered in minutes.",
    reports_search: "Search reports…",
    free: "Free",

    // Birth form
    bf_ordering: "You are ordering",
    bf_step_1: "Birth Details", bf_step_2: "Payment", bf_step_3: "Delivered",
    bf_fee: "Report fee", bf_coupon: "Coupon", bf_total: "Total",
    bf_name: "Full Name", bf_name_ph: "As per birth records",
    bf_gender: "Gender", bf_female: "Female", bf_male: "Male", bf_other: "Other",
    bf_dob: "Date of Birth", bf_tob: "Exact Time of Birth",
    bf_pob: "Place of Birth", bf_pob_ph: "City, Country",
    bf_email: "Email", bf_mobile: "Mobile Number",
    bf_coupon_q: "Have a coupon?", bf_apply: "Apply",
    bf_continue: "Continue to Payment",
    bf_checkout_eyebrow: "Checkout · Mocked Razorpay",
    bf_confirm: "Confirm your payment",
    bf_mock_note: "Razorpay integration is mocked in this environment. Clicking below simulates a successful checkout and triggers report generation.",
    bf_order_id: "Order ID", bf_amount: "Amount",
    bf_pay: "Pay", bf_processing: "Processing…",
    bf_ready_title: "Your report is ready.",
    bf_ready_body: "We have delivered a PDF copy to {email} (mocked in this environment) and saved it to your dashboard.",
    bf_download: "Download PDF", bf_goto_dashboard: "Go to dashboard",
    bf_signin_first: "Please sign in to continue",

    // Auth
    login_eyebrow: "Sign in", login_title: "Welcome back.",
    login_sub: "Continue your journey with Cosmic Hora.",
    login_new: "New here?", login_create: "Create an account",
    login_submit: "Sign in",
    register_eyebrow: "Begin your journey",
    register_title: "Create your account.",
    register_sub: "Store your reports, revisit them anytime.",
    register_have: "Already have an account?",
    register_submit: "Create account",
    field_password: "Password",

    // Dashboard
    dash_eyebrow: "Your Sanctuary",
    dash_welcome: "Welcome, {name}.",
    dash_reports: "Your reports",
    dash_order_another: "Order another",
    dash_empty_title: "Your library is empty",
    dash_empty_body: "Begin with any of our 15 report types.",
    dash_browse: "Browse reports",
    dash_pdf: "PDF",
    dash_pending: "Payment pending",

    // Static pages
    about_eyebrow: "Our Story",
    about_title_1: "Ancient light,", about_title_2: "patiently studied.",
    about_p1: "Cosmic Hora is a small studio devoted to the craft of Vedic astrology. We combine the classical texts — Parashara, Jaimini, Brihat Parashara Hora Shastra — with modern computational astronomy and language models fine-tuned on decades of interpretive literature.",
    about_p2: "The result: reports that read like they were written by a thoughtful astrologer sitting across a wooden table, not a robot.",
    about_principles: "Our Principles",
    about_principles_title: "Guiding stars.",
    about_pr1_t: "Fidelity to tradition", about_pr1_d: "We use the sidereal zodiac and classical dashas. No shortcuts, no hybrids.",
    about_pr2_t: "Respect for privacy", about_pr2_d: "Your birth details are encrypted at rest and never shared with any third party.",
    about_pr3_t: "Beautiful writing", about_pr3_d: "Every paragraph is composed to be read, considered and kept.",
    about_begin: "Begin your reading.",
    about_choose_report: "Choose a report",
    about_book: "Book an astrologer",

    services_eyebrow: "Services",
    services_title: "Everything the sky has to say.",
    svc_1_t: "AI Reports", svc_1_d: "Instant, PDF-delivered Vedic reports across 15 traditions.",
    svc_2_t: "Live Consultations", svc_2_d: "Book a private session with a senior astrologer (coming soon).",
    svc_3_t: "Muhurta Selection", svc_3_d: "Choose auspicious timing for weddings, launches and journeys.",
    svc_4_t: "Custom Analysis", svc_4_d: "Ask a specific life question and receive a bespoke reading.",

    pricing_eyebrow: "Pricing",
    pricing_title: "Fair, transparent, timeless.",
    pricing_sub: "Buy a single report or choose a bundle. No subscriptions, ever.",
    pricing_essential: "Essential", pricing_insight: "Insight", pricing_complete: "Complete Path",
    pricing_choose: "Choose",
    pricing_individual: "Individual reports",

    blog_eyebrow: "Journal",
    blog_title: "Notes from the observatory.",
    blog_read: "Read essay →",
    blog_back: "← Back to Journal",
    blog_not_found: "Essay not found.",
    loading: "Loading…",

    contact_eyebrow: "Contact",
    contact_title: "Write to us.",
    contact_sub: "Questions about a report, a partnership idea, or a note of gratitude — we read every message with care.",
    contact_email_lbl: "Email", contact_phone_lbl: "Phone",
    field_name: "Name", field_email: "Email",
    contact_subject: "Subject", contact_message: "Message",
    contact_send: "Send message",
    contact_thanks: "Thank you — we will be in touch shortly.",

    appt_eyebrow: "Schedule an Appointment",
    appt_title: "Sit with a senior astrologer.",
    appt_sub: "Private, 45-minute conversations available by request. We will confirm your slot by email.",
    appt_mobile: "Mobile",
    appt_date: "Preferred Date", appt_time: "Preferred Time",
    appt_topic: "What would you like to discuss?",
    appt_submit: "Request appointment",
    appt_thanks: "Requested. We will confirm your slot by email.",

    faq_eyebrow: "Frequently Asked",
    faq_title: "Questions, answered.",
    legal_eyebrow: "Legal",

    // Common
    common_loading: "Loading…",
    common_saved: "Saved",
    common_deleted: "Deleted",
    common_error: "Something went wrong. Please try again.",

    // Report titles (slug → localized title)
    "rt.complete-horoscope.title": "Complete Horoscope",
    "rt.complete-horoscope.tagline": "A definitive lifetime chart reading.",
    "rt.marriage-compatibility.title": "Marriage Compatibility",
    "rt.marriage-compatibility.tagline": "Kundali Milan & Guna analysis.",
    "rt.career-analysis.title": "Career Analysis",
    "rt.career-analysis.tagline": "Discover your vocational dharma.",
    "rt.finance-wealth.title": "Finance & Wealth",
    "rt.finance-wealth.tagline": "Money houses, timing & remedies.",
    "rt.business-success.title": "Business Success",
    "rt.business-success.tagline": "Timing ventures and partnerships.",
    "rt.education.title": "Education",
    "rt.education.tagline": "Study, focus, and higher learning.",
    "rt.health.title": "Health",
    "rt.health.tagline": "Body, mind, and prevention.",
    "rt.foreign-settlement.title": "Foreign Settlement",
    "rt.foreign-settlement.tagline": "Migration timing & opportunity.",
    "rt.love-relationships.title": "Love & Relationships",
    "rt.love-relationships.tagline": "Venus, timing, and karmic ties.",
    "rt.child-birth.title": "Child Birth",
    "rt.child-birth.tagline": "Santan yoga and timing.",
    "rt.muhurta.title": "Muhurta",
    "rt.muhurta.tagline": "Auspicious timing for events.",
    "rt.yearly-predictions.title": "Yearly Predictions",
    "rt.yearly-predictions.tagline": "12-month personalised forecast.",
    "rt.monthly-predictions.title": "Monthly Predictions",
    "rt.monthly-predictions.tagline": "This month's cosmic weather.",
    "rt.numerology.title": "Numerology",
    "rt.numerology.tagline": "Numbers behind your name & birth.",
    "rt.custom-report.title": "Custom Report",
    "rt.custom-report.tagline": "Ask a specific question.",
  },

  hi: {
    nav_home: "मुख्य पृष्ठ", nav_reports: "रिपोर्ट्स", nav_services: "सेवाएँ",
    nav_pricing: "मूल्य", nav_journal: "जर्नल", nav_about: "हमारे बारे में",
    nav_contact: "संपर्क", nav_dashboard: "डैशबोर्ड", nav_admin: "एडमिन",
    nav_signin: "साइन इन", nav_signout: "साइन आउट", nav_begin: "आरंभ करें",

    footer_tagline: "प्राचीन वैदिक ज्ञान, आधुनिक साधक के लिए नए सिरे से रचित।",
    footer_explore: "अन्वेषण करें", footer_company: "कंपनी", footer_legal: "कानूनी",
    footer_book: "ज्योतिषी से मिलें",
    footer_rights: "सर्वाधिकार सुरक्षित।",
    footer_madewith: "आकाश के प्रति श्रद्धा से निर्मित।",

    hero_eyebrow: "प्राचीन ज्ञान · आधुनिक शिल्प",
    hero_line1: "ब्रह्मांड,",
    hero_line2: "अनुवादित",
    hero_line3: "आपके लिए",
    hero_body: "AI द्वारा तैयार वैदिक ज्योतिष रिपोर्ट, अनुभवी विद्वान की देखभाल के साथ, कुछ ही मिनटों में आपके इनबॉक्स तक। कोई प्रतीक्षा नहीं। बस आकाश, फुसफुसाता हुआ।",
    hero_cta_reports: "रिपोर्ट्स देखें",
    hero_cta_how: "यह कैसे काम करता है",
    hero_stat_rating: "4.9 रेटिंग",
    hero_stat_delivered: "12,000+ रीडिंग वितरित",
    hero_stat_types: "15 रिपोर्ट प्रकार",
    hero_featured: "विशेष रिपोर्ट",
    hero_featured_title: "संपूर्ण कुंडली",
    hero_featured_sub: "सिडेरियल परंपरा में एक निश्चित जीवनकाल पठन।",

    ritual_eyebrow: "अनुष्ठान",
    ritual_title: "आप और तारों के बीच चार सौम्य चरण।",
    ritual_1_t: "रिपोर्ट चुनें", ritual_1_d: "संपूर्ण कुंडली से मुहूर्त तक — 15 परंपराएँ प्रतीक्षा में।",
    ritual_2_t: "जन्म विवरण साझा करें", ritual_2_d: "नाम, तारीख़, समय और स्थान। श्रद्धा से संभाला जाता है।",
    ritual_3_t: "भुगतान पूर्ण करें", ritual_3_d: "एन्क्रिप्टेड चेकआउट, तुरंत रसीद।",
    ritual_4_t: "अपनी PDF प्राप्त करें", ritual_4_d: "मिनटों में इनबॉक्स और डैशबोर्ड में उपलब्ध।",

    library_eyebrow: "हमारा पुस्तकालय",
    library_title: "रिपोर्ट्स, सूक्ष्मता से रचित।",
    library_view_all: "सभी रिपोर्ट्स देखें",
    library_order: "ऑर्डर",

    tst_eyebrow: "साधक क्या कहते हैं",
    tst_title: "उनके अपने शब्दों में।",

    cta_title: "आपकी कुंडली प्रतीक्षा में है।",
    cta_body: "एक रीडिंग से आरंभ करें — कोई सदस्यता नहीं, कोई बंधन नहीं।",
    cta_choose: "अपनी रिपोर्ट चुनें",
    cta_speak: "ज्योतिषी से बात करें",

    reports_title: "हर प्रकार का पठन, एक पुस्तकालय।",
    reports_sub: "वैदिक ज्योतिष की पंद्रह परंपराओं में से चुनें, प्रत्येक कठोरता से रचित और मिनटों में वितरित।",
    reports_search: "रिपोर्ट्स खोजें…",
    free: "निःशुल्क",

    bf_ordering: "आप ऑर्डर कर रहे हैं",
    bf_step_1: "जन्म विवरण", bf_step_2: "भुगतान", bf_step_3: "प्राप्त",
    bf_fee: "रिपोर्ट शुल्क", bf_coupon: "कूपन", bf_total: "कुल",
    bf_name: "पूरा नाम", bf_name_ph: "जन्म रिकॉर्ड के अनुसार",
    bf_gender: "लिंग", bf_female: "महिला", bf_male: "पुरुष", bf_other: "अन्य",
    bf_dob: "जन्म तिथि", bf_tob: "सटीक जन्म समय",
    bf_pob: "जन्म स्थान", bf_pob_ph: "शहर, देश",
    bf_email: "ईमेल", bf_mobile: "मोबाइल नंबर",
    bf_coupon_q: "क्या आपके पास कूपन है?", bf_apply: "लागू करें",
    bf_continue: "भुगतान पर जाएँ",
    bf_checkout_eyebrow: "चेकआउट · मॉक Razorpay",
    bf_confirm: "अपने भुगतान की पुष्टि करें",
    bf_mock_note: "इस परिवेश में Razorpay एकीकरण मॉक है। नीचे क्लिक करने पर एक सफल चेकआउट का अनुकरण होता है और रिपोर्ट निर्माण प्रारंभ होता है।",
    bf_order_id: "ऑर्डर ID", bf_amount: "राशि",
    bf_pay: "भुगतान करें", bf_processing: "प्रक्रिया जारी…",
    bf_ready_title: "आपकी रिपोर्ट तैयार है।",
    bf_ready_body: "हमने {email} को PDF प्रति वितरित की है (इस परिवेश में मॉक) और आपके डैशबोर्ड में सहेजी है।",
    bf_download: "PDF डाउनलोड करें", bf_goto_dashboard: "डैशबोर्ड पर जाएँ",
    bf_signin_first: "जारी रखने के लिए साइन इन करें",

    login_eyebrow: "साइन इन", login_title: "पुनः स्वागत है।",
    login_sub: "Cosmic Hora के साथ अपनी यात्रा जारी रखें।",
    login_new: "यहाँ नए हैं?", login_create: "खाता बनाएँ",
    login_submit: "साइन इन",
    register_eyebrow: "अपनी यात्रा आरंभ करें",
    register_title: "अपना खाता बनाएँ।",
    register_sub: "अपनी रिपोर्ट्स संगृहीत करें, कभी भी पुनः देखें।",
    register_have: "पहले से खाता है?",
    register_submit: "खाता बनाएँ",
    field_password: "पासवर्ड",

    dash_eyebrow: "आपका आश्रय",
    dash_welcome: "स्वागत है, {name}।",
    dash_reports: "आपकी रिपोर्ट्स",
    dash_order_another: "एक और ऑर्डर करें",
    dash_empty_title: "आपका पुस्तकालय खाली है",
    dash_empty_body: "हमारे 15 रिपोर्ट प्रकारों में से किसी से आरंभ करें।",
    dash_browse: "रिपोर्ट्स ब्राउज़ करें",
    dash_pdf: "PDF",
    dash_pending: "भुगतान लंबित",

    about_eyebrow: "हमारी कहानी",
    about_title_1: "प्राचीन प्रकाश,", about_title_2: "धैर्य से अध्ययन किया।",
    about_p1: "Cosmic Hora वैदिक ज्योतिष के शिल्प को समर्पित एक छोटा स्टूडियो है। हम शास्त्रीय ग्रंथों — पराशर, जैमिनि, बृहत् पराशर होरा शास्त्र — को आधुनिक कम्प्यूटेशनल खगोल विज्ञान और दशकों के व्याख्यात्मक साहित्य पर प्रशिक्षित भाषा मॉडलों के साथ जोड़ते हैं।",
    about_p2: "परिणाम: रिपोर्ट्स जो ऐसे पढ़ी जाती हैं मानो एक विचारशील ज्योतिषी ने लकड़ी की मेज़ के पार बैठकर लिखी हों, रोबोट ने नहीं।",
    about_principles: "हमारे सिद्धांत",
    about_principles_title: "मार्गदर्शक तारे।",
    about_pr1_t: "परंपरा के प्रति निष्ठा", about_pr1_d: "हम सिडेरियल राशिचक्र और शास्त्रीय दशाओं का उपयोग करते हैं। कोई शॉर्टकट नहीं।",
    about_pr2_t: "गोपनीयता का सम्मान", about_pr2_d: "आपके जन्म विवरण एन्क्रिप्टेड हैं और कभी भी किसी तीसरे पक्ष के साथ साझा नहीं किए जाते।",
    about_pr3_t: "सुंदर लेखन", about_pr3_d: "हर पैराग्राफ पढ़े, विचारे और सहेजे जाने के लिए रचा गया है।",
    about_begin: "अपनी रीडिंग आरंभ करें।",
    about_choose_report: "रिपोर्ट चुनें",
    about_book: "ज्योतिषी बुक करें",

    services_eyebrow: "सेवाएँ",
    services_title: "आकाश जो कुछ कहना चाहता है।",
    svc_1_t: "AI रिपोर्ट्स", svc_1_d: "15 परंपराओं में तत्काल, PDF वितरित वैदिक रिपोर्ट्स।",
    svc_2_t: "लाइव परामर्श", svc_2_d: "वरिष्ठ ज्योतिषी के साथ निजी सत्र बुक करें (जल्द आ रहा है)।",
    svc_3_t: "मुहूर्त चयन", svc_3_d: "विवाह, प्रारंभ और यात्राओं के लिए शुभ समय चुनें।",
    svc_4_t: "कस्टम विश्लेषण", svc_4_d: "एक विशेष जीवन प्रश्न पूछें और अनुकूलित रीडिंग प्राप्त करें।",

    pricing_eyebrow: "मूल्य",
    pricing_title: "उचित, पारदर्शी, कालातीत।",
    pricing_sub: "एक रिपोर्ट खरीदें या बंडल चुनें। कभी कोई सदस्यता नहीं।",
    pricing_essential: "एसेंशियल", pricing_insight: "इनसाइट", pricing_complete: "कम्प्लीट पथ",
    pricing_choose: "चुनें",
    pricing_individual: "व्यक्तिगत रिपोर्ट्स",

    blog_eyebrow: "जर्नल",
    blog_title: "वेधशाला से टिप्पणियाँ।",
    blog_read: "निबंध पढ़ें →",
    blog_back: "← जर्नल पर लौटें",
    blog_not_found: "निबंध नहीं मिला।",
    loading: "लोड हो रहा है…",

    contact_eyebrow: "संपर्क",
    contact_title: "हमें लिखें।",
    contact_sub: "किसी रिपोर्ट, साझेदारी विचार या धन्यवाद के बारे में — हम हर संदेश ध्यान से पढ़ते हैं।",
    contact_email_lbl: "ईमेल", contact_phone_lbl: "फ़ोन",
    field_name: "नाम", field_email: "ईमेल",
    contact_subject: "विषय", contact_message: "संदेश",
    contact_send: "संदेश भेजें",
    contact_thanks: "धन्यवाद — हम शीघ्र ही संपर्क करेंगे।",

    appt_eyebrow: "अपॉइंटमेंट निर्धारित करें",
    appt_title: "वरिष्ठ ज्योतिषी के साथ बैठें।",
    appt_sub: "निजी, 45-मिनट की बातचीत अनुरोध पर उपलब्ध। हम ईमेल द्वारा आपके स्लॉट की पुष्टि करेंगे।",
    appt_mobile: "मोबाइल",
    appt_date: "पसंदीदा तिथि", appt_time: "पसंदीदा समय",
    appt_topic: "आप क्या चर्चा करना चाहेंगे?",
    appt_submit: "अपॉइंटमेंट का अनुरोध करें",
    appt_thanks: "अनुरोध किया गया। हम ईमेल द्वारा आपके स्लॉट की पुष्टि करेंगे।",

    faq_eyebrow: "अक्सर पूछे जाने वाले",
    faq_title: "प्रश्न, उत्तर सहित।",
    legal_eyebrow: "कानूनी",

    common_loading: "लोड हो रहा है…",
    common_saved: "सहेजा गया",
    common_deleted: "हटाया गया",
    common_error: "कुछ ग़लत हुआ। कृपया पुनः प्रयास करें।",

    "rt.complete-horoscope.title": "संपूर्ण कुंडली",
    "rt.complete-horoscope.tagline": "जीवनकाल की निश्चित कुंडली रीडिंग।",
    "rt.marriage-compatibility.title": "विवाह अनुकूलता",
    "rt.marriage-compatibility.tagline": "कुंडली मिलान व गुण विश्लेषण।",
    "rt.career-analysis.title": "करियर विश्लेषण",
    "rt.career-analysis.tagline": "अपने व्यावसायिक धर्म की खोज करें।",
    "rt.finance-wealth.title": "वित्त व संपत्ति",
    "rt.finance-wealth.tagline": "धन भाव, समय व उपाय।",
    "rt.business-success.title": "व्यवसाय सफलता",
    "rt.business-success.tagline": "उद्यम व साझेदारी का समय।",
    "rt.education.title": "शिक्षा",
    "rt.education.tagline": "अध्ययन, एकाग्रता व उच्च शिक्षा।",
    "rt.health.title": "स्वास्थ्य",
    "rt.health.tagline": "शरीर, मन और रोकथाम।",
    "rt.foreign-settlement.title": "विदेश निपटान",
    "rt.foreign-settlement.tagline": "प्रवास समय व अवसर।",
    "rt.love-relationships.title": "प्रेम व संबंध",
    "rt.love-relationships.tagline": "शुक्र, समय व कर्म बंधन।",
    "rt.child-birth.title": "संतान प्राप्ति",
    "rt.child-birth.tagline": "संतान योग व समय।",
    "rt.muhurta.title": "मुहूर्त",
    "rt.muhurta.tagline": "आयोजनों के लिए शुभ समय।",
    "rt.yearly-predictions.title": "वार्षिक भविष्यवाणियाँ",
    "rt.yearly-predictions.tagline": "12-माह का व्यक्तिगत पूर्वानुमान।",
    "rt.monthly-predictions.title": "मासिक भविष्यवाणियाँ",
    "rt.monthly-predictions.tagline": "इस माह का ब्रह्मांडीय मौसम।",
    "rt.numerology.title": "अंक ज्योतिष",
    "rt.numerology.tagline": "आपके नाम व जन्म के पीछे की संख्याएँ।",
    "rt.custom-report.title": "कस्टम रिपोर्ट",
    "rt.custom-report.tagline": "एक विशेष प्रश्न पूछें।",
  },

  te: {
    nav_home: "హోమ్", nav_reports: "నివేదికలు", nav_services: "సేవలు",
    nav_pricing: "ధరలు", nav_journal: "జర్నల్", nav_about: "గురించి",
    nav_contact: "సంప్రదించండి", nav_dashboard: "డాష్‌బోర్డ్", nav_admin: "అడ్మిన్",
    nav_signin: "సైన్ ఇన్", nav_signout: "సైన్ ఔట్", nav_begin: "ప్రారంభించండి",

    footer_tagline: "పురాతన వైదిక జ్ఞానం, ఆధునిక సాధకుని కోసం కొత్తగా రూపొందించబడింది.",
    footer_explore: "అన్వేషించండి", footer_company: "కంపెనీ", footer_legal: "చట్టపరమైన",
    footer_book: "జ్యోతిష్కుని బుక్ చేయండి",
    footer_rights: "అన్ని హక్కులు ప్రత్యేకించబడ్డాయి.",
    footer_madewith: "ఆకాశం పట్ల భక్తితో రూపొందించబడింది.",

    hero_eyebrow: "పురాతన జ్ఞానం · ఆధునిక కళ",
    hero_line1: "విశ్వం,",
    hero_line2: "అనువదించబడింది",
    hero_line3: "మీ కోసం",
    hero_body: "AI-రూపొందించిన వైదిక జ్యోతిష నివేదికలు, అనుభవజ్ఞుడైన పండితుని శ్రద్ధతో సిద్ధం చేసి, కొన్ని నిమిషాల్లో మీ ఇన్‌బాక్స్‌కు అందించబడతాయి. ఎటువంటి క్యూలు లేవు. కేవలం ఆకాశం, గుసగుసలాడుతోంది.",
    hero_cta_reports: "నివేదికలను అన్వేషించండి",
    hero_cta_how: "ఇది ఎలా పనిచేస్తుంది",
    hero_stat_rating: "4.9 రేటింగ్",
    hero_stat_delivered: "12,000+ రీడింగ్‌లు అందించబడ్డాయి",
    hero_stat_types: "15 నివేదిక రకాలు",
    hero_featured: "ప్రత్యేక నివేదిక",
    hero_featured_title: "సంపూర్ణ జాతకం",
    hero_featured_sub: "సైడీరియల్ సంప్రదాయంలో ఖచ్చితమైన జీవితకాల పఠనం.",

    ritual_eyebrow: "ఆచారం",
    ritual_title: "మీకు మరియు నక్షత్రాలకు మధ్య నాలుగు మృదువైన అడుగులు.",
    ritual_1_t: "నివేదికను ఎంచుకోండి", ritual_1_d: "సంపూర్ణ జాతకం నుండి ముహూర్తం వరకు — 15 సంప్రదాయాలు.",
    ritual_2_t: "జన్మ వివరాలను పంచుకోండి", ritual_2_d: "పేరు, తేదీ, సమయం మరియు స్థలం. భక్తితో నిర్వహించబడతాయి.",
    ritual_3_t: "చెల్లింపును పూర్తి చేయండి", ritual_3_d: "ఎన్‌క్రిప్టెడ్ చెక్‌అవుట్, రసీదు తక్షణమే.",
    ritual_4_t: "మీ PDF ను స్వీకరించండి", ritual_4_d: "నిమిషాల్లో ఇన్‌బాక్స్ మరియు డాష్‌బోర్డ్‌కు అందించబడుతుంది.",

    library_eyebrow: "మా గ్రంథాలయం",
    library_title: "నివేదికలు, జాగ్రత్తగా రచించబడ్డాయి.",
    library_view_all: "అన్ని నివేదికలను చూడండి",
    library_order: "ఆర్డర్",

    tst_eyebrow: "సాధకులు ఏమి చెబుతున్నారు",
    tst_title: "వారి స్వంత మాటల్లో.",

    cta_title: "మీ చార్ట్ వేచి ఉంది.",
    cta_body: "ఒక్క రీడింగ్‌తో ప్రారంభించండి — సబ్‌స్క్రిప్షన్ లేదు, ఏ షరతులు లేవు.",
    cta_choose: "మీ నివేదికను ఎంచుకోండి",
    cta_speak: "జ్యోతిష్కునితో మాట్లాడండి",

    reports_title: "ప్రతి రకమైన పఠనం, ఒకే గ్రంథాలయం.",
    reports_sub: "వైదిక జ్యోతిష్యం యొక్క పదిహేను సంప్రదాయాల నుండి ఎంచుకోండి, ప్రతి ఒక్కటి కఠినంగా రచించబడి నిమిషాల్లో అందించబడతాయి.",
    reports_search: "నివేదికలను శోధించండి…",
    free: "ఉచితం",

    bf_ordering: "మీరు ఆర్డర్ చేస్తున్నారు",
    bf_step_1: "జన్మ వివరాలు", bf_step_2: "చెల్లింపు", bf_step_3: "అందించబడింది",
    bf_fee: "నివేదిక రుసుము", bf_coupon: "కూపన్", bf_total: "మొత్తం",
    bf_name: "పూర్తి పేరు", bf_name_ph: "జన్మ రికార్డుల ప్రకారం",
    bf_gender: "లింగం", bf_female: "స్త్రీ", bf_male: "పురుషుడు", bf_other: "ఇతర",
    bf_dob: "పుట్టిన తేదీ", bf_tob: "ఖచ్చితమైన జన్మ సమయం",
    bf_pob: "జన్మ స్థలం", bf_pob_ph: "నగరం, దేశం",
    bf_email: "ఇమెయిల్", bf_mobile: "మొబైల్ నంబర్",
    bf_coupon_q: "మీ వద్ద కూపన్ ఉందా?", bf_apply: "వర్తింపజేయండి",
    bf_continue: "చెల్లింపుకు కొనసాగించండి",
    bf_checkout_eyebrow: "చెక్‌అవుట్ · మాక్డ్ Razorpay",
    bf_confirm: "మీ చెల్లింపును నిర్ధారించండి",
    bf_mock_note: "ఈ వాతావరణంలో Razorpay ఇంటిగ్రేషన్ మాక్ చేయబడింది. క్రింద క్లిక్ చేయడం విజయవంతమైన చెక్‌అవుట్‌ను అనుకరిస్తుంది మరియు నివేదిక ఉత్పత్తిని ప్రేరేపిస్తుంది.",
    bf_order_id: "ఆర్డర్ ID", bf_amount: "మొత్తం",
    bf_pay: "చెల్లించండి", bf_processing: "ప్రాసెస్ అవుతోంది…",
    bf_ready_title: "మీ నివేదిక సిద్ధంగా ఉంది.",
    bf_ready_body: "మేము {email} కు PDF ప్రతిని పంపించాము (ఈ వాతావరణంలో మాక్) మరియు మీ డాష్‌బోర్డ్‌లో సేవ్ చేశాము.",
    bf_download: "PDF డౌన్‌లోడ్ చేయండి", bf_goto_dashboard: "డాష్‌బోర్డ్‌కు వెళ్ళండి",
    bf_signin_first: "కొనసాగించడానికి దయచేసి సైన్ ఇన్ చేయండి",

    login_eyebrow: "సైన్ ఇన్", login_title: "తిరిగి స్వాగతం.",
    login_sub: "Cosmic Hora తో మీ ప్రయాణాన్ని కొనసాగించండి.",
    login_new: "ఇక్కడ కొత్తవారా?", login_create: "ఖాతాను సృష్టించండి",
    login_submit: "సైన్ ఇన్",
    register_eyebrow: "మీ ప్రయాణం ప్రారంభించండి",
    register_title: "మీ ఖాతాను సృష్టించండి.",
    register_sub: "మీ నివేదికలను నిల్వ చేయండి, ఎప్పుడైనా తిరిగి చూడండి.",
    register_have: "ఇప్పటికే ఖాతా ఉందా?",
    register_submit: "ఖాతా సృష్టించండి",
    field_password: "పాస్‌వర్డ్",

    dash_eyebrow: "మీ ఆశ్రయం",
    dash_welcome: "స్వాగతం, {name}.",
    dash_reports: "మీ నివేదికలు",
    dash_order_another: "మరొకటి ఆర్డర్ చేయండి",
    dash_empty_title: "మీ గ్రంథాలయం ఖాళీగా ఉంది",
    dash_empty_body: "మా 15 నివేదిక రకాలలో దేనితోనైనా ప్రారంభించండి.",
    dash_browse: "నివేదికలను బ్రౌజ్ చేయండి",
    dash_pdf: "PDF",
    dash_pending: "చెల్లింపు పెండింగ్‌లో ఉంది",

    about_eyebrow: "మా కథ",
    about_title_1: "పురాతన కాంతి,", about_title_2: "సహనంతో అధ్యయనం చేయబడింది.",
    about_p1: "Cosmic Hora అనేది వైదిక జ్యోతిష కళకు అంకితమైన ఒక చిన్న స్టూడియో. మేము శాస్త్రీయ గ్రంథాలను — పరాశర, జైమిని, బృహత్ పరాశర హోరా శాస్త్రం — ఆధునిక కంప్యూటేషనల్ ఖగోళశాస్త్రం మరియు దశాబ్దాల వ్యాఖ్యాన సాహిత్యంపై శిక్షణ పొందిన భాషా నమూనాలతో సంయోగం చేస్తాము.",
    about_p2: "ఫలితం: రోబోట్ కాదు, చెక్క టేబుల్ ఆవల కూర్చున్న ఆలోచనాశీలుడైన జ్యోతిష్కుడు వ్రాసినట్టు చదవగలిగే నివేదికలు.",
    about_principles: "మా సూత్రాలు",
    about_principles_title: "మార్గదర్శక నక్షత్రాలు.",
    about_pr1_t: "సంప్రదాయానికి విశ్వాసం", about_pr1_d: "మేము సైడీరియల్ రాశి చక్రం మరియు శాస్త్రీయ దశలను ఉపయోగిస్తాము. షార్ట్‌కట్‌లు లేవు.",
    about_pr2_t: "గోప్యతకు గౌరవం", about_pr2_d: "మీ జన్మ వివరాలు ఎన్‌క్రిప్టెడ్‌గా ఉంటాయి మరియు ఎప్పుడూ మూడవ పార్టీతో పంచుకోబడవు.",
    about_pr3_t: "అందమైన రచన", about_pr3_d: "ప్రతి పేరా చదవడానికి, ఆలోచించడానికి మరియు ఉంచుకోవడానికి రచించబడింది.",
    about_begin: "మీ రీడింగ్‌ను ప్రారంభించండి.",
    about_choose_report: "నివేదికను ఎంచుకోండి",
    about_book: "జ్యోతిష్కుని బుక్ చేయండి",

    services_eyebrow: "సేవలు",
    services_title: "ఆకాశం చెప్పాలనుకున్నదంతా.",
    svc_1_t: "AI నివేదికలు", svc_1_d: "15 సంప్రదాయాల్లో తక్షణమే, PDF-అందించబడిన వైదిక నివేదికలు.",
    svc_2_t: "లైవ్ కన్సల్టేషన్లు", svc_2_d: "వరిష్ఠ జ్యోతిష్కునితో ప్రైవేట్ సెషన్ బుక్ చేయండి (త్వరలో వస్తుంది).",
    svc_3_t: "ముహూర్త ఎంపిక", svc_3_d: "వివాహాలు, ప్రారంభాలు మరియు ప్రయాణాలకు శుభ సమయాన్ని ఎంచుకోండి.",
    svc_4_t: "కస్టమ్ విశ్లేషణ", svc_4_d: "నిర్దిష్ట జీవిత ప్రశ్న అడగండి మరియు ప్రత్యేకమైన రీడింగ్ పొందండి.",

    pricing_eyebrow: "ధరలు",
    pricing_title: "న్యాయమైన, పారదర్శకమైన, కాలాతీతమైన.",
    pricing_sub: "ఒక నివేదికను కొనండి లేదా బండిల్‌ను ఎంచుకోండి. ఎప్పటికీ సబ్‌స్క్రిప్షన్‌లు లేవు.",
    pricing_essential: "ఎసెన్షియల్", pricing_insight: "ఇన్‌సైట్", pricing_complete: "కంప్లీట్ పథ్",
    pricing_choose: "ఎంచుకోండి",
    pricing_individual: "వ్యక్తిగత నివేదికలు",

    blog_eyebrow: "జర్నల్",
    blog_title: "నక్షత్రశాలా నుండి గమనికలు.",
    blog_read: "వ్యాసం చదవండి →",
    blog_back: "← జర్నల్‌కు తిరిగి",
    blog_not_found: "వ్యాసం కనుగొనబడలేదు.",
    loading: "లోడ్ అవుతోంది…",

    contact_eyebrow: "సంప్రదించండి",
    contact_title: "మాకు వ్రాయండి.",
    contact_sub: "నివేదిక గురించి, భాగస్వామ్య ఆలోచన లేదా ధన్యవాదాల నోట్ — మేము ప్రతి సందేశాన్ని జాగ్రత్తగా చదువుతాము.",
    contact_email_lbl: "ఇమెయిల్", contact_phone_lbl: "ఫోన్",
    field_name: "పేరు", field_email: "ఇమెయిల్",
    contact_subject: "విషయం", contact_message: "సందేశం",
    contact_send: "సందేశం పంపండి",
    contact_thanks: "ధన్యవాదాలు — మేము త్వరలో సంప్రదిస్తాము.",

    appt_eyebrow: "అపాయింట్‌మెంట్‌ను షెడ్యూల్ చేయండి",
    appt_title: "వరిష్ఠ జ్యోతిష్కునితో కూర్చోండి.",
    appt_sub: "ప్రైవేట్, 45-నిమిషాల సంభాషణలు అభ్యర్థనపై అందుబాటులో ఉన్నాయి. మేము ఇమెయిల్ ద్వారా మీ స్లాట్‌ను నిర్ధారిస్తాము.",
    appt_mobile: "మొబైల్",
    appt_date: "ఇష్టపడే తేదీ", appt_time: "ఇష్టపడే సమయం",
    appt_topic: "మీరు ఏమి చర్చించాలనుకుంటున్నారు?",
    appt_submit: "అపాయింట్‌మెంట్ అభ్యర్థించండి",
    appt_thanks: "అభ్యర్థించబడింది. మేము ఇమెయిల్ ద్వారా మీ స్లాట్‌ను నిర్ధారిస్తాము.",

    faq_eyebrow: "తరచుగా అడిగేవి",
    faq_title: "ప్రశ్నలు, సమాధానాలతో.",
    legal_eyebrow: "చట్టపరమైన",

    common_loading: "లోడ్ అవుతోంది…",
    common_saved: "సేవ్ చేయబడింది",
    common_deleted: "తొలగించబడింది",
    common_error: "ఏదో తప్పు జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి.",

    "rt.complete-horoscope.title": "సంపూర్ణ జాతకం",
    "rt.complete-horoscope.tagline": "ఖచ్చితమైన జీవితకాల చార్ట్ పఠనం.",
    "rt.marriage-compatibility.title": "వివాహ అనుకూలత",
    "rt.marriage-compatibility.tagline": "కుండలి మిలన్ & గుణ విశ్లేషణ.",
    "rt.career-analysis.title": "కెరీర్ విశ్లేషణ",
    "rt.career-analysis.tagline": "మీ వృత్తి ధర్మాన్ని కనుగొనండి.",
    "rt.finance-wealth.title": "ఆర్థిక & సంపద",
    "rt.finance-wealth.tagline": "ధన భావాలు, సమయం & పరిహారాలు.",
    "rt.business-success.title": "వ్యాపార విజయం",
    "rt.business-success.tagline": "ఉద్యమాలు మరియు భాగస్వామ్యాల సమయం.",
    "rt.education.title": "విద్య",
    "rt.education.tagline": "అధ్యయనం, ఏకాగ్రత మరియు ఉన్నత విద్య.",
    "rt.health.title": "ఆరోగ్యం",
    "rt.health.tagline": "శరీరం, మనస్సు మరియు నివారణ.",
    "rt.foreign-settlement.title": "విదేశ నివాసం",
    "rt.foreign-settlement.tagline": "ప్రవాస సమయం & అవకాశం.",
    "rt.love-relationships.title": "ప్రేమ & సంబంధాలు",
    "rt.love-relationships.tagline": "శుక్ర, సమయం మరియు కర్మ బంధాలు.",
    "rt.child-birth.title": "సంతాన ప్రాప్తి",
    "rt.child-birth.tagline": "సంతాన యోగం మరియు సమయం.",
    "rt.muhurta.title": "ముహూర్తం",
    "rt.muhurta.tagline": "కార్యక్రమాలకు శుభ సమయం.",
    "rt.yearly-predictions.title": "వార్షిక అంచనాలు",
    "rt.yearly-predictions.tagline": "12-నెల వ్యక్తిగతీకరించిన అంచనా.",
    "rt.monthly-predictions.title": "మాసిక అంచనాలు",
    "rt.monthly-predictions.tagline": "ఈ నెల యొక్క విశ్వ వాతావరణం.",
    "rt.numerology.title": "సంఖ్యాశాస్త్రం",
    "rt.numerology.tagline": "మీ పేరు మరియు జన్మ వెనుక ఉన్న సంఖ్యలు.",
    "rt.custom-report.title": "కస్టమ్ నివేదిక",
    "rt.custom-report.tagline": "నిర్దిష్ట ప్రశ్నను అడగండి.",
  },
};

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("ch_lang") || "en");

  useEffect(() => {
    localStorage.setItem("ch_lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key, vars) => {
    const raw = (DICT[lang] && DICT[lang][key]) || DICT.en[key] || key;
    if (!vars) return raw;
    return Object.keys(vars).reduce(
      (acc, k) => acc.replace(new RegExp(`\\{${k}\\}`, "g"), vars[k]),
      raw,
    );
  };

  // Translate a report-type record: prefer localized keys, fall back to the
  // raw DB value. Slug-based, so admins don't need to translate anything.
  const tReport = (r) => {
    if (!r) return r;
    return {
      ...r,
      title: t(`rt.${r.slug}.title`) !== `rt.${r.slug}.title` ? t(`rt.${r.slug}.title`) : r.title,
      tagline: t(`rt.${r.slug}.tagline`) !== `rt.${r.slug}.tagline` ? t(`rt.${r.slug}.tagline`) : r.tagline,
    };
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t, tReport, langs: LANGS }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
