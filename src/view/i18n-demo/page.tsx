import React from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageManager, BpmnTranslations, SupportedLanguage } from '@/utils/locales';

// 主组件
const I18nDemo: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = React.useState<SupportedLanguage>(
    LanguageManager.getCurrentLanguage()
  );

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    LanguageManager.changeLanguage(newLang);
    setCurrentLang(newLang);
  };

  const handleResetToDefault = () => {
    LanguageManager.resetToDefault();
    setCurrentLang(LanguageManager.getCurrentLanguage());
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px', textAlign: 'center' }}>
        🌐 Internationalization Demo
      </h1>

      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        borderRadius: '12px',
        color: 'white',
        marginBottom: '30px'
      }}>
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Language Controls</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>Current Language: {currentLang}</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {LanguageManager.getSupportedLanguages().map(lang => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code as SupportedLanguage)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: currentLang === lang.code ? '#ffffff' : 'rgba(255,255,255,0.2)',
                  color: currentLang === lang.code ? '#667eea' : 'white',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.3s'
                }}
              >
                {lang.name}
              </button>
            ))}
          </div>

          <button
            onClick={handleResetToDefault}
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              border: 'none',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Reset to Default
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '20px' }}>Translation Examples</h2>

        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3>Common Translations</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginTop: '15px'
          }}>
            <div style={{
              background: 'white',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <strong>Save Button:</strong><br />
              "{t('common.save', 'Save')}"
            </div>
            <div style={{
              background: 'white',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <strong>Confirm Button:</strong><br />
              "{t('common.confirm', 'Confirm')}"
            </div>
            <div style={{
              background: 'white',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <strong>Cancel Button:</strong><br />
              "{t('common.cancel', 'Cancel')}"
            </div>
          </div>
        </div>

        <div style={{
          background: '#e8f5e8',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#2d5016' }}>BPMN Translations</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '15px',
            marginTop: '15px'
          }}>
            <div style={{
              background: 'white',
              padding: '15px',
              borderRadius: '8px',
              borderLeft: '4px solid #25d366'
            }}>
              <strong>Assignee Field:</strong><br />
              LABEL: "{BpmnTranslations.getFieldTranslation('assignee')}"<br />
              PLACEHOLDER: "{BpmnTranslations.getFieldTranslation('assignee', 'placeholder')}"
            </div>
            <div style={{
              background: 'white',
              padding: '15px',
              borderRadius: '8px',
              borderLeft: '4px solid #25d366'
            }}>
              <strong>User Task:</strong><br />
              "{BpmnTranslations.getElementTranslation('UserTask')}"
            </div>
            <div style={{
              background: 'white',
              padding: '15px',
              borderRadius: '8px',
              borderLeft: '4px solid #25d366'
            }}>
              <strong>Please Select:</strong><br />
              "{BpmnTranslations.getPanelMessage('pleaseSelectElement')}"
            </div>
            <div style={{
              background: 'white',
              padding: '15px',
              borderRadius: '8px',
              borderLeft: '4px solid #25d366'
            }}>
              <strong>Save Dialog:</strong><br />
              "{BpmnTranslations.getDialogTranslation('confirmSave', 'title')}"
            </div>
          </div>
        </div>
      </div>

      <div style={{
        background: '#fff3cd',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #ffeaa7'
      }}>
        <h3>System Information</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px',
          marginTop: '15px'
        }}>
          <div><strong>Current Language:</strong> {i18n.language}</div>
          <div><strong>Text Direction:</strong> {i18n.dir?.() || 'ltr'}</div>
          <div><strong>Available Languages:</strong> {LanguageManager.getSupportedLanguages().map(l => l.code).join(', ')}</div>
          <div><strong>Version:</strong> 1.0.0</div>
        </div>
      </div>
    </div>
  );
};

export default I18nDemo;
