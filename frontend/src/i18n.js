import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
 resources: {
  en: {
    translation: {
      settings: {
        title: "Settings",
        card: "Your Card",
        security: "Security",
        notification: "Notification",
        receipt: "Receipt Customization",
        language: "Languages",
        help: "Help and Support",
        logout: "Logout"
      }
    }
  },

  fr: {
    translation: {
      settings: {
        title: "Paramètres",
        card: "Votre carte",
        security: "Sécurité",
        notification: "Notifications",
        receipt: "Personnalisation des reçus",
        language: "Langues",
        help: "Aide et support",
        logout: "Se déconnecter"
      }
    }
  },

  id: {
    translation: {
      settings: {
        title: "Pengaturan",
        card: "Kartu Anda",
        security: "Keamanan",
        notification: "Notifikasi",
        receipt: "Kustomisasi Struk",
        language: "Bahasa",
        help: "Bantuan & Dukungan",
        logout: "Keluar"
      }
    }
  }
},

  lng: localStorage.getItem("lang") || "en",

  fallbackLng: "en",
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
