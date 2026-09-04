import s from './uikit.module.scss'
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux'
import { toggleTheme } from '../../store/app.slice'
import IconSprite, { type IconName } from '../../elements/icon'
import Toggle from '../../elements/toggle'

const COLOR_TOKENS = [
  { name: '--color-body', desc: 'Основной фон страницы', css: 'var(--color-body)' },
  { name: '--color-head', desc: 'Фон верхней шапки', css: 'var(--color-head)' },
  { name: '--color-card', desc: 'Фон карточек и блоков', css: 'var(--color-card)' },
  { name: '--color-dialog', desc: 'Фон диалогов и меню', css: 'var(--color-dialog)' },
  { name: '--color-input', desc: 'Фон полей ввода', css: 'var(--color-input)' },
  { name: '--color-active', desc: 'Активный элемент / таб', css: 'var(--color-active)' },
  { name: '--color-hover', desc: 'Фон при наведении', css: 'var(--color-hover)' },
  { name: '--color-border', desc: 'Границы и разделители', css: 'var(--color-border)' },
  { name: '--color-shadow', desc: 'Цвет теней', css: 'var(--color-shadow)' },
  { name: '--color-brand', desc: 'Главный цвет бренда', css: 'var(--color-brand)' },
  { name: '--color-green', desc: 'Успех, пополнение', css: 'var(--color-green)' },
  { name: '--color-red', desc: 'Ошибка, списание', css: 'var(--color-red)' },
  { name: '--color-orange', desc: 'Предупреждение, пендинг', css: 'var(--color-orange)' },
  { name: '--color-blue', desc: 'Инфо, действия', css: 'var(--color-blue)' },
]

const ALL_ICONS: IconName[] = [
  'activity', 'add', 'arrow_down', 'arrow_back', 'bank', 'bell', 'bell-z', 'check',
  'close', 'copy', 'crown', 'delete', 'discord', 'draft', 'error', 'exit',
  'favorite', 'filter', 'finish', 'fire', 'flag', 'home', 'info', 'instagram',
  'mail', 'menu', 'metamask', 'moon', 'more', 'pencil', 'phantom', 'plus',
  'report', 'search', 'star', 'success', 'tiktok', 'trend', 'tultip', 'twitter',
  'upload', 'vk', 'volume', 'warning',
]

export default function UiKit() {
  const dispatch = useAppDispatch()
  const { theme } = useAppSelector((state) => state.app)
  const [isMobileView, setIsMobileView] = useState(false)
  const [demoToggle, setDemoToggle] = useState(true)
  const [activeSegment, setActiveSegment] = useState<'account' | 'balance' | 'notifications'>('balance')
  const [bioText, setBioText] = useState('Трейдер и прогнозист. Специализируюсь на макроэкономике и крипте.')

  const bioLength = bioText.length

  return (
    <div className={s.page}>
      {/* Top sticky control bar */}
      <div className={s.controlBar}>
        <div className={s.controlGroup}>
          <button
            type='button'
            className={`btn ${isMobileView ? 'gray' : 'blue'}`}
            onClick={() => setIsMobileView(false)}>
            <span>💻 Десктоп</span>
          </button>
          <button
            type='button'
            className={`btn ${isMobileView ? 'blue' : 'gray'}`}
            onClick={() => setIsMobileView(true)}>
            <span>📱 Мобильный (390px)</span>
          </button>
        </div>

        <div className={s.navLinks}>
          <a href='#colors' className={s.navLink}>Цвета</a>
          <a href='#typography' className={s.navLink}>Типографика</a>
          <a href='#buttons' className={s.navLink}>Кнопки</a>
          <a href='#forms' className={s.navLink}>Формы</a>
          <a href='#badges' className={s.navLink}>Бейджи</a>
          <a href='#tabs' className={s.navLink}>Табы</a>
          <a href='#skeletons' className={s.navLink}>Шиммер</a>
          <a href='#icons' className={s.navLink}>Иконки</a>
        </div>

        <div className={s.controlGroup}>
          <span className='text-xs secondary'>Тема: <b>{theme === 'dark' ? 'Темная' : 'Светлая'}</b></span>
          <Toggle checked={theme === 'dark'} onChange={() => dispatch(toggleTheme())} />
        </div>
      </div>

      {/* Main showcase container */}
      <div className={`${s.viewportContainer} ${isMobileView ? s.mobile : 'container'}`}>
        {isMobileView && (
          <div className={s.phoneHeader}>
            <span>09:41</span>
            <div className={s.notch} />
            <span>5G 100%</span>
          </div>
        )}

        <div className='column gap-4'>
          <div>
            <h1>Дизайн-система и UI Kit</h1>
            <p className='secondary text-sm mt-1'>
              Интерактивная витрина всех компонентов проекта iknow. Редактируйте переменные в <code>config.scss</code> и
              наблюдайте за обновлениями в реальном времени.
            </p>
          </div>

          {/* SECTION 1: COLORS */}
          <section id='colors' className={s.section}>
            <div className={s.sectionTitle}>
              <IconSprite name='moon' size={20} color='var(--color-brand)' />
              <span>1. Цветовая палитра токенов</span>
            </div>
            <div className={s.grid}>
              {COLOR_TOKENS.map((token) => (
                <div key={token.name} className={s.colorCard}>
                  <div className={s.colorSwatch} style={{ background: token.css }} />
                  <div className={s.colorInfo}>
                    <span className={s.colorName}>{token.name}</span>
                    <span className={s.colorDesc}>{token.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 2: TYPOGRAPHY */}
          <section id='typography' className={s.section}>
            <div className={s.sectionTitle}>
              <IconSprite name='pencil' size={20} color='var(--color-brand)' />
              <span>2. Типографика</span>
            </div>
            <div className={s.card}>
              <div className={s.typeRow}>
                <h1>Заголовок H1 — Самый крупный</h1>
                <span className={s.typeMeta}>--font-size-h1 (24px) / 700</span>
              </div>
              <div className={s.typeRow}>
                <h2>Заголовок H2 — Подраздел</h2>
                <span className={s.typeMeta}>--font-size-h2 (20px) / 600</span>
              </div>
              <div className={s.typeRow}>
                <p className='text-lg'>Основной акцентный текст (Large)</p>
                <span className={s.typeMeta}>--font-size-lg (18px)</span>
              </div>
              <div className={s.typeRow}>
                <p className='text-md'>Стандартный базовый текст (Medium body)</p>
                <span className={s.typeMeta}>--font-size-md (16px)</span>
              </div>
              <div className={s.typeRow}>
                <p className='text-sm secondary'>Второстепенный текст и описания (Small secondary)</p>
                <span className={s.typeMeta}>--font-size-sm (14px)</span>
              </div>
              <div className={s.typeRow}>
                <span className='text-xs secondary'>Микротекст, подписи дат и хинты (Extra small)</span>
                <span className={s.typeMeta}>--font-size-xs (12px)</span>
              </div>
            </div>
          </section>

          {/* SECTION 3: BUTTONS */}
          <section id='buttons' className={s.section}>
            <div className={s.sectionTitle}>
              <IconSprite name='check' size={20} color='var(--color-brand)' />
              <span>3. Кнопки и действия</span>
            </div>
            <div className='column gap-3'>
              <div>
                <span className='text-xs secondary mb-2 block'>Цвета кнопок:</span>
                <div className={s.buttonRow}>
                  <button type='button' className='btn'>Обычная</button>
                  <button type='button' className='btn blue'>Синяя (Blue)</button>
                  <button type='button' className='btn green'>Зеленая (Green)</button>
                  <button type='button' className='btn orange'>Оранжевая (Orange)</button>
                  <button type='button' className='btn gray'>Серая (Gray)</button>
                  <button type='button' className='btn' disabled>Отключена</button>
                </div>
              </div>

              <div>
                <span className='text-xs secondary mb-2 block'>Размеры и иконки:</span>
                <div className={s.buttonRow}>
                  <button type='button' className='btn big blue'>
                    <IconSprite name='arrow_down' size={20} />
                    <span>Большая (Big 54px)</span>
                  </button>
                  <button type='button' className='btn mid green'>
                    <IconSprite name='bank' size={18} />
                    <span>Средняя (Mid 44px)</span>
                  </button>
                  <button type='button' className='btn gray'>
                    <IconSprite name='pencil' size={16} />
                    <span>Стандарт (38px)</span>
                  </button>
                  <button type='button' className='btn btn-icon' title='Icon Only'>
                    <IconSprite name='bell' size={18} />
                  </button>
                  <button type='button' className='btn btn-icon' title='Icon Only'>
                    <IconSprite name='search' size={18} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: FORM CONTROLS */}
          <section id='forms' className={s.section}>
            <div className={s.sectionTitle}>
              <IconSprite name='draft' size={20} color='var(--color-brand)' />
              <span>4. Поля ввода и формы</span>
            </div>
            <div className={s.card}>
              <div className='column gap-3'>
                <div className='form-row'>
                  <label>Обычное поле ввода</label>
                  <input type='text' className='outline' placeholder='Введите значение...' defaultValue='Пользовательский ввод' />
                </div>

                <div className='form-row'>
                  <label>Поле с ошибкой валидации</label>
                  <input type='text' className='outline error' defaultValue='неверный_формат' />
                  <span className='text-xs color-red'>Никнейм должен быть не менее 4 символов</span>
                </div>

                <div className='form-row'>
                  <label>Поле с успешной проверкой</label>
                  <input type='text' className='outline success' defaultValue='ivan_winner' />
                  <span className='text-xs color-green'>✨ Никнейм свободен</span>
                </div>

                <div className='form-row'>
                  <label>Многострочное поле "О себе" со счетчиком символов (255 max)</label>
                  <textarea
                    rows={4}
                    className='outline'
                    maxLength={255}
                    value={bioText}
                    onChange={(e) => setBioText(e.target.value)}
                  />
                  <div className='row center justify gap-2 mt-1'>
                    <span className='text-xs secondary'>Отображается в публичном профиле</span>
                    <span
                      className={`text-xs ${
                        bioLength >= 255 ? 'color-red w-600' : bioLength >= 230 ? 'color-orange w-600' : 'secondary'
                      }`}
                      style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {bioLength} / 255
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 5: BADGES & CHIPS */}
          <section id='badges' className={s.section}>
            <div className={s.sectionTitle}>
              <IconSprite name='flag' size={20} color='var(--color-brand)' />
              <span>5. Бейджи, статусы и чипсы</span>
            </div>
            <div className={s.card}>
              <div className='column gap-3'>
                <div>
                  <span className='text-xs secondary mb-2 block'>Статусы операций:</span>
                  <div className={s.badgeRow}>
                    <span className={`${s.badge} ${s.completed}`}>Выполнен</span>
                    <span className={`${s.badge} ${s.pending}`}>В обработке</span>
                    <span className={`${s.badge} ${s.rejected}`}>Отклонен</span>
                    <span className={`${s.badge} ${s.blue}`}>Подтвержден</span>
                  </div>
                </div>

                <div>
                  <span className='text-xs secondary mb-2 block'>Блокчейн-ссылки и хэши:</span>
                  <div className={s.badgeRow}>
                    <span className='row center gap-1 p-1 ph-2 bg-input border rounded font-mono text-xs color-blue'>
                      <span>0x7f8a...3b21</span>
                      <span>↗</span>
                    </span>
                    <span className='row center gap-1 p-1 ph-2 bg-input border rounded font-mono text-xs color-blue'>
                      <span>0x9c12...4f98</span>
                      <span>↗</span>
                    </span>
                  </div>
                </div>

                <div>
                  <span className='text-xs secondary mb-2 block'>Интерактивный переключатель (Toggle):</span>
                  <div className='row center gap-3'>
                    <Toggle checked={demoToggle} onChange={() => setDemoToggle(!demoToggle)} />
                    <span className='text-sm'>{demoToggle ? 'Включено' : 'Выключено'}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 6: TABS & SEGMENTED CONTROLS */}
          <section id='tabs' className={s.section}>
            <div className={s.sectionTitle}>
              <IconSprite name='menu' size={20} color='var(--color-brand)' />
              <span>6. Навигационные табы и сегменты</span>
            </div>
            <div className={s.card}>
              <span className='text-xs secondary mb-2 block'>Капсульный переключатель разделов (Segmented Control):</span>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '4px',
                  padding: '4px',
                  background: 'var(--color-input)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                }}>
                <button
                  type='button'
                  onClick={() => setActiveSegment('account')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '9px 4px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: activeSegment === 'account' ? 600 : 500,
                    color: activeSegment === 'account' ? 'var(--color-primary)' : 'var(--color-secondary)',
                    background: activeSegment === 'account' ? 'var(--color-card)' : 'transparent',
                    boxShadow: activeSegment === 'account' ? '0 2px 8px var(--color-shadow)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}>
                  <IconSprite name='pencil' size={16} />
                  <span>Профиль</span>
                </button>
                <button
                  type='button'
                  onClick={() => setActiveSegment('balance')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '9px 4px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: activeSegment === 'balance' ? 600 : 500,
                    color: activeSegment === 'balance' ? 'var(--color-primary)' : 'var(--color-secondary)',
                    background: activeSegment === 'balance' ? 'var(--color-card)' : 'transparent',
                    boxShadow: activeSegment === 'balance' ? '0 2px 8px var(--color-shadow)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}>
                  <IconSprite name='bank' size={16} />
                  <span>Баланс</span>
                </button>
                <button
                  type='button'
                  onClick={() => setActiveSegment('notifications')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '9px 4px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: activeSegment === 'notifications' ? 600 : 500,
                    color: activeSegment === 'notifications' ? 'var(--color-primary)' : 'var(--color-secondary)',
                    background: activeSegment === 'notifications' ? 'var(--color-card)' : 'transparent',
                    boxShadow: activeSegment === 'notifications' ? '0 2px 8px var(--color-shadow)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}>
                  <IconSprite name='bell' size={16} />
                  <span>Уведомления</span>
                </button>
              </div>
            </div>
          </section>

          {/* SECTION 7: SKELETONS & SHIMMER */}
          <section id='skeletons' className={s.section}>
            <div className={s.sectionTitle}>
              <IconSprite name='activity' size={20} color='var(--color-brand)' />
              <span>7. Скелетоны загрузки (Shimmer)</span>
            </div>
            <div className='column gap-3'>
              <div className={s.card}>
                <span className='text-xs secondary mb-3 block'>Скелетон карточки пользователя / транзакции:</span>
                <div className='row center gap-3'>
                  <div className='shimmer' style={{ width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0 }} />
                  <div className='column gap-2 grow'>
                    <div className='shimmer' style={{ width: '35%', height: '16px', borderRadius: '4px' }} />
                    <div className='shimmer' style={{ width: '65%', height: '12px', borderRadius: '4px' }} />
                  </div>
                  <div className='shimmer' style={{ width: '70px', height: '24px', borderRadius: '6px' }} />
                </div>
              </div>

              <div className={s.card}>
                <span className='text-xs secondary mb-3 block'>Скелетон элементов формы:</span>
                <div className='column gap-3'>
                  <div className='shimmer' style={{ width: '100%', height: '40px', borderRadius: '8px' }} />
                  <div className='shimmer' style={{ width: '100%', height: '80px', borderRadius: '8px' }} />
                  <div className='shimmer' style={{ width: '140px', height: '38px', borderRadius: '6px' }} />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 8: ICONS */}
          <section id='icons' className={s.section}>
            <div className={s.sectionTitle}>
              <IconSprite name='star' size={20} color='var(--color-brand)' />
              <span>8. Все иконки проекта ({ALL_ICONS.length})</span>
            </div>
            <div className={s.iconGrid}>
              {ALL_ICONS.map((icon) => (
                <div key={icon} className={s.iconCard}>
                  <IconSprite name={icon} size={24} />
                  <span className={s.iconName}>{icon}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
