import type { AppLocale } from "./translations";

type RegisterCopy = {
  loadingPrice: string;
  freePrice: string;
  perMonthSuffix: string;
  apiLoadError: string;
  validations: {
    societyNameRequired: string;
    fullNameRequired: string;
    passwordRequired: string;
    passwordLength: string;
    missingGeneratedDetails: string;
  };
  submitSuccess: string;
  submitError: string;
  leftPanel: {
    chip: string;
    title: string;
    description: string;
    tags: [string, string, string];
    nextTitle: string;
    nextSteps: [string, string, string];
    imageAlt: string;
  };
  formPanel: {
    title: string;
    description: string;
    snapshotTitle: string;
    approvedSocieties: string;
    premiumPlan: string;
    snapshotLiveNote: string;
    generatedTitle: string;
    societyCode: string;
    adminUsername: string;
    waitingSociety: string;
    waitingAdmin: string;
    generatedNote: string;
    requiredTitle: string;
    societyNameLabel: string;
    societyNamePlaceholder: string;
    societyNameHelper: string;
    adminNameLabel: string;
    adminNamePlaceholder: string;
    adminNameHelper: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    passwordHelper: string;
    submitting: string;
    submit: string;
    alreadyApproved: string;
    goToLogin: string;
    platformAdmin: string;
    useAdmin: string;
  };
};

const registerCopy: Record<AppLocale, RegisterCopy> = {
  en: {
    loadingPrice: "Loading...",
    freePrice: "₹0",
    perMonthSuffix: "/month",
    apiLoadError: "Unable to load live platform details.",
    validations: {
      societyNameRequired: "Society name is required",
      fullNameRequired: "Administrator name is required",
      passwordRequired: "Password is required",
      passwordLength: "Password must be at least 8 characters",
      missingGeneratedDetails: "Please enter both the society name and administrator name to generate the login details."
    },
    submitSuccess: "Enrollment submitted. Society code {{code}} and username @{{username}} will be used after approval.",
    submitError: "Unable to submit enrollment",
    leftPanel: {
      chip: "Society Enrollment",
      title: "Register Your Society",
      description:
        "This form is only for creating the main society workspace account. Agents and clients are created later from inside the approved society dashboard.",
      tags: ["Society Only", "Approval Required", "Admin Username From Name"],
      nextTitle: "What Happens Next",
      nextSteps: [
        "1. Submit the society name, main administrator, and password.",
        "2. Platform superadmin reviews and approves the society.",
        "3. After approval, you log in at /login and create your internal users there."
      ],
      imageAlt: "Illustration of onboarding and account setup"
    },
    formPanel: {
      title: "Society Enrollment Form",
      description:
        "Only the core details are required here. The registration page now also pulls the current platform snapshot from the API so you can see the live network before you enroll.",
      snapshotTitle: "Live Platform Snapshot",
      approvedSocieties: "Approved Societies",
      premiumPlan: "Premium Plan",
      snapshotLiveNote:
        "These values are loaded live from the API, so the registration page stays aligned with the current platform setup.",
      generatedTitle: "Generated Login Details",
      societyCode: "Society Code",
      adminUsername: "Admin Username",
      waitingSociety: "Waiting for society name",
      waitingAdmin: "Waiting for administrator name",
      generatedNote:
        "The society code comes from the society name, and the first admin username comes from the administrator name you enter here.",
      requiredTitle: "Required Details",
      societyNameLabel: "Society Name",
      societyNamePlaceholder: "e.g. Skyline Cooperative Credit Society",
      societyNameHelper: "This name is used to generate the society code.",
      adminNameLabel: "Main Administrator Name",
      adminNamePlaceholder: "Full name",
      adminNameHelper: "This name is used to generate the first admin username.",
      passwordLabel: "Password",
      passwordPlaceholder: "Create a secure password",
      passwordHelper: "Use at least 8 characters for the initial society admin password.",
      submitting: "Submitting...",
      submit: "Submit Society Enrollment",
      alreadyApproved: "Already approved?",
      goToLogin: "Go to society login",
      platformAdmin: "Platform superadmin?",
      useAdmin: "Use the admin terminal"
    }
  },
  hi: {
    loadingPrice: "लोड हो रहा है...",
    freePrice: "₹0",
    perMonthSuffix: "/माह",
    apiLoadError: "लाइव प्लेटफ़ॉर्म विवरण लोड नहीं हो सके।",
    validations: {
      societyNameRequired: "सोसाइटी नाम आवश्यक है",
      fullNameRequired: "प्रशासक का नाम आवश्यक है",
      passwordRequired: "पासवर्ड आवश्यक है",
      passwordLength: "पासवर्ड कम से कम 8 अक्षरों का होना चाहिए",
      missingGeneratedDetails: "लॉगिन विवरण बनाने के लिए कृपया सोसाइटी नाम और प्रशासक नाम दोनों दर्ज करें।"
    },
    submitSuccess: "नामांकन भेज दिया गया है। स्वीकृति के बाद सोसाइटी कोड {{code}} और यूज़रनेम @{{username}} उपयोग किया जाएगा।",
    submitError: "नामांकन भेजा नहीं जा सका",
    leftPanel: {
      chip: "सोसाइटी नामांकन",
      title: "अपनी सोसाइटी रजिस्टर करें",
      description:
        "यह फ़ॉर्म केवल मुख्य सोसाइटी वर्कस्पेस खाता बनाने के लिए है। एजेंट और क्लाइंट बाद में स्वीकृत सोसाइटी डैशबोर्ड के अंदर बनाए जाते हैं।",
      tags: ["केवल सोसाइटी", "स्वीकृति आवश्यक", "नाम से एडमिन यूज़रनेम"],
      nextTitle: "इसके बाद क्या होगा",
      nextSteps: [
        "1. सोसाइटी नाम, मुख्य प्रशासक और पासवर्ड जमा करें।",
        "2. प्लेटफ़ॉर्म सुपरएडमिन सोसाइटी की समीक्षा करके स्वीकृति देता है।",
        "3. स्वीकृति के बाद आप /login पर लॉगिन करते हैं और वहाँ अपने आंतरिक यूज़र बनाते हैं।"
      ],
      imageAlt: "ऑनबोर्डिंग और अकाउंट सेटअप का चित्र"
    },
    formPanel: {
      title: "सोसाइटी नामांकन फ़ॉर्म",
      description:
        "यहाँ केवल मुख्य विवरण आवश्यक हैं। रजिस्ट्रेशन पेज अब API से वर्तमान प्लेटफ़ॉर्म स्नैपशॉट भी लाता है ताकि नामांकन से पहले आप लाइव नेटवर्क देख सकें।",
      snapshotTitle: "लाइव प्लेटफ़ॉर्म स्नैपशॉट",
      approvedSocieties: "स्वीकृत सोसाइटी",
      premiumPlan: "प्रीमियम प्लान",
      snapshotLiveNote:
        "ये मान API से लाइव लोड किए जाते हैं, इसलिए रजिस्ट्रेशन पेज वर्तमान प्लेटफ़ॉर्म सेटअप के साथ संरेखित रहता है।",
      generatedTitle: "जनरेट किए गए लॉगिन विवरण",
      societyCode: "सोसाइटी कोड",
      adminUsername: "एडमिन यूज़रनेम",
      waitingSociety: "सोसाइटी नाम की प्रतीक्षा में",
      waitingAdmin: "प्रशासक नाम की प्रतीक्षा में",
      generatedNote:
        "सोसाइटी कोड सोसाइटी नाम से बनता है, और पहला एडमिन यूज़रनेम यहाँ दर्ज किए गए प्रशासक नाम से बनता है।",
      requiredTitle: "आवश्यक विवरण",
      societyNameLabel: "सोसाइटी नाम",
      societyNamePlaceholder: "उदा. स्काईलाइन कोऑपरेटिव क्रेडिट सोसाइटी",
      societyNameHelper: "इसी नाम से सोसाइटी कोड बनाया जाता है।",
      adminNameLabel: "मुख्य प्रशासक का नाम",
      adminNamePlaceholder: "पूरा नाम",
      adminNameHelper: "इसी नाम से पहला एडमिन यूज़रनेम बनाया जाता है।",
      passwordLabel: "पासवर्ड",
      passwordPlaceholder: "सुरक्षित पासवर्ड बनाएं",
      passwordHelper: "प्रारंभिक सोसाइटी एडमिन पासवर्ड के लिए कम से कम 8 अक्षरों का उपयोग करें।",
      submitting: "भेजा जा रहा है...",
      submit: "सोसाइटी नामांकन जमा करें",
      alreadyApproved: "पहले से स्वीकृत?",
      goToLogin: "सोसाइटी लॉगिन पर जाएँ",
      platformAdmin: "प्लेटफ़ॉर्म सुपरएडमिन?",
      useAdmin: "एडमिन टर्मिनल उपयोग करें"
    }
  },
  mr: {
    loadingPrice: "लोड होत आहे...",
    freePrice: "₹0",
    perMonthSuffix: "/महिना",
    apiLoadError: "लाइव्ह प्लॅटफॉर्म तपशील लोड करता आले नाहीत.",
    validations: {
      societyNameRequired: "सोसायटीचे नाव आवश्यक आहे",
      fullNameRequired: "प्रशासकाचे नाव आवश्यक आहे",
      passwordRequired: "पासवर्ड आवश्यक आहे",
      passwordLength: "पासवर्ड किमान 8 अक्षरांचा असावा",
      missingGeneratedDetails: "लॉगिन तपशील तयार करण्यासाठी कृपया सोसायटीचे नाव आणि प्रशासकाचे नाव दोन्ही भरा."
    },
    submitSuccess: "नोंदणी विनंती पाठवली आहे. मंजुरीनंतर सोसायटी कोड {{code}} आणि यूजरनेम @{{username}} वापरले जाईल.",
    submitError: "नोंदणी विनंती पाठवता आली नाही",
    leftPanel: {
      chip: "सोसायटी नोंदणी",
      title: "तुमची सोसायटी नोंदवा",
      description:
        "हा फॉर्म फक्त मुख्य सोसायटी वर्कस्पेस खाते तयार करण्यासाठी आहे. एजंट आणि क्लायंट नंतर मंजूर सोसायटी डॅशबोर्डमधून तयार केले जातात.",
      tags: ["फक्त सोसायटी", "मंजुरी आवश्यक", "नावावरून एडमिन यूजरनेम"],
      nextTitle: "पुढे काय होईल",
      nextSteps: [
        "1. सोसायटीचे नाव, मुख्य प्रशासक आणि पासवर्ड सबमिट करा.",
        "2. प्लॅटफॉर्म सुपरअॅडमिन सोसायटीची पाहणी करून मंजुरी देतो.",
        "3. मंजुरीनंतर तुम्ही /login येथे लॉगिन करून अंतर्गत यूजर्स तयार करता."
      ],
      imageAlt: "ऑनबोर्डिंग आणि अकाउंट सेटअपचे चित्र"
    },
    formPanel: {
      title: "सोसायटी नोंदणी फॉर्म",
      description:
        "येथे फक्त मुख्य तपशील आवश्यक आहेत. नोंदणी पान आता API मधून वर्तमान प्लॅटफॉर्म स्नॅपशॉट देखील आणते, त्यामुळे नोंदणीपूर्वी तुम्ही लाइव्ह नेटवर्क पाहू शकता.",
      snapshotTitle: "लाइव्ह प्लॅटफॉर्म स्नॅपशॉट",
      approvedSocieties: "मंजूर सोसायट्या",
      premiumPlan: "प्रीमियम प्लॅन",
      snapshotLiveNote:
        "ही मूल्ये API मधून लाइव्ह लोड होतात, त्यामुळे नोंदणी पान सध्याच्या प्लॅटफॉर्म सेटअपशी जुळलेले राहते.",
      generatedTitle: "तयार झालेले लॉगिन तपशील",
      societyCode: "सोसायटी कोड",
      adminUsername: "एडमिन यूजरनेम",
      waitingSociety: "सोसायटी नावाची प्रतीक्षा आहे",
      waitingAdmin: "प्रशासक नावाची प्रतीक्षा आहे",
      generatedNote:
        "सोसायटी कोड सोसायटीच्या नावावरून तयार होतो, आणि पहिला एडमिन यूजरनेम येथे दिलेल्या प्रशासकाच्या नावावरून तयार होतो.",
      requiredTitle: "आवश्यक तपशील",
      societyNameLabel: "सोसायटीचे नाव",
      societyNamePlaceholder: "उदा. स्कायलाइन कोऑपरेटिव क्रेडिट सोसायटी",
      societyNameHelper: "याच नावावरून सोसायटी कोड तयार होतो.",
      adminNameLabel: "मुख्य प्रशासकाचे नाव",
      adminNamePlaceholder: "पूर्ण नाव",
      adminNameHelper: "याच नावावरून पहिला एडमिन यूजरनेम तयार होतो.",
      passwordLabel: "पासवर्ड",
      passwordPlaceholder: "सुरक्षित पासवर्ड तयार करा",
      passwordHelper: "प्राथमिक सोसायटी एडमिन पासवर्डसाठी किमान 8 अक्षरे वापरा.",
      submitting: "सबमिट होत आहे...",
      submit: "सोसायटी नोंदणी सबमिट करा",
      alreadyApproved: "आधीच मंजूर?",
      goToLogin: "सोसायटी लॉगिनकडे जा",
      platformAdmin: "प्लॅटफॉर्म सुपरअॅडमिन?",
      useAdmin: "एडमिन टर्मिनल वापरा"
    }
  }
};

export function getRegisterPageCopy(locale: AppLocale) {
  return registerCopy[locale] ?? registerCopy.en;
}
