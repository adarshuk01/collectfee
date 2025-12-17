import { useTranslation } from 'react-i18next';

const T = ({ k }) => {
  const { t } = useTranslation();
  return t(k);
};
