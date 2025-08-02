/**
 * Comprehensive translations system for Leben in Deutschland app
 * 
 * Features:
 * - Multi-language support (EN, DE, TR) with easy extensibility
 * - Hierarchical organization by feature/component
 * - Dynamic content support (dates, counts, etc.)
 * - Fallback system for missing translations
 * - Type safety helpers
 */

// Helper function to get current month and year
const getCurrentMonthYear = (language = 'EN') => {
  const now = new Date();
  const year = now.getFullYear();

  const monthNames = {
    EN: ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'],
    DE: ["Januar", "Februar", "März", "April", "Mai", "Juni",
      "Juli", "August", "September", "Oktober", "November", "Dezember"],
    TR: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
      "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"],
    FR: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
    ES: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
  };

  const month = monthNames[language]?.[now.getMonth()] || monthNames['EN'][now.getMonth()];
  return `${month} ${year}`;
};

// Base translations structure - easily extensible for new languages
export const translations = {
  EN: {
    // App Identity
    app_name: "Leben in Deutschland",
    title: "LiD/Naturalisation Exam Preparation",
    subtitle: "Master your German citizenship test",
    subtitle_description: () => `German Citizenship Test Preparation\n${getCurrentMonthYear('EN')}`,
    
    // Navigation & Menu
    nav_all: "🏠 All Questions",
    nav_state: "🗺️ By State", 
    nav_test: "🎯 Test Simulator",
    nav_marked: "📚 Bookmarked",
    nav_incorrect: "❌ Incorrectly answered",
    nav_support: "💝 Support",
    
    // Common Actions
    start: "Start",
    next: "Next",
    previous: "Previous", 
    submit: "Submit",
    cancel: "Cancel",
    ok: "OK",
    yes: "Yes",
    no: "No",
    close: "Close",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    refresh: "Refresh",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    
    // Question Interface
    question: "Question",
    of: "of",
    answer: "Answer",
    check_answer: "✅ Check Answer",
    your_answer: "Your answer",
    correct_answer: "Correct answer",
    not_answered: "Not answered",
    answered: "Answered",
    unanswered: "Unanswered",
    correct: "Correct",
    incorrect: "Incorrect",
    correct_result: "Correct!",
    incorrect_result: "Incorrect",
    
    // Bookmarks
    bookmark: "Bookmark",
    remove_bookmark: "Remove bookmark",
    bookmarked: "Bookmarked",
    bookmarked_questions_title: "Bookmarked Questions",
    bookmarked_questions_desc: "Review your saved questions for focused learning",
    no_bookmarked_questions: "No bookmarked questions",
    no_bookmarked_questions_title: "No Bookmarked Questions",
    no_bookmarked_questions_desc: "You haven't bookmarked any questions yet.",
    explore_questions: "Explore Questions",
    clear_all_bookmarks: "Clear All Bookmarks",
    
    // Test Simulator
    test_simulator_title: "Leben in Deutschland Test Simulator",
    test_simulator_desc: "Practice the official German citizenship test",
    practice_test_mode: "Practice Test Mode",
    test_sim_start_button: "🚀 Start Test",
    select_state: "🏛️ Select your Federal State:",
    test_information: "Test Information",
    test_33_questions: "33 questions (30 general + 3 state-specific)",
    test_17_correct: "17 correct answers needed to pass",
    test_pass_requirement: "Minimum of 17 correct answers required",
    test_60_minutes: "60 minutes time limit",
    select_bundesland: "Select Your Bundesland",
    start_test: "Start Test",
    generating_test: "Generating Test...",
    submit_test: "Submit Test",
    reset_test: "Reset Test",
    test_completed: "Test Completed",
    time_remaining: "Time Remaining",
    time_left: "Time Left",
    progress: "Progress",
    question_progress: "Question Progress",
    current: "Current",
    test_results: "Test Results",
    congratulations_passed: "Congratulations! You Passed!",
    test_not_passed: "Test Not Passed",
    test_passed_desc: "You have successfully completed the Leben in Deutschland test!",
    test_failed_desc: "Keep studying and try again!",
    take_another_test: "Take Another Test",
    state: "State",
    
    // Support Page
    support_title: "Support",
    support_me: "Support Me",
    support_desc: "If this app has helped you, I'd appreciate your support!",
    payment_methods: "Payment Methods",
    buy_me_coffee: "Buy me a coffee",
    buy_me_coffee_desc: "Support the development of this app",
    coffee_desc: "For daily caffeine boost",
    help_maintain_website: "Help maintain website",
    maintenance_desc: "Server & updates",
    beer_party: "Beer party",
    party_desc: "Celebrate with me!",
    
    // PayPal & Ko-fi
    paypal_support_options: 'PayPal Support Options',
    kofi_support: 'Ko-fi Support',
    support_on_kofi: 'Support on Ko-fi',
    kofi_note: 'Ko-fi is a simple way to support creators. Choose any amount you would like to contribute.',
    
    // Bank Transfer
    bank_transfer_details: '💳 Bank Transfer Details',
    account_holder: 'Account Holder:',
    iban: 'IBAN:',
    reference: 'Reference:',
    
    // Cryptocurrency
    cryptocurrency_payment: 'Cryptocurrency Payment',
    bitcoin_label: 'Bitcoin (BTC)',
    ethereum_label: 'Ethereum (ETH)',
    crypto_note: 'Send any amount equivalent to your desired support level',
    
    // Study & Learning
    study_options: "Study Options",
    study_tips: "Study Tips",
    statistics: "Statistics",
    questions_done: "Questions Done",
    to_review: "To Review",
    
    // UI & System
    go_back: "Go back",
    change_language: "Change language",
    toggle_theme: "Toggle theme",
    copied: "Copied!",
    copied_to_clipboard: "copied to clipboard",
    hide: "Hide",
    translate: "Translate",
    show: "Show",
    
    // Empty States & Messages
    no_questions_available: "No Questions Available",
    good_luck_message: "Good luck with your German citizenship test!",
    you_got_this: "You've got this! 💪",
    
    // Incorrect answers screen
    incorrect_title: "Incorrect Answers",
    incorrect_empty_title: "No Incorrect Answers Yet!",
    incorrect_empty_desc: "You haven't answered any questions incorrectly yet. Keep practicing!",
    practice_questions: "Practice Questions",
    
    // Accessibility
    view_questions_overview: "View questions overview",
    view_bookmarked_questions: "View bookmarked questions",
    view_questions_to_review: "View questions to review",
    
    // Questions Overview
    questions_overview: "Questions Overview",
    overview_desc: "Visual grid showing all 300 questions progress",
    
    // Missing keys from original translations
    all_questions_title: "All 300 Questions",
    all_300_questions: "All 300 Questions Overview",
    all_questions_desc: "Browse through all the general questions to prepare.",
    state_questions_title: "Questions by State",
    state_questions_desc: "Select your federal state to practice the specific questions.",
    test_sim_desc: "Start a simulated test with 33 random questions. You need to answer at least 17 questions correctly to pass.",
    marked_desc: "Here are all the questions you have marked for later review.",
    incorrect_desc: "Here are all the questions you answered incorrectly. Practice them again!",
    questions: "📝 Questions",
    start_with_all_questions: "Start with All Questions",
    start_with_all_questions_desc: "Get familiar with the question format and topics",
    bookmark_difficult_ones: "Bookmark Difficult Ones",
    bookmark_difficult_ones_desc: "Save questions you find challenging for later review",
    take_practice_tests: "Take Practice Tests",
    take_practice_tests_desc: "Simulate the real exam with timed 33-question tests",
    // Support options
    bug_fixes: "Bug fixes",
    quick_responses: "Quick responses",
    new_features: "New features",
    priority_support: "Priority support",
    major_improvements: "Major improvements",
    long_term_sustainability: "Long-term sustainability",
    special_thanks: "Special thanks",
    premium: "Premium",
    international: "International",
    powered_by_paypal: "Powered by PayPal",
    bank_transfer: "Bank Transfer",
    credit_card: "Credit Card",
    cryptocurrency: "Cryptocurrency",
    kofi: "Ko-fi",
    kofi_desc: "Support creators",
    sepa_no_fees: "SEPA - No fees",
    visa_mastercard: "Visa, Mastercard",
    btc_eth: "BTC, ETH",
    popular: "Popular",
    secure_payment: "Secure Payment",
    no_fees: "No fees",
    instant_germany: "Instant in Germany",
    // Keep it free section
    why_support_matters: "🎯 Why Your Support Matters",
    keep_it_free: "Keep It Free",
    keep_it_free_desc: "Your support ensures this remains a free resource for all learners",
    regular_updates: "Regular Updates",
    regular_updates_desc: "Continuous improvements and new features based on user feedback",
    better_experience: "Better Experience",
    better_experience_desc: "Enhanced user interface and faster performance improvements",
    thank_you_title: "Thank You! 🙏",
    thank_you_desc: "Every contribution, no matter the size, helps keep this app running and improving. Your support makes a real difference in helping people achieve their German citizenship dreams.",
    choose_support_amount: "Choose Support Amount:",
    
    // Settings
    settings: "Settings",
    preferences: "Preferences",
    language: "Language",
    dark_mode: "Dark Mode",
    dark_mode_desc: "Switch between light and dark theme",
    notifications: "Notifications",
    notifications_desc: "Receive study reminders and updates",
    bookmarked_questions: "Bookmarked Questions",
    incorrect_answers: "Incorrect Answers",
    correct_answers: "Correct Answers",
    clear_bookmarks: "Clear Bookmarks",
    clear_bookmarks_desc: "Clear all bookmarked questions",
    clear_incorrect_answers: "Clear Incorrect Answers",
    clear_incorrect_answers_desc: "Clear all incorrectly answered questions",
    clear_correct_answers: "Clear Correct Answers",
    clear_correct_answers_desc: "Clear all correctly answered questions",
    privacy: "Privacy",
    privacy_policy: "Privacy Policy",
    privacy_policy_desc: "Learn how we protect your data",
    terms_of_service: "Terms of Service",
    terms_of_service_desc: "Read our terms and conditions",
    data_usage: "Data Usage",
    data_usage_desc: "See what data we collect",
    support_donate: "Support & Donate",
    buy_me_a_coffee: "Buy Me a Coffee",
    buy_me_a_coffee_desc: "Support the development of this app",
    rate_app: "Rate the App",
    rate_app_desc: "Help others discover this app",
    contact_support: "Contact Support",
    contact_support_desc: "Get help or send feedback",
    developer_tools: "Developer Tools",
    developer_warning: "These actions cannot be undone",
    reset_all_data: "Reset All Data",
    reset_all_data_desc: "Clear everything and start fresh",
    debug_info: "Debug Info",
    debug_info_desc: "View app version and debug information",
    
    // Terms of Service
    terms_of_service_title: "Terms of Service",
    terms_of_service_subtitle: "Please read these terms carefully before using our citizenship test preparation app",
    terms_last_updated: "Last updated: December 2024",
    terms_quick_nav_overview: "Overview",
    terms_quick_nav_privacy: "Privacy",
    terms_quick_nav_contact: "Contact",
    
    // Section 1: Acceptance of Terms
    terms_acceptance_title: "Acceptance of Terms",
    terms_acceptance_content: "By using this mobile app, you agree to these terms of service. If you disagree, please do not use the app.",
    
    // Section 2: Service Description
    terms_service_title: "Service Description",
    terms_service_content: "Our mobile app provides free preparation for the German citizenship test with the following features:",
    terms_service_features: [
      "All 300 official BAMF questions",
      "Test simulator with realistic conditions",
      "State-specific questions",
      "Progress tracking and bookmarks",
      "Multi-language support"
    ],
    terms_service_source: "All questions in this app are sourced directly from the official BAMF question catalog:",
    terms_bamf_catalog_title: "BAMF Official Question Catalog",
    terms_bamf_catalog_url: "www.bamf.de/SharedDocs/Anlagen/DE/Integration/Einbuergerung/gesamtfragenkatalog-lebenindeutschland.html",
    terms_regular_updates_title: "Regular Updates",
    terms_regular_updates_content: "We regularly update our question database to ensure it matches the official BAMF version.",
    terms_source_pdf_title: "Source PDF Date",
    terms_source_pdf_date: "PDF version from: 07.05.2025",
    
    // Section 3: Disclaimers
    terms_disclaimers_title: "Disclaimers",
    terms_disclaimer_educational_title: "Educational Purpose",
    terms_disclaimer_educational_content: "This mobile app is for educational purposes only and is not officially affiliated with BAMF.",
    terms_disclaimer_guarantee_title: "No Success Guarantee",
    terms_disclaimer_guarantee_content: "We do not guarantee that using this mobile app will result in passing the official test.",
    terms_disclaimer_accuracy_title: "Content Accuracy",
    terms_disclaimer_accuracy_content: "While we strive to provide accurate information, we cannot guarantee completeness or accuracy.",
    
    // Section 4: Limitation of Liability
    terms_liability_title: "Limitation of Liability",
    terms_liability_content: "We are not liable for direct, indirect, or consequential damages arising from the use of this mobile app.",
    
    // Section 5: Changes to Terms
    terms_changes_title: "Changes to Terms",
    terms_changes_content: "We reserve the right to modify these terms of service at any time. Changes will be posted on this page.",
    
    // Section 6: Contact Us
    terms_contact_title: "Contact Us",
    terms_contact_content: "For questions about these terms of service, contact us:",
    terms_contact_email: "support@einbuergerungstest-fragen24.de",
  },
  
  DE: {
    // App Identity
    app_name: "Leben in Deutschland",
    title: "LiD/Einbürgerung Prüfungsvorbereitung",
    subtitle: "Meistern Sie Ihren deutschen Einbürgerungstest",
    subtitle_description: () => `Deutsche Einbürgerungstest Vorbereitung\n${getCurrentMonthYear('DE')}`,
    
    // Navigation & Menu
    nav_all: "🏠 Alle Fragen",
    nav_state: "🗺️ Nach Bundesland",
    nav_test: "🎯 Test-Simulator",
    nav_marked: "📚 Gemerkte Fragen",
    nav_incorrect: "❌ Falsch beantwortet",
    nav_support: "💝 Unterstützen",
    
    // Common Actions
    start: "Starten",
    next: "Weiter",
    previous: "Zurück",
    submit: "Einreichen",
    cancel: "Abbrechen",
    ok: "OK",
    yes: "Ja",
    no: "Nein",
    close: "Schließen",
    save: "Speichern",
    delete: "Löschen",
    edit: "Bearbeiten",
    refresh: "Aktualisieren",
    loading: "Laden...",
    error: "Fehler",
    success: "Erfolg",
    
    // Question Interface
    question: "Frage",
    of: "von",
    answer: "Antwort",
    check_answer: "✅ Antwort prüfen",
    your_answer: "Ihre Antwort",
    correct_answer: "Richtige Antwort",
    not_answered: "Nicht beantwortet",
    answered: "Beantwortet",
    unanswered: "Unbeantwortet",
    correct: "Richtig",
    incorrect: "Falsch",
    correct_result: "Richtig!",
    incorrect_result: "Falsch",
    
    // Bookmarks
    bookmark: "Lesezeichen",
    remove_bookmark: "Lesezeichen entfernen",
    bookmarked: "Gemerkt",
    bookmarked_questions_title: "Gemerkte Fragen",
    bookmarked_questions_desc: "Überprüfen Sie Ihre gespeicherten Fragen für fokussiertes Lernen",
    no_bookmarked_questions: "Keine gemerkten Fragen",
    no_bookmarked_questions_title: "Keine gemerkten Fragen",
    no_bookmarked_questions_desc: "Sie haben noch keine Fragen markiert.",
    explore_questions: "Fragen erkunden",
    clear_all_bookmarks: "Alle Lesezeichen löschen",
    
    // Test Simulator
    test_simulator_title: "Leben in Deutschland Test Simulator",
    test_simulator_desc: "Üben Sie den offiziellen deutschen Einbürgerungstest",
    practice_test_mode: "Übungs-Testmodus",
    test_sim_start_button: "🚀 Test starten",
    select_state: "🏛️ Wählen Sie Ihr Bundesland:",
    test_information: "Testinformationen",
    test_33_questions: "33 Fragen (30 allgemeine + 3 bundeslandspezifische)",
    test_17_correct: "17 richtige Antworten zum Bestehen erforderlich",
    test_pass_requirement: "Minimum 17 richtige Antworten erforderlich",
    test_60_minutes: "60 Minuten Zeitlimit",
    select_bundesland: "Wählen Sie Ihr Bundesland",
    start_test: "Test starten",
    generating_test: "Test wird generiert...",
    submit_test: "Test einreichen",
    reset_test: "Test zurücksetzen",
    test_completed: "Test abgeschlossen",
    time_remaining: "Verbleibende Zeit",
    time_left: "Verbleibende Zeit",
    progress: "Fortschritt",
    question_progress: "Fragenfortschritt",
    current: "Aktuell",
    test_results: "Testergebnisse",
    congratulations_passed: "Herzlichen Glückwunsch! Sie haben bestanden!",
    test_not_passed: "Test nicht bestanden",
    test_passed_desc: "Sie haben den Leben in Deutschland Test erfolgreich abgeschlossen!",
    test_failed_desc: "Lernen Sie weiter und versuchen Sie es erneut!",
    take_another_test: "Einen weiteren Test machen",
    state: "Bundesland",
    
    // Support Page
    support_title: "Unterstützung",
    support_me: "Unterstütze mich",
    support_desc: "Wenn dir diese App geholfen hat, würde ich mich über deine Unterstützung freuen!",
    payment_methods: "Zahlungsmethoden",
    buy_me_coffee: "Kauf mir einen Kaffee",
    buy_me_coffee_desc: "Unterstützen Sie die Entwicklung dieser App",
    coffee_desc: "Für den täglichen Koffein-Kick",
    help_maintain_website: "Website-Wartung helfen",
    maintenance_desc: "Server & Updates",
    beer_party: "Bier-Party",
    party_desc: "Feier mit mir!",
    
    // PayPal & Ko-fi
    paypal_support_options: 'PayPal Unterstützungsoptionen',
    kofi_support: 'Ko-fi Unterstützung',
    support_on_kofi: 'Unterstützen auf Ko-fi',
    kofi_note: 'Ko-fi ist eine einfache Möglichkeit, Kreative zu unterstützen. Wählen Sie einen beliebigen Betrag.',
    
    // Bank Transfer
    bank_transfer_details: '💳 Banküberweisungsdetails',
    account_holder: 'Kontoinhaber:',
    iban: 'IBAN:',
    reference: 'Verwendungszweck:',
    
    // Cryptocurrency
    cryptocurrency_payment: 'Kryptowährungszahlung',
    bitcoin_label: 'Bitcoin (BTC)',
    ethereum_label: 'Ethereum (ETH)',
    crypto_note: 'Senden Sie jeden Betrag entsprechend Ihrer gewünschten Unterstützung.',
    
    // Study & Learning
    study_options: "Lernoptionen",
    study_tips: "Lerntipps",
    statistics: "Statistiken",
    questions_done: "Fragen bearbeitet",
    to_review: "Zu überprüfen",
    
    // UI & System
    go_back: "Zurück gehen",
    change_language: "Sprache ändern",
    toggle_theme: "Design wechseln",
    copied: "Kopiert!",
    copied_to_clipboard: "in die Zwischenablage kopiert",
    hide: "Verstecken",
    translate: "Übersetzen",
    show: "Anzeigen",
    
    // Empty States & Messages
    no_questions_available: "Keine Fragen verfügbar",
    good_luck_message: "Viel Erfolg bei Ihrem deutschen Einbürgerungstest!",
    you_got_this: "Sie schaffen das! 💪",
    
    // Incorrect answers screen
    incorrect_title: "Falsche Antworten",
    incorrect_empty_title: "Noch keine falschen Antworten!",
    incorrect_empty_desc: "Sie haben noch keine Fragen falsch beantwortet. Weiter so!",
    practice_questions: "Übungsfragen",
    
    // Accessibility
    view_questions_overview: "Fragenübersicht anzeigen",
    view_bookmarked_questions: "Gemerkte Fragen anzeigen",
    view_questions_to_review: "Zu überprüfende Fragen anzeigen",
    
    // Questions Overview
    questions_overview: "Fragen-Übersicht",
    overview_desc: "Visuelles Raster zeigt alle 300 Fragen Fortschritt",
    
    // Missing keys from original translations
    all_questions_title: "Alle 300 Fragen",
    all_300_questions: "Übersicht aller 300 Fragen",
    all_questions_desc: "Blättern Sie durch alle allgemeinen Fragen, um sich vorzubereiten.",
    state_questions_title: "Fragen nach Bundesland",
    state_questions_desc: "Wählen Sie Ihr Bundesland, um die spezifischen Fragen zu üben.",
    test_sim_desc: "Starten Sie einen simulierten Test mit 33 zufälligen Fragen. Sie müssen mindestens 17 Fragen richtig beantworten, um zu bestehen.",
    marked_desc: "Hier finden Sie alle Fragen, die Sie zur späteren Wiederholung markiert haben.",
    incorrect_desc: "Hier sind alle Fragen, die Sie falsch beantwortet haben. Üben Sie sie erneut!",
    questions: "📝 Fragen",
    start_with_all_questions: "Beginnen Sie mit allen Fragen",
    start_with_all_questions_desc: "Machen Sie sich mit dem Fragenformat und den Themen vertraut",
    bookmark_difficult_ones: "Schwierige Fragen merken",
    bookmark_difficult_ones_desc: "Speichern Sie herausfordernde Fragen für spätere Wiederholung",
    take_practice_tests: "Übungstests machen",
    take_practice_tests_desc: "Simulieren Sie die echte Prüfung mit zeitlich begrenzten 33-Fragen-Tests",
    // Support options
    bug_fixes: "Fehlerbehebungen",
    quick_responses: "Schnelle Antworten",
    new_features: "Neue Funktionen",
    priority_support: "Priorisierte Unterstützung",
    major_improvements: "Wichtige Verbesserungen",
    long_term_sustainability: "Langfristige Nachhaltigkeit",
    special_thanks: "Besonderer Dank",
    premium: "Premium",
    international: "International",
    powered_by_paypal: "Powered by PayPal",
    bank_transfer: "Banküberweisung",
    credit_card: "Kreditkarte",
    cryptocurrency: "Kryptowährung",
    kofi: "Ko-fi",
    kofi_desc: "Unterstütze Kreative",
    sepa_no_fees: "SEPA - Keine Gebühren",
    visa_mastercard: "Visa, Mastercard",
    btc_eth: "BTC, ETH",
    popular: "Beliebt",
    secure_payment: "Sichere Zahlung",
    no_fees: "Keine Gebühren",
    instant_germany: "Sofort in Deutschland",
    // Keep it free section
    why_support_matters: "🎯 Warum Ihre Unterstützung zählt",
    keep_it_free: "Kostenlos halten",
    keep_it_free_desc: "Ihre Unterstützung sorgt dafür, dass dies eine kostenlose Ressource für alle Lernenden bleibt.",
    regular_updates: "Regelmäßige Updates",
    regular_updates_desc: "Kontinuierliche Verbesserungen und neue Funktionen basierend auf Nutzerfeedback.",
    better_experience: "Besseres Erlebnis",
    better_experience_desc: "Verbesserte Benutzeroberfläche und schnellere Leistungsverbesserungen.",
    thank_you_title: "Danke! 🙏",
    thank_you_desc: "Jeder Beitrag, egal wie groß, hilft, diese App am Laufen und Verbessern zu halten. Ihre Unterstützung macht einen echten Unterschied für Menschen, die ihren deutschen Einbürgerungstraum verwirklichen möchten.",
    choose_support_amount: "Unterstützungsbetrag wählen:",
    
    // Settings
    settings: "Einstellungen",
    preferences: "Einstellungen",
    language: "Sprache",
    dark_mode: "Dunkler Modus",
    dark_mode_desc: "Zwischen hellem und dunklem Design wechseln",
    notifications: "Benachrichtigungen",
    notifications_desc: "Lernerinnerungen und Updates erhalten",
    bookmarked_questions: "Gemerkte Fragen",
    incorrect_answers: "Falsche Antworten",
    correct_answers: "Richtige Antworten",
    clear_bookmarks: "Lesezeichen löschen",
    clear_bookmarks_desc: "Alle gemerkten Fragen löschen",
    clear_incorrect_answers: "Falsche Antworten löschen",
    clear_incorrect_answers_desc: "Alle falsch beantworteten Fragen löschen",
    clear_correct_answers: "Richtige Antworten löschen",
    clear_correct_answers_desc: "Alle richtig beantworteten Fragen löschen",
    privacy: "Datenschutz",
    privacy_policy: "Datenschutzrichtlinie",
    privacy_policy_desc: "Erfahren Sie, wie wir Ihre Daten schützen",
    terms_of_service: "Nutzungsbedingungen",
    terms_of_service_desc: "Lesen Sie unsere Geschäftsbedingungen",
    data_usage: "Datenverwendung",
    data_usage_desc: "Sehen Sie, welche Daten wir sammeln",
    support_donate: "Unterstützung & Spenden",
    buy_me_a_coffee: "Kauf mir einen Kaffee",
    buy_me_a_coffee_desc: "Unterstützen Sie die Entwicklung dieser App",
    rate_app: "App bewerten",
    rate_app_desc: "Helfen Sie anderen, diese App zu entdecken",
    contact_support: "Support kontaktieren",
    contact_support_desc: "Hilfe erhalten oder Feedback senden",
    developer_tools: "Entwickler-Tools",
    developer_warning: "Diese Aktionen können nicht rückgängig gemacht werden",
    reset_all_data: "Alle Daten zurücksetzen",
    reset_all_data_desc: "Alles löschen und neu anfangen",
    debug_info: "Debug-Informationen",
    debug_info_desc: "App-Version und Debug-Informationen anzeigen",
    
    // Terms of Service
    terms_of_service_title: "Nutzungsbedingungen",
    terms_of_service_subtitle: "Bitte lesen Sie diese Bedingungen sorgfältig durch, bevor Sie unsere App zur Vorbereitung auf den Einbürgerungstest verwenden",
    terms_last_updated: "Zuletzt aktualisiert: Dezember 2024",
    terms_quick_nav_overview: "Übersicht",
    terms_quick_nav_privacy: "Datenschutz",
    terms_quick_nav_contact: "Kontakt",
    
    // Section 1: Acceptance of Terms
    terms_acceptance_title: "Annahme der Bedingungen",
    terms_acceptance_content: "Durch die Nutzung dieser mobilen App stimmen Sie diesen Nutzungsbedingungen zu. Wenn Sie nicht einverstanden sind, verwenden Sie die App bitte nicht.",
    
    // Section 2: Service Description
    terms_service_title: "Servicebeschreibung",
    terms_service_content: "Unsere mobile App bietet kostenlose Vorbereitung auf den deutschen Einbürgerungstest mit folgenden Funktionen:",
    terms_service_features: [
      "Alle 300 offiziellen BAMF-Fragen",
      "Test-Simulator mit realistischen Bedingungen",
      "Bundeslandspezifische Fragen",
      "Fortschrittsverfolgung und Lesezeichen",
      "Mehrsprachige Unterstützung"
    ],
    terms_service_source: "Alle Fragen in dieser App stammen direkt aus dem offiziellen BAMF-Fragenkatalog:",
    terms_bamf_catalog_title: "BAMF Offizieller Fragenkatalog",
    terms_bamf_catalog_url: "www.bamf.de/SharedDocs/Anlagen/DE/Integration/Einbuergerung/gesamtfragenkatalog-lebenindeutschland.html",
    terms_regular_updates_title: "Regelmäßige Updates",
    terms_regular_updates_content: "Wir aktualisieren unsere Fragendatenbank regelmäßig, um sicherzustellen, dass sie der offiziellen BAMF-Version entspricht.",
    terms_source_pdf_title: "Quell-PDF-Datum",
    terms_source_pdf_date: "PDF-Version vom: 07.05.2025",
    
    // Section 3: Disclaimers
    terms_disclaimers_title: "Haftungsausschlüsse",
    terms_disclaimer_educational_title: "Bildungszweck",
    terms_disclaimer_educational_content: "Diese mobile App dient nur Bildungszwecken und ist nicht offiziell mit dem BAMF verbunden.",
    terms_disclaimer_guarantee_title: "Keine Erfolgsgarantie",
    terms_disclaimer_guarantee_content: "Wir garantieren nicht, dass die Nutzung dieser mobilen App zum Bestehen der offiziellen Prüfung führt.",
    terms_disclaimer_accuracy_title: "Inhaltsgenauigkeit",
    terms_disclaimer_accuracy_content: "Obwohl wir uns bemühen, genaue Informationen bereitzustellen, können wir keine Vollständigkeit oder Genauigkeit garantieren.",
    
    // Section 4: Limitation of Liability
    terms_liability_title: "Haftungsbeschränkung",
    terms_liability_content: "Wir haften nicht für direkte, indirekte oder Folgeschäden, die durch die Nutzung dieser mobilen App entstehen.",
    
    // Section 5: Changes to Terms
    terms_changes_title: "Änderungen der Bedingungen",
    terms_changes_content: "Wir behalten uns das Recht vor, diese Nutzungsbedingungen jederzeit zu ändern. Änderungen werden auf dieser Seite veröffentlicht.",
    
    // Section 6: Contact Us
    terms_contact_title: "Kontaktieren Sie uns",
    terms_contact_content: "Bei Fragen zu diesen Nutzungsbedingungen kontaktieren Sie uns:",
    terms_contact_email: "support@einbuergerungstest-fragen24.de",
  },
  
  TR: {
    // App Identity
    app_name: "Leben in Deutschland",
    title: "LiD/Vatandaşlık Sınavı Hazırlığı",
    subtitle: "Almanya vatandaşlık sınavınızı başarıyla geçin",
    subtitle_description: () => `Almanya Vatandaşlık Testi Hazırlığı\n${getCurrentMonthYear('TR')}`,
    
    // Navigation & Menu
    nav_all: "🏠 Tüm Sorular",
    nav_state: "🗺️ Eyalet Bazında",
    nav_test: "🎯 Test Simülatörü",
    nav_marked: "📚 İşaretlenenler",
    nav_incorrect: "❌ Yanlış cevaplanan",
    nav_support: "💝 Destek",
    
    // Common Actions
    start: "Başlat",
    next: "Sonraki",
    previous: "Önceki",
    submit: "Gönder",
    cancel: "İptal",
    ok: "Tamam",
    yes: "Evet",
    no: "Hayır",
    close: "Kapat",
    save: "Kaydet",
    delete: "Sil",
    edit: "Düzenle",
    refresh: "Yenile",
    loading: "Yükleniyor...",
    error: "Hata",
    success: "Başarılı",
    
    // Question Interface
    question: "Soru",
    of: "den",
    answer: "Cevap",
    check_answer: "✅ Cevabı Kontrol Et",
    your_answer: "Cevabınız",
    correct_answer: "Doğru Cevap",
    not_answered: "Cevaplanmadı",
    answered: "Cevaplandı",
    unanswered: "Cevaplanmadı",
    correct: "Doğru",
    incorrect: "Yanlış",
    correct_result: "Doğru!",
    incorrect_result: "Yanlış",
    
    // Bookmarks
    bookmark: "İşaretle",
    remove_bookmark: "İşaretçiyi Kaldır",
    bookmarked: "İşaretlendi",
    bookmarked_questions_title: "İşaretlenen Sorular",
    bookmarked_questions_desc: "Kaydettiğiniz soruları gözden geçirin",
    no_bookmarked_questions: "İşaretlenen soru yok",
    no_bookmarked_questions_title: "İşaretlenen Soru Yok",
    no_bookmarked_questions_desc: "Henüz hiçbir soruyu işaretlemediniz.",
    explore_questions: "Soruları Keşfet",
    clear_all_bookmarks: "Tüm İşaretleri Temizle",
    
    // Test Simulator
    test_simulator_title: "Leben in Deutschland Test Simülatörü",
    test_simulator_desc: "Resmi Alman vatandaşlık testini çalışın",
    practice_test_mode: "Pratik Test Modu",
    test_sim_start_button: "🚀 Testi Başlat",
    select_state: "🏛️ Eyaletinizi seçin:",
    test_information: "Test Bilgileri",
    test_33_questions: "33 soru (30 genel + 3 eyalet spesifik)",
    test_17_correct: "Geçmek için 17 doğru cevap gereklidir",
    test_pass_requirement: "Minimum 17 doğru cevap gerekli",
    test_60_minutes: "60 dakika zaman sınırı",
    select_bundesland: "Bundesland Seçin",
    start_test: "Testi Başlat",
    generating_test: "Test oluşturuluyor...",
    submit_test: "Testi Gönder",
    reset_test: "Testi Sıfırla",
    test_completed: "Test Tamamlandı",
    time_remaining: "Kalan Süre",
    time_left: "Kalan Süre",
    progress: "İlerleme",
    question_progress: "Soru İlerlemesi",
    current: "Şu anki",
    test_results: "Test Sonuçları",
    congratulations_passed: "Tebrikler! Geçtiniz!",
    test_not_passed: "Test Geçilemedi",
    test_passed_desc: "Leben in Deutschland testini başarıyla tamamladınız!",
    test_failed_desc: "Çalışmaya devam edin ve tekrar deneyin!",
    take_another_test: "Başka Bir Test Yap",
    state: "Eyalet",
    
    // Support Page
    support_title: "Destek",
    support_me: "Destek Ol",
    support_desc: "Bu uygulama size yardımcı olduysa, desteğinizi beklerim!",
    payment_methods: "Ödeme Yöntemleri",
    buy_me_coffee: "Bana bir kahve al",
    buy_me_coffee_desc: "Bu uygulamanın geliştirilmesini destekleyin",
    coffee_desc: "Günlük kafein takviyesi için",
    help_maintain_website: "Web Sitesini Koruma Yardımı",
    maintenance_desc: "Sunucu & Güncellemeler",
    beer_party: "Bira Partisi",
    party_desc: "Benimle kutla!",
    
    // PayPal & Ko-fi
    paypal_support_options: 'PayPal Destek Seçenekleri',
    kofi_support: 'Ko-fi Destek',
    support_on_kofi: 'Ko-fi üzerinden destek ol',
    kofi_note: 'Ko-fi, yaratıcıları desteklemenin kolay bir yoludur. İstediğiniz miktarı seçin.',
    
    // Bank Transfer
    bank_transfer_details: '💳 Banka Transferi Detayları',
    account_holder: 'Hesap Sahibi:',
    iban: 'IBAN:',
    reference: 'Açıklama:',
    
    // Cryptocurrency
    cryptocurrency_payment: 'Kripto Para ile Ödeme',
    bitcoin_label: 'Bitcoin (BTC)',
    ethereum_label: 'Ethereum (ETH)',
    crypto_note: 'Destek seviyenize denk gelen herhangi bir tutarı gönderin',
    
    // Study & Learning
    study_options: "Çalışma Seçenekleri",
    study_tips: "Çalışma İpuçları",
    statistics: "İstatistikler",
    questions_done: "Tamamlanan Sorular",
    to_review: "Gözden Geçirilecek",
    
    // UI & System
    go_back: "Geri git",
    change_language: "Dili değiştir",
    toggle_theme: "Temayı değiştir",
    copied: "Kopyalandı!",
    copied_to_clipboard: "panoya kopyalandı",
    hide: "Gizle",
    translate: "Çevir",
    show: "Göster",
    
    // Empty States & Messages
    no_questions_available: "Uygun Soru Yok",
    good_luck_message: "Almanya vatandaşlık sınavınızda iyi şanslar!",
    you_got_this: "Bunu başarırsın! 💪",
    
    // Incorrect answers screen
    incorrect_title: "Yanlış Cevaplar",
    incorrect_empty_title: "Henüz Yanlış Cevap Yok!",
    incorrect_empty_desc: "Henüz hiçbir soruyu yanlış cevaplamadınız. Çalışmaya devam edin!",
    practice_questions: "Pratik Sorular",
    
    // Accessibility
    view_questions_overview: "Soruların özetini görüntüle",
    view_bookmarked_questions: "İşaretli soruları görüntüle",
    view_questions_to_review: "Gözden geçirilecek soruların görüntüle",
    
    // Questions Overview
    questions_overview: "Sorular Genel Bakış",
    overview_desc: "Tüm 300 soru ilerlemesini gösteren görsel ızgara",
    
    // Missing keys from original translations
    all_questions_title: "Tüm 300 Soru",
    all_300_questions: "Tüm 300 Soru Özeti",
    all_questions_desc: "Hazırlanmak için tüm genel soruları gözden geçirin.",
    state_questions_title: "Eyalet Bazında Sorular",
    state_questions_desc: "Belirli soruları çalışmak için eyaletinizi seçin.",
    test_sim_desc: "33 rastgele soru ile bir simüle test başlatın. Geçmek için en az 17 doğru yanıtlamanız gerekli.",
    marked_desc: "Daha sonra gözden geçirmek için işaretlediğiniz tüm sorular burada.",
    incorrect_desc: "Yanlış cevapladığınız tüm sorular burada. Tekrar çalışın!",
    questions: "📝 Sorular",
    start_with_all_questions: "Tüm Sorularla Başla",
    start_with_all_questions_desc: "Soru formatına ve konularına aşina olun",
    bookmark_difficult_ones: "Zor Olanları İşaretle",
    bookmark_difficult_ones_desc: "Zor bulduğunuz soruları daha sonra incelemek için kaydedin",
    take_practice_tests: "Pratik Test Yap",
    take_practice_tests_desc: "Zamanlı 33 soruluk testlerle gerçek sınavı simüle edin",
    // Support options
    bug_fixes: "Hata düzeltmeleri",
    quick_responses: "Hızlı yanıtlar",
    new_features: "Yeni özellikler",
    priority_support: "Öncelikli destek",
    major_improvements: "Büyük iyileştirmeler",
    long_term_sustainability: "Uzun vadeli sürdürülebilirlik",
    special_thanks: "Özel teşekkür",
    premium: "Premium",
    international: "Uluslararası",
    powered_by_paypal: "PayPal tarafından desteklenmektedir",
    bank_transfer: "Banka Transferi",
    credit_card: "Kredi Kartı",
    cryptocurrency: "Kripto Para",
    kofi: "Ko-fi",
    kofi_desc: "Yaratıcıları destekle",
    sepa_no_fees: "SEPA - Ücretsiz",
    visa_mastercard: "Visa, Mastercard",
    btc_eth: "BTC, ETH",
    popular: "Popüler",
    secure_payment: "Güvenli Ödeme",
    no_fees: "Ücret Yok",
    instant_germany: "Almanya içinde Anında",
    // Keep it free section
    why_support_matters: "🎯 Neden desteğiniz önemli",
    keep_it_free: "Ücretsiz tutun",
    keep_it_free_desc: "Desteğiniz, bu kaynağın tüm öğrenciler için ücretsiz kalmasını sağlar",
    regular_updates: "Düzenli Güncellemeler",
    regular_updates_desc: "Kullanıcı geri bildirimleri ile sürekli iyileştirmeler ve yeni özellikler",
    better_experience: "Daha İyi Deneyim",
    better_experience_desc: "Geliştirilmiş kullanıcı arayüzü ve daha hızlı performans iyileştirmeleri",
    thank_you_title: "Teşekkürler! 🙏",
    thank_you_desc: "Küçük ya da büyük her katkı, bu uygulamanın çalışmasına ve gelişmesine yardımcı olur. Desteğiniz, insanların Almanya vatandaşlık hayallerine ulaşmasına gerçekten yardımcı olur.",
    choose_support_amount: "Destek Tutarını Seçin:",
    
    // Settings
    settings: "Ayarlar",
    preferences: "Tercihler",
    language: "Dil",
    dark_mode: "Karanlık Mod",
    dark_mode_desc: "Açık ve karanlık tema arasında geçiş yapın",
    notifications: "Bildirimler",
    notifications_desc: "Çalışma hatırlatıcıları ve güncellemeler alın",
    bookmarked_questions: "İşaretlenen Sorular",
    incorrect_answers: "Yanlış Cevaplar",
    correct_answers: "Doğru Cevaplar",
    clear_bookmarks: "İşaretleri Temizle",
    clear_bookmarks_desc: "Tüm işaretlenen soruları temizle",
    clear_incorrect_answers: "Yanlış Cevapları Temizle",
    clear_incorrect_answers_desc: "Tüm yanlış cevaplanmış soruları temizle",
    clear_correct_answers: "Doğru Cevapları Temizle",
    clear_correct_answers_desc: "Tüm doğru cevaplanmış soruları temizle",
    privacy: "Gizlilik",
    privacy_policy: "Gizlilik Politikası",
    privacy_policy_desc: "Verilerinizi nasıl koruduğumuzu öğrenin",
    terms_of_service: "Hizmet Şartları",
    terms_of_service_desc: "Şartlar ve koşullarımızı okuyun",
    data_usage: "Veri Kullanımı",
    data_usage_desc: "Hangi verileri topladığımızı görün",
    support_donate: "Destek ve Bağış",
    buy_me_a_coffee: "Bana Bir Kahve Al",
    buy_me_a_coffee_desc: "Bu uygulamanın geliştirilmesini destekleyin",
    rate_app: "Uygulamayı Oyla",
    rate_app_desc: "Diğerlerinin bu uygulamayı keşfetmesine yardım edin",
    contact_support: "Destek ile İletişim",
    contact_support_desc: "Yardım alın veya geri bildirim gönderin",
    developer_tools: "Geliştirici Araçları",
    developer_warning: "Bu işlemler geri alınamaz",
    reset_all_data: "Tüm Verileri Sıfırla",
    reset_all_data_desc: "Her şeyi temizle ve yeni başla",
    debug_info: "Hata Ayıklama Bilgileri",
    debug_info_desc: "Uygulama sürümü ve hata ayıklama bilgilerini görüntüle",
    
    // Terms of Service
    terms_of_service_title: "Hizmet Şartları",
    terms_of_service_subtitle: "Vatandaşlık testi hazırlık uygulamamızı kullanmadan önce lütfen bu şartları dikkatle okuyun",
    terms_last_updated: "Son güncelleme: Aralık 2024",
    terms_quick_nav_overview: "Genel Bakış",
    terms_quick_nav_privacy: "Gizlilik",
    terms_quick_nav_contact: "İletişim",
    
    // Section 1: Acceptance of Terms
    terms_acceptance_title: "Şartların Kabulü",
    terms_acceptance_content: "Bu mobil uygulamayı kullanarak, bu hizmet şartlarını kabul etmiş olursunuz. Kabul etmiyorsanız, lütfen uygulamayı kullanmayın.",
    
    // Section 2: Service Description
    terms_service_title: "Hizmet Açıklaması",
    terms_service_content: "Mobil uygulamamız, aşağıdaki özelliklerle Alman vatandaşlık testi için ücretsiz hazırlık sağlar:",
    terms_service_features: [
      "Tüm 300 resmi BAMF sorusu",
      "Gerçekçi koşullarla test simülatörü",
      "Eyalet özel soruları",
      "İlerleme takibi ve yer imleri",
      "Çok dilli destek"
    ],
    terms_service_source: "Bu uygulamadaki tüm sorular doğrudan resmi BAMF soru kataloğundan alınmıştır:",
    terms_bamf_catalog_title: "BAMF Resmi Soru Kataloğu",
    terms_bamf_catalog_url: "www.bamf.de/SharedDocs/Anlagen/DE/Integration/Einbuergerung/gesamtfragenkatalog-lebenindeutschland.html",
    terms_regular_updates_title: "Düzenli Güncellemeler",
    terms_regular_updates_content: "Resmi BAMF sürümüyle eşleştiğinden emin olmak için soru veritabanımızı düzenli olarak güncelliyoruz.",
    terms_source_pdf_title: "Kaynak PDF Tarihi",
    terms_source_pdf_date: "PDF sürümü: 07.05.2025",
    
    // Section 3: Disclaimers
    terms_disclaimers_title: "Feragatnameler",
    terms_disclaimer_educational_title: "Eğitim Amacı",
    terms_disclaimer_educational_content: "Bu mobil uygulama yalnızca eğitim amaçlıdır ve BAMF ile resmi olarak bağlantılı değildir.",
    terms_disclaimer_guarantee_title: "Başarı Garantisi Yok",
    terms_disclaimer_guarantee_content: "Bu mobil uygulamayı kullanmanın resmi testi geçmeyle sonuçlanacağını garanti etmiyoruz.",
    terms_disclaimer_accuracy_title: "İçerik Doğruluğu",
    terms_disclaimer_accuracy_content: "Doğru bilgi sağlamaya çalışsak da, tamlık veya doğruluk garantisi veremeyiz.",
    
    // Section 4: Limitation of Liability
    terms_liability_title: "Sorumluluk Sınırlaması",
    terms_liability_content: "Bu mobil uygulamanın kullanımından kaynaklanan doğrudan, dolaylı veya sonuçsal zararlardan sorumlu değiliz.",
    
    // Section 5: Changes to Terms
    terms_changes_title: "Şartlarda Değişiklikler",
    terms_changes_content: "Bu hizmet şartlarını istediğimiz zaman değiştirme hakkını saklı tutarız. Değişiklikler bu sayfada yayınlanacaktır.",
    
    // Section 6: Contact Us
    terms_contact_title: "Bizimle İletişime Geçin",
    terms_contact_content: "Bu hizmet şartları hakkında sorularınız için bizimle iletişime geçin:",
    terms_contact_email: "support@einbuergerungstest-fragen24.de",
  }
};

// Helper function to get translation with fallback
export const getTranslation = (language, key, fallback = key) => {
  return translations[language]?.[key] || translations['EN']?.[key] || fallback;
};

// Helper function to get all available languages
export const getAvailableLanguages = () => {
  return Object.keys(translations);
};

// Language metadata for future extensions
export const languageMetadata = {
  EN: { name: 'English', nativeName: 'English', flag: '🇺🇸', rtl: false },
  DE: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', rtl: false },
  TR: { name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', rtl: false }
};
